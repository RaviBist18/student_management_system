import { useState, type ChangeEvent } from "react";
import { Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStudents } from "@/context/StudentsContext";
import { toBik_euro } from "bikram-sambat";

export function AttendanceUploadModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
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

  const { uploadAttendanceCsv, courses } = useStudents();
  const [courseKey, setCourseKey] = useState<string>(courses[0]?.course_key ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: string[] } | null>(null);
  const todayBS = toBik_euro(new Date().toISOString().split("T")[0]!);
  const [defaultYear, defaultMonth] = todayBS.split("-").map(Number);
  const [bsYear, setBsYear] = useState<number>(defaultYear!);
  const [bsMonth, setBsMonth] = useState<number>(defaultMonth!);

  function chooseFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setResult(null);
    const res = await uploadAttendanceCsv(courseKey, file, bsYear, bsMonth);
    setResult(res);
    setUploading(false);
  }

  function handleClose(v: boolean) {
    if (!v) {
      setFile(null);
      setResult(null);
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Upload attendance</DialogTitle>
          <DialogDescription>
            Upload a CSV with roll_no, name, and one status column per day (P/A) for the selected
            month and course.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <label className="form-field">
            <span>Course</span>
            <select
              value={courseKey}
              onChange={(e) => setCourseKey(e.target.value)}
              style={{
                width: "100%",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "#f8fafc",
                padding: "8px 12px",
                fontSize: "14px",
              }}
            >
              {courses
                .filter((c) => c.active)
                .map((c) => (
                  <option key={c.course_key} value={c.course_key}>
                    {c.course_name}
                  </option>
                ))}
            </select>
          </label>
          <label className="form-field">
            <span>Month</span>
            <select
              value={bsMonth}
              onChange={(e) => setBsMonth(Number(e.target.value))}
              style={{
                width: "100%",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "#f8fafc",
                padding: "8px 12px",
                fontSize: "14px",
              }}
            >
              {BS_MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Year (BS)</span>
            <input
              type="number"
              value={bsYear}
              onChange={(e) => setBsYear(Number(e.target.value))}
              style={{
                width: "100%",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "#f8fafc",
                padding: "8px 12px",
                fontSize: "14px",
              }}
            />
          </label>
          <label className="form-field">
            <span>Attendance CSV file (roll_no, name, day columns)</span>
            <input type="file" accept=".csv" onChange={chooseFile} />
          </label>
          {result && (
            <div className="rounded-md border border-border p-3 text-sm">
              <p className="font-semibold text-success">
                {result.success} record(s) uploaded successfully.
              </p>
              {result.failed.length > 0 && (
                <div className="mt-2 text-destructive">
                  <p className="font-semibold">{result.failed.length} row(s) failed:</p>
                  <ul className="ml-4 list-disc">
                    {result.failed.slice(0, 10).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Close
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            <Upload /> {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
