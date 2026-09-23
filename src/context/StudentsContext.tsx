import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import Papa from "papaparse";
import type { Student, Payment, ImportRow } from "@/lib/types";
import { CSV_COLUMNS } from "@/lib/types";
import { studentSchema, type StudentFormValues } from "@/lib/schema";
import { gradeFor, statusFor } from "@/lib/helpers";
import { supabase } from "@/lib/supabase";
import { toBik_euro, toGreg } from "bikram-sambat";

type Course = {
  course_key: string;
  course_name: string;
  admission_fee: number;
  course_fee: number;
  active: boolean;
};
type Teacher = { id: string; name: string; active: boolean };
type Timing = { id: string; label: string; active: boolean };

type StudentsContextValue = {
  students: Student[];
  studentsLoading: boolean;
  dark: boolean;
  setDark: (v: boolean) => void;
  modalOpen: boolean;
  setModalOpen: (v: boolean) => void;
  editingId: string | null;
  openAdd: () => void;
  openEdit: (id: string) => void;
  save: (values: StudentFormValues) => void;
  deleteStudent: (id: string) => void;
  addPayment: (id: string, payment: Omit<Payment, "id" | "voided">) => void;
  voidPayment: (paymentId: string, voided: boolean) => Promise<void>;
  selectMode: boolean;
  setSelectMode: (v: boolean) => void;
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  bulkDelete: () => void;
  bulkExport: () => void;
  importRows: ImportRow[];
  importModalOpen: boolean;
  setImportModalOpen: (v: boolean) => void;
  parseCsvFile: (file: File) => void;
  commitImport: (rows: ImportRow[]) => void;
  uploadAttendanceCsv: (
    courseKey: string,
    file: File,
    bsYear: number,
    bsMonth: number,
  ) => Promise<{ success: number; failed: string[] }>;
  uploadWeeklyExamCsv: (
    courseKey: string,
    file: File,
    weekLabel: string,
    examDate: string,
  ) => Promise<{ success: number; failed: string[] }>;
  resetWeeklyForStudent: (studentId: string) => Promise<void>;
  resetWeeklyForCourse: (courseKey: string) => Promise<number>;
  uploadMonthlyExamCsv: (
    courseKey: string,
    file: File,
    monthLabel: string,
    examDate: string,
  ) => Promise<{ success: number; failed: string[] }>;
  resetMonthlyForStudent: (studentId: string) => Promise<void>;
  resetMonthlyForCourse: (courseKey: string) => Promise<number>;
  resetAttendanceForCourseMonth: (
    courseKey: string,
    bsYear: number,
    bsMonth: number,
  ) => Promise<number>;
  courses: Course[];
  teachers: Teacher[];
  timings: Timing[];
  currentBatch: string;
  settingsLoading: boolean;
  addCourse: (c: Omit<Course, "active">) => Promise<void>;
  updateCourse: (courseKey: string, patch: Partial<Course>) => Promise<void>;
  archiveCourse: (courseKey: string, active: boolean) => Promise<void>;
  addTeacher: (name: string) => Promise<void>;
  updateTeacher: (id: string, patch: Partial<Teacher>) => Promise<void>;
  archiveTeacher: (id: string, active: boolean) => Promise<void>;
  addTiming: (label: string) => Promise<void>;
  updateTiming: (id: string, patch: Partial<Timing>) => Promise<void>;
  archiveTiming: (id: string, active: boolean) => Promise<void>;
  updateCurrentBatch: (value: string) => Promise<void>;
};
const StudentsContext = createContext<StudentsContextValue | null>(null);

