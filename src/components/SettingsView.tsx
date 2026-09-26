import { useState } from "react";
import { ArrowLeft, LogOut, Plus, RotateCcw, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/Brand";
import { useStudents } from "@/context/StudentsContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

function ArchiveBadge<T extends { active: boolean }>({
  items,
  labelFor,
  onRestore,
  onDelete,
  restoreKey,
}: {
  items: T[];
  labelFor: (item: T) => string;
  onRestore: (item: T) => void;
  onDelete: (item: T) => void;
  restoreKey: (item: T) => string;
}) {
  const archived = items.filter((i) => !i.active);
  if (archived.length === 0) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="View archived"
          className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-surface-raised"
        >
          <Archive className="size-3" /> {archived.length} archived
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2">
        <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Archived</div>
        <div className="flex flex-col gap-1">
          {archived.map((item) => (
            <div
              key={restoreKey(item)}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-raised"
            >
              <span className="truncate">{labelFor(item)}</span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  title="Restore"
                  onClick={() => onRestore(item)}
                >
                  <RotateCcw className="size-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Delete permanently"
                      className="text-destructive border-destructive/40"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{labelFor(item)}" permanently?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone. This only removes it from the settings list — student
                        records already using it are not affected.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(item)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

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
    deleteCourse,
    addTeacher,
    archiveTeacher,
    deleteTeacher,
    addTiming,
    archiveTiming,
    deleteTiming,
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
  const [addError, setAddError] = useState<string | null>(null);

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
    const key = newCourseKey.trim();
    const name = newCourseName.trim();
    if (!key || !name) return;
    if (courses.some((c) => c.course_key.toLowerCase() === key.toLowerCase())) {
      setAddError(`Course key "${key}" already exists (active or archived).`);
      return;
    }
    setAddError(null);
    await addCourse({
      course_key: key,
      course_name: name,
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
    const name = newTeacherName.trim();
    if (!name) return;
    if (teachers.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      setAddError(`Teacher "${name}" already exists (active or archived).`);
      return;
    }
    setAddError(null);
    await addTeacher(name);
    setNewTeacherName("");
  }

  async function handleAddTiming() {
    const label = newTimingLabel.trim();
    if (!label) return;
    if (timings.some((t) => t.label.toLowerCase() === label.toLowerCase())) {
      setAddError(`Timing "${label}" already exists (active or archived).`);
      return;
    }
    setAddError(null);
    await addTiming(label);
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
          {addError && (
            <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {addError}
            </p>
          )}
        </section>

        {/* Courses */}
        <section className="mb-12">
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-base font-bold">Courses</h2>
            <span className="flex items-center gap-1.5 rounded-full bg-surface-raised px-2 py-0.5 text-xs font-medium text-muted-foreground">
              <span className="status-dot" />
              {activeCourses} active
            </span>
            <ArchiveBadge
              items={courses}
              labelFor={(c) => c.course_name}
              restoreKey={(c) => c.course_key}
              onRestore={(c) => archiveCourse(c.course_key, true)}
              onDelete={(c) => deleteCourse(c.course_key)}
            />
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
            {courses
              .filter((c) => c.active)
              .map((c) => (
                <div
                  key={c.course_key}
                  className="grid min-w-[500px] grid-cols-[1fr_120px_120px_auto] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
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
                      title="Archive course"
                      className="text-destructive border-destructive/40"
                      onClick={() => archiveCourse(c.course_key, false)}
                    >
                      <Archive className="size-4" />
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
              <ArchiveBadge
                items={teachers}
                labelFor={(t) => t.name}
                restoreKey={(t) => t.id}
                onRestore={(t) => archiveTeacher(t.id, true)}
                onDelete={(t) => deleteTeacher(t.id)}
              />
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Shown in the student form and dashboard filters.
            </p>

            <div className="overflow-hidden rounded-lg border border-border">
              {teachers
                .filter((t) => t.active)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0"
                  >
                    <span className="text-sm font-medium">{t.name}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Archive teacher"
                      className="text-destructive border-destructive/40"
                      onClick={() => archiveTeacher(t.id, false)}
                    >
                      <Archive className="size-4" />
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
              <ArchiveBadge
                items={timings}
                labelFor={(t) => t.label}
                restoreKey={(t) => t.id}
                onRestore={(t) => archiveTiming(t.id, true)}
                onDelete={(t) => deleteTiming(t.id)}
              />
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Shown in the student form and dashboard filters.
            </p>

            <div className="overflow-hidden rounded-lg border border-border">
              {timings
                .filter((t) => t.active)
                .map((t) => (
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
