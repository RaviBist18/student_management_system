import type { CSSProperties } from "react";

export function Meter({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div className="meter-card">
      <div className={`score-ring ${tone}`} style={{ "--score": value } as CSSProperties}>
        <div>
          <strong>{value}</strong>
          <span>%</span>
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-bold">
          {value >= 85 ? "Excellent" : value >= 70 ? "On track" : "Needs focus"}
        </p>
      </div>
    </div>
  );
}
