import { useEffect, useState } from "react";
import { toBik_euro, toGreg, daysInMonth } from "bikram-sambat";
import { supabase } from "@/lib/supabase";

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

export function AttendanceGrid({ studentId }: { studentId: string }) {
  const [logs, setLogs] = useState<{ date: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("attendance_log")
      .select("date, status")
      .eq("student_id", studentId)
      .order("date", { ascending: true })
      .then(({ data }) => {
        setLogs(data ?? []);
        setLoading(false);
      });
  }, [studentId]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading attendance...</p>;
  if (!logs.length)
    return <p className="text-sm text-muted-foreground">No attendance records uploaded yet.</p>;

  // Convert all log dates to BS, group by latest BS year-month present
  const bsEntries = logs.map((l) => {
    const bs = toBik_euro(l.date); // "YYYY-MM-DD"
    const [y, m, d] = bs.split("-").map(Number);
    return { bsYear: y!, bsMonth: m!, bsDay: d!, status: l.status };
  });
  const latest = bsEntries[bsEntries.length - 1]!;
  const { bsYear, bsMonth } = latest;

  const monthEntries = bsEntries.filter((e) => e.bsYear === bsYear && e.bsMonth === bsMonth);
  const statusByDay = new Map(monthEntries.map((e) => [e.bsDay, e.status]));

  const totalDays = daysInMonth(bsYear, bsMonth);
  const firstAd = toGreg(bsYear, bsMonth, 1);
  const startWeekday = new Date(firstAd.year, firstAd.month - 1, firstAd.day).getDay();

  const present = monthEntries.filter((e) => e.status === "P").length;
  const absent = monthEntries.filter((e) => e.status === "A").length;

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const cells: Array<number | null> = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold">
            {BS_MONTHS[bsMonth - 1]} {bsYear} attendance
          </h3>
          <p className="text-sm text-muted-foreground">
            {present} present · {absent} absent
          </p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-2">
            <i className="attendance-key present" />
            Present
          </span>
          <span className="flex items-center gap-2">
            <i className="attendance-key absent" />
            Absent
          </span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const status = statusByDay.get(day);
          const tone =
            status === "P"
              ? "bg-success/20 text-success"
              : status === "A"
                ? "bg-danger/20 text-danger"
                : "bg-muted text-muted-foreground";
          return (
            <div
              key={day}
              title={`Day ${day}: ${status === "P" ? "Present" : status === "A" ? "Absent" : "No record"}`}
              className={`flex aspect-square items-center justify-center rounded-md text-xs font-bold ${tone}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
