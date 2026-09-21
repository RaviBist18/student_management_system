import { GraduationCap } from "lucide-react";

export function Brand({ onClick }: { onClick?: (() => void) | undefined }) {
  return (
    <div
      className={`flex min-w-0 items-center gap-3 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className="brand-mark">
        <GraduationCap />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold leading-tight sm:text-base">
          Ambition Technical Institute
        </div>
        <div className="truncate text-xs text-muted-foreground">Student Profile Management</div>
      </div>
    </div>
  );
}
