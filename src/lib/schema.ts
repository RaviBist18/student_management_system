import { z } from "zod";

const NAME_RE = /^[A-Za-z\s.'-]+$/;

export const PRIOR_EDUCATION_OPTIONS = [
  "Below SEE",
  "SEE (10th)",
  "+2 / High School",
  "Bachelor's (Undergraduate)",
  "Bachelor's (Graduate)",
  "Master's (Postgraduate)",
  "Other",
] as const;

export const studentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter the student's name")
    .max(80)
    .regex(NAME_RE, "Name can only contain letters, spaces, and . ' -"),
  id: z.string().trim().max(30).optional(),
  course: z.string().trim().min(2, "Select a course"),
  father: z
    .string()
    .trim()
    .min(2, "Enter the father's name")
    .max(80)
    .regex(NAME_RE, "Name can only contain letters, spaces, and . ' -"),
  phone: z
    .string()
    .trim()
    .regex(/^9\d{9}$/, "Enter a valid 10-digit Nepal mobile number (starts with 9)"),
  address: z.string().trim().min(3).max(140),
  school: z.string().trim().max(120).optional(),
  prior: z
    .enum(PRIOR_EDUCATION_OPTIONS, {
      errorMap: () => ({ message: "Select prior education" }),
    })
    .optional(),
  attendance: z.coerce.number().min(0).max(100).optional(),
  score: z.coerce.number().min(0).max(100).optional(),
  remarks: z.string().trim().max(500).optional(),
  teacher: z.string().trim().min(2, "Select a teacher"),
  timing: z.string().trim().min(2, "Select a timing"),
});

export type FormValues = z.infer<typeof studentSchema>;
export type StudentFormValues = FormValues & { photo: string | undefined };
