import type { Student } from "@/lib/types";
import { initials } from "@/lib/helpers";

export function StudentAvatar({ student, className }: { student: Student; className: string }) {
  return student.photo ? (
    <div className={`${className} overflow-hidden p-0`}>
      <img
        src={student.photo}
        alt={`${student.name} profile`}
        className="h-full w-full object-cover"
      />
    </div>
  ) : (
    <div className={className}>{initials(student.name)}</div>
  );
}
