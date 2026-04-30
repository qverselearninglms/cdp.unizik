import { z } from "zod";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const FacultyEnum = z.enum([
  "Engineering",
  "Sciences",
  "Arts",
  "Social Sciences",
  "Medicine",
  "Law",
  "Education",
  "Management Sciences",
]);

export const SemesterEnum = z.enum(["First", "Second"]);
export const AcademicLevelEnum = z.enum(["100", "200", "300", "400", "500"]);
export const PaymentStatusEnum = z.enum(["paid", "partial", "unpaid", "overdue"]);
export const GradePointEnum = z.enum(["A", "B", "C", "D", "E", "F"]);

// ─── Filter Schema ───────────────────────────────────────────────────────────

export const DirectorFilterSchema = z.object({
  faculty: FacultyEnum.or(z.literal("all")).optional(),
  department: z.string().optional(),
  program: z.string().optional(),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, "Format: YYYY/YYYY").optional(),
  semester: SemesterEnum.or(z.literal("all")).optional(),
  level: AcademicLevelEnum.or(z.literal("all")).optional(),
  status: z.string().optional(),
  search: z.string().max(100).optional(),
});

// ─── Report Export Schema ────────────────────────────────────────────────────

export const ExportReportSchema = z.object({
  reportType: z.enum(["financial", "statistical", "grades", "overview"]),
  format: z.enum(["pdf", "csv", "xlsx"]),
  faculty: FacultyEnum.or(z.literal("all")).optional(),
  academicYear: z.string().optional(),
  semester: SemesterEnum.optional(),
  dateRange: z
    .object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    })
    .optional(),
});

export type DirectorFilterInput = z.infer<typeof DirectorFilterSchema>;
export type ExportReportInput = z.infer<typeof ExportReportSchema>;
