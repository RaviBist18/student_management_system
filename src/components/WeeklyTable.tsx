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

export function WeeklyTable({ exams }: { exams: Exam[] }) {
  const trendData = exams.map((e) => ({
    label: e.label,
    percent: Math.round((e.score / e.max) * 100),
  }));
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
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="overflow-x-auto">
        <table className="exam-table">
          <thead>
            <tr>
              <th>Assessment</th>
              <th>Topic</th>
              <th>Date</th>
              <th>Marks</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e) => {
              const pct = Math.round((e.score / e.max) * 100);
              return (
                <tr key={e.label}>
                  <td>
                    <strong>{e.label}</strong>
                  </td>
                  <td>{e.subject}</td>
                  <td className="text-muted-foreground">{e.date}</td>
                  <td className="font-mono font-bold">
                    {e.score} / {e.max}
                  </td>
                  <td>
                    <span className={`score-badge ${performance(pct)}`}>{pct}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
