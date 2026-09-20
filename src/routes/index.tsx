import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { z } from "zod";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Download,
  FileSpreadsheet,
  GraduationCap,
  MapPin,
  Moon,
  Pencil,
  Phone,
  Plus,
  Quote,
  Search,
  Sun,
  Upload,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Profile Management — Ambition Technical Institute" },
      { name: "description", content: "Interactive student records and performance presentation system for Ambition Technical Institute." },
      { property: "og:title", content: "Ambition Technical Institute — Student Profile Management" },
      { property: "og:description", content: "Student records and performance presentation dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudentManagementApp,
});

type Exam = { label: string; subject: string; score: number; max: number; date: string };
type Student = {
  id: string; name: string; course: string; courseKey: string; batch: string;
  father: string; phone: string; address: string; school: string; prior: string;
  score: number; grade: string; attendance: number; status: string; remarks: string;
  weekly: Exam[]; monthly: Exam[];
};

const studentsSeed: Student[] = [
  {
    id: "ATI-2025-0101", name: "Aarav Sharma", course: "Master Diploma in Computer Technology", courseKey: "MDCT", batch: "2025",
    father: "Ramesh Sharma", phone: "+977 9841234567", address: "Ward 4, Birendranagar", school: "Model Higher Secondary School", prior: "+2 Science",
    score: 88, grade: "A+", attendance: 94, status: "Top Performer",
    weekly: [["Week 1", "HTML/CSS", 48, 50, "06 Apr 2025"], ["Week 2", "JavaScript", 45, 50, "13 Apr 2025"], ["Week 3", "React Basics", 42, 50, "20 Apr 2025"], ["Week 4", "Node.js", 46, 50, "27 Apr 2025"]].map(([label, subject, score, max, date]) => ({ label: String(label), subject: String(subject), score: Number(score), max: Number(max), date: String(date) })),
    monthly: [["Term I", "Computer Fundamentals", 92, 100], ["Term I", "Programming in C/C++", 86, 100], ["Term I", "Web Technology", 90, 100], ["Term I", "Database Systems", 84, 100]].map(([label, subject, score, max]) => ({ label: String(label), subject: String(subject), score: Number(score), max: Number(max), date: "May 2025" })),
    remarks: "Aarav shows exceptional logical skills and is consistently ahead in practical lab assignments.",
  },
  {
    id: "ATI-2025-0102", name: "Priya Adhikari", course: "Python Programming & Data Science", courseKey: "Python", batch: "2025",
    father: "Hari Prasad Adhikari", phone: "+977 9851098765", address: "Main Road, Surkhet", school: "Horizon Higher Secondary School", prior: "+2 Management",
    score: 76, grade: "B+", attendance: 88, status: "Good",
    weekly: [["Week 1", "Python Syntax", 40, 50, "06 Apr 2025"], ["Week 2", "Data Structures", 38, 50, "13 Apr 2025"], ["Week 3", "Pandas/Numpy", 37, 50, "20 Apr 2025"], ["Week 4", "OOP Concepts", 39, 50, "27 Apr 2025"]].map(([label, subject, score, max, date]) => ({ label: String(label), subject: String(subject), score: Number(score), max: Number(max), date: String(date) })),
    monthly: [["Term I", "Core Python", 78, 100], ["Term I", "Data Analysis", 72, 100], ["Term I", "Statistics", 75, 100], ["Term I", "SQL Basics", 79, 100]].map(([label, subject, score, max]) => ({ label: String(label), subject: String(subject), score: Number(score), max: Number(max), date: "May 2025" })),
    remarks: "Priya is working hard and grasping concepts well. Extra practice on data analysis projects will boost her performance.",
  },
  {
    id: "ATI-2025-0103", name: "Rohan Karki", course: "UI/UX & Graphic Design", courseKey: "Graphic Design", batch: "2024",
    father: "Bikram Karki", phone: "+977 9803456789", address: "Housing Colony, Birendranagar", school: "National Technical Institute", prior: "Grade 10 (SEE)",
    score: 62, grade: "C+", attendance: 72, status: "Needs Attention",
    weekly: [["Week 1", "Figma Tools", 35, 50, "06 Apr 2025"], ["Week 2", "Color Theory", 30, 50, "13 Apr 2025"], ["Week 3", "Typography", 28, 50, "20 Apr 2025"], ["Week 4", "Wireframing", 32, 50, "27 Apr 2025"]].map(([label, subject, score, max, date]) => ({ label: String(label), subject: String(subject), score: Number(score), max: Number(max), date: String(date) })),
    monthly: [["Term I", "Vector Graphics", 60, 100], ["Term I", "UI Layouts", 64, 100], ["Term I", "Design Systems", 58, 100], ["Term I", "User Research", 66, 100]].map(([label, subject, score, max]) => ({ label: String(label), subject: String(subject), score: Number(score), max: Number(max), date: "May 2025" })),
    remarks: "Rohan has great creative potential, but needs to improve attendance and submit weekly design tasks on time.",
  },
  {
    id: "ATI-2025-0104", name: "Sneha Thapa", course: "Web Development & Hardware", courseKey: "Web Dev", batch: "2025",
    father: "Dhan Bahadur Thapa", phone: "+977 9812987654", address: "Airport Area, Surkhet", school: "Valley Public School", prior: "+2 Science",
    score: 83, grade: "A", attendance: 91, status: "Top Performer",
    weekly: [["Week 1", "Hardware Assembly", 45, 50, "06 Apr 2025"], ["Week 2", "Networking", 42, 50, "13 Apr 2025"], ["Week 3", "Tailwind CSS", 41, 50, "20 Apr 2025"], ["Week 4", "JavaScript ES6", 40, 50, "27 Apr 2025"]].map(([label, subject, score, max, date]) => ({ label: String(label), subject: String(subject), score: Number(score), max: Number(max), date: String(date) })),
    monthly: [["Term I", "Computer Hardware", 88, 100], ["Term I", "Network Security", 80, 100], ["Term I", "Responsive Web Design", 84, 100], ["Term I", "Frontend Frameworks", 80, 100]].map(([label, subject, score, max]) => ({ label: String(label), subject: String(subject), score: Number(score), max: Number(max), date: "May 2025" })),
    remarks: "Sneha is very consistent in both theory and practical lab sessions.",
  },
];

