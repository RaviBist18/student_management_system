import { useState } from "react";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  Download,
  FileSpreadsheet,
  LogOut,
  Pencil,
  Quote,
  Trash2,
  UserRound,
} from "lucide-react";
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
import type { Student, Payment } from "@/lib/types";
import { performance } from "@/lib/helpers";
import { Brand } from "@/components/Brand";
import { StudentAvatar } from "@/components/StudentAvatar";
import { Detail } from "@/components/Detail";
import { Meter } from "@/components/Meter";
import { ProfileTabs } from "@/components/ProfileTabs";
import { WeeklyTable } from "@/components/WeeklyTable";
import { MonthlyCards } from "@/components/MonthlyCards";
import { AttendanceGrid } from "@/components/AttendanceGrid";
import { FeesPanel } from "@/components/FeesPanel";
import { PrintableReport } from "@/components/PrintableReport";

export function ProfileView({
  student,
  onBack,
  onHome,
  onEdit,
  onDelete,
  onAddPayment,
  onLogout,
  onResetWeekly,
}: {
  student: Student;
  onBack: () => void;
  onHome?: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onAddPayment: (id: string, payment: Omit<Payment, "id">) => void;
  onLogout: () => void;
  onResetWeekly: (id: string) => Promise<void>;
}) {
  const [tab, setTab] = useState<"weekly" | "monthly" | "attendance" | "fees">("weekly");
  const [presentMode, setPresentMode] = useState(false);

  function exportSheet() {
    const rows = [
      ["Student", student.name],
      ["Student ID", student.id],
      ["Course", student.course],
      ["Overall Score", `${student.score}%`],
      ["Attendance", `${student.attendance}%`],
      [],
      ["Assessment", "Subject", "Score", "Maximum", "Percentage"],
      ...student.weekly.map((e) => [
        e.label,
        e.subject,
        e.score,
        e.max,
        `${Math.round((e.score / e.max) * 100)}%`,
      ]),
      ...student.monthly.map((e) => [
        e.label,
        e.subject,
        e.score,
        e.max,
        `${Math.round((e.score / e.max) * 100)}%`,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${student.id}-performance.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="profile-shell">
      {!presentMode && (
        <header className="border-b border-border bg-header/90 backdrop-blur-xl print:hidden">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-5 py-4 lg:px-8">
            <Brand onClick={onHome} />
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={exportSheet}>
                <FileSpreadsheet />
                <span className="hidden sm:inline">Export Excel Sheet</span>
              </Button>
              <Button onClick={() => window.print()}>
                <Download />
                <span className="hidden sm:inline">Export PDF Report Card</span>
              </Button>
              <Button variant="outline" size="icon" title="Log out" onClick={onLogout}>
                <LogOut />
              </Button>
            </div>
          </div>
        </header>
      )}
      <div className="mx-auto max-w-[1400px] px-5 py-7 print:hidden lg:px-8 lg:py-10">
        {!presentMode && (
          <Button variant="ghost" className="mb-4" onClick={onBack}>
            <ArrowLeft /> Back to Dashboard
          </Button>
        )}
        <section className="identity-banner">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <StudentAvatar student={student} className="avatar avatar-large" />
            <div className="min-w-0 flex-1">
              <div className="eyebrow">Student performance profile</div>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{student.name}</h1>
              <p className="mt-2 font-mono text-sm text-primary">{student.id}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="info-chip">
                  <BookOpen /> {student.course}
                </span>
                <span className="info-chip">
                  <CalendarDays /> Batch {student.batch}
                </span>
                <span className="info-chip">
                  <UserRound /> {student.teacher}
                </span>
                <span className="info-chip">
                  <CalendarDays /> {student.timing}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 self-start">
              {!presentMode && (
                <>
                  <Button variant="outline" onClick={() => setPresentMode(true)}>
                    <UserRound /> Present to Parent
                  </Button>
                  <Button variant="outline" onClick={onEdit}>
                    <Pencil /> Edit Record / Add Marks
                  </Button>
                </>
              )}
              {presentMode ? (
                <Button variant="default" onClick={() => setPresentMode(false)}>
                  <UserRound /> Exit Presentation
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 /> Delete Student
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {student.name}'s record?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes all exam and attendance data for this student. This cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(student.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          <div className="parent-grid">
            <Detail icon={UserRound} label="Father's name" value={student.father} />
            <Detail icon={UserRound} label="Contact number" value={student.phone} />
            <Detail icon={UserRound} label="Address" value={student.address} />
            <Detail
              icon={UserRound}
              label="School / prior education"
              value={`${student.school} · ${student.prior}`}
            />
          </div>
        </section>
        <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_1.5fr]">
          {student.score !== null ? (
            <Meter value={student.score} label="Overall score" tone={performance(student.score)} />
          ) : (
            <div className="grade-panel">
              <p className="eyebrow">Overall score</p>
              <span className="text-3xl font-bold text-muted-foreground">—</span>
              <p className="text-sm text-muted-foreground">No marks uploaded yet</p>
            </div>
          )}
          <Meter
            value={student.attendance}
            label="Attendance rate"
            tone={performance(student.attendance)}
          />
          <div className="grade-panel">
            <div>
              <p className="eyebrow">Academic standing</p>
              <div className="mt-3 flex items-end gap-3">
                <span className="text-5xl font-bold">{student.grade || "—"}</span>
                <span
                  className={`score-badge ${student.score !== null ? performance(student.score) : ""}`}
                >
                  {student.status || "Pending"}
                </span>
              </div>
            </div>
            <Award className="size-16 text-primary/40" />
          </div>
        </section>
        <section className="mt-5 content-panel">
          <div className="flex items-center justify-between gap-3">
            <ProfileTabs tab={tab} setTab={setTab} />
            {tab === "weekly" && !presentMode && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 /> Reset Weekly Marks
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset {student.name}'s weekly marks?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This clears all weekly exam entries and resets the overall score to pending.
                      This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onResetWeekly(student.id)}>
                      Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <div className="pt-5">
            {tab === "weekly" && <WeeklyTable exams={student.weekly} />}{" "}
            {tab === "monthly" && <MonthlyCards exams={student.monthly} />}{" "}
            {tab === "attendance" && <AttendanceGrid studentId={student.id} />}{" "}
            {tab === "fees" && (
              <FeesPanel student={student} onAddPayment={(p) => onAddPayment(student.id, p)} />
            )}
          </div>
        </section>

        <section className="remarks-box">
          <Quote />
          <div>
            <div className="eyebrow">Instructor remarks</div>
            <p className="mt-2 text-lg leading-relaxed">"{student.remarks}"</p>
          </div>
        </section>
      </div>
      <PrintableReport student={student} />
    </div>
  );
}
