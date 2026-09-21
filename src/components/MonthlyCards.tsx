import type { Exam } from "@/lib/types";
import { performance } from "@/lib/helpers";

export function MonthlyCards({ exams }: { exams: Exam[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {exams.map((e) => (
        <div className="subject-row" key={e.subject}>
          <div className="flex justify-between gap-3">
            <div>
              <p className="font-bold">{e.subject}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {e.label} · {e.date}
              </p>
            </div>
            <strong className="font-mono">
              {e.score}/{e.max}
            </strong>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${performance((e.score / e.max) * 100)}`}
              style={{ width: `${(e.score / e.max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