const studentSchema = z.object({
  name: z.string().trim().min(2, "Enter the student's name").max(80), id: z.string().trim().min(4, "Enter a valid student ID").max(30),
  course: z.string().trim().min(2, "Enter a course").max(100), father: z.string().trim().min(2, "Enter the father's name").max(80),
  phone: z.string().trim().regex(/^\+?[0-9 ]{7,18}$/, "Enter a valid phone number"), address: z.string().trim().min(3).max(140),
  score: z.coerce.number().min(0).max(100), attendance: z.coerce.number().min(0).max(100), remarks: z.string().trim().min(4).max(500),
});

type FormValues = z.infer<typeof studentSchema>;
const initials = (name: string) => name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const performance = (score: number) => score >= 85 ? "excellent" : score >= 70 ? "good" : score >= 50 ? "average" : "attention";
const gradeFor = (score: number) => score >= 85 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B+" : score >= 60 ? "C+" : score >= 50 ? "C" : "D";
const statusFor = (score: number) => score >= 80 ? "Top Performer" : score < 65 ? "Needs Attention" : "Good";

function StudentManagementApp() {
  const [students, setStudents] = useState(studentsSeed);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("All Courses");
  const [batch, setBatch] = useState("All Batches");
  const [status, setStatus] = useState("All Statuses");
  const [dark, setDark] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const selected = students.find((item) => item.id === selectedId);

  const visible = useMemo(() => students.filter((s) => {
    const term = query.trim().toLowerCase();
    const matchesSearch = !term || [s.name, s.id, s.phone].some((value) => value.toLowerCase().includes(term));
    return matchesSearch && (course === "All Courses" || s.courseKey === course) && (batch === "All Batches" || s.batch === batch) &&
      (status === "All Statuses" || (status === "Top Performers" ? s.status === "Top Performer" : s.status === "Needs Attention"));
  }), [students, query, course, batch, status]);

  function openAdd() { setEditingId(null); setModalOpen(true); }
  function openEdit(id: string) { setEditingId(id); setModalOpen(true); }
  function save(values: FormValues) {
    if (editingId) {
      setStudents((items) => items.map((s) => s.id === editingId ? { ...s, ...values, grade: gradeFor(values.score), status: statusFor(values.score) } : s));
    } else {
      const key = values.course.toLowerCase().includes("python") ? "Python" : values.course.toLowerCase().includes("design") ? "Graphic Design" : values.course.toLowerCase().includes("web") ? "Web Dev" : "MDCT";
      const template = studentsSeed[0];
      if (!template) return;
      setStudents((items) => [...items, { ...template, ...values, courseKey: key, batch: "2025", grade: gradeFor(values.score), status: statusFor(values.score), school: "Not provided", prior: "Not provided" }]);
    }
    setModalOpen(false);
  }

  return (
    <div className={dark ? "dark" : ""}>
      <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {selected ? (
          <ProfileView student={selected} onBack={() => setSelectedId(null)} onEdit={() => openEdit(selected.id)} />
        ) : (
          <Dashboard students={students} visible={visible} query={query} setQuery={setQuery} course={course} setCourse={setCourse} batch={batch} setBatch={setBatch} status={status} setStatus={setStatus} dark={dark} setDark={setDark} onAdd={openAdd} onSelect={setSelectedId} onUpload={() => fileRef.current?.click()} uploadMessage={uploadMessage} />
        )}
        <input ref={fileRef} className="hidden" type="file" accept=".csv" onChange={(event) => { const name = event.target.files?.[0]?.name; setUploadMessage(name ? `${name} ready to import` : ""); }} />
        <StudentModal open={modalOpen} onOpenChange={setModalOpen} student={students.find((s) => s.id === editingId)} onSave={save} />
      </main>
    </div>
  );
}

