import { useState } from "react";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStudents } from "@/context/StudentsContext";
import { NEPALI_MONTHS, type Student } from "@/lib/types";
import { exportWorkbook, type ExportSheet } from "@/lib/sheets";
import {
  buildCourseRows,
  buildMonthlyRows,
  buildStudentRows,
  buildTeacherRows,
  buildTimingRows,
  buildWeeklyRows,
  exportFileName,
  fetchAttendanceRows,
  filterStudents,
} from "@/lib/export-rows";

type Include = {
  students: boolean;
  attendance: boolean;
  weekly: boolean;
  monthly: boolean;
  settings: boolean;
};

const ALL: Include = {
  students: true,
  attendance: true,
  weekly: true,
  monthly: true,
  settings: true,
};
const NONE: Include = {
  students: false,
  attendance: false,
  weekly: false,
  monthly: false,
  settings: false,
};

const ITEMS: [keyof Include, string][] = [
  ["students", "Students list"],
  ["attendance", "Attendance"],
  ["weekly", "Weekly marks"],
  ["monthly", "Monthly marks"],
  ["settings", "Settings (courses, teachers, timings)"],
];

export function ExportDialog({ students }: { students: Student[] }) {
  const { courses, teachers, timings } = useStudents();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [courseKey, setCourseKey] = useState("");
  const [batch, setBatch] = useState("");
  const [teacher, setTeacher] = useState("");
  const [timing, setTiming] = useState("");
  const [inc, setInc] = useState<Include>(ALL);
  const [attMonth, setAttMonth] = useState(0); // 0 = all
  const [attYear, setAttYear] = useState(2083);

  const batches = Array.from(new Set(students.map((s) => s.batch))).sort();
  const anyTicked = Object.values(inc).some(Boolean);
  const activeFilters = [courseKey, batch, teacher, timing].filter(Boolean).length;

  function clearFilters() {
    setCourseKey("");
    setBatch("");
    setTeacher("");
    setTiming("");
  }

  function preset(p: "all" | "attendance" | "marks" | "students") {
    if (p === "all") setInc(ALL);
    if (p === "attendance") setInc({ ...NONE, attendance: true });
    if (p === "marks") setInc({ ...NONE, weekly: true, monthly: true });
    if (p === "students") setInc({ ...NONE, students: true });
  }

  async function handleExport() {
    setBusy(true);
    try {
      const list = filterStudents(students, { courseKey, batch, teacher, timing });
      const sheets: ExportSheet[] = [];

      if (inc.students) sheets.push({ name: "Students", rows: buildStudentRows(list) });
      if (inc.attendance) {
        const range = attMonth ? { bsYear: attYear, bsMonth: attMonth } : null;
        const rows = await fetchAttendanceRows(list, range);
        sheets.push({ name: "Attendance", rows });
      }
      if (inc.weekly) sheets.push({ name: "Weekly Marks", rows: buildWeeklyRows(list) });
      if (inc.monthly) sheets.push({ name: "Monthly Marks", rows: buildMonthlyRows(list) });
      if (inc.settings) {
        sheets.push({ name: "Courses", rows: buildCourseRows(courses, courseKey) });
        sheets.push({ name: "Teachers", rows: buildTeacherRows(teachers) });
        sheets.push({ name: "Timings", rows: buildTimingRows(timings) });
      }

      if (!sheets.some((s) => s.rows.length > 0)) {
        toast.error("Nothing to export for this filter");
        return;
      }

      const saved = await exportWorkbook(sheets, exportFileName(courseKey));
      if (!saved) return; // user cancelled the save dialog
      const summary = sheets
        .filter((s) => s.rows.length > 0)
        .map((s) => `${s.name} (${s.rows.length})`)
        .join(", ");
      toast.success(`Exported: ${summary}`);
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileDown /> Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Export data
            {activeFilters > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({activeFilters} filter{activeFilters > 1 ? "s" : ""} active)
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Downloads a readable Excel file. Your live data is not changed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => preset("all")}>
            Everything
          </Button>
          <Button size="sm" variant="outline" onClick={() => preset("attendance")}>
            Attendance only
          </Button>
          <Button size="sm" variant="outline" onClick={() => preset("marks")}>
            Marks only
          </Button>
          <Button size="sm" variant="outline" onClick={() => preset("students")}>
            Students only
          </Button>
          {activeFilters > 0 && (
            <Button size="sm" variant="ghost" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="filter-control">
            <span>Course</span>
            <select value={courseKey} onChange={(e) => setCourseKey(e.target.value)}>
              <option value="">All courses</option>
              {courses.map((c) => (
                <option key={c.course_key} value={c.course_key}>
                  {c.course_key}
                  {c.active ? "" : " (archived)"}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-control">
            <span>Batch</span>
            <select value={batch} onChange={(e) => setBatch(e.target.value)}>
              <option value="">All batches</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-control">
            <span>Teacher</span>
            <select value={teacher} onChange={(e) => setTeacher(e.target.value)}>
              <option value="">All teachers</option>
              {teachers
                .filter((t) => t.active)
                .map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="filter-control">
            <span>Timing</span>
            <select value={timing} onChange={(e) => setTiming(e.target.value)}>
              <option value="">All timings</option>
              {timings
                .filter((t) => t.active)
                .map((t) => (
                  <option key={t.id} value={t.label}>
                    {t.label}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <div className="grid gap-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Include</div>
          {ITEMS.map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={inc[key]}
                onChange={(e) => setInc((prev) => ({ ...prev, [key]: e.target.checked }))}
              />
              {label}
            </label>
          ))}
        </div>

        {inc.attendance && (
          <div className="grid grid-cols-2 gap-3">
            <label className="filter-control">
              <span>Month (BS)</span>
              <select value={attMonth} onChange={(e) => setAttMonth(Number(e.target.value))}>
                <option value={0}>All months</option>
                {NEPALI_MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            {attMonth > 0 && (
              <label className="filter-control">
                <span>Year (BS)</span>
                <input
                  type="number"
                  value={attYear}
                  onChange={(e) => setAttYear(Number(e.target.value))}
                />
              </label>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={busy || !anyTicked}>
            {busy ? "Preparing..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
