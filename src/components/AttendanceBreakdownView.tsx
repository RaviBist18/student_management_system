import { useState } from "react";
import { ArrowLeft, CalendarDays, ChevronRight, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Student } from "@/lib/types";
import { Brand } from "@/components/Brand";

function avg(list: Student[]) {
  if (!list.length) return 0;
  return list.reduce((a, s) => a + s.attendance, 0) / list.length;
}

export function AttendanceBreakdownView({
  students,
  onBack,
  onHome,
  onLogout,
}: {
  students: Student[];
  onBack: () => void;
  onHome?: () => void;
  onLogout: () => void;
}) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");

  const allCourses = Array.from(new Set(students.map((s) => s.courseKey)))
    .map((key) => {
      const group = students.filter((s) => s.courseKey === key);
      return { key, count: group.length, attendance: avg(group) };
    })
    .sort((a, b) => b.attendance - a.attendance);
  const courses = allCourses.filter((c) =>
    c.key.toLowerCase().includes(courseSearch.trim().toLowerCase()),
  );

  const courseStudents = selectedCourse
    ? students.filter((s) => s.courseKey === selectedCourse)
    : [];
  const allTeacherStats = Array.from(new Set(courseStudents.map((s) => s.teacher)))
    .map((teacher) => {
      const taught = courseStudents.filter((s) => s.teacher === teacher);
      return { teacher, count: taught.length, attendance: avg(taught) };
    })
    .sort((a, b) => b.attendance - a.attendance);
  const teacherStats = allTeacherStats.filter((t) =>
    t.teacher.toLowerCase().includes(teacherSearch.trim().toLowerCase()),
  );

  function openCourse(key: string) {
    setSelectedCourse(key);
    setTeacherSearch("");
  }

  function tone(pct: number) {
    if (pct >= 85) return "text-success";
    if (pct >= 70) return "text-warning";
    return "text-danger";
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-header/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-5 py-4 lg:px-8">
          <Brand onClick={onHome} />
          <Button
            variant="outline"
            size="icon"
            className="ml-auto"
            title="Log out"
            onClick={onLogout}
          >
            <LogOut />
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-[1400px] px-5 py-9 lg:px-8 lg:py-14">
        {selectedCourse ? (
          <>
            <Button variant="ghost" className="mb-4" onClick={() => setSelectedCourse(null)}>
              <ArrowLeft /> Back to courses
            </Button>
            <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="eyebrow">Attendance breakdown</div>
                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{selectedCourse}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Average attendance by teacher for this course.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border bg-surface-raised px-3">
                <Search className="size-4 text-muted-foreground" />
                <input
                  aria-label="Search teacher"
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:w-64"
                  placeholder="Search teacher name..."
                />
              </div>
            </section>
            {teacherStats.length ? (
              <section className="grid gap-3">
                {teacherStats.map((t) => (
                  <div key={t.teacher} className="content-panel flex items-center gap-4">
                    <div className="metric-icon metric-emerald">
                      <CalendarDays />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold">{t.teacher}</div>
                      <div className="text-sm text-muted-foreground">
                        {t.count} student{t.count === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${tone(t.attendance)}`}>
                      {t.attendance.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </section>
            ) : (
              <div className="empty-state">
                <Search />
                <h3>No teachers found</h3>
                <p>Try a different search term.</p>
              </div>
            )}
          </>
        ) : (
          <>
            <Button variant="ghost" className="mb-4" onClick={onBack}>
              <ArrowLeft /> Back to Dashboard
            </Button>
            <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="eyebrow">Attendance breakdown</div>
                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Average attendance</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Open a course to see attendance by teacher.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border bg-surface-raised px-3">
                <Search className="size-4 text-muted-foreground" />
                <input
                  aria-label="Search courses"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:w-64"
                  placeholder="Search course name..."
                />
              </div>
            </section>
            {courses.length ? (
              <section className="grid gap-4">
                {courses.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => openCourse(c.key)}
                    className="content-panel flex w-full items-center gap-4 text-left transition hover:border-primary/50"
                  >
                    <div className="metric-icon metric-emerald">
                      <CalendarDays />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold">{c.key}</div>
                      <div className="text-sm text-muted-foreground">
                        {c.count} student{c.count === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${tone(c.attendance)}`}>
                      {c.attendance.toFixed(2)}%
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </button>
                ))}
              </section>
            ) : (
              <div className="empty-state">
                <Search />
                <h3>No courses found</h3>
                <p>Try a different search term.</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