function Brand() {
  return <div className="flex min-w-0 items-center gap-3"><div className="brand-mark"><GraduationCap /></div><div className="min-w-0"><div className="text-sm font-bold leading-tight sm:text-base">Ambition Technical Institute</div><div className="truncate text-xs text-muted-foreground">Student Profile Management</div></div></div>;
}

function Dashboard({ students, visible, query, setQuery, course, setCourse, batch, setBatch, status, setStatus, dark, setDark, onAdd, onSelect, onUpload, uploadMessage }: {
  students: Student[]; visible: Student[]; query: string; setQuery: (v: string) => void; course: string; setCourse: (v: string) => void; batch: string; setBatch: (v: string) => void; status: string; setStatus: (v: string) => void; dark: boolean; setDark: (v: boolean) => void; onAdd: () => void; onSelect: (id: string) => void; onUpload: () => void; uploadMessage: string;
}) {
  const metrics = [
    ["Total students", String(students.length).padStart(2, "0"), Users, "primary"],
    ["Active courses", String(new Set(students.map((s) => s.courseKey)).size).padStart(2, "0"), BookOpen, "violet"],
    ["Avg. attendance", `${(students.reduce((a, s) => a + s.attendance, 0) / students.length).toFixed(2)}%`, CalendarDays, "emerald"],
    ["Top performers", String(students.filter((s) => s.status === "Top Performer").length).padStart(2, "0"), Award, "amber"],
  ] as const;
  return <>
    <header className="sticky top-0 z-30 border-b border-border bg-header/90 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-4 px-5 py-4 lg:flex-nowrap lg:px-8"><Brand />
        <div className="order-3 flex w-full flex-1 items-center gap-2 rounded-md border border-border bg-surface-raised px-3 lg:order-none lg:ml-8 lg:max-w-xl"><Search className="size-4 text-muted-foreground"/><input aria-label="Search students" value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Search by name, student ID or phone..."/></div>
        <div className="ml-auto flex items-center gap-2"><Button variant="outline" size="icon" title={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setDark(!dark)}>{dark ? <Sun/> : <Moon/>}</Button><Button variant="outline" className="hidden sm:inline-flex" onClick={onUpload}><Upload/> Upload CSV</Button><Button onClick={onAdd}><Plus/> Add New Student</Button></div>
      </div>
    </header>
    <div className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8 lg:py-10">
      <section className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="eyebrow">Operator dashboard</div><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Student overview</h1><p className="mt-2 text-sm text-muted-foreground">Manage records and open presentation-ready performance profiles.</p></div><div className="operator-tag"><span className="status-dot"/> Operator Mode <span className="text-muted-foreground">· Logged in as Admin</span></div></section>
      {uploadMessage && <div className="mb-5 flex items-center gap-2 rounded-md border border-success/30 bg-success-soft px-4 py-3 text-sm text-success"><Check className="size-4"/>{uploadMessage}</div>}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, Icon, tone]) => <div className="metric-card" key={label}><div className={`metric-icon metric-${tone}`}><Icon/></div><div><div className="metric-value">{value}</div><div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div></div></div>)}</section>
      <section className="mt-8 flex flex-col gap-4 border-y border-border py-5 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-lg font-bold">Student records</h2><p className="text-sm text-muted-foreground">Showing {visible.length} of {students.length} students</p></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{[
        ["Course", course, setCourse, ["All Courses", "MDCT", "Python", "Graphic Design", "Web Dev"]], ["Batch", batch, setBatch, ["All Batches", "2024", "2025"]], ["Performance", status, setStatus, ["All Statuses", "Top Performers", "Needs Attention"]],
      ].map(([label, value, setter, options]) => <label className="filter-control" key={String(label)}><span>{String(label)}</span><select aria-label={String(label)} value={String(value)} onChange={(e) => (setter as (v: string) => void)(e.target.value)}>{(options as string[]).map((o) => <option key={o}>{o}</option>)}</select></label>)}</div></section>
      {visible.length ? <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{visible.map((student, index) => <StudentCard key={student.id} student={student} index={index} onClick={() => onSelect(student.id)}/>)}</section> : <div className="empty-state"><Search/><h3>No students found</h3><p>Try changing the search or filters.</p></div>}
    </div>
  </>;
}

