import {
  BarChart3,
  BookOpen,
  Award,
  CalendarDays,
  Check,
  FileSpreadsheet,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  LogOut,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { ExportDialog } from "@/components/ExportDialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Student } from "@/lib/types";
import { Brand } from "@/components/Brand";
import { StudentCard } from "@/components/StudentCard";
import { useStudents } from "@/context/StudentsContext";

const BS_MONTHS = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashoj",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

export function Dashboard({
  students,
  visible,
  query,
  setQuery,
  course,
  setCourse,
  batch,
  setBatch,
  status,
  setStatus,
  teacher,
  setTeacher,
  timing,
  setTiming,
  sortBy,
  setSortBy,
  dark,
  setDark,
  onAdd,
  isOwner,
  onAnalytics,
  onSettings,
  onSelect,
  onUpload,
  onUploadAttendance,
  onUploadMarks,
  onResetWeeklyForCourse,
  onResetAttendanceForCourseMonth,
  onUploadMonthlyMarks,
  onResetMonthlyForCourse,
  uploadMessage,
  onDelete,
  selectMode,
  setSelectMode,
  selectedIds,
  onToggleSelect,
  onBulkDelete,
  onBulkExport,
  onLogout,
  pageItems,
  page,
  pageCount,
  setPage,
  onCourseBreakdown,
  onAttendanceBreakdown,
}: {
  students: Student[];
  visible: Student[];
  query: string;
  setQuery: (v: string) => void;
  course: string;
  setCourse: (v: string) => void;
  batch: string;
  setBatch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  teacher: string;
  setTeacher: (v: string) => void;
  timing: string;
  setTiming: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  onAdd: () => void;
  isOwner: boolean;
  onAnalytics: () => void;
  onSettings: () => void;
  onSelect: (id: string) => void;
  onUpload: () => void;
  onUploadAttendance: () => void;
  onUploadMarks: () => void;
  onResetWeeklyForCourse: (courseKey: string) => Promise<number>;
  onResetAttendanceForCourseMonth: (
    courseKey: string,
    bsYear: number,
    bsMonth: number,
  ) => Promise<number>;
  onUploadMonthlyMarks: () => void;
  onResetMonthlyForCourse: (courseKey: string) => Promise<number>;
  uploadMessage: string;
  onDelete: (id: string) => void;
  selectMode: boolean;
  setSelectMode: (v: boolean) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onLogout: () => void;
  pageItems: Student[];
  page: number;
  pageCount: number;
  setPage: (v: number) => void;
  onCourseBreakdown: () => void;
  onAttendanceBreakdown: () => void;
}) {
  const { courses, teachers, timings } = useStudents();
  function resetFiltersAndScroll() {
    setQuery("");
    setCourse("All Courses");
    setBatch("All Batches");
    setStatus("All Statuses");
    setTeacher("All Teachers");
    setTiming("All Timings");
    document.getElementById("student-cards-grid")?.scrollIntoView({ behavior: "smooth" });
  }
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [resetCourse, setResetCourse] = useState("MDCT");
  const [attResetCourse, setAttResetCourse] = useState("MDCT");
  const [monthlyResetCourse, setMonthlyResetCourse] = useState("MDCT");
  const [attResetMonth, setAttResetMonth] = useState(1);
  const [attResetYear, setAttResetYear] = useState(2082);

  useEffect(() => {
    if (
      course !== "All Courses" ||
      batch !== "All Batches" ||
      status !== "All Statuses" ||
      teacher !== "All Teachers" ||
      timing !== "All Timings"
    ) {
      document
        .getElementById("student-cards-grid")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [course, batch, status, teacher, timing]);
  const searchMatches =
    query.trim().length > 0
      ? students
          .filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()))
          .slice(0, 8)
      : [];
  const metrics = [
    [
      "Total students",
      String(students.length).padStart(2, "0"),
      Users,
      "primary",
      resetFiltersAndScroll,
    ],
    [
      "Active courses",
      String(
        new Set(
          students
            .map((s) => s.courseKey)
            .filter((key) => courses.some((c) => c.course_key === key && c.active)),
        ).size,
      ).padStart(2, "0"),
      BookOpen,
      "violet",
      onCourseBreakdown,
    ],
    [
      "Avg. attendance",
      (() => {
        const withData = students.filter(
          (s): s is typeof s & { attendance: number } => s.attendance !== null,
        );
        return withData.length
          ? `${(withData.reduce((a, s) => a + s.attendance, 0) / withData.length).toFixed(2)}%`
          : "—";
      })(),
      CalendarDays,
      "emerald",
      onAttendanceBreakdown,
    ],
    [
      "Top performers",
      String(students.filter((s) => s.status === "Top Performer").length).padStart(2, "0"),
      Award,
      "amber",
      () => {
        setStatus("Top Performers");
        requestAnimationFrame(() => {
          document.getElementById("student-cards-grid")?.scrollIntoView({ behavior: "smooth" });
        });
      },
    ],
  ] as Array<[string, string, typeof Users, string, (() => void) | null]>;
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-header/90 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-4 lg:flex-row lg:flex-nowrap lg:items-center lg:gap-4 lg:px-8">
          <div className="flex w-full items-center justify-between gap-2 lg:w-auto lg:justify-start">
            <Brand onClick={() => window.scrollTo({ top: 0, behavior: "instant" })} />
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="outline"
                size="icon"
                title={dark ? "Switch to light mode" : "Switch to dark mode"}
                onClick={() => setDark(!dark)}
              >
                {dark ? <Sun /> : <Moon />}
              </Button>
              <Button variant="outline" size="icon" title="Upload CSV" onClick={onUpload}>
                <Upload />
              </Button>
              <Button variant="outline" size="icon" title="Settings" onClick={onSettings}>
                <Settings />
              </Button>
              <Button variant="outline" size="icon" title="Log out" onClick={onLogout}>
                <LogOut />
              </Button>
            </div>
          </div>
          <div className="flex w-full items-center gap-2 lg:ml-8 lg:max-w-xl">
            <div className="relative flex-1">
              <div className="flex items-center gap-2 rounded-md border border-border bg-surface-raised px-3">
                <Search className="size-4 text-muted-foreground" />
                <input
                  aria-label="Search students"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(-1);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyDown={(e) => {
                    if (!searchMatches.length) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveIndex((i) => (i + 1) % searchMatches.length);
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveIndex((i) => (i <= 0 ? searchMatches.length - 1 : i - 1));
                    } else if (e.key === "Enter" && activeIndex >= 0) {
                      e.preventDefault();
                      const s = searchMatches[activeIndex];
                      if (s) {
                        setQuery("");
                        setShowSuggestions(false);
                        onSelect(s.id);
                      }
                    } else if (e.key === "Escape") {
                      setShowSuggestions(false);
                    }
                  }}
                  className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Search by name, student ID or phone..."
                />
              </div>
              {showSuggestions && searchMatches.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-72 overflow-y-auto rounded-md border border-border bg-surface-raised shadow-lg">
                  {searchMatches.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setQuery("");
                        setShowSuggestions(false);
                        onSelect(s.id);
                      }}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${
                        i === activeIndex ? "bg-primary/10" : "hover:bg-primary/10"
                      }`}
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{s.id}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={onAdd} className="shrink-0 lg:hidden">
              <Plus /> Add New Student
            </Button>
          </div>
          <div className="hidden lg:flex lg:items-center lg:gap-2 lg:ml-auto">
            <Button
              variant="outline"
              size="icon"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun /> : <Moon />}
            </Button>
            <Button variant="outline" onClick={onUpload}>
              <Upload /> Upload CSV
            </Button>
            <ExportDialog students={students} />

            <Button variant="outline" size="icon" title="Settings" onClick={onSettings}>
              <Settings />
            </Button>
            <Button variant="outline" size="icon" title="Log out" onClick={onLogout}>
              <LogOut />
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1400px] px-5 py-9 lg:px-8 lg:py-14">
        <section className="mb-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="eyebrow">Operator dashboard</div>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Student overview</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage records and open presentation-ready performance profiles.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <div className="operator-tag">
                <span className="status-dot" /> Operator Mode{" "}
                <span className="text-muted-foreground">· Logged in as Admin</span>
              </div>
            </div>
          </div>
        </section>
        {uploadMessage && (
          <div className="mb-5 flex items-center gap-2 rounded-md border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">
            <Check className="size-4" />
            {uploadMessage}
          </div>
        )}
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value, Icon, tone, onClick]) => (
            <div
              className={`flex min-h-28 items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-sm backdrop-blur-xl${onClick ? " cursor-pointer transition hover:border-primary/50" : ""}`}
              key={label}
              onClick={onClick ?? undefined}
              role={onClick ? "button" : undefined}
              tabIndex={onClick ? 0 : undefined}
            >
              <div className={`metric-icon metric-${tone}`}>
                <Icon />
              </div>
              <div>
                <div className="metric-value">{value}</div>
                <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
              </div>
            </div>
          ))}
        </section>
        <section
          id="student-list-section"
          className="sticky top-[73px] z-20 mt-10 flex flex-col gap-6 border-y border-border bg-background py-6 lg:flex-row lg:items-start"
        >
          <div>
            <h2
              className="text-lg font-bold cursor-pointer hover:text-primary transition"
              onClick={resetFiltersAndScroll}
            >
              Student records
            </h2>
            <p className="text-sm text-muted-foreground">
              Showing {visible.length} of {students.length} students
            </p>
            <div className="mt-3 flex flex-wrap gap-5">
              <Button onClick={onAdd}>
                <Plus /> Add New Student
              </Button>
              <Button variant="outline" onClick={onAnalytics}>
                <BarChart3 /> Analytics
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:ml-auto lg:w-auto lg:grid-cols-3">
            {[
              [
                "Course",
                course,
                setCourse,
                ["All Courses", ...courses.filter((c) => c.active).map((c) => c.course_key)],
              ],
              [
                "Batch",
                batch,
                setBatch,
                ["All Batches", ...Array.from(new Set(students.map((s) => s.batch))).sort()],
              ],
              [
                "Performance",
                status,
                setStatus,
                ["All Statuses", "Top Performers", "Needs Attention"],
              ],
              [
                "Teacher",
                teacher,
                setTeacher,
                ["All Teachers", ...teachers.filter((t) => t.active).map((t) => t.name)],
              ],
              [
                "Timing",
                timing,
                setTiming,
                ["All Timings", ...timings.filter((t) => t.active).map((t) => t.label)],
              ],
              [
                "Sort by",
                sortBy,
                setSortBy,
                [
                  "Name (A-Z)",
                  "Name (Z-A)",
                  "Score (High-Low)",
                  "Score (Low-High)",
                  "Attendance (High-Low)",
                  "Attendance (Low-High)",
                ],
              ],
            ].map(([label, value, setter, options]) => (
              <label className="filter-control" key={String(label)}>
                <span>{String(label)}</span>
                <select
                  aria-label={String(label)}
                  value={String(value)}
                  onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                >
                  {(options as string[]).map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </section>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <Button variant="outline" onClick={onUploadAttendance}>
              <CalendarDays /> Upload Attendance
            </Button>
            <Button variant="outline" onClick={onUploadMarks}>
              <FileSpreadsheet /> Upload Marks(Weekly)
            </Button>
            <Button variant="outline" onClick={onUploadMonthlyMarks}>
              <FileSpreadsheet /> Upload Marks(Monthly)
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-destructive border-destructive/40 hover:bg-destructive/10"
                >
                  <Trash2 /> Reset Attendance
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset attendance for a course and month</AlertDialogTitle>
                  <AlertDialogDescription>
                    Pick a course and BS month/year. This deletes all attendance records for that
                    course in that month. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-3">
                  <label className="filter-control">
                    <span>Course</span>
                    <select
                      value={attResetCourse}
                      onChange={(e) => setAttResetCourse(e.target.value)}
                    >
                      {courses
                        .filter((c) => c.active || c.course_key === attResetCourse)
                        .map((c) => (
                          <option key={c.course_key} value={c.course_key}>
                            {c.course_key}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className="filter-control">
                    <span>Month (BS)</span>
                    <select
                      value={attResetMonth}
                      onChange={(e) => setAttResetMonth(Number(e.target.value))}
                    >
                      {BS_MONTHS.map((m, i) => (
                        <option key={m} value={i + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="filter-control">
                    <span>Year (BS)</span>
                    <input
                      type="number"
                      value={attResetYear}
                      onChange={(e) => setAttResetYear(Number(e.target.value))}
                    />
                  </label>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      onResetAttendanceForCourseMonth(attResetCourse, attResetYear, attResetMonth)
                    }
                  >
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-destructive border-destructive/40 hover:bg-destructive/10"
                >
                  <Trash2 /> Reset Weekly Marks
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset weekly marks for a course</AlertDialogTitle>
                  <AlertDialogDescription>
                    Pick a course. This clears weekly exam data and resets the overall score for
                    every student in that course. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <label className="filter-control">
                  <span>Course</span>
                  <select value={resetCourse} onChange={(e) => setResetCourse(e.target.value)}>
                    {courses
                      .filter((c) => c.active || c.course_key === resetCourse)
                      .map((c) => (
                        <option key={c.course_key} value={c.course_key}>
                          {c.course_key}
                        </option>
                      ))}
                  </select>
                </label>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onResetWeeklyForCourse(resetCourse)}>
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-destructive border-destructive/40 hover:bg-destructive/10"
                >
                  <Trash2 /> Reset Monthly Marks
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset monthly marks for a course</AlertDialogTitle>
                  <AlertDialogDescription>
                    Pick a course. This clears all monthly exam data for every student in that
                    course, all months. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <label className="filter-control">
                  <span>Course</span>
                  <select
                    value={monthlyResetCourse}
                    onChange={(e) => setMonthlyResetCourse(e.target.value)}
                  >
                    {courses
                      .filter((c) => c.active || c.course_key === monthlyResetCourse)
                      .map((c) => (
                        <option key={c.course_key} value={c.course_key}>
                          {c.course_key}
                        </option>
                      ))}
                  </select>
                </label>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onResetMonthlyForCourse(monthlyResetCourse)}>
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            variant={selectMode ? "default" : "outline"}
            onClick={() => setSelectMode(!selectMode)}
          >
            <Check />
            {selectMode ? "Cancel Select" : "Select"}
          </Button>
        </div>
        {selectMode && selectedIds.size > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-md border border-primary/30 bg-primary/10 px-4 py-3">
            <span className="text-sm font-semibold">{selectedIds.size} selected</span>
            <Button variant="outline" size="sm" onClick={onBulkExport}>
              <FileSpreadsheet /> Export Selected
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 /> Delete Selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedIds.size} student record(s)?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes all exam, attendance, and fee data for the selected students. This
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onBulkDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        {visible.length ? (
          <>
            <section
              id="student-cards-grid"
              className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            >
              {pageItems.map((student, index) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  index={index}
                  onClick={() => onSelect(student.id)}
                  onDelete={onDelete}
                  selectMode={selectMode}
                  selected={selectedIds.has(student.id)}
                  onToggleSelect={onToggleSelect}
                />
              ))}
            </section>
            {pageCount > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="px-3 text-sm text-muted-foreground">
                  Page {page} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pageCount}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <Search />
            <h3>No students found</h3>
            <p>Try changing the search or filters.</p>
          </div>
        )}
      </div>
    </>
  );
}
