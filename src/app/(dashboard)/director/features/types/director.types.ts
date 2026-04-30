// ─── Director Feature Types ─────────────────────────────────────────────────

export type UserRole = "student" | "lecturer" | "director" | "admin";

export type Faculty =
  | "Engineering"
  | "Sciences"
  | "Arts"
  | "Social Sciences"
  | "Medicine"
  | "Law"
  | "Education"
  | "Management Sciences";

export type Semester = "First" | "Second";

export type AcademicLevel = "100" | "200" | "300" | "400" | "500";

export type PaymentStatus = "paid" | "partial" | "unpaid" | "overdue";

export type GradePoint = "A" | "B" | "C" | "D" | "E" | "F";

// ─── Dashboard Overview ──────────────────────────────────────────────────────

export interface DashboardMetric {
  label: string;
  value: number | string;
  change: number; // percentage change
  changeLabel: string;
  icon: string;
  trend: "up" | "down" | "neutral";
}

export interface DashboardOverview {
  totalStudents: number;
  totalLecturers: number;
  totalRevenue: number;
  pendingPayments: number;
  activePrograms: number;
  graduationRate: number;
  metrics: DashboardMetric[];
}

// ─── Enrollment Chart Data ───────────────────────────────────────────────────

export interface EnrollmentDataPoint {
  month: string;
  students: number;
  lecturers: number;
  newEnrollments: number;
}

export interface FacultyDistribution {
  faculty: Faculty;
  students: number;
  lecturers: number;
  percentage: number;
}

// ─── Financial Types ─────────────────────────────────────────────────────────

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  matricNumber: string;
  faculty: Faculty;
  department: string;
  program: string;
  level: AcademicLevel;
  academicYear: string;
  semester: Semester;
  amount: number;
  amountPaid: number;
  balance: number;
  status: PaymentStatus;
  paymentDate?: string;
  dueDate: string;
  paymentChannel?: string;
}

export interface FinancialSummary {
  totalExpected: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  byFaculty: {
    faculty: Faculty;
    expected: number;
    collected: number;
    outstanding: number;
  }[];
  monthlyTrend: {
    month: string;
    collected: number;
    expected: number;
  }[];
}

// ─── Student / Lecturer Report Types ────────────────────────────────────────

export interface StudentRecord {
  id: string;
  matricNumber: string;
  fullName: string;
  email: string;
  phone: string;
  faculty: Faculty;
  department: string;
  program: string;
  level: AcademicLevel;
  academicYear: string;
  gpa: number;
  cgpa: number;
  status: "active" | "deferred" | "graduated" | "withdrawn";
  admissionYear: string;
  gender: "Male" | "Female";
}

export interface LecturerRecord {
  id: string;
  staffId: string;
  fullName: string;
  email: string;
  phone: string;
  faculty: Faculty;
  department: string;
  designation: string;
  courses: string[];
  studentsCount: number;
  yearsOfService: number;
  status: "active" | "on-leave" | "sabbatical" | "retired";
  gender: "Male" | "Female";
}

export interface StatisticalReport {
  students: StudentRecord[];
  lecturers: LecturerRecord[];
  totalStudents: number;
  totalLecturers: number;
  studentsByLevel: Record<AcademicLevel, number>;
  studentsByGender: { male: number; female: number };
  lecturersByDesignation: Record<string, number>;
}

// ─── Grade Report Types ──────────────────────────────────────────────────────

export interface CourseGrade {
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  score: number;
  grade: GradePoint;
  gradePoints: number;
  semester: Semester;
  lecturerName: string;
}

export interface StudentGradeRecord {
  studentId: string;
  matricNumber: string;
  studentName: string;
  faculty: Faculty;
  department: string;
  program: string;
  level: AcademicLevel;
  academicYear: string;
  semester: Semester;
  courses: CourseGrade[];
  semesterGPA: number;
  cgpa: number;
  totalUnits: number;
  earnedUnits: number;
  status: "pass" | "probation" | "fail" | "distinction";
}

export interface GradeDistribution {
  grade: GradePoint;
  count: number;
  percentage: number;
}

export interface GradeReport {
  records: StudentGradeRecord[];
  gradeDistribution: GradeDistribution[];
  averageGPA: number;
  passRate: number;
  distinctionRate: number;
  byFaculty: {
    faculty: Faculty;
    averageGPA: number;
    studentCount: number;
  }[];
}

// ─── Filter Types ────────────────────────────────────────────────────────────

export interface DirectorFilter {
  faculty?: Faculty | "all";
  department?: string | "all";
  program?: string | "all";
  academicYear?: string;
  semester?: Semester | "all";
  level?: AcademicLevel | "all";
  status?: string | "all";
  search?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// ─── Store Shape ─────────────────────────────────────────────────────────────

export interface DirectorStoreState {
  overview: DashboardOverview | null;
  enrollmentData: EnrollmentDataPoint[];
  facultyDistribution: FacultyDistribution[];
  financialSummary: FinancialSummary | null;
  paymentRecords: PaymentRecord[];
  statisticalReport: StatisticalReport | null;
  gradeReport: GradeReport | null;
  filter: DirectorFilter;
  pagination: PaginationState;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
}

export interface DirectorStoreActions {
  setFilter: (filter: Partial<DirectorFilter>) => void;
  resetFilter: () => void;
  setPagination: (p: Partial<PaginationState>) => void;
  fetchOverview: () => Promise<void>;
  fetchFinancialSummary: (filter?: DirectorFilter) => Promise<void>;
  fetchPaymentRecords: (filter?: DirectorFilter) => Promise<void>;
  fetchStatisticalReport: (filter?: DirectorFilter) => Promise<void>;
  fetchGradeReport: (filter?: DirectorFilter) => Promise<void>;
  setLoading: (key: string, value: boolean) => void;
  setError: (key: string, error: string | null) => void;
}

export type DirectorStore = DirectorStoreState & DirectorStoreActions;