function StudentCard({ student, index, onClick }: { student: Student; index: number; onClick: () => void }) {
  return <article className="student-card group" onClick={onClick} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}>
    <div className="flex items-start justify-between"><div className={`avatar avatar-${index % 4}`}>{initials(student.name)}</div><span className={`score-badge ${performance(student.score)}`}>{student.score}%</span></div>
    <div className="mt-5"><h3 className="text-xl font-bold">{student.name}</h3><p className="mt-1 font-mono text-xs text-muted-foreground">{student.id}</p></div>
    <div className="my-5 min-h-14 border-l-2 border-primary/50 pl-3"><p className="text-sm font-semibold leading-snug">{student.course}</p><p className="mt-1 text-xs text-muted-foreground">Batch {student.batch}</p></div>
    <div className="grid grid-cols-2 gap-2"><div className="data-tile"><span>Overall</span><strong>{student.score}%</strong></div><div className="data-tile"><span>Attendance</span><strong>{student.attendance}%</strong></div></div>
    <Button variant="outline" className="mt-5 w-full justify-between">View full profile <ChevronRight/></Button>
  </article>;
}

function ProfileView({ student, onBack, onEdit }: { student: Student; onBack: () => void; onEdit: () => void }) {
  const [tab, setTab] = useState<"weekly" | "monthly" | "attendance">("weekly");
  function exportSheet() {
    const rows = [["Student", student.name], ["Student ID", student.id], ["Course", student.course], ["Overall Score", `${student.score}%`], ["Attendance", `${student.attendance}%`], [], ["Assessment", "Subject", "Score", "Maximum", "Percentage"], ...student.weekly.map((e) => [e.label, e.subject, e.score, e.max, `${Math.round(e.score / e.max * 100)}%`]), ...student.monthly.map((e) => [e.label, e.subject, e.score, e.max, `${Math.round(e.score / e.max * 100)}%`])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = `${student.id}-performance.csv`; a.click(); URL.revokeObjectURL(url);
  }
  return <div className="profile-shell">
    <header className="border-b border-border bg-header/90 backdrop-blur-xl print:hidden"><div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-5 py-4 lg:px-8"><Button variant="ghost" onClick={onBack}><ArrowLeft/> Back to Dashboard</Button><div className="mx-auto hidden lg:block"><Brand/></div><div className="ml-auto flex gap-2"><Button variant="outline" onClick={exportSheet}><FileSpreadsheet/><span className="hidden sm:inline">Export Excel Sheet</span></Button><Button onClick={() => window.print()}><Download/><span className="hidden sm:inline">Export PDF Report Card</span></Button></div></div></header>
    <div className="mx-auto max-w-[1400px] px-5 py-7 lg:px-8 lg:py-10">
      <div className="print-brand hidden"><Brand/></div>
      <section className="identity-banner"><div className="flex flex-col gap-6 lg:flex-row lg:items-center"><div className="avatar avatar-large">{initials(student.name)}</div><div className="min-w-0 flex-1"><div className="eyebrow">Student performance profile</div><h1 className="mt-2 text-3xl font-bold sm:text-4xl">{student.name}</h1><p className="mt-2 font-mono text-sm text-primary">{student.id}</p><div className="mt-4 flex flex-wrap gap-2"><span className="info-chip"><BookOpen/> {student.course}</span><span className="info-chip"><CalendarDays/> Batch {student.batch}</span></div></div><Button variant="outline" onClick={onEdit} className="self-start"><Pencil/> Edit Record / Add Marks</Button></div>
        <div className="parent-grid"><Detail icon={UserRound} label="Father's name" value={student.father}/><Detail icon={Phone} label="Contact number" value={student.phone}/><Detail icon={MapPin} label="Address" value={student.address}/><Detail icon={GraduationCap} label="School / prior education" value={`${student.school} · ${student.prior}`}/></div>
      </section>
      <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_1.5fr]"><Meter value={student.score} label="Overall score" tone={performance(student.score)}/><Meter value={student.attendance} label="Attendance rate" tone={performance(student.attendance)}/><div className="grade-panel"><div><p className="eyebrow">Academic standing</p><div className="mt-3 flex items-end gap-3"><span className="text-5xl font-bold">{student.grade}</span><span className={`score-badge ${performance(student.score)}`}>{student.status}</span></div></div><Award className="size-16 text-primary/40"/></div></section>
      <section className="mt-5 content-panel"><ProfileTabs tab={tab} setTab={setTab}/><div className="pt-5">{tab === "weekly" && <WeeklyTable exams={student.weekly}/>} {tab === "monthly" && <MonthlyCards exams={student.monthly}/>} {tab === "attendance" && <AttendanceGrid rate={student.attendance}/>}</div></section>
      <section className="remarks-box"><Quote/><div><div className="eyebrow">Instructor remarks</div><p className="mt-2 text-lg leading-relaxed">“{student.remarks}”</p></div></section>
    </div>
  </div>;
}

