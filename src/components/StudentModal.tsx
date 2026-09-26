import { useState, type ChangeEvent } from "react";
import { CircleUserRound, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudents } from "@/context/StudentsContext";
import type { Student } from "@/lib/types";
import { studentSchema, PRIOR_EDUCATION_OPTIONS, type StudentFormValues } from "@/lib/schema";

export function StudentModal({
  open,
  onOpenChange,
  student,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: Student | undefined;
  onSave: (v: StudentFormValues) => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState(student?.photo);
  const { courses, teachers, timings } = useStudents();
  const [courseKey, setCourseKey] = useState(student?.courseKey ?? "");
  const [teacher, setTeacher] = useState(student?.teacher ?? "");
  const [timing, setTiming] = useState(student?.timing ?? "");
  const [prior, setPrior] = useState(student?.prior ?? "");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const REQUIRED = new Set(["name", "father", "phone", "address", "course", "teacher", "timing"]);

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, ["photo"]: "Choose a valid image file" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhoto(reader.result);
        setErrors((current) => {
          const next = { ...current };
          delete next["photo"];
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  }

  function validateField(name: string, value: string) {
    if (!value.trim() && !hasSubmitted) {
      setErrors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
      return;
    }
    const shape = studentSchema.shape as Record<string, { safeParse: (v: unknown) => any }>;
    const fieldSchema = shape[name];
    if (!fieldSchema) return;
    const result = fieldSchema.safeParse(value);
    setErrors((current) => {
      const next = { ...current };
      if (result.success) delete next[name];
      else next[name] = result.error.issues[0]?.message ?? "Invalid value";
      return next;
    });
  }

  const key = `${student?.id ?? "new"}-${open}`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={key} className="max-h-[92vh] max-w-3xl overflow-y-auto bg-card p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>{student ? "Edit student record" : "Add new student"}</DialogTitle>
          <DialogDescription>
            Update the student and guardian information used in presentations.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4 px-6 py-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.currentTarget));
            delete data["photoFile"];
            const parsed = studentSchema.safeParse(data);
            if (!parsed.success) {
              setHasSubmitted(true);
              setErrors(
                Object.fromEntries(
                  parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
                ),
              );
              return;
            }
            setErrors({});
            onSave({ ...parsed.data, photo });
          }}
        >
          <label className="photo-upload-field sm:col-span-2">
            <span>Student photo</span>
            <div className="flex items-center gap-4">
              {photo ? (
                <img src={photo} alt="Student photo preview" className="photo-preview" />
              ) : (
                <div className="photo-preview-placeholder">
                  <CircleUserRound />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <input name="photoFile" type="file" accept="image/*" onChange={choosePhoto} />
                <p>Choose a clear portrait image</p>
                {errors["photo"] && <small>{errors["photo"]}</small>}
              </div>
            </div>
          </label>
          {[
            ["name", "Student name", student?.name, "text"],
            ["father", "Father's name", student?.father, "text"],
            ["phone", "Phone", student?.phone, "tel"],
            ["address", "Address", student?.address, "text"],
            ["school", "School", student?.school, "text"],
            ...(student ? [["score", "Overall marks (%)", student?.score, "number"]] : []),
          ].map(([name, label, value, type]) => (
            <label className="form-field" key={String(name)}>
              <span>
                {label}
                {REQUIRED.has(String(name)) && " *"}
              </span>
              <input
                name={String(name)}
                type={String(type)}
                defaultValue={value ?? ""}
                maxLength={name === "phone" ? 10 : type === "text" ? 140 : undefined}
                min={type === "number" ? 0 : undefined}
                max={type === "number" ? 100 : undefined}
                inputMode={name === "phone" ? "numeric" : undefined}
                onBlur={(e) => validateField(String(name), e.target.value)}
              />
              {errors[String(name)] && <small>{errors[String(name)]}</small>}
            </label>
          ))}
          <label className="form-field">
            <span>Course *</span>
            <input type="hidden" name="course" value={courseKey} />
            <Select
              value={courseKey}
              onValueChange={(v) => {
                setCourseKey(v);
                validateField("course", v);
              }}
              disabled={!!student}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                {courses
                  .filter((c) => c.active || c.course_key === courseKey)
                  .map((c) => (
                    <SelectItem key={c.course_key} value={c.course_key}>
                      {c.course_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors["course"] && <small>{errors["course"]}</small>}
          </label>
          <label className="form-field">
            <span>Teacher *</span>
            <input type="hidden" name="teacher" value={teacher} />
            <Select
              value={teacher}
              onValueChange={(v) => {
                setTeacher(v);
                validateField("teacher", v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                {teachers
                  .filter((t) => t.active || t.name === teacher)
                  .map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors["teacher"] && <small>{errors["teacher"]}</small>}
          </label>
          <label className="form-field">
            <span>Class timing *</span>
            <input type="hidden" name="timing" value={timing} />
            <Select
              value={timing}
              onValueChange={(v) => {
                setTiming(v);
                validateField("timing", v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timing" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                {timings
                  .filter((t) => t.active || t.label === timing)
                  .map((t) => (
                    <SelectItem key={t.id} value={t.label}>
                      {t.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors["timing"] && <small>{errors["timing"]}</small>}
          </label>
          <label className="form-field">
            <span>Prior education</span>
            <input type="hidden" name="prior" value={prior} />
            <Select value={prior} onValueChange={setPrior}>
              <SelectTrigger>
                <SelectValue placeholder="Select prior education" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                {PRIOR_EDUCATION_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors["prior"] && <small>{errors["prior"]}</small>}
          </label>
          <label className="form-field sm:col-span-2">
            <span>Instructor remarks</span>
            <textarea name="remarks" defaultValue={student?.remarks} rows={4} maxLength={500} />
            {errors["remarks"] && <small>{errors["remarks"]}</small>}
          </label>
          <DialogFooter className="sm:col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Check /> Save Student Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
