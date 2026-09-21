export type Exam = { label: string; subject: string; score: number; max: number; date: string };

export type Payment = { id: string; amount: number; date: string; mode: string; note?: string };

export type Student = {
  id: string;
  name: string;
  course: string;
  courseKey: string;
  batch: string;
  father: string;
  phone: string;
  address: string;
  school: string;
  prior: string;
  score: number;
  grade: string;
  attendance: number;
  status: string;
  remarks: string;
  weekly: Exam[];
  monthly: Exam[];
  photo?: string;
  teacher: string;
  timing: string;
  admissionFee: number;
  courseFee: number;
  payments: Payment[];
};

export const FEE_MAP: Record<string, { admission: number; course: number }> = {
  MDCT: { admission: 3000, course: 45000 },
  Python: { admission: 3000, course: 38000 },
  "Graphic Design": { admission: 3000, course: 32000 },
  "Web Dev": { admission: 3000, course: 40000 },
};

export const NEPALI_MONTHS = [
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

export type ImportRow = {
  rowNum: number;
  raw: Record<string, string>;
  errors: string[];
  duplicate: boolean;
};
