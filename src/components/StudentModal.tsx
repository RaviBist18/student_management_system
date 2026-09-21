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
import type { Student } from "@/lib/types";
import { studentSchema, type StudentFormValues } from "@/lib/schema";

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
            ["course", "Course", student?.course, "text"],
            ["father", "Father's name", student?.father, "text"],
            ["phone", "Phone", student?.phone, "tel"],
            ["address", "Address", student?.address, "text"],
            ["score", "Overall marks (%)", student?.score, "number"],
          ].map(([name, label, value, type]) => (
            <label className="form-field" key={String(name)}>
              <span>{label}</span>
              <input
                name={String(name)}
                type={String(type)}
                defaultValue={value}
                readOnly={name === "course" && !!student}
                maxLength={type === "text" ? 140 : undefined}
                min={type === "number" ? 0 : undefined}
                max={type === "number" ? 100 : undefined}
              />
              {errors[String(name)] && <small>{errors[String(name)]}</small>}
            </label>
          ))}
          <label className="form-field">
            <span>Teacher</span>
            <select
              name="teacher"
              defaultValue={student?.teacher ?? "Suraj Bist"}
              style={{
                width: "100%",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "#f3f4f6",
                padding: "8px 12px",
                fontSize: "14px",
              }}
            >
              <option>Suraj Bist</option>
              <option>Neha Bist</option>
              <option>Ravi Bist</option>
            </select>
          </label>
          <label className="form-field">
            <span>Class timing</span>
            <select
              name="timing"
              defaultValue={student?.timing ?? "8-10 AM"}
              style={{
                width: "100%",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "#f8fafc",
                padding: "8px 12px",
                fontSize: "14px",
              }}
            >
              <option>8-10 AM</option>
              <option>10-12 PM</option>
              <option>2-4 PM</option>
            </select>
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
