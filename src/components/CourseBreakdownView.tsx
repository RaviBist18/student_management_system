import { useState } from "react";
import { ArrowLeft, ChevronRight, LogOut, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Student } from "@/lib/types";
import { Brand } from "@/components/Brand";

export function CourseBreakdownView({
  students,
  onBack,
  onHome,
  onLogout,
  onSelectStudent,
}: {
  students: Student[];
  onBack: () => void;
  onHome?: () => void;
  onLogout: () => void;
  onSelectStudent: (id: string) => void;
}) {
  const GROUP_PREVIEW = 9;
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("All Teachers");
  const [expandedTeachers, setExpandedTeachers] = useState<Set<string>>(new Set());

  const allCourses = Array.from(new Set(students.map((s) => s.courseKey))).map((key) => {
    const group = students.filter((s) => s.courseKey === key);
    const teacherSet = new Set(group.map((s) => s.teacher));
    return { key, count: group.length, teacherCount: teacherSet.size };
  });
  const courses = allCourses.filter((c) =>
    c.key.toLowerCase().includes(courseSearch.trim().toLowerCase()),
  );

  const courseStudentsAll = selectedCourse
    ? students.filter((s) => s.courseKey === selectedCourse)
    : [];
  const teacherOptions = [
    "All Teachers",
    ...Array.from(new Set(courseStudentsAll.map((s) => s.teacher))),
  ];
  const courseStudents = courseStudentsAll.filter((s) => {
    const term = studentSearch.trim().toLowerCase();
    const matchesSearch =
      !term || s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term);
    const matchesTeacher = teacherFilter === "All Teachers" || s.teacher === teacherFilter;
    return matchesSearch && matchesTeacher;
  });
  const teacherGroups = Array.from(new Set(courseStudents.map((s) => s.teacher))).map(
    (teacher) => ({
      teacher,
      students: courseStudents.filter((s) => s.teacher === teacher),
    }),
  );

  function openCourse(key: string) {
    setSelectedCourse(key);
    setStudentSearch("");
    setTeacherFilter("All Teachers");
    setExpandedTeachers(new Set());
  }

  function toggleExpanded(teacher: string) {
    setExpandedTeachers((prev) => {
      const next = new Set(prev);
      if (next.has(teacher)) next.delete(teacher);
      else next.add(teacher);
      return next;
    });
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
                <div className="eyebrow">Course breakdown</div>
                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{selectedCourse}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {courseStudentsAll.length} student{courseStudentsAll.length === 1 ? "" : "s"}{" "}
                  across {teacherOptions.length - 1} teacher
                  {teacherOptions.length - 1 === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex items-center gap-2 rounded-md border border-border bg-surface-raised px-3">
                  <Search className="size-4 text-muted-foreground" />
                  <input
                    aria-label="Search students in this course"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:w-56"
                    placeholder="Search student name or ID..."
                  />
                </div>
                <label className="filter-control">
                  <span>Teacher</span>
                  <select
                    aria-label="Filter by teacher"
                    value={teacherFilter}
                    onChange={(e) => setTeacherFilter(e.target.value)}
                  >
                    {teacherOptions.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>
            </section>
            {teacherGroups.length ? (
              <section className="grid gap-5">
                {teacherGroups.map(({ teacher, students: taught }) => {
                  const expanded = expandedTeachers.has(teacher);
                  const visible = expanded ? taught : taught.slice(0, GROUP_PREVIEW);
                  return (
                    <div key={teacher} className="content-panel">
                      <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                        {teacher} · {taught.length} student{taught.length === 1 ? "" : "s"}
                      </h2>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {visible.map((student) => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => onSelectStudent(student.id)}
                            className="flex items-center gap-3 rounded-md border border-border bg-surface-raised px-3 py-2 text-left text-sm transition hover:border-primary/50"
                          >
                            <span className="font-medium">{student.name}</span>
                            <span className="ml-auto text-xs text-muted-foreground">
                              {student.id}
                            </span>
                          </button>
                        ))}
                      </div>
                      {taught.length > GROUP_PREVIEW && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3"
                          onClick={() => toggleExpanded(teacher)}
                        >
                          {expanded ? "Show less" : `Show all ${taught.length}`}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </section>
            ) : (
              <div className="empty-state">
                <Search />
                <h3>No students found</h3>
                <p>Try a different name, ID, or teacher.</p>
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
                <div className="eyebrow">Course breakdown</div>
                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Active courses</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Open a course to see which teachers run it and who's enrolled.
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
                    className="content-panel flex w-full items-center gap-3 text-left transition hover:border-primary/50"
                  >
                    <div className="metric-icon metric-violet">
                      <Users />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold">{c.key}</div>
                      <div className="text-sm text-muted-foreground">
                        {c.count} student{c.count === 1 ? "" : "s"} · {c.teacherCount} teacher
                        {c.teacherCount === 1 ? "" : "s"}
                      </div>
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
