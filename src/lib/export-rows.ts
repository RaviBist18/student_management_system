import { supabase } from "@/lib/supabase";
import type { Student } from "@/lib/types";
import type { ExportSheet } from "@/lib/sheets";

type Row = ExportSheet["rows"][number];

// Matches the inline types in StudentsContext.tsx
type Course = {
  course_key: string;
  course_name: string;
  admission_fee: number;
  course_fee: number;
  active: boolean;
};
type Teacher = { id: string; name: string; active: boolean };
type Timing = { id: string; label: string; active: boolean };

type AttendanceRow = {
  student_id: string;
  course_key: string;
  date: string;
  status: string;
  bs_year: number;
  bs_month: number;
};

export type ExportFilter = {
  courseKey: string; // "" = all courses
  batch: string; // "" = all batches
  teacher: string; // "" = all teachers
  timing: string; // "" = all timings
};

export type AttendanceRange = { bsYear: number; bsMonth: number } | null; // null = all

function pct(score: number, max: number): number | null {
  return max > 0 ? Math.round((score / max) * 1000) / 10 : null;
}

function byCourseThenRoll(a: Student, b: Student): number {
  return a.courseKey.localeCompare(b.courseKey) || a.rollNo - b.rollNo;
}

export function filterStudents(students: Student[], f: ExportFilter): Student[] {
  return students
    .filter(
      (s) =>
        (!f.courseKey || s.courseKey === f.courseKey) &&
        (!f.batch || s.batch === f.batch) &&
        (!f.teacher || s.teacher === f.teacher) &&
        (!f.timing || s.timing === f.timing),
    )
    .sort(byCourseThenRoll);
}

export function buildStudentRows(students: Student[]): Row[] {
  return students.map((s) => ({
    "Student ID": s.id,
    "Roll No": s.rollNo,
    Name: s.name,
    Course: s.courseKey,
    Batch: s.batch,
    Father: s.father,
    Phone: s.phone,
    Address: s.address,
    Teacher: s.teacher,
    Timing: s.timing,
    Score: s.score,
    Grade: s.grade,
    Status: s.status,
    "Attendance %": s.attendance,
  }));
}

function buildExamRows(students: Student[], kind: "weekly" | "monthly"): Row[] {
  const labelHeader = kind === "weekly" ? "Week" : "Month";
  const rows: Row[] = [];
  for (const s of students) {
    for (const e of s[kind]) {
      const marks = Number(e.score);
      const max = Number(e.max);
      rows.push({
        "Student ID": s.id,
        "Roll No": s.rollNo,
        Name: s.name,
        Course: s.courseKey,
        [labelHeader]: e.label,
        Date: e.date,
        Subject: e.subject,
        Marks: marks,
        Max: max,
        "%": pct(marks, max),
      });
    }
  }
  return rows;
}

export const buildWeeklyRows = (students: Student[]) => buildExamRows(students, "weekly");
export const buildMonthlyRows = (students: Student[]) => buildExamRows(students, "monthly");

/**
 * Pulls attendance straight from Supabase for the given (already filtered) students.
 * range = null means all months.
 */
export async function fetchAttendanceRows(
  students: Student[],
  range: AttendanceRange,
): Promise<Row[]> {
  if (!students.length) return [];
  const ids = students.map((s) => s.id);

  let query = supabase.from("attendance_log").select("*").in("student_id", ids);
  if (range) {
    query = query.eq("bs_year", range.bsYear).eq("bs_month", range.bsMonth);
  }
  const { data, error } = await query;
  if (error || !data) return [];

  const byId = new Map(students.map((s) => [s.id, s]));
  const rows: { s: Student; a: AttendanceRow }[] = [];
  for (const a of data as AttendanceRow[]) {
    const s = byId.get(a.student_id);
    if (!s) continue;
    rows.push({ s, a });
  }
  rows.sort((x, y) => byCourseThenRoll(x.s, y.s) || x.a.date.localeCompare(y.a.date));

  return rows.map(({ s, a }) => ({
    "Student ID": s.id,
    "Roll No": s.rollNo,
    Name: s.name,
    Course: s.courseKey,
    Date: a.date,
    Status: a.status === "P" ? "Present" : "Absent",
  }));
}

export function buildCourseRows(courses: Course[], courseKey: string): Row[] {
  return courses
    .filter((c) => !courseKey || c.course_key === courseKey)
    .map((c) => ({
      "Course Key": c.course_key,
      "Course Name": c.course_name,
      "Admission Fee": c.admission_fee,
      "Course Fee": c.course_fee,
      Active: c.active ? "Yes" : "No",
    }));
}

export const buildTeacherRows = (teachers: Teacher[]): Row[] =>
  teachers.map((t) => ({ Name: t.name, Active: t.active ? "Yes" : "No" }));

export const buildTimingRows = (timings: Timing[]): Row[] =>
  timings.map((t) => ({ Timing: t.label, Active: t.active ? "Yes" : "No" }));

export function exportFileName(courseKey: string): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  const course = (courseKey || "All").replace(/[\\/:*?"<>|]/g, "-");
  return `ATI-export-${course}-${date}.xlsx`;
}
