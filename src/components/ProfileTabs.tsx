import { Award, CalendarDays, ClipboardList, FileSpreadsheet, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileTabs({
  tab,
  setTab,
  isOwner,
}: {
  tab: "weekly" | "monthly" | "attendance" | "fees";
  setTab: (tab: "weekly" | "monthly" | "attendance" | "fees") => void;
  isOwner: boolean;
}) {
  const tabs: Array<["weekly" | "monthly" | "attendance" | "fees", string, LucideIcon]> = [
    ["weekly", "Weekly exams", ClipboardList],
    ["monthly", "Monthly / Term", Award],
    ["attendance", "Attendance history", CalendarDays],
  ];
  if (isOwner) {
    tabs.push(["fees", "Fees", FileSpreadsheet]);
  }
  return (
    <div className="tabs print:hidden">
      {tabs.map(([key, label, Icon]) => (
        <Button key={key} variant={tab === key ? "default" : "ghost"} onClick={() => setTab(key)}>
          <Icon />
          {label}
        </Button>
      ))}
    </div>
  );
}
