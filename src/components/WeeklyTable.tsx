import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Exam } from "@/lib/types";
import { performance } from "@/lib/helpers";
import { toBik_euro } from "bikram-sambat";

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

function fmtDateBS(adDate: string) {
  try {
    const bs = toBik_euro(adDate); // "YYYY-MM-DD" in BS
    const [y, m, d] = bs.split("-").map(Number);
    return `${String(d).padStart(2, "0")} ${BS_MONTHS[m! - 1]} ${y}`;
  } catch {
    return adDate; // fallback, bad/unparseable date
  }
}

function groupByWeek(exams: Exam[]) {
  const map = new Map<string, { label: string; date: string; rows: Exam[] }>();
  for (const e of exams) {
    const key = `${e.label}__${e.date}`;
    if (!map.has(key)) map.set(key, { label: e.label, date: e.date, rows: [] });
    map.get(key)!.rows.push(e);
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function WeeklyTable({ exams }: { exams: Exam[] }) {
  if (exams.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No exam records yet</p>;
  }

  const groups = groupByWeek(exams);

  const trendData = groups.map((g) => {
    const scored = g.rows.filter((r) => r.score != null);
    const avgPct = scored.length
      ? Math.round(
          (scored.reduce((sum, r) => sum + (r.score as number) / r.max, 0) * 100) / scored.length,
        )
      : null;
    return { label: g.label, percent: avgPct };
  });

  return (
    <div>
      <div className="mb-6 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
            <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="percent"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Score %"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="exam-table" style={{ width: "100%", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "30%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Marks</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <>
                <tr key={`${g.label}__${g.date}__header`}>
                  <td colSpan={3} className="bg-muted/40 px-4 py-2 text-sm font-semibold">
                    {g.label} — {fmtDateBS(g.date)}
                  </td>
                </tr>
                {g.rows.map((e) => {
                  const pending = e.score == null;
                  const pct = pending ? null : Math.round(((e.score as number) / e.max) * 100);
                  return (
                    <tr key={`${g.label}__${g.date}__${e.subject}`}>
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
