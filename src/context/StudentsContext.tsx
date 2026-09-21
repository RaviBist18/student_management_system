import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import Papa from "papaparse";
import type { Student, Payment, ImportRow } from "@/lib/types";
import { FEE_MAP, CSV_COLUMNS } from "@/lib/types";
import { studentSchema, type StudentFormValues } from "@/lib/schema";
import { gradeFor, statusFor } from "@/lib/helpers";
import { supabase } from "@/lib/supabase";
import { toBik_euro, toGreg } from "bikram-sambat";

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
  addPayment: (id: string, payment: Omit<Payment, "id">) => void;
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
  resetAttendanceForCourseMonth: (
    courseKey: string,
    bsYear: number,
    bsMonth: number,
  ) => Promise<number>;
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
    attendance: Number(s.attendance),
    status: s.status ?? "",
    remarks: s.remarks ?? "",
    weekly: s.weekly ?? [],
    monthly: s.monthly ?? [],
    photo: s.photo ?? undefined,
    teacher: s.teacher ?? "",
    timing: s.timing ?? "",
    admissionFee: Number(s.admission_fee),
    courseFee: Number(s.course_fee),
    payments: payments
      .filter((p) => p.student_id === s.id)
      .map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        date: p.date,
        mode: p.mode,
        note: p.note ?? undefined,
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

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [dark, setDark] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);

  async function fetchStudents() {
    const { data: studentsData, error } = await supabase.from("students").select("*");
    if (error) {
      toast.error("Failed to load students");
      setStudentsLoading(false);
      return;
    }
    const { data: paymentsData } = await supabase.from("payments").select("*");
    setStudents((studentsData ?? []).map((s) => mapRow(s, paymentsData ?? [])));
    setStudentsLoading(false);
  }

  useEffect(() => {
    fetchStudents();
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
      const key = values.course.toLowerCase().includes("python")
        ? "Python"
        : values.course.toLowerCase().includes("design")
          ? "Graphic Design"
          : values.course.toLowerCase().includes("web")
            ? "Web Dev"
            : "MDCT";
      const fees = FEE_MAP[key] ?? { admission: 3000, course: 35000 };
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
        batch: "2025",
        score: null,
        grade: "",
        status: "",
        school: "Not provided",
        prior: "Not provided",
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

  async function addPayment(id: string, payment: Omit<Payment, "id">) {
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
          const rawId = raw["id"] ?? "";
          const duplicate = students.some((s) => s.id === rawId);
          if (duplicate) errors.push(`Duplicate student ID: ${rawId}`);
          return { rowNum: i + 2, raw, errors, duplicate };
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
    const newStudents = valid.map((r) => {
      const v = r.raw;
      const name = v["name"] ?? "";
      const id = v["id"] ?? "";
      const course = v["course"] ?? "";
      const father = v["father"] ?? "";
      const phone = v["phone"] ?? "";
      const address = v["address"] ?? "";
      const teacher = v["teacher"] ?? "";
      const timing = v["timing"] ?? "";
      const remarks = v["remarks"] ?? "";
      const score = Number(v["score"] ?? 0);
      const attendance = 0; // ignored — real value comes from attendance-log uploads only
      const key = course.toLowerCase().includes("python")
        ? "Python"
        : course.toLowerCase().includes("design")
          ? "Graphic Design"
          : course.toLowerCase().includes("web")
            ? "Web Dev"
            : "MDCT";
      const fees = FEE_MAP[key] ?? { admission: 3000, course: 35000 };
      return {
        id,
        name,
        course,
        course_key: key,
        father,
        phone,
        address,
        score,
        attendance,
        teacher,
        timing,
        remarks,
        grade: gradeFor(score),
        status: statusFor(score),
        batch: "2025",
        school: "Not provided",
        prior: "Not provided",
        admission_fee: fees.admission,
        course_fee: fees.course,
      };
    });
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
