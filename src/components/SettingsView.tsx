import { useState } from "react";
import { ArrowLeft, LogOut, Plus, RotateCcw, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/Brand";
import { useStudents } from "@/context/StudentsContext";

export function SettingsView({
  onBack,
  onHome,
  onLogout,
}: {
  onBack: () => void;
  onHome?: () => void;
  onLogout: () => void;
}) {
  const {
    courses,
    teachers,
    timings,
    currentBatch,
    addCourse,
    updateCourse,
    archiveCourse,
    addTeacher,
    archiveTeacher,
    addTiming,
    archiveTiming,
    updateCurrentBatch,
  } = useStudents();

  const [newCourseKey, setNewCourseKey] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [newAdmissionFee, setNewAdmissionFee] = useState("0");
  const [newCourseFee, setNewCourseFee] = useState("0");

  const [feeEdits, setFeeEdits] = useState<Record<string, { admission: string; course: string }>>(
    {},
  );
  const [savingCourse, setSavingCourse] = useState<string | null>(null);

  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTimingLabel, setNewTimingLabel] = useState("");
  const [batchInput, setBatchInput] = useState(currentBatch);

  function feeFor(courseKey: string, field: "admission" | "course", fallback: number) {
    return feeEdits[courseKey]?.[field] ?? String(fallback);
  }
  function setFee(courseKey: string, field: "admission" | "course", value: string) {
    setFeeEdits((prev) => ({
      ...prev,
      [courseKey]: {
        admission: prev[courseKey]?.admission ?? "0",
        course: prev[courseKey]?.course ?? "0",
        [field]: value,
      },
    }));
  }

  async function handleAddCourse() {
    if (!newCourseKey.trim() || !newCourseName.trim()) return;
    await addCourse({
      course_key: newCourseKey.trim(),
      course_name: newCourseName.trim(),
      admission_fee: Number(newAdmissionFee) || 0,
      course_fee: Number(newCourseFee) || 0,
    });
    setNewCourseKey("");
    setNewCourseName("");
    setNewAdmissionFee("0");
    setNewCourseFee("0");
  }

  async function handleSaveFees(
    courseKey: string,
    currentAdmission: number,
    currentCourse: number,
  ) {
    setSavingCourse(courseKey);
    const admission = Number(feeFor(courseKey, "admission", currentAdmission));
    const course = Number(feeFor(courseKey, "course", currentCourse));
    await updateCourse(courseKey, { admission_fee: admission, course_fee: course });
    setSavingCourse(null);
  }

  async function handleAddTeacher() {
    if (!newTeacherName.trim()) return;
    await addTeacher(newTeacherName.trim());
    setNewTeacherName("");
  }

  async function handleAddTiming() {
    if (!newTimingLabel.trim()) return;
    await addTiming(newTimingLabel.trim());
    setNewTimingLabel("");
  }

  async function handleUpdateBatch() {
    if (!batchInput.trim() || batchInput.trim() === currentBatch) return;
    await updateCurrentBatch(batchInput.trim());
  }

  const activeCourses = courses.filter((c) => c.active).length;
  const activeTeachers = teachers.filter((t) => t.active).length;
  const activeTimings = timings.filter((t) => t.active).length;

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

      <div className="mx-auto max-w-[1100px] px-5 py-9 lg:px-8 lg:py-14">
        <Button variant="ghost" className="mb-4" onClick={onBack}>
          <ArrowLeft /> Back to Dashboard
        </Button>

        <section className="mb-10">
          <div className="eyebrow">Owner settings</div>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Institute settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage courses, teachers, timings, and the current batch. Changes apply everywhere
            immediately — no code changes needed.
          </p>
        </section>

        {/* Courses */}
        <section className="mb-12">
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-base font-bold">Courses</h2>
            <span className="flex items-center gap-1.5 rounded-full bg-surface-raised px-2 py-0.5 text-xs font-medium text-muted-foreground">
              <span className="status-dot" />
              {activeCourses} active
            </span>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Fees set here are used automatically when a new student joins this course.
          </p>

          <div className="overflow-x-auto rounded-lg border border-border">
            <div className="grid min-w-[500px] grid-cols-[1fr_120px_120px_auto] items-center gap-3 border-b border-border bg-surface-raised px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
              <span>Course</span>
              <span>Admission</span>
              <span>Course fee</span>
              <span className="text-right">Actions</span>
            </div>
            {courses.map((c) => (
              <div
                key={c.course_key}
                className={`grid min-w-[500px] grid-cols-[1fr_120px_120px_auto] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 ${
                  c.active ? "" : "opacity-50"
                }`}
              >
                <div>
                  <div className="text-sm font-medium">{c.course_name}</div>
                  <div className="text-xs text-muted-foreground">{c.course_key}</div>
                </div>
                <input
                  type="number"
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                  value={feeFor(c.course_key, "admission", c.admission_fee)}
                  onChange={(e) => setFee(c.course_key, "admission", e.target.value)}
                />
                <input
                  type="number"
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                  value={feeFor(c.course_key, "course", c.course_fee)}
                  onChange={(e) => setFee(c.course_key, "course", e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={savingCourse === c.course_key}
                    onClick={() => handleSaveFees(c.course_key, c.admission_fee, c.course_fee)}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    title={c.active ? "Archive course" : "Restore course"}
                    className={c.active ? "text-destructive border-destructive/40" : ""}
                    onClick={() => archiveCourse(c.course_key, !c.active)}
                  >
                    {c.active ? <Archive className="size-4" /> : <RotateCcw className="size-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-dashed border-border p-4">
            <div className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Add a course
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="filter-control">
                <span>Key</span>
                <input value={newCourseKey} onChange={(e) => setNewCourseKey(e.target.value)} />
              </label>
              <label className="filter-control">
                <span>Name</span>
                <input value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} />
              </label>
              <label className="filter-control">
                <span>Admission fee</span>
                <input
                  type="number"
                  value={newAdmissionFee}
                  onChange={(e) => setNewAdmissionFee(e.target.value)}
                />
              </label>
              <label className="filter-control">
                <span>Course fee</span>
                <input
                  type="number"
                  value={newCourseFee}
                  onChange={(e) => setNewCourseFee(e.target.value)}
                />
              </label>
            </div>
            <Button className="mt-3" onClick={handleAddCourse}>
              <Plus /> Add course
            </Button>
          </div>
        </section>

        {/* Teachers + Timings side by side */}
        <section className="mb-12 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-base font-bold">Teachers</h2>
              <span className="flex items-center gap-1.5 rounded-full bg-surface-raised px-2 py-0.5 text-xs font-medium text-muted-foreground">
                <span className="status-dot" />
                {activeTeachers} active
              </span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Shown in the student form and dashboard filters.
            </p>

            <div className="overflow-hidden rounded-lg border border-border">
              {teachers.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0 ${
                    t.active ? "" : "opacity-50"
                  }`}
                >
                  <span className="text-sm font-medium">{t.name}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    title={t.active ? "Archive teacher" : "Restore teacher"}
                    className={t.active ? "text-destructive border-destructive/40" : ""}
                    onClick={() => archiveTeacher(t.id, !t.active)}
                  >
                    {t.active ? <Archive className="size-4" /> : <RotateCcw className="size-4" />}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-border p-4">
              <label className="filter-control flex-1">
                <span>Teacher name</span>
                <input value={newTeacherName} onChange={(e) => setNewTeacherName(e.target.value)} />
              </label>
              <Button onClick={handleAddTeacher}>
                <Plus /> Add
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-base font-bold">Class timings</h2>
              <span className="flex items-center gap-1.5 rounded-full bg-surface-raised px-2 py-0.5 text-xs font-medium text-muted-foreground">
                <span className="status-dot" />
                {activeTimings} active
              </span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Shown in the student form and dashboard filters.
            </p>

            <div className="overflow-hidden rounded-lg border border-border">
              {timings.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0 ${
                    t.active ? "" : "opacity-50"
                  }`}
                >
                  <span className="text-sm font-medium">{t.label}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    title={t.active ? "Archive timing" : "Restore timing"}
                    className={t.active ? "text-destructive border-destructive/40" : ""}
                    onClick={() => archiveTiming(t.id, !t.active)}
                  >
                    {t.active ? <Archive className="size-4" /> : <RotateCcw className="size-4" />}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-border p-4">
              <label className="filter-control flex-1">
                <span>Timing label</span>
                <input value={newTimingLabel} onChange={(e) => setNewTimingLabel(e.target.value)} />
              </label>
              <Button onClick={handleAddTiming}>
                <Plus /> Add
              </Button>
            </div>
          </div>
        </section>

        {/* Batch */}
        <section>
          <h2 className="text-base font-bold">Current batch</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            New students are assigned this batch. Existing students keep theirs.
          </p>
          <div className="flex items-end gap-3 rounded-lg border border-border p-4">
            <label className="filter-control">
              <span>Batch</span>
              <input value={batchInput} onChange={(e) => setBatchInput(e.target.value)} />
            </label>
            <Button onClick={handleUpdateBatch}>Update batch</Button>
          </div>
        </section>
      </div>
    </>
  );
}
