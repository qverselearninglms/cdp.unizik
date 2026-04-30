/**
 * Director Service
 * ─────────────────────────────────────────────────────────────────────────────
 * All live API calls are commented out and replaced with simulated dummy data.
 * To switch to live mode: uncomment the `apiClient` calls and remove the
 * `simulateDelay` + dummy-data blocks beneath each function.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// import { apiClient } from "@/core/client";
import {
  DashboardOverview,
  EnrollmentDataPoint,
  FacultyDistribution,
  FinancialSummary,
  PaymentRecord,
  StatisticalReport,
  GradeReport,
  DirectorFilter,
} from "../types/director.types";

// ─── Helper ──────────────────────────────────────────────────────────────────

const simulateDelay = (ms = 800) =>
  new Promise<void>((res) => setTimeout(res, ms));

const rnd = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Seed Data ───────────────────────────────────────────────────────────────

const FACULTIES = [
  "Engineering",
  "Sciences",
  "Arts",
  "Social Sciences",
  "Medicine",
  "Law",
  "Education",
  "Management Sciences",
] as const;

const DEPARTMENTS: Record<string, string[]> = {
  Engineering: ["Civil Engineering", "Electrical Engineering", "Mechanical Engineering", "Chemical Engineering"],
  Sciences: ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
  Arts: ["English", "History", "Philosophy", "Linguistics", "Theatre Arts"],
  "Social Sciences": ["Economics", "Political Science", "Sociology", "Mass Communication", "Psychology"],
  Medicine: ["Medicine & Surgery", "Nursing Science", "Medical Laboratory Science", "Physiotherapy"],
  Law: ["Law"],
  Education: ["Educational Management", "Guidance & Counselling", "Science Education", "Arts Education"],
  "Management Sciences": ["Accounting", "Business Administration", "Banking & Finance", "Marketing"],
};

const FIRST_NAMES = [
  "Chukwuemeka", "Amaka", "Obinna", "Ngozi", "Kelechi", "Adaeze", "Ifeanyi",
  "Chioma", "Emeka", "Uchenna", "Nnamdi", "Blessing", "Chidinma", "Ikechukwu",
  "Adaora", "Chidi", "Obiageli", "Nkechi", "Uche", "Oluchi", "Tochukwu",
  "Ifeoma", "Chukwudi", "Chiamaka", "Okechukwu",
];
const LAST_NAMES = [
  "Okonkwo", "Nwosu", "Eze", "Chukwu", "Obi", "Nzekwe", "Onyekachi",
  "Aneke", "Ugwu", "Nwachukwu", "Obiora", "Okafor", "Onyia", "Egwuonwu",
  "Nweke", "Agu", "Onuoha", "Mbah", "Onyebueke", "Nwofor",
];

const randomName = () =>
  `${FIRST_NAMES[rnd(0, FIRST_NAMES.length - 1)]} ${LAST_NAMES[rnd(0, LAST_NAMES.length - 1)]}`;

const randomMatric = (year = "2021") =>
  `UNIZIK/${year}/${rnd(100000, 999999)}`;

const randomStaffId = () => `STAFF/${rnd(1000, 9999)}`;

const ACADEMIC_YEARS = ["2020/2021", "2021/2022", "2022/2023", "2023/2024", "2024/2025"];
const LEVELS = ["100", "200", "300", "400", "500"] as const;
const SEMESTERS = ["First", "Second"] as const;
const PAYMENT_STATUSES = ["paid", "partial", "unpaid", "overdue"] as const;
const GRADES = ["A", "B", "C", "D", "E", "F"] as const;
const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

// ─── Mock Generator: Students ─────────────────────────────────────────────────

function generateStudents(count = 200) {
  return Array.from({ length: count }, (_, i) => {
    const faculty = FACULTIES[rnd(0, FACULTIES.length - 1)];
    const depts = DEPARTMENTS[faculty];
    const department = depts[rnd(0, depts.length - 1)];
    const level = LEVELS[rnd(0, LEVELS.length - 1)];
    const gpa = parseFloat((rnd(10, 50) / 10).toFixed(2));
    const cgpa = parseFloat((rnd(15, 50) / 10).toFixed(2));
    const admYear = rnd(2018, 2024).toString();
    return {
      id: `STU-${i + 1}`,
      matricNumber: randomMatric(admYear),
      fullName: randomName(),
      email: `student${i + 1}@unizik.edu.ng`,
      phone: `080${rnd(10000000, 99999999)}`,
      faculty,
      department,
      program: `${department} (B.Sc)`,
      level,
      academicYear: ACADEMIC_YEARS[rnd(0, ACADEMIC_YEARS.length - 1)],
      gpa,
      cgpa,
      status: ["active", "active", "active", "deferred", "graduated", "withdrawn"][rnd(0, 5)] as any,
      admissionYear: admYear,
      gender: rnd(0, 1) === 0 ? "Male" : "Female" as any,
    };
  });
}

// ─── Mock Generator: Lecturers ────────────────────────────────────────────────

function generateLecturers(count = 60) {
  const designations = ["Professor", "Associate Professor", "Senior Lecturer", "Lecturer I", "Lecturer II", "Assistant Lecturer", "Graduate Assistant"];
  return Array.from({ length: count }, (_, i) => {
    const faculty = FACULTIES[rnd(0, FACULTIES.length - 1)];
    const depts = DEPARTMENTS[faculty];
    const department = depts[rnd(0, depts.length - 1)];
    return {
      id: `LEC-${i + 1}`,
      staffId: randomStaffId(),
      fullName: randomName(),
      email: `lecturer${i + 1}@unizik.edu.ng`,
      phone: `080${rnd(10000000, 99999999)}`,
      faculty,
      department,
      designation: designations[rnd(0, designations.length - 1)],
      courses: [`${department.substring(0, 3).toUpperCase()}${rnd(100, 499)}`, `${department.substring(0, 3).toUpperCase()}${rnd(100, 499)}`],
      studentsCount: rnd(30, 250),
      yearsOfService: rnd(1, 35),
      status: ["active", "active", "active", "on-leave", "sabbatical"][rnd(0, 4)] as any,
      gender: rnd(0, 1) === 0 ? "Male" : "Female" as any,
    };
  });
}

// ─── Mock Generator: Payments ─────────────────────────────────────────────────

function generatePayments(students: ReturnType<typeof generateStudents>): PaymentRecord[] {
  return students.map((s) => {
    const expected = [150000, 165000, 175000, 200000, 220000][rnd(0, 4)];
    const statusPick = PAYMENT_STATUSES[rnd(0, 3)];
    const paid =
      statusPick === "paid"
        ? expected
        : statusPick === "partial"
        ? rnd(50000, expected - 10000)
        : statusPick === "unpaid"
        ? 0
        : rnd(0, 40000);
    return {
      id: `PAY-${s.id}`,
      studentId: s.id,
      studentName: s.fullName,
      matricNumber: s.matricNumber,
      faculty: s.faculty,
      department: s.department,
      program: s.program,
      level: s.level,
      academicYear: s.academicYear,
      semester: SEMESTERS[rnd(0, 1)],
      amount: expected,
      amountPaid: paid,
      balance: expected - paid,
      status: statusPick,
      paymentDate: statusPick !== "unpaid" ? `2024-${String(rnd(1, 12)).padStart(2, "0")}-${String(rnd(1, 28)).padStart(2, "0")}` : undefined,
      dueDate: "2024-10-31",
      paymentChannel: ["Remita", "Bank Transfer", "Card Payment"][rnd(0, 2)],
    };
  });
}

// ─── Mock Generator: Grade Records ───────────────────────────────────────────

function generateGrades(students: ReturnType<typeof generateStudents>) {
  return students.slice(0, 120).map((s) => {
    const courses = Array.from({ length: rnd(4, 7) }, (_, j) => {
      const g = GRADES[rnd(0, 5)];
      return {
        courseCode: `${s.department.substring(0, 3).toUpperCase()}${rnd(100, 499)}`,
        courseTitle: `Course ${j + 1} in ${s.department}`,
        creditUnits: rnd(2, 4),
        score: rnd(30, 100),
        grade: g,
        gradePoints: GRADE_POINTS[g],
        semester: SEMESTERS[rnd(0, 1)],
        lecturerName: randomName(),
      };
    });

    const totalUnits = courses.reduce((a, c) => a + c.creditUnits, 0);
    const weightedPoints = courses.reduce((a, c) => a + c.gradePoints * c.creditUnits, 0);
    const gpa = parseFloat((weightedPoints / totalUnits).toFixed(2));
    const earnedUnits = courses.filter((c) => c.grade !== "F").reduce((a, c) => a + c.creditUnits, 0);

    const status =
      gpa >= 4.5 ? "distinction" : gpa >= 2.4 ? "pass" : gpa >= 1.5 ? "probation" : "fail";

    return {
      studentId: s.id,
      matricNumber: s.matricNumber,
      studentName: s.fullName,
      faculty: s.faculty,
      department: s.department,
      program: s.program,
      level: s.level,
      academicYear: s.academicYear,
      semester: SEMESTERS[rnd(0, 1)],
      courses,
      semesterGPA: gpa,
      cgpa: parseFloat((gpa * 0.9 + Math.random() * 0.5).toFixed(2)),
      totalUnits,
      earnedUnits,
      status: status as any,
    };
  });
}

// ─── Cached Seed ──────────────────────────────────────────────────────────────

let _students: ReturnType<typeof generateStudents> | null = null;
let _lecturers: ReturnType<typeof generateLecturers> | null = null;
let _payments: PaymentRecord[] | null = null;
let _grades: ReturnType<typeof generateGrades> | null = null;

function getSeeds() {
  if (!_students) _students = generateStudents(300);
  if (!_lecturers) _lecturers = generateLecturers(80);
  if (!_payments) _payments = generatePayments(_students);
  if (!_grades) _grades = generateGrades(_students);
  return { students: _students, lecturers: _lecturers, payments: _payments, grades: _grades };
}

// ─── Service Methods ──────────────────────────────────────────────────────────

export const directorService = {
  // ── Dashboard Overview ────────────────────────────────────────────────────

  async fetchOverview(): Promise<DashboardOverview> {
    // LIVE: const res = await apiClient.get<DashboardOverview>("/director/overview");
    // LIVE: return res.data;
    await simulateDelay(600);
    const { students, lecturers, payments } = getSeeds();
    const totalRevenue = payments.reduce((a, p) => a + p.amountPaid, 0);
    const pendingPayments = payments.filter((p) => p.status !== "paid").reduce((a, p) => a + p.balance, 0);
    return {
      totalStudents: students.length,
      totalLecturers: lecturers.length,
      totalRevenue,
      pendingPayments,
      activePrograms: 42,
      graduationRate: 87.4,
      metrics: [
        { label: "Total Students", value: students.length, change: 5.2, changeLabel: "vs last session", icon: "users", trend: "up" },
        { label: "Total Lecturers", value: lecturers.length, change: 3.1, changeLabel: "vs last session", icon: "book-open", trend: "up" },
        { label: "Total Revenue", value: `₦${(totalRevenue / 1_000_000).toFixed(1)}M`, change: 12.5, changeLabel: "vs last session", icon: "banknote", trend: "up" },
        { label: "Outstanding Fees", value: `₦${(pendingPayments / 1_000_000).toFixed(1)}M`, change: -8.3, changeLabel: "vs last session", icon: "alert-circle", trend: "down" },
        { label: "Active Programs", value: 42, change: 2, changeLabel: "new programs", icon: "graduation-cap", trend: "up" },
        { label: "Graduation Rate", value: "87.4%", change: 1.8, changeLabel: "vs last year", icon: "trending-up", trend: "up" },
      ],
    };
  },

  async fetchEnrollmentData(): Promise<EnrollmentDataPoint[]> {
    // LIVE: const res = await apiClient.get<EnrollmentDataPoint[]>("/director/enrollment-trend");
    // LIVE: return res.data;
    await simulateDelay(400);
    const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    return months.map((month) => ({
      month,
      students: rnd(4500, 5500),
      lecturers: rnd(70, 90),
      newEnrollments: rnd(80, 400),
    }));
  },

  async fetchFacultyDistribution(): Promise<FacultyDistribution[]> {
    // LIVE: const res = await apiClient.get<FacultyDistribution[]>("/director/faculty-distribution");
    // LIVE: return res.data;
    await simulateDelay(300);
    const { students } = getSeeds();
    const total = students.length;
    const map: Record<string, number> = {};
    for (const f of FACULTIES) map[f] = 0;
    students.forEach((s) => (map[s.faculty] = (map[s.faculty] || 0) + 1));
    return FACULTIES.map((f) => ({
      faculty: f,
      students: map[f],
      lecturers: rnd(5, 20),
      percentage: parseFloat(((map[f] / total) * 100).toFixed(1)),
    }));
  },

  // ── Financial ─────────────────────────────────────────────────────────────

  async fetchFinancialSummary(filter?: DirectorFilter): Promise<FinancialSummary> {
    // LIVE: const res = await apiClient.get<FinancialSummary>("/director/financial-summary", { params: filter });
    // LIVE: return res.data;
    await simulateDelay(700);
    const { payments } = getSeeds();
    const filtered = filter?.faculty && filter.faculty !== "all"
      ? payments.filter((p) => p.faculty === filter.faculty)
      : payments;

    const totalExpected = filtered.reduce((a, p) => a + p.amount, 0);
    const totalCollected = filtered.reduce((a, p) => a + p.amountPaid, 0);

    const byFaculty = FACULTIES.map((f) => {
      const fps = payments.filter((p) => p.faculty === f);
      const exp = fps.reduce((a, p) => a + p.amount, 0);
      const col = fps.reduce((a, p) => a + p.amountPaid, 0);
      return { faculty: f, expected: exp, collected: col, outstanding: exp - col };
    });

    const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const monthlyTrend = months.map((m) => ({
      month: m,
      collected: rnd(8_000_000, 18_000_000),
      expected: rnd(18_000_000, 25_000_000),
    }));

    return {
      totalExpected,
      totalCollected,
      totalOutstanding: totalExpected - totalCollected,
      collectionRate: parseFloat(((totalCollected / totalExpected) * 100).toFixed(1)),
      byFaculty,
      monthlyTrend,
    };
  },

  async fetchPaymentRecords(filter?: DirectorFilter): Promise<{ records: PaymentRecord[]; total: number }> {
    // LIVE: const res = await apiClient.get<{ records: PaymentRecord[]; total: number }>("/director/payments", { params: filter });
    // LIVE: return res.data;
    await simulateDelay(600);
    const { payments } = getSeeds();
    let records = [...payments];

    if (filter?.faculty && filter.faculty !== "all")
      records = records.filter((r) => r.faculty === filter.faculty);
    if (filter?.level && filter.level !== "all")
      records = records.filter((r) => r.level === filter.level);
    if (filter?.semester && filter.semester !== "all")
      records = records.filter((r) => r.semester === filter.semester);
    if (filter?.status && filter.status !== "all")
      records = records.filter((r) => r.status === filter.status);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      records = records.filter(
        (r) => r.studentName.toLowerCase().includes(q) || r.matricNumber.toLowerCase().includes(q)
      );
    }
    return { records: records.slice(0, 100), total: records.length };
  },

  // ── Statistical Reports ───────────────────────────────────────────────────

  async fetchStatisticalReport(filter?: DirectorFilter): Promise<StatisticalReport> {
    // LIVE: const res = await apiClient.get<StatisticalReport>("/director/statistical-report", { params: filter });
    // LIVE: return res.data;
    await simulateDelay(800);
    const { students, lecturers } = getSeeds();

    let filteredStudents = [...students];
    let filteredLecturers = [...lecturers];

    if (filter?.faculty && filter.faculty !== "all") {
      filteredStudents = filteredStudents.filter((s) => s.faculty === filter.faculty);
      filteredLecturers = filteredLecturers.filter((l) => l.faculty === filter.faculty);
    }
    if (filter?.department && filter.department !== "all") {
      filteredStudents = filteredStudents.filter((s) => s.department === filter.department);
      filteredLecturers = filteredLecturers.filter((l) => l.department === filter.department);
    }
    if (filter?.level && filter.level !== "all") {
      filteredStudents = filteredStudents.filter((s) => s.level === filter.level);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      filteredStudents = filteredStudents.filter((s) => s.fullName.toLowerCase().includes(q) || s.matricNumber.toLowerCase().includes(q));
      filteredLecturers = filteredLecturers.filter((l) => l.fullName.toLowerCase().includes(q));
    }

    const studentsByLevel: Record<string, number> = { "100": 0, "200": 0, "300": 0, "400": 0, "500": 0 };
    filteredStudents.forEach((s) => (studentsByLevel[s.level] = (studentsByLevel[s.level] || 0) + 1));

    const male = filteredStudents.filter((s) => s.gender === "Male").length;
    const female = filteredStudents.filter((s) => s.gender === "Female").length;

    const designationMap: Record<string, number> = {};
    filteredLecturers.forEach((l) => {
      designationMap[l.designation] = (designationMap[l.designation] || 0) + 1;
    });

    return {
      students: filteredStudents.slice(0, 100) as any,
      lecturers: filteredLecturers.slice(0, 50) as any,
      totalStudents: filteredStudents.length,
      totalLecturers: filteredLecturers.length,
      studentsByLevel: studentsByLevel as any,
      studentsByGender: { male, female },
      lecturersByDesignation: designationMap,
    };
  },

  // ── Grade Reports ─────────────────────────────────────────────────────────

  async fetchGradeReport(filter?: DirectorFilter): Promise<GradeReport> {
    // LIVE: const res = await apiClient.get<GradeReport>("/director/grade-report", { params: filter });
    // LIVE: return res.data;
    await simulateDelay(700);
    const { grades } = getSeeds();

    let records = [...grades];

    if (filter?.faculty && filter.faculty !== "all")
      records = records.filter((r) => r.faculty === filter.faculty);
    if (filter?.level && filter.level !== "all")
      records = records.filter((r) => r.level === filter.level);
    if (filter?.semester && filter.semester !== "all")
      records = records.filter((r) => r.semester === filter.semester);
    if (filter?.academicYear)
      records = records.filter((r) => r.academicYear === filter.academicYear);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      records = records.filter((r) => r.studentName.toLowerCase().includes(q) || r.matricNumber.toLowerCase().includes(q));
    }

    const avgGPA = parseFloat(
      (records.reduce((a, r) => a + r.semesterGPA, 0) / (records.length || 1)).toFixed(2)
    );

    const gradeCountMap: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    records.forEach((r) =>
      r.courses.forEach((c) => (gradeCountMap[c.grade] = (gradeCountMap[c.grade] || 0) + 1))
    );
    const totalGrades = Object.values(gradeCountMap).reduce((a, v) => a + v, 0);
    const gradeDistribution = GRADES.map((g) => ({
      grade: g,
      count: gradeCountMap[g],
      percentage: parseFloat(((gradeCountMap[g] / (totalGrades || 1)) * 100).toFixed(1)),
    }));

    const byFaculty = FACULTIES.map((f) => {
      const fr = records.filter((r) => r.faculty === f);
      return {
        faculty: f,
        averageGPA: fr.length ? parseFloat((fr.reduce((a, r) => a + r.semesterGPA, 0) / fr.length).toFixed(2)) : 0,
        studentCount: fr.length,
      };
    });

    return {
      records: records.slice(0, 100) as any,
      gradeDistribution,
      averageGPA: avgGPA,
      passRate: parseFloat(((records.filter((r) => r.status !== "fail").length / (records.length || 1)) * 100).toFixed(1)),
      distinctionRate: parseFloat(((records.filter((r) => r.status === "distinction").length / (records.length || 1)) * 100).toFixed(1)),
      byFaculty,
    };
  },
};


