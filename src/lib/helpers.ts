import type { Student } from "@/lib/types";

export const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const performance = (score: number) =>
  score >= 85 ? "excellent" : score >= 70 ? "good" : score >= 50 ? "average" : "attention";

export const gradeFor = (score: number) =>
  score >= 85
    ? "A+"
    : score >= 80
      ? "A"
      : score >= 70
        ? "B+"
        : score >= 60
          ? "C+"
          : score >= 50
            ? "C"
            : "D";

export const statusFor = (score: number) =>
  score >= 80 ? "Top Performer" : score < 65 ? "Needs Attention" : "Good";

export const totalDue = (s: Student) => s.admissionFee + s.courseFee;
export const totalPaid = (s: Student) =>
  s.payments.filter((p) => !p.voided).reduce((a, p) => a + p.amount, 0);
export const balanceDue = (s: Student) => totalDue(s) - totalPaid(s);
export const feeStatus = (s: Student) => {
  const bal = balanceDue(s);
  if (bal <= 0) return "Paid";
  if (totalPaid(s) > 0) return "Partial";
  return "Pending";
};

export const CSV_COLUMNS = [
  "name",
  "id",
  "course",
  "father",
  "phone",
  "address",
  "score",
  "attendance",
  "teacher",
  "timing",
  "remarks",
] as const;

export const FEE_MAP: Record<string, { admission: number; course: number }> = {
  MDCT: { admission: 3000, course: 45000 },
  Python: { admission: 3000, course: 38000 },
  "Graphic Design": { admission: 3000, course: 32000 },
  "Web Dev": { admission: 3000, course: 40000 },
};
