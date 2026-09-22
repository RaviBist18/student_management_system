import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Login } from "@/pages/Login";
import { StudentsProvider, useStudents } from "@/context/StudentsContext";

import { Dashboard } from "@/components/Dashboard";
import { ProfileView } from "@/components/ProfileView";
import { AnalyticsView } from "@/components/AnalyticsView";
import { CourseBreakdownView } from "@/components/CourseBreakdownView";
import { AttendanceBreakdownView } from "@/components/AttendanceBreakdownView";
import { StudentModal } from "@/components/StudentModal";
import { ImportPreviewModal } from "@/components/ImportPreviewModal";
import { AttendanceUploadModal } from "@/components/AttendanceUploadModal";
import { WeeklyMarksUploadModal } from "@/components/WeeklyMarksUploadModal";
import { MonthlyMarksUploadModal } from "@/components/MonthlyMarksUploadModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Profile Management — Ambition Technical Institute" },
      {
        name: "description",
        content:
          "Interactive student records and performance presentation system for Ambition Technical Institute.",
      },
      {
        property: "og:title",
        content: "Ambition Technical Institute — Student Profile Management",
      },
      {
        property: "og:description",
        content: "Student records and performance presentation dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteWrapper,
});

function RouteWrapper() {
  const { isAuthed, loading, isOwner } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }
  if (!isAuthed) {
    return <Login />;
  }

  return (
    <StudentsProvider isOwner={isOwner}>
      <StudentManagementApp isOwner={isOwner} />
    </StudentsProvider>
  );
}

function StudentManagementApp({ isOwner }: { isOwner: boolean }) {
  const {
    students,
    studentsLoading,
    dark,
    setDark,
    modalOpen,
    setModalOpen,
    editingId,
    openAdd,
    openEdit,
    save,
    deleteStudent,
    addPayment,
    voidPayment,
    selectMode,
    setSelectMode,
    selectedIds,
    toggleSelect,
    bulkDelete,
    bulkExport,
    importRows,
    importModalOpen,
    setImportModalOpen,
    parseCsvFile,
    commitImport,
    resetWeeklyForStudent,
    resetWeeklyForCourse,
    resetMonthlyForStudent,
    resetMonthlyForCourse,
    resetAttendanceForCourseMonth,
  } = useStudents();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCourseBreakdown, setShowCourseBreakdown] = useState(false);
  const [showAttendanceBreakdown, setShowAttendanceBreakdown] = useState(false);
  const [showAttendanceUpload, setShowAttendanceUpload] = useState(false);
  const [showMarksUpload, setShowMarksUpload] = useState(false);
  const [showMonthlyMarksUpload, setShowMonthlyMarksUpload] = useState(false);
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("All Courses");
  const [batch, setBatch] = useState("All Batches");
  const [status, setStatus] = useState("All Statuses");
  const [teacher, setTeacher] = useState("All Teachers");
  const [timing, setTiming] = useState("All Timings");
  const [sortBy, setSortBy] = useState("Name (A-Z)");
  const [uploadMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const selected = students.find((item) => item.id === selectedId);

  const visible = useMemo(() => {
    const filtered = students.filter((s) => {
      const term = query.trim().toLowerCase();
      const matchesSearch =
        !term || [s.name, s.id, s.phone].some((value) => value.toLowerCase().includes(term));
      return (
        matchesSearch &&
        (course === "All Courses" || s.courseKey === course) &&
        (batch === "All Batches" || s.batch === batch) &&
        (status === "All Statuses" ||
          (status === "Top Performers"
            ? s.status === "Top Performer"
            : s.status === "Needs Attention")) &&
        (teacher === "All Teachers" || s.teacher === teacher) &&
        (timing === "All Timings" || s.timing === timing)
      );
    });
    const sorted = [...filtered];
    if (sortBy === "Name (A-Z)") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "Score (High-Low)")
      sorted.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    else if (sortBy === "Score (Low-High)")
      sorted.sort((a, b) => (a.score ?? -1) - (b.score ?? -1));
    else if (sortBy === "Attendance (High-Low)")
      sorted.sort((a, b) => (b.attendance ?? -1) - (a.attendance ?? -1));
    else if (sortBy === "Attendance (Low-High)")
      sorted.sort((a, b) => (a.attendance ?? -1) - (b.attendance ?? -1));
    if (status === "Top Performers") {
      return sorted.sort((a, b) => (b.score ?? -1) - (a.score ?? -1)).slice(0, 10);
    }
    return sorted;
  }, [students, query, course, batch, status, sortBy, teacher, timing]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount);
  const pageItems = visible.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, course, batch, status, sortBy, teacher, timing]);

  function goHome() {
    setShowAnalytics(false);
    setShowCourseBreakdown(false);
    setShowAttendanceBreakdown(false);
    setSelectedId(null);
  }
  function logout() {
    supabase.auth.signOut();
  }

  if (studentsLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className={dark ? "dark" : ""}>
      <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Toaster richColors position="top-right" />
        {showAnalytics ? (
          <AnalyticsView students={students} onBack={goHome} onHome={goHome} onLogout={logout} />
        ) : showAttendanceBreakdown ? (
          <AttendanceBreakdownView
            students={students}
            onBack={goHome}
            onHome={goHome}
            onLogout={logout}
          />
        ) : showCourseBreakdown ? (
          <CourseBreakdownView
            students={students}
            onBack={goHome}
            onHome={goHome}
            onLogout={logout}
            onSelectStudent={(id) => {
              setShowCourseBreakdown(false);
              setSelectedId(id);
            }}
          />
        ) : selected ? (
          <ProfileView
            student={selected}
            isOwner={isOwner}
            onBack={goHome}
            onHome={goHome}
            onLogout={logout}
            onEdit={() => openEdit(selected.id)}
            onDelete={deleteStudent}
            onAddPayment={addPayment}
            onVoidPayment={voidPayment}
            onResetWeekly={resetWeeklyForStudent}
            onResetMonthly={resetMonthlyForStudent}
          />
        ) : (
          <Dashboard
            students={students}
            visible={visible}
            pageItems={pageItems}
            page={pageSafe}
            pageCount={pageCount}
            setPage={setPage}
            query={query}
            setQuery={setQuery}
            onLogout={logout}
            selectMode={selectMode}
            setSelectMode={setSelectMode}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onBulkDelete={bulkDelete}
            onBulkExport={bulkExport}
            course={course}
            setCourse={setCourse}
            batch={batch}
            setBatch={setBatch}
            status={status}
            setStatus={setStatus}
            teacher={teacher}
            setTeacher={setTeacher}
            timing={timing}
            setTiming={setTiming}
            sortBy={sortBy}
            setSortBy={setSortBy}
            dark={dark}
            setDark={setDark}
            onAdd={openAdd}
            onAnalytics={() => setShowAnalytics(true)}
            onCourseBreakdown={() => setShowCourseBreakdown(true)}
            onAttendanceBreakdown={() => setShowAttendanceBreakdown(true)}
            onSelect={setSelectedId}
            onUpload={() => fileRef.current?.click()}
            onUploadAttendance={() => setShowAttendanceUpload(true)}
            onUploadMarks={() => setShowMarksUpload(true)}
            onUploadMonthlyMarks={() => setShowMonthlyMarksUpload(true)}
            onResetMonthlyForCourse={resetMonthlyForCourse}
            onResetWeeklyForCourse={resetWeeklyForCourse}
            onResetAttendanceForCourseMonth={resetAttendanceForCourseMonth}
            uploadMessage={uploadMessage}
            onDelete={deleteStudent}
          />
        )}
        <input
          ref={fileRef}
          className="hidden"
          type="file"
          accept=".csv"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) parseCsvFile(file);
            event.target.value = "";
          }}
        />
        <ImportPreviewModal
          open={importModalOpen}
          onOpenChange={setImportModalOpen}
          rows={importRows}
          onCommit={commitImport}
        />
        <AttendanceUploadModal open={showAttendanceUpload} onOpenChange={setShowAttendanceUpload} />
        <WeeklyMarksUploadModal open={showMarksUpload} onOpenChange={setShowMarksUpload} />
        <MonthlyMarksUploadModal
          open={showMonthlyMarksUpload}
          onOpenChange={setShowMonthlyMarksUpload}
        />
        <StudentModal
          key={`${editingId ?? "new"}-${modalOpen}`}
          open={modalOpen}
          onOpenChange={setModalOpen}
          student={students.find((s) => s.id === editingId)}
          onSave={save}
        />
      </main>
    </div>
  );
}
