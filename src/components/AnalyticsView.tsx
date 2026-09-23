import { ArrowLeft, LogOut } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import type { Student } from "@/lib/types";
import { Brand } from "@/components/Brand";

export function AnalyticsView({
  students,
  onBack,
  onHome,
  onLogout,
}: {
  students: Student[];
  onBack: () => void;
  onHome?: () => void;
  onLogout: () => void;
}) {
  const courseData = Array.from(new Set(students.map((s) => s.courseKey))).map((key) => {
    const group = students.filter((s) => s.courseKey === key);
    return {
      course: key,
      avgScore: Math.round(group.reduce((a, s) => a + (s.score ?? 0), 0) / group.length),
      avgAttendance: Math.round(group.reduce((a, s) => a + (s.attendance ?? 0), 0) / group.length),
    };
  });

  const batchData = Array.from(new Set(students.map((s) => s.batch))).map((batch) => {
    const group = students.filter((s) => s.batch === batch);
    return {
      batch: `Batch ${batch}`,
      students: group.length,
      avgScore: Math.round(group.reduce((a, s) => a + (s.score ?? 0), 0) / group.length),
    };
  });

  const statusData = ["Top Performer", "Good", "Needs Attention"]
    .map((label) => ({ name: label, value: students.filter((s) => s.status === label).length }))
    .filter((d) => d.value > 0);

  const statusColors: Record<string, string> = {
    "Top Performer": "var(--success)",
    Good: "var(--primary)",
    "Needs Attention": "var(--danger)",
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-header/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-5 py-4 lg:px-8">
          <Brand onClick={onHome} />
          <Button
            variant="outline"
            size="icon"
            className="ml-auto"
            title="Log out"
            onClick={onLogout}
          >
            <LogOut />
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-[1400px] px-5 py-9 lg:px-8 lg:py-14">
        <Button variant="ghost" className="mb-4" onClick={onBack}>
          <ArrowLeft /> Back to Dashboard
        </Button>
        <section className="mb-10">
          <div className="eyebrow">Institute analytics</div>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Performance overview</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Aggregated trends across all enrolled students.
          </p>
        </section>
        <section className="grid gap-5 lg:grid-cols-2">
          <div className="content-panel">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Average score by course
            </h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="course"
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="avgScore"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                    name="Avg score %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="content-panel">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Average attendance by course
            </h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="course"
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="avgAttendance"
                    fill="var(--violet)"
                    radius={[4, 4, 0, 0]}
                    name="Avg attendance %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="content-panel">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Batch comparison
            </h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="batch" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="students"
                    fill="var(--warning)"
                    radius={[4, 4, 0, 0]}
                    name="Students"
                  />
                  <Bar
                    dataKey="avgScore"
                    fill="var(--success)"
                    radius={[4, 4, 0, 0]}
                    name="Avg score %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="content-panel">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Performance distribution
            </h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={statusColors[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
