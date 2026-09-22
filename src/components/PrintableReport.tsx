import { GraduationCap } from "lucide-react";
import type { Student } from "@/lib/types";
import { gradeFor } from "@/lib/helpers";
import { StudentAvatar } from "@/components/StudentAvatar";

export function PrintableReport({ student }: { student: Student }) {
  const exams = [
    ...student.weekly.map((exam) => ({ ...exam, assessment: "Weekly" })),
    ...student.monthly.map((exam) => ({ ...exam, assessment: "Monthly / Term" })),
  ];
  return (
    <article className="print-report">
      <header className="print-report-header">
        <div className="print-logo">
          <GraduationCap />
        </div>
        <div>
          <h1>AMBITION TECHNICAL INSTITUTE</h1>
          <p>Birendranagar, Surkhet, Nepal</p>
          <strong>STUDENT PERFORMANCE REPORT CARD</strong>
        </div>
      </header>
      <section className="print-student-summary">
        <StudentAvatar student={student} className="print-photo" />
        <div className="print-summary-grid">
          <PrintDetail label="Full Name" value={student.name} />
          <PrintDetail label="Student ID" value={student.id} />
          <PrintDetail label="Course" value={student.course} />
          <PrintDetail label="Batch" value={student.batch} />
          <PrintDetail label="Father's Name" value={student.father} />
          <PrintDetail label="Contact Number" value={student.phone} />
        </div>
      </section>
      <section>
        <h2>Performance Marks</h2>
        <table className="print-marks-table">
          <thead>
            <tr>
              <th>Assessment</th>
              <th>Subject</th>
              <th>Obtained</th>
              <th>Max Marks</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => {
              const percent = Math.round((exam.score / exam.max) * 100);
              return (
                <tr key={`${exam.assessment}-${exam.subject}`}>
                  <td>{exam.assessment}</td>
                  <td>{exam.subject}</td>
                  <td>{exam.score}</td>
                  <td>{exam.max}</td>
                  <td>{gradeFor(percent)}</td>
                </tr>
              );
            })}
            <tr className="print-total-row">
              <td colSpan={2}>Overall Performance</td>
              <td>{student.score}%</td>
              <td>Attendance</td>
              <td>{student.attendance !== null ? `${student.attendance}%` : "—"}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section className="print-remarks">
        <h2>Instructor Remarks</h2>
        <p>{student.remarks}</p>
      </section>
      <footer className="print-signatures">
        <div>
          <span />
          <strong>Course Coordinator</strong>
        </div>
        <div>
          <span />
          <strong>Parent / Guardian</strong>
        </div>
      </footer>
    </article>
  );
}

function PrintDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