function Detail({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) { return <div className="detail-item"><Icon/><div><span>{label}</span><strong>{value}</strong></div></div>; }
function ProfileTabs({ tab, setTab }: { tab: "weekly" | "monthly" | "attendance"; setTab: (tab: "weekly" | "monthly" | "attendance") => void }) {
  const tabs: Array<["weekly" | "monthly" | "attendance", string, LucideIcon]> = [["weekly", "Weekly exams", ClipboardList], ["monthly", "Monthly / Term", Award], ["attendance", "Attendance history", CalendarDays]];
  return <div className="tabs print:hidden">{tabs.map(([key, label, Icon]) => <Button key={key} variant={tab === key ? "default" : "ghost"} onClick={() => setTab(key)}><Icon/>{label}</Button>)}</div>;
}
function Meter({ value, label, tone }: { value: number; label: string; tone: string }) { return <div className="meter-card"><div className={`score-ring ${tone}`} style={{ "--score": value } as CSSProperties}><div><strong>{value}</strong><span>%</span></div></div><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 font-bold">{value >= 85 ? "Excellent" : value >= 70 ? "On track" : "Needs focus"}</p></div></div>; }
function WeeklyTable({ exams }: { exams: Exam[] }) { return <div className="overflow-x-auto"><table className="exam-table"><thead><tr><th>Assessment</th><th>Topic</th><th>Date</th><th>Marks</th><th>Performance</th></tr></thead><tbody>{exams.map((e) => { const pct = Math.round(e.score / e.max * 100); return <tr key={e.label}><td><strong>{e.label}</strong></td><td>{e.subject}</td><td className="text-muted-foreground">{e.date}</td><td className="font-mono font-bold">{e.score} / {e.max}</td><td><span className={`score-badge ${performance(pct)}`}>{pct}%</span></td></tr>; })}</tbody></table></div>; }
function MonthlyCards({ exams }: { exams: Exam[] }) { return <div className="grid gap-3 md:grid-cols-2">{exams.map((e) => <div className="subject-row" key={e.subject}><div className="flex justify-between gap-3"><div><p className="font-bold">{e.subject}</p><p className="mt-1 text-xs text-muted-foreground">{e.label} · {e.date}</p></div><strong className="font-mono">{e.score}/{e.max}</strong></div><div className="progress-track"><div className={`progress-fill ${performance(e.score / e.max * 100)}`} style={{ width: `${e.score / e.max * 100}%` }}/></div></div>)}</div>; }
function AttendanceGrid({ rate }: { rate: number }) { const present = Math.round(rate * 0.3); return <div><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Last 30 academic days</h3><p className="text-sm text-muted-foreground">{present} present · {30 - present} absent</p></div><div className="flex gap-4 text-xs"><span className="flex items-center gap-2"><i className="attendance-key present"/>Present</span><span className="flex items-center gap-2"><i className="attendance-key absent"/>Absent</span></div></div><div className="attendance-grid">{Array.from({ length: 30 }, (_, i) => <div key={i} title={`Day ${i + 1}: ${i < present ? "Present" : "Absent"}`} className={i < present ? "present" : "absent"}>{i + 1}</div>)}</div></div>; }

function StudentModal({ open, onOpenChange, student, onSave }: { open: boolean; onOpenChange: (v: boolean) => void; student: Student | undefined; onSave: (v: FormValues) => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const key = `${student?.id ?? "new"}-${open}`;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent key={key} className="max-h-[92vh] max-w-3xl overflow-y-auto bg-card p-0"><DialogHeader className="border-b border-border px-6 py-5"><DialogTitle>{student ? "Edit student record" : "Add new student"}</DialogTitle><DialogDescription>Update the student and guardian information used in presentations.</DialogDescription></DialogHeader><form className="grid gap-4 px-6 py-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget)); const parsed = studentSchema.safeParse(data); if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]))); return; } setErrors({}); onSave(parsed.data); }}>
    {[["name", "Student name", student?.name, "text"], ["id", "Student ID", student?.id, "text"], ["course", "Course", student?.course, "text"], ["father", "Father's name", student?.father, "text"], ["phone", "Phone", student?.phone, "tel"], ["address", "Address", student?.address, "text"], ["score", "Overall marks (%)", student?.score, "number"], ["attendance", "Attendance (%)", student?.attendance, "number"]].map(([name, label, value, type]) => <label className="form-field" key={String(name)}><span>{label}</span><input name={String(name)} type={String(type)} defaultValue={value} maxLength={type === "text" ? 140 : undefined} min={type === "number" ? 0 : undefined} max={type === "number" ? 100 : undefined}/>{errors[String(name)] && <small>{errors[String(name)]}</small>}</label>)}
    <label className="form-field sm:col-span-2"><span>Instructor remarks</span><textarea name="remarks" defaultValue={student?.remarks} rows={4} maxLength={500}/>{errors["remarks"] && <small>{errors["remarks"]}</small>}</label>
    <DialogFooter className="sm:col-span-2 mt-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit"><Check/> Save Student Record</Button></DialogFooter>
  </form></DialogContent></Dialog>;
}