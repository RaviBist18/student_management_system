import { ChevronRight, Trash2 } from "lucide-react";
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
import type { Student } from "@/lib/types";
import { performance } from "@/lib/helpers";
import { StudentAvatar } from "@/components/StudentAvatar";

export function StudentCard({
  student,
  index,
  onClick,
  onDelete,
  selectMode,
  selected,
  onToggleSelect,
}: {
  student: Student;
  index: number;
  onClick: () => void;
  onDelete: (id: string) => void;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <article
      className={`student-card group ${selected ? "ring-2 ring-primary" : ""}`}
      onClick={() => (selectMode ? onToggleSelect(student.id) : onClick())}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") selectMode ? onToggleSelect(student.id) : onClick();
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {selectMode && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(student.id)}
              onClick={(e) => e.stopPropagation()}
              className="size-4"
            />
          )}
          <StudentAvatar student={student} className={`avatar avatar-${index % 4}`} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`score-badge ${performance(student.score)}`}>{student.score}%</span>
          {!selectMode && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="delete-icon-btn"
                  title="Delete student"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="size-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {student.name}'s record?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes all exam and attendance data for this student. This cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(student.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      <div className="mt-5">
        <h3 className="text-xl font-bold">{student.name}</h3>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{student.id}</p>
      </div>
      <div className="my-5 min-h-14 border-l-2 border-primary/50 pl-3">
        <p className="text-sm font-semibold leading-snug">{student.course}</p>
        <p className="mt-1 text-xs text-muted-foreground">Batch {student.batch}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="data-tile">
          <span>Overall</span>
          <strong>{student.score}%</strong>
        </div>
        <div className="data-tile">
          <span>Attendance</span>
          <strong>{student.attendance}%</strong>
        </div>
      </div>
      <Button variant="outline" className="mt-5 w-full justify-between">
        View full profile <ChevronRight />
      </Button>
    </article>
  );
}