function mapRow(s: any, payments: any[]): Student {
  return {
    id: s.id,
    name: s.name,
    course: s.course,
    courseKey: s.course_key,
    batch: s.batch,
    father: s.father ?? "",
    phone: s.phone ?? "",
    address: s.address ?? "",
    school: s.school ?? "",
    prior: s.prior ?? "",
    score: s.score === null ? null : Number(s.score),
    grade: s.grade ?? "",
    attendance: s.attendance === null ? null : Number(s.attendance),
    status: s.status ?? "",
    remarks: s.remarks ?? "",
    weekly: s.weekly ?? [],
    monthly: s.monthly ?? [],
    photo: s.photo ?? undefined,
    teacher: s.teacher ?? "",
    timing: s.timing ?? "",
    admissionFee: s.admission_fee != null ? Number(s.admission_fee) : 0,
    courseFee: s.course_fee != null ? Number(s.course_fee) : 0,
    payments: payments
      .filter((p) => p.student_id === s.id)
      .map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        date: p.date,
        mode: p.mode,
        note: p.note ?? undefined,
        voided: Boolean(p.voided),
      })),
  };
}

async function getCurrentBsYear(): Promise<number> {
  const today = new Date().toISOString().split("T")[0]!;
  const bsDate = toBik_euro(today);
  return parseInt(bsDate.split("-")[0]!, 10);
}

async function generateStudentId(): Promise<string> {
  const bsYear = await getCurrentBsYear();
  const { count, error } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("bs_year", bsYear);
  if (error) throw error;
  const seq = (count ?? 0) + 1;
  return `ATI-${bsYear}-${String(seq).padStart(4, "0")}`;
}

async function generateRollNo(courseKey: string): Promise<number> {
  const { count, error } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("course_key", courseKey);
  if (error) throw error;
  return (count ?? 0) + 1;
}

