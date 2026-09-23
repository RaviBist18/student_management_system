import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().trim().min(2, "Enter the student's name").max(80),
  id: z.string().trim().max(30).optional(),
  course: z.string().trim().min(2, "Enter a course").max(100),
  father: z.string().trim().min(2, "Enter the father's name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{7,18}$/, "Enter a valid phone number"),
  address: z.string().trim().min(3).max(140),
  school: z.string().trim().max(120).optional(),
  prior: z.string().trim().max(120).optional(),
  attendance: z.coerce.number().min(0).max(100).optional(),
  remarks: z.string().trim().max(500).optional(),
  teacher: z.string().trim().min(2).max(60),
  timing: z.string().trim().min(2).max(30),
});

export type FormValues = z.infer<typeof studentSchema>;
export type StudentFormValues = FormValues & { photo: string | undefined };
