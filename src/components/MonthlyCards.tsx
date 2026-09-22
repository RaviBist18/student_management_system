import type { Exam } from "@/lib/types";
import { performance } from "@/lib/helpers";

function groupByLabel(exams: Exam[]) {
  const map = new Map<string, { label: string; date: string; rows: Exam[] }>();
  for (const e of exams) {
    const key = e.label;
    if (!map.has(key)) map.set(key, { label: e.label, date: e.date, rows: [] });
    map.get(key)!.rows.push(e);
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function MonthlyCards({ exams }: { exams: Exam[] }) {
  if (exams.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">No monthly exam records yet</p>
    );
  }

  const groups = groupByLabel(exams);

  const scored = exams.filter((e) => e.score != null);
  const avgPct = scored.length
    ? Math.round(scored.reduce((sum, e) => sum + (e.score / e.max) * 100, 0) / scored.length)
    : null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {avgPct !== null ? (
            <>
              Monthly average: <span className="font-bold text-foreground">{avgPct}%</span>
            </>
          ) : (
            "No scored entries yet"
          )}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="exam-table" style={{ width: "100%", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "20%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "25%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Month</th>
              <th>Subject</th>
              <th>Marks</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <>
                {g.rows.map((e, i) => {
                  const pending = e.score == null;
                  const pct = pending ? null : Math.round(((e.score as number) / e.max) * 100);
                  return (
                    <tr key={`${g.label}__${e.subject}`}>
                      {i === 0 && (
                        <td
                          rowSpan={g.rows.length}
                          className="bg-muted/40 align-top text-sm font-semibold"
                        >
                          {g.label}
                        </td>
                      )}
                      <td>{e.subject}</td>
                      <td className="font-mono font-bold">
                        {pending ? "—" : `${e.score} / ${e.max}`}
                      </td>
                      <td>
                        {pending ? (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        ) : (
                          <span className={`score-badge ${performance(pct as number)}`}>
                            {pct}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