export function StudentsProvider({ children, isOwner }: { children: ReactNode; isOwner: boolean }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [dark, setDark] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [timings, setTimings] = useState<Timing[]>([]);
  const [currentBatch, setCurrentBatch] = useState<string>("2025");
  const [settingsLoading, setSettingsLoading] = useState(true);

  async function fetchStudents() {
    const { data: studentsData, error } = await supabase
      .from(isOwner ? "students" : "students_handler_view")
      .select("*");
    if (error) {
      toast.error("Failed to load students");
      setStudentsLoading(false);
      return;
    }
    const paymentsData = isOwner ? (await supabase.from("payments").select("*")).data : [];
    setStudents((studentsData ?? []).map((s) => mapRow(s, paymentsData ?? [])));
    setStudentsLoading(false);
  }

  async function fetchSettings() {
    const [coursesRes, teachersRes, timingsRes, batchRes] = await Promise.all([
      supabase.from("courses").select("*").order("course_name"),
      supabase.from("teachers").select("*").order("name"),
      supabase.from("timings").select("*").order("label"),
      supabase.from("settings").select("*").eq("key", "current_batch").maybeSingle(),
    ]);
    if (coursesRes.data) setCourses(coursesRes.data as Course[]);
    if (teachersRes.data) setTeachers(teachersRes.data as Teacher[]);
    if (timingsRes.data) setTimings(timingsRes.data as Timing[]);
    if (batchRes.data) setCurrentBatch(batchRes.data.value);
    setSettingsLoading(false);
  }

  useEffect(() => {
    fetchStudents();
  }, [isOwner]);

  useEffect(() => {
    fetchSettings();
  }, []);

  function openAdd() {
    setEditingId(null);
    setModalOpen(true);
  }
  function openEdit(id: string) {
    setEditingId(id);
    setModalOpen(true);
  }

  async function save(values: StudentFormValues) {
    const { photo, ...recordValues } = values;
    // score/grade/status are derived from weekly marks (uploadWeeklyExamCsv) — never set here.
    if (editingId) {
      const { attendance: _ignoredAttendance, ...updateValues } = recordValues;
      const { error } = await supabase
        .from("students")
        .update({
          ...updateValues,
          course_key: recordValues.course,
          photo: photo ?? undefined,
        })
        .eq("id", editingId);
      if (error) {
        toast.error("Failed to update student");
        return;
      }
      toast.success("Student record updated");
    } else {
      const key = values.course;
      const courseRow = courses.find((c) => c.course_key === key);
      if (!courseRow) {
        toast.error("Selected course not found — refresh and try again");
        return;
      }
      const fees = { admission: courseRow.admission_fee, course: courseRow.course_fee };
      const newId = await generateStudentId();
      const rollNo = await generateRollNo(key);
      const bsYear = await getCurrentBsYear();
      const {
        id: _ignoredFormId,
        attendance: _ignoredAttendance,
        ...recordValuesWithoutId
      } = recordValues;
      const { error } = await supabase.from("students").insert({
        ...recordValuesWithoutId,
        id: newId,
        roll_no: rollNo,
        bs_year: bsYear,
        attendance: 0,
        course_key: key,
        batch: currentBatch,
        score: null,
        grade: "",
        status: "",
        school: recordValuesWithoutId.school || "Not provided",
        prior: recordValuesWithoutId.prior || "Not provided",
        photo: photo ?? null,
        admission_fee: fees.admission,
        course_fee: fees.course,
      });
      if (error) {
        toast.error("Failed to add student");
        return;
      }
      toast.success("New student added");
    }
    setModalOpen(false);
    fetchStudents();
  }
  async function deleteStudent(id: string) {
    const target = students.find((s) => s.id === id);
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete student");
      return;
    }
    toast.success(`${target?.name ?? "Student"} record deleted`);
    fetchStudents();
  }

  async function addCourse(c: Omit<Course, "active">) {
    const { error } = await supabase.from("courses").insert(c);
    if (error) {
      toast.error("Failed to add course");
      return;
    }
    toast.success("Course added");
    fetchSettings();
  }
  async function updateCourse(courseKey: string, patch: Partial<Course>) {
    const { error } = await supabase.from("courses").update(patch).eq("course_key", courseKey);
    if (error) {
      toast.error("Failed to update course");
      return;
    }
    toast.success("Course updated");
    fetchSettings();
  }
  async function archiveCourse(courseKey: string, active: boolean) {
    const { error } = await supabase.from("courses").update({ active }).eq("course_key", courseKey);
    if (error) {
      toast.error("Failed to update course status");
      return;
    }
    toast.success(active ? "Course restored" : "Course archived");
    fetchSettings();
  }

  async function addTeacher(name: string) {
    const { error } = await supabase.from("teachers").insert({ name });
    if (error) {
      toast.error("Failed to add teacher");
      return;
    }
    toast.success("Teacher added");
    fetchSettings();
  }
  async function updateTeacher(id: string, patch: Partial<Teacher>) {
    const { error } = await supabase.from("teachers").update(patch).eq("id", id);
    if (error) {
      toast.error("Failed to update teacher");
      return;
    }
    toast.success("Teacher updated");
    fetchSettings();
  }
  async function archiveTeacher(id: string, active: boolean) {
    const { error } = await supabase.from("teachers").update({ active }).eq("id", id);
    if (error) {
      toast.error("Failed to update teacher status");
      return;
    }
    toast.success(active ? "Teacher restored" : "Teacher archived");
    fetchSettings();
  }

  async function addTiming(label: string) {
    const { error } = await supabase.from("timings").insert({ label });
    if (error) {
      toast.error("Failed to add timing");
      return;
    }
    toast.success("Timing added");
    fetchSettings();
  }
  async function updateTiming(id: string, patch: Partial<Timing>) {
    const { error } = await supabase.from("timings").update(patch).eq("id", id);
    if (error) {
      toast.error("Failed to update timing");
      return;
    }
    toast.success("Timing updated");
    fetchSettings();
  }
  async function archiveTiming(id: string, active: boolean) {
    const { error } = await supabase.from("timings").update({ active }).eq("id", id);
    if (error) {
      toast.error("Failed to update timing status");
      return;
    }
    toast.success(active ? "Timing restored" : "Timing archived");
    fetchSettings();
  }

  async function updateCurrentBatch(value: string) {
    const { error } = await supabase.from("settings").update({ value }).eq("key", "current_batch");
    if (error) {
      toast.error("Failed to update batch");
      return;
    }
    setCurrentBatch(value);
    toast.success(`Batch updated to ${value}`);
  }

  async function addPayment(id: string, payment: Omit<Payment, "id" | "voided">) {
    const { error } = await supabase.from("payments").insert({
      student_id: id,
      amount: payment.amount,
      date: payment.date,
      mode: payment.mode,
      note: payment.note ?? null,
    });
    if (error) {
      toast.error("Failed to record payment");
      return;
    }
    toast.success("Payment recorded");
    fetchStudents();
  }

  async function voidPayment(paymentId: string, voided: boolean) {
    const { error } = await supabase.from("payments").update({ voided }).eq("id", paymentId);
    if (error) {
      toast.error(voided ? "Failed to delete payment" : "Failed to restore payment");
      return;
    }
    toast.success(voided ? "Payment deleted" : "Payment restored");
    fetchStudents();
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkDelete() {
    const { error } = await supabase.from("students").delete().in("id", Array.from(selectedIds));
    if (error) {
      toast.error("Failed to delete selected students");
      return;
    }
    toast.success(`${selectedIds.size} student(s) deleted`);
    setSelectedIds(new Set());
    setSelectMode(false);
    fetchStudents();
  }

  function bulkExport() {
    const targets = students.filter((s) => selectedIds.has(s.id));
    const rows = [
      CSV_COLUMNS,
      ...targets.map((s) => [
        s.name,
        s.id,
        s.course,
        s.father,
        s.phone,
        s.address,
        String(s.score),
        String(s.attendance),
        s.teacher,
        s.timing,
        s.remarks,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "students-bulk-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${targets.length} student(s) exported`);
  }

  function parseCsvFile(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: ImportRow[] = results.data.map((raw, i) => {
          const errors: string[] = [];
          const missingCols = CSV_COLUMNS.filter((c) => !(c in raw));
          if (missingCols.length) errors.push(`Missing columns: ${missingCols.join(", ")}`);
          const parsed = studentSchema.safeParse(raw);
          if (!parsed.success) {
            for (const issue of parsed.error.issues) {
              errors.push(`${issue.path[0]}: ${issue.message}`);
            }
          }

          const rawCourse = (raw["course"] ?? "").trim().toLowerCase();
          const courseMatch = courses.some(
            (c) =>
              c.active &&
              (c.course_key.toLowerCase() === rawCourse ||
                c.course_name.toLowerCase() === rawCourse),
          );
          if (rawCourse && !courseMatch) errors.push(`Unknown course: ${raw["course"]}`);

          const rawTeacher = (raw["teacher"] ?? "").trim().toLowerCase();
          const teacherMatch = teachers.some(
            (t) => t.active && t.name.toLowerCase() === rawTeacher,
          );
          if (rawTeacher && !teacherMatch) errors.push(`Unknown teacher: ${raw["teacher"]}`);

          const rawTiming = (raw["timing"] ?? "").trim().toLowerCase();
          const timingMatch = timings.some((t) => t.active && t.label.toLowerCase() === rawTiming);
          if (rawTiming && !timingMatch) errors.push(`Unknown timing: ${raw["timing"]}`);

          return { rowNum: i + 2, raw, errors, duplicate: false };
        });
        setImportRows(rows);
        setImportModalOpen(true);
      },
      error: () => {
        toast.error("Could not parse CSV file");
      },
    });
  }

  async function commitImport(rows: ImportRow[]) {
    const valid = rows.filter((r) => r.errors.length === 0);
    if (!valid.length) {
      toast.error("No valid rows to import");
      return;
    }
    const bsYear = await getCurrentBsYear();
    const idCounts: Record<number, number> = {};
    const rollCounts: Record<string, number> = {};
    const newStudents = [];
    for (const r of valid) {
      const v = r.raw;
      const name = v["name"] ?? "";
      const course = v["course"] ?? "";
      const father = v["father"] ?? "";
      const phone = v["phone"] ?? "";
      const address = v["address"] ?? "";
      const teacher = v["teacher"] ?? "";
      const timing = v["timing"] ?? "";
      const remarks = v["remarks"] ?? "";
      const school = v["school"] ?? "";
      const prior = v["prior"] ?? "";
      const matchedCourse = courses.find(
        (c) =>
          c.course_key.toLowerCase() === course.toLowerCase() ||
          c.course_name.toLowerCase() === course.toLowerCase(),
      );
      const key = matchedCourse?.course_key ?? course; // unmatched CSV text kept as-is — Step 7 flags this as import error
      const fees = matchedCourse
        ? { admission: matchedCourse.admission_fee, course: matchedCourse.course_fee }
        : { admission: 0, course: 0 };
      if (idCounts[bsYear] === undefined) {
        const { count } = await supabase
          .from("students")
          .select("id", { count: "exact", head: true })
          .eq("bs_year", bsYear);
        idCounts[bsYear] = count ?? 0;
      }
      idCounts[bsYear]++;
      const newId = `ATI-${bsYear}-${String(idCounts[bsYear]).padStart(4, "0")}`;

      if (rollCounts[key] === undefined) {
        const { count } = await supabase
          .from("students")
          .select("id", { count: "exact", head: true })
          .eq("course_key", key);
        rollCounts[key] = count ?? 0;
      }
      rollCounts[key]++;
      const rollNo = rollCounts[key];

      newStudents.push({
        id: newId,
        roll_no: rollNo,
        bs_year: bsYear,
        name,
        course,
        course_key: key,
        father,
        phone,
        address,
        score: null,
        attendance: 0,
        teacher,
        timing,
        remarks,
        grade: "",
        status: "",
        batch: currentBatch,
        school: school || "Not provided",
        prior: prior || "Not provided",
        admission_fee: fees.admission,
        course_fee: fees.course,
      });
    }
    const { error } = await supabase.from("students").insert(newStudents);
    if (error) {
      toast.error("Failed to import students");
      return;
    }
    toast.success(`${newStudents.length} student(s) imported`);
    setImportModalOpen(false);
    setImportRows([]);
    fetchStudents();
  }

  async function uploadAttendanceCsv(
    courseKey: string,
    file: File,
    bsYear: number,
    bsMonth: number,
  ): Promise<{ success: number; failed: string[] }> {
    return new Promise((resolve) => {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const failed: string[] = [];
          let success = 0;

          if (!results.data.length) {
            resolve({ success: 0, failed: ["CSV has no data rows"] });
            return;
          }

          // day columns = every header key that's a plain number, e.g. "1".."32"
          const headerKeys = Object.keys(results.data[0] ?? {});
          const dayKeys = headerKeys.filter((k) => /^\d+$/.test(k.trim()));

          if (!dayKeys.length) {
            resolve({
              success: 0,
              failed: ["No day columns found — expected headers like 1,2,3...30"],
            });
            return;
          }

          for (let i = 0; i < results.data.length; i++) {
            const row = results.data[i];
            if (!row) continue;
            const rollNo = Number(row["roll_no"]);
            const rowNum = i + 2;

            if (!rollNo) {
              failed.push(`Row ${rowNum}: invalid roll_no`);
              continue;
            }

            const { data: student, error: lookupErr } = await supabase
              .from("students")
              .select("id")
              .eq("course_key", courseKey)
              .eq("roll_no", rollNo)
              .maybeSingle();

            if (lookupErr || !student) {
              failed.push(`Row ${rowNum}: no student with roll_no ${rollNo} in ${courseKey}`);
              continue;
            }

            const dayRecords: {
              student_id: string;
              course_key: string;
              date: string;
              status: string;
              bs_year: number;
              bs_month: number;
            }[] = [];

            for (const dayKey of dayKeys) {
              const statusRaw = (row[dayKey] ?? "").trim().toUpperCase();
              if (statusRaw !== "P" && statusRaw !== "A") continue; // blank/unmarked day — skip, not a failure

              const day = Number(dayKey);
              const greg = toGreg(bsYear, bsMonth, day);
              const adDate = `${greg.year}-${String(greg.month).padStart(2, "0")}-${String(greg.day).padStart(2, "0")}`;

              dayRecords.push({
                student_id: student.id,
                course_key: courseKey,
                date: adDate,
                status: statusRaw,
                bs_year: bsYear,
                bs_month: bsMonth,
              });
            }

            if (!dayRecords.length) {
              failed.push(`Row ${rowNum}: no valid P/A values found for roll_no ${rollNo}`);
              continue;
            }

            const { error: insertErr } = await supabase
              .from("attendance_log")
              .upsert(dayRecords, { onConflict: "student_id,date" });

            if (insertErr) {
              failed.push(`Row ${rowNum}: ${insertErr.message}`);
              continue;
            }

            success += dayRecords.length;
          }

          // students.attendance is recalculated by a DB trigger on attendance_log — no manual recompute needed here
          fetchStudents();
          resolve({ success, failed });
        },
        error: () => resolve({ success: 0, failed: ["Could not parse CSV file"] }),
      });
    });
  }

  async function uploadWeeklyExamCsv(
    courseKey: string,
    file: File,
    weekLabel: string,
    examDate: string,
  ): Promise<{ success: number; failed: string[] }> {
    return new Promise((resolve) => {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const failed: string[] = [];
          let success = 0;

          if (!results.data.length) {
            resolve({ success: 0, failed: ["CSV has no data rows"] });
            return;
          }

          // group rows by roll_no — one student can have multiple subject rows in same CSV
          const byRoll = new Map<
            number,
            { rowNum: number; subject: string; marks: string; maxMarks: string }[]
          >();

          for (let i = 0; i < results.data.length; i++) {
            const row = results.data[i];
            if (!row) continue;
            const rowNum = i + 2;
            const rollNo = Number(row["roll_no"]);
            const subject = (row["subject"] ?? "").trim();

            if (!rollNo) {
              failed.push(`Row ${rowNum}: invalid roll_no`);
              continue;
            }
            if (!subject) {
              failed.push(`Row ${rowNum}: missing subject`);
              continue;
            }

            const entries = byRoll.get(rollNo) ?? [];
            entries.push({
              rowNum,
              subject,
              marks: row["marks"] ?? "",
              maxMarks: row["max_marks"] ?? "",
            });
            byRoll.set(rollNo, entries);
          }

          for (const [rollNo, entries] of byRoll) {
            const { data: student, error: lookupErr } = await supabase
              .from("students")
              .select("id, weekly")
              .eq("course_key", courseKey)
              .eq("roll_no", rollNo)
              .maybeSingle();

            if (lookupErr || !student) {
              for (const e of entries) {
                failed.push(`Row ${e.rowNum}: no student with roll_no ${rollNo} in ${courseKey}`);
              }
              continue;
            }

            let weekly: {
              label: string;
              subject: string;
              score: number;
              max: number;
              date: string;
            }[] = student.weekly ?? [];

            for (const e of entries) {
              const marks = Number(e.marks);
              if (Number.isNaN(marks)) {
                failed.push(`Row ${e.rowNum}: invalid marks for roll_no ${rollNo}`);
                continue;
              }
              const maxMarks = e.maxMarks.trim() ? Number(e.maxMarks) : 50;
              if (Number.isNaN(maxMarks) || maxMarks <= 0) {
                failed.push(`Row ${e.rowNum}: invalid max_marks for roll_no ${rollNo}`);
                continue;
              }
              if (marks > maxMarks) {
                failed.push(
                  `Row ${e.rowNum}: marks (${marks}) exceeds max_marks (${maxMarks}) for roll_no ${rollNo}`,
                );
                continue;
              }

              // upsert by (label, subject), case/whitespace-insensitive — drop old entry for same week+subject, add fresh one
              weekly = weekly.filter(
                (w) =>
                  !(
                    w.label.trim().toLowerCase() === weekLabel.trim().toLowerCase() &&
                    w.subject === e.subject
                  ),
              );
              weekly.push({
                label: weekLabel.trim().replace(/^week\s+(\d+)$/i, "Week $1"),
                subject: e.subject,
                score: marks,
                max: maxMarks,
                date: examDate,
              });
              success++;
            }

            const overallScore = weekly.length
              ? Math.round(
                  weekly.reduce((sum, w) => sum + (w.score / w.max) * 100, 0) / weekly.length,
                )
              : null; // null → UI shows "—", not 0%

            const { error: updateErr } = await supabase
              .from("students")
              .update({
                weekly,
                score: overallScore,
                grade: overallScore !== null ? gradeFor(overallScore) : "",
                status: overallScore !== null ? statusFor(overallScore) : "",
              })
              .eq("id", student.id);

            if (updateErr) {
              for (const e of entries) failed.push(`Row ${e.rowNum}: ${updateErr.message}`);
            }
          }

          fetchStudents();
          resolve({ success, failed });
        },
        error: () => resolve({ success: 0, failed: ["Could not parse CSV file"] }),
      });
    });
  }

  async function resetWeeklyForStudent(studentId: string): Promise<void> {
    const { error } = await supabase
      .from("students")
      .update({ weekly: [], score: null, grade: "", status: "" })
      .eq("id", studentId);
    if (error) {
      console.error("resetWeeklyForStudent error:", error);
      toast.error("Failed to reset weekly marks");
      return;
    }
    toast.success("Weekly marks reset");
    fetchStudents();
  }

  async function resetWeeklyForCourse(courseKey: string): Promise<number> {
    const { data: targets, error: lookupErr } = await supabase
      .from("students")
      .select("id")
      .eq("course_key", courseKey);

    if (lookupErr || !targets) {
      toast.error("Failed to look up students for this course");
      return 0;
    }

    if (!targets.length) {
      toast.error("No students found in this course");
      return 0;
    }

    const { error } = await supabase
      .from("students")
      .update({ weekly: [], score: null, grade: "", status: "" })
      .eq("course_key", courseKey);

    if (error) {
      console.error("resetWeeklyForCourse error:", error);
      toast.error("Failed to reset weekly marks");
      return 0;
    }

    toast.success(`Weekly marks reset for ${targets.length} student(s)`);
    fetchStudents();
    return targets.length;
  }

  async function uploadMonthlyExamCsv(
    courseKey: string,
    file: File,
    monthLabel: string,
    examDate: string,
  ): Promise<{ success: number; failed: string[] }> {
    return new Promise((resolve) => {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const failed: string[] = [];
          let success = 0;

          if (!results.data.length) {
            resolve({ success: 0, failed: ["CSV has no data rows"] });
            return;
          }

          const byRoll = new Map<
            number,
            { rowNum: number; subject: string; marks: string; maxMarks: string }[]
          >();

          for (let i = 0; i < results.data.length; i++) {
            const row = results.data[i];
            if (!row) continue;
            const rowNum = i + 2;
            const rollNo = Number(row["roll_no"]);
            const subject = (row["subject"] ?? "").trim();

            if (!rollNo) {
              failed.push(`Row ${rowNum}: invalid roll_no`);
              continue;
            }
            if (!subject) {
              failed.push(`Row ${rowNum}: missing subject`);
              continue;
            }

            const entries = byRoll.get(rollNo) ?? [];
            entries.push({
              rowNum,
              subject,
              marks: row["marks"] ?? "",
              maxMarks: row["max_marks"] ?? "",
            });
            byRoll.set(rollNo, entries);
          }

          for (const [rollNo, entries] of byRoll) {
            const { data: student, error: lookupErr } = await supabase
              .from("students")
              .select("id, monthly")
              .eq("course_key", courseKey)
              .eq("roll_no", rollNo)
              .maybeSingle();

            if (lookupErr || !student) {
              for (const e of entries) {
                failed.push(`Row ${e.rowNum}: no student with roll_no ${rollNo} in ${courseKey}`);
              }
              continue;
            }

            let monthly: {
              label: string;
              subject: string;
              score: number;
              max: number;
              date: string;
            }[] = student.monthly ?? [];

            for (const e of entries) {
              const marks = Number(e.marks);
              if (Number.isNaN(marks)) {
                failed.push(`Row ${e.rowNum}: invalid marks for roll_no ${rollNo}`);
                continue;
              }
              const maxMarks = e.maxMarks.trim() ? Number(e.maxMarks) : 50;
              if (Number.isNaN(maxMarks) || maxMarks <= 0) {
                failed.push(`Row ${e.rowNum}: invalid max_marks for roll_no ${rollNo}`);
                continue;
              }
              if (marks > maxMarks) {
                failed.push(
                  `Row ${e.rowNum}: marks (${marks}) exceeds max_marks (${maxMarks}) for roll_no ${rollNo}`,
                );
                continue;
              }

              // upsert by (label, subject) — same-month re-upload overwrites, no duplicates
              monthly = monthly.filter(
                (m) =>
                  !(
                    m.label.trim().toLowerCase() === monthLabel.trim().toLowerCase() &&
                    m.subject === e.subject
                  ),
              );
              monthly.push({
                label: monthLabel.trim(),
                subject: e.subject,
                score: marks,
                max: maxMarks,
                date: examDate,
              });
              success++;
            }

            // monthly does NOT touch students.score/grade/status — that stays weekly-only, locked earlier
            const { error: updateErr } = await supabase
              .from("students")
              .update({ monthly })
              .eq("id", student.id);

            if (updateErr) {
              for (const e of entries) failed.push(`Row ${e.rowNum}: ${updateErr.message}`);
            }
          }

          fetchStudents();
          resolve({ success, failed });
        },
        error: () => resolve({ success: 0, failed: ["Could not parse CSV file"] }),
      });
    });
  }

  async function resetMonthlyForStudent(studentId: string): Promise<void> {
    const { error } = await supabase.from("students").update({ monthly: [] }).eq("id", studentId);
    if (error) {
      console.error("resetMonthlyForStudent error:", error);
      toast.error("Failed to reset monthly marks");
      return;
    }
    toast.success("Monthly marks reset");
    fetchStudents();
  }

  async function resetMonthlyForCourse(courseKey: string): Promise<number> {
    const { data: targets, error: lookupErr } = await supabase
      .from("students")
      .select("id")
      .eq("course_key", courseKey);

    if (lookupErr || !targets) {
      toast.error("Failed to look up students for this course");
      return 0;
    }

    if (!targets.length) {
      toast.error("No students found in this course");
      return 0;
    }

    const { error } = await supabase
      .from("students")
      .update({ monthly: [] })
      .eq("course_key", courseKey);

    if (error) {
      console.error("resetMonthlyForCourse error:", error);
      toast.error("Failed to reset monthly marks");
      return 0;
    }

    toast.success(`Monthly marks reset for ${targets.length} student(s)`);
    fetchStudents();
    return targets.length;
  }

  async function resetAttendanceForCourseMonth(
    courseKey: string,
    bsYear: number,
    bsMonth: number,
  ): Promise<number> {
    const { data: deleted, error } = await supabase
      .from("attendance_log")
      .delete()
      .eq("course_key", courseKey)
      .eq("bs_year", bsYear)
      .eq("bs_month", bsMonth)
      .select("id");

    if (error) {
      toast.error("Failed to reset attendance");
      return 0;
    }

    const count = deleted?.length ?? 0;
    toast.success(`Attendance reset — ${count} record(s) removed`);
    fetchStudents();
    return count;
  }

  return (
    <StudentsContext.Provider
      value={{
        students,
        studentsLoading,
        dark,
        setDark,
        modalOpen,
        setModalOpen,
        editingId,
        openAdd,
        openEdit,
        save,
        deleteStudent,
        addPayment,
        voidPayment,
        selectMode,
        setSelectMode,
        selectedIds,
        toggleSelect,
        bulkDelete,
        bulkExport,
        importRows,
        importModalOpen,
        setImportModalOpen,
        parseCsvFile,
        commitImport,
        uploadAttendanceCsv,
        uploadWeeklyExamCsv,
        resetWeeklyForStudent,
        resetWeeklyForCourse,
        uploadMonthlyExamCsv,
        resetMonthlyForStudent,
        resetMonthlyForCourse,
        courses,
        teachers,
        timings,
        currentBatch,
        settingsLoading,
        addCourse,
        updateCourse,
        archiveCourse,
        addTeacher,
        updateTeacher,
        archiveTeacher,
        addTiming,
        updateTiming,
        archiveTiming,
        updateCurrentBatch,
        resetAttendanceForCourseMonth,
      }}
    >
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents() {
  const ctx = useContext(StudentsContext);
  if (!ctx) throw new Error("useStudents must be used within StudentsProvider");
  return ctx;
}
