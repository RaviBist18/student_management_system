import { useState } from "react";
import { CalendarDays, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NEPALI_MONTHS } from "@/lib/types";

export function BSDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const parts = value.split(" ");
  const [day, setDay] = useState(parts[0] ?? "");
  const [month, setMonth] = useState(parts[1] ?? "Ashoj");
  const [year, setYear] = useState(parts[2] ?? "2083");
  const years = Array.from({ length: 10 }, (_, i) => String(2078 + i));
  const days = Array.from({ length: 32 }, (_, i) => String(i + 1).padStart(2, "0"));

  function apply() {
    onChange(`${day.padStart(2, "0")} ${month} ${year}`);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 text-sm"
        onClick={() => setOpen(!open)}
      >
        <span className={value ? "" : "text-muted-foreground"}>
          {value || "Select date (B.S.)"}
        </span>
        <CalendarDays className="size-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full min-w-72 rounded-md border border-border bg-card p-4 shadow-xl">
          <div className="grid grid-cols-3 gap-2">
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                {days.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                {NEPALI_MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" className="mt-3 w-full" onClick={apply}>
            <Check /> Set Date
          </Button>
        </div>
      )}
    </div>
  );
}
