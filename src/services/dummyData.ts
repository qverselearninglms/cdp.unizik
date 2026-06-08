/**
 * Shared in-memory mock database for the admin modules.
 * Every function returns a Promise with a simulated delay
 * so react-query behaves exactly like a real API.
 */
import type {
   AcademicSession,
   Semester,
   FeeStructure,
   FresherFeeItem,
   OtherFeeItem,
   AdmissionCycle,
   AdmissionRequirement,
   Program,
   CreateAcademicSessionPayload,
   UpdateAcademicSessionPayload,
   CreateSemesterPayload,
   CreateFeeStructurePayload,
   CreateFresherFeePayload,
   CreateOtherFeePayload,
   CreateAdmissionCyclePayload,
   UpdateAdmissionCyclePayload,
   CreateAdmissionRequirementPayload,
   GenerateFeeAccountsPayload,
   GenerateFeeAccountsResponse,
   AdmissionApplication,
   UpdateApplicationPayload,
   ReviewApplicationPayload,
   ApiListResponse,
   ApiSingleResponse,
   Setting,
   CreateSettingPayload,
   UpdateSettingPayload,
   SettingsQueryParams,
} from "@/types/school";

// ── helpers ─────────────────────────────────
let _nextId = 100;
const uid = () => String(++_nextId);
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ── seed data ───────────────────────────────

const sessions: AcademicSession[] = [
   {
      id: "ses-1",
      name: "2023/2024",
      start_date: "2023-09-01",
      end_date: "2024-08-31",
      is_active: false,
   },
   {
      id: "ses-2",
      name: "2024/2025",
      start_date: "2024-09-01",
      end_date: "2025-08-31",
      is_active: true,
   },
];

const semesters: Semester[] = [
   {
      id: "sem-1",
      academic_session_id: "ses-2",
      name: "1st Semester",
      sequence_no: 1,
      is_active: false,
   },
   {
      id: "sem-2",
      academic_session_id: "ses-2",
      name: "2nd Semester",
      sequence_no: 2,
      is_active: true,
   },
   {
      id: "sem-3",
      academic_session_id: "ses-1",
      name: "1st Semester",
      sequence_no: 1,
      is_active: false,
   },
   {
      id: "sem-4",
      academic_session_id: "ses-1",
      name: "2nd Semester",
      sequence_no: 2,
      is_active: false,
   },
];

const programs: Program[] = [
   { id: "prg-1", department_id: "dept-1", name: "B.Sc. Computer Science", code: "CSC", degree_type: "B.Sc.", duration_years: 4, description: "Bachelor of Science in Computer Science", min_credit_units: 120, is_active: true },
   { id: "prg-2", department_id: "dept-2", name: "B.Sc. Mechanical Engineering", code: "MEE", degree_type: "B.Sc.", duration_years: 5, description: "Bachelor of Science in Mechanical Engineering", min_credit_units: 150, is_active: true },
   { id: "prg-3", department_id: "dept-3", name: "B.A. Economics", code: "ECO", degree_type: "B.A.", duration_years: 4, description: "Bachelor of Arts in Economics", min_credit_units: 120, is_active: true },
   { id: "prg-4", department_id: "dept-4", name: "B.Sc. Biochemistry", code: "BCH", degree_type: "B.Sc.", duration_years: 4, description: "Bachelor of Science in Biochemistry", min_credit_units: 120, is_active: true },
];

const feeStructures: FeeStructure[] = [
   {
      id: "fs-1",
      academic_session_id: "ses-2",
      semester_id: "sem-1",
      program_id: "prg-1",
      level: 100,
      total_amount: 150000,
      description: "Fresh student fees – Comp Sci, 100L, 1st Sem",
   },
   {
      id: "fs-2",
      academic_session_id: "ses-2",
      semester_id: "sem-2",
      program_id: "prg-1",
      level: 100,
      total_amount: 120000,
      description: "Comp Sci, 100L, 2nd Sem",
   },
   {
      id: "fs-3",
      academic_session_id: "ses-2",
      semester_id: "sem-1",
      program_id: "prg-2",
      level: 100,
      total_amount: 180000,
      description: "Fresh student fees – Mech Eng, 100L, 1st Sem",
   },
   {
      id: "fs-4",
      academic_session_id: "ses-2",
      semester_id: "sem-2",
      program_id: "prg-2",
      level: 100,
      total_amount: 140000,
      description: "Mech Eng, 100L, 2nd Sem",
   },
];

// ── Academic Sessions API ───────────────────

export const dummySessionApi = {
   async list() {
      await delay();
      return { data: [...sessions], total: sessions.length };
   },

   async getById(id: string) {
      await delay(200);
      const s = sessions.find((x) => x.id === id);
      if (!s) throw new Error("Session not found");
      return { data: s };
   },

   async create(payload: CreateAcademicSessionPayload) {
      await delay(500);
      const item: AcademicSession = { id: uid(), ...payload };
      sessions.push(item);
      return { data: item, message: "Session created" };
   },

   async update(id: string, payload: UpdateAcademicSessionPayload) {
      await delay(500);
      const idx = sessions.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Session not found");
      sessions[idx] = { ...sessions[idx], ...payload };
      return { data: sessions[idx], message: "Session updated" };
   },

   async remove(id: string) {
      await delay(300);
      const idx = sessions.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Session not found");
      sessions.splice(idx, 1);
      return { message: "Session deleted" };
   },

   async activate(id: string) {
      await delay(500);
      // Deactivate all, then activate the one
      sessions.forEach((s) => (s.is_active = false));
      const s = sessions.find((x) => x.id === id);
      if (!s) throw new Error("Session not found");
      s.is_active = true;
      return { data: s, message: "Session activated" };
   },
};

// ── Semesters API ───────────────────────────

export const dummySemesterApi = {
   async listBySession(sessionId: string) {
      await delay();
      const filtered = semesters.filter(
         (s) => s.academic_session_id === sessionId
      );
      return { data: filtered, total: filtered.length };
   },

   async create(payload: CreateSemesterPayload) {
      await delay(500);
      const item: Semester = { id: uid(), ...payload };
      semesters.push(item);
      return { data: item, message: "Semester created" };
   },

   async remove(id: string) {
      await delay(300);
      const idx = semesters.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Semester not found");
      semesters.splice(idx, 1);
      return { message: "Semester deleted" };
   },

   async activate(id: string) {
      await delay(500);
      // Deactivate all semesters in the same session, activate this one
      const target = semesters.find((x) => x.id === id);
      if (!target) throw new Error("Semester not found");
      semesters
         .filter((s) => s.academic_session_id === target.academic_session_id)
         .forEach((s) => (s.is_active = false));
      target.is_active = true;
      return { data: target, message: "Semester activated" };
   },
};

// ── Fee Structures API ──────────────────────

export const dummyFeeStructureApi = {
   async listBySession(sessionId: string) {
      await delay();
      const filtered = feeStructures.filter(
         (f) => f.academic_session_id === sessionId
      );
      return { data: filtered, total: filtered.length };
   },

   async create(payload: CreateFeeStructurePayload) {
      await delay(500);
      const item: FeeStructure = { id: uid(), ...payload };
      feeStructures.push(item);
      return { data: item, message: "Fee structure created" };
   },

   async remove(id: string) {
      await delay(300);
      const idx = feeStructures.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Fee structure not found");
      feeStructures.splice(idx, 1);
      return { message: "Fee structure deleted" };
   },
};

// ── Programs API (read-only lookup) ─────────

export const dummyProgramApi = {
   async list() {
      await delay(200);
      return { data: [...programs], total: programs.length };
   },
};

// ── Fee Account Generation ──────────────────

export const dummyFeeAccountApi = {
   async generate(
      payload: GenerateFeeAccountsPayload
   ): Promise<GenerateFeeAccountsResponse> {
      await delay(1500); // Simulate heavy operation

      // Count how many fee structures exist for this session
      const structureCount = feeStructures.filter(
         (f) => f.academic_session_id === payload.academic_session_id
      ).length;

      // Simulate: 47 students × however many structures matched
      const studentsEnrolled = 47;
      const generated = studentsEnrolled * Math.max(structureCount, 1);

      return {
         generated_count: generated,
         message: `Successfully generated fee accounts for ${studentsEnrolled} enrolled students across ${structureCount} fee structure(s).`,
      };
   },
};

// ── Fresher Fee Items ───────────────────────

const fresherFees: FresherFeeItem[] = [
   { id: "ff-1", academic_session_id: "ses-2", name: "Application Fee", amount: 10000 },
   { id: "ff-2", academic_session_id: "ses-2", name: "Acceptance Fee", amount: 30000 },
   { id: "ff-3", academic_session_id: "ses-2", name: "Matriculation Fee", amount: 5000 },
   { id: "ff-4", academic_session_id: "ses-1", name: "Application Fee", amount: 10000 },
   { id: "ff-5", academic_session_id: "ses-1", name: "Acceptance Fee", amount: 25000 },
];

export const dummyFresherFeeApi = {
   async listBySession(sessionId: string) {
      await delay();
      const filtered = fresherFees.filter(
         (f) => f.academic_session_id === sessionId
      );
      return { data: filtered, total: filtered.length };
   },

   async create(payload: CreateFresherFeePayload) {
      await delay(500);
      const item: FresherFeeItem = { id: uid(), ...payload };
      fresherFees.push(item);
      return { data: item, message: "Fresher fee created" };
   },

   async remove(id: string) {
      await delay(300);
      const idx = fresherFees.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Fresher fee not found");
      fresherFees.splice(idx, 1);
      return { message: "Fresher fee deleted" };
   },
};

// ── Other Fee Items ─────────────────────────

const otherFees: OtherFeeItem[] = [
   {
      id: "of-1",
      academic_session_id: "ses-2",
      semester_id: "",
      level: 0,
      name: "Library Fee",
      amount: 5000,
      description: "Annual library access for all students",
   },
   {
      id: "of-2",
      academic_session_id: "ses-2",
      semester_id: "sem-1",
      level: 100,
      name: "Lab Coat & Safety Kit",
      amount: 3500,
      description: "Required for science students, 1st semester only",
   },
   {
      id: "of-3",
      academic_session_id: "ses-2",
      semester_id: "",
      level: 0,
      name: "Sports & Recreation Fee",
      amount: 2000,
      description: "Covers gym and sports facilities",
   },
];

export const dummyOtherFeeApi = {
   async listBySession(sessionId: string) {
      await delay();
      const filtered = otherFees.filter(
         (f) => f.academic_session_id === sessionId
      );
      return { data: filtered, total: filtered.length };
   },

   async create(payload: CreateOtherFeePayload) {
      await delay(500);
      const item: OtherFeeItem = { id: uid(), ...payload };
      otherFees.push(item);
      return { data: item, message: "Other fee created" };
   },

   async remove(id: string) {
      await delay(300);
      const idx = otherFees.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Other fee not found");
      otherFees.splice(idx, 1);
      return { message: "Other fee deleted" };
   },
};

// ── Admission Cycles ────────────────────────

const now = new Date().toISOString();

const admissionCycles: AdmissionCycle[] = [
   {
      id: "adc-1",
      academic_session_id: "ses-2",
      status: "open",
      application_start_date: "2024-06-01",
      application_end_date: "2024-09-30",
      late_application_allowed: true,
      late_application_fee: 5000,
      max_applications: 0,
      require_documents: true,
      required_documents: ["O'Level Result", "Birth Certificate", "Passport Photograph"],
      notification_email: "admissions@qhub.edu.ng",
      instructions: "All applicants must upload valid O'Level results and a recent passport photograph. Late applications attract an additional fee.",
      created_at: now,
      updated_at: now,
   },
   {
      id: "adc-2",
      academic_session_id: "ses-1",
      status: "closed",
      application_start_date: "2023-06-01",
      application_end_date: "2023-09-15",
      late_application_allowed: false,
      late_application_fee: 0,
      max_applications: 500,
      require_documents: true,
      required_documents: ["O'Level Result", "Birth Certificate"],
      notification_email: "admissions@qhub.edu.ng",
      instructions: "Admission for the 2023/2024 session is now closed.",
      created_at: now,
      updated_at: now,
   },
];

const admissionRequirements: AdmissionRequirement[] = [
   {
      id: "ar-1",
      admission_cycle_id: "adc-1",
      program_id: "",
      min_age: 16,
      max_age: 0,
      min_credits: 5,
      required_subjects: ["Mathematics", "English Language"],
      description: "General minimum requirement for all programs",
   },
   {
      id: "ar-2",
      admission_cycle_id: "adc-1",
      program_id: "prg-1",
      min_age: 16,
      max_age: 0,
      min_credits: 5,
      required_subjects: ["Mathematics", "English Language", "Physics"],
      description: "Computer Science requires Physics in addition to general requirements",
   },
   {
      id: "ar-3",
      admission_cycle_id: "adc-1",
      program_id: "prg-2",
      min_age: 16,
      max_age: 0,
      min_credits: 5,
      required_subjects: ["Mathematics", "English Language", "Physics", "Chemistry"],
      description: "Mechanical Engineering requires Physics and Chemistry",
   },
];

export const dummyAdmissionCycleApi = {
   async listBySession(sessionId: string) {
      await delay();
      const filtered = admissionCycles.filter(
         (c) => c.academic_session_id === sessionId
      );
      return { data: filtered, total: filtered.length };
   },

   async getById(id: string) {
      await delay(200);
      const c = admissionCycles.find((x) => x.id === id);
      if (!c) throw new Error("Admission cycle not found");
      return { data: c };
   },

   async create(payload: CreateAdmissionCyclePayload) {
      await delay(500);
      const item: AdmissionCycle = {
         id: uid(),
         ...payload,
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString(),
      };
      admissionCycles.push(item);
      return { data: item, message: "Admission cycle created" };
   },

   async update(id: string, payload: UpdateAdmissionCyclePayload) {
      await delay(500);
      const idx = admissionCycles.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Admission cycle not found");
      admissionCycles[idx] = {
         ...admissionCycles[idx],
         ...payload,
         updated_at: new Date().toISOString(),
      };
      return { data: admissionCycles[idx], message: "Admission cycle updated" };
   },

   async remove(id: string) {
      await delay(300);
      const idx = admissionCycles.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Admission cycle not found");
      admissionCycles.splice(idx, 1);
      // also remove related requirements
      for (let i = admissionRequirements.length - 1; i >= 0; i--) {
         if (admissionRequirements[i].admission_cycle_id === id) {
            admissionRequirements.splice(i, 1);
         }
      }
      return { message: "Admission cycle deleted" };
   },

   async updateStatus(id: string, status: "draft" | "open" | "closed") {
      await delay(500);
      const cycle = admissionCycles.find((x) => x.id === id);
      if (!cycle) throw new Error("Admission cycle not found");
      cycle.status = status;
      cycle.updated_at = new Date().toISOString();
      return { data: cycle, message: `Admission ${status === "open" ? "opened" : status === "closed" ? "closed" : "set to draft"}` };
   },
};

export const dummyAdmissionRequirementApi = {
   async listByCycle(cycleId: string) {
      await delay();
      const filtered = admissionRequirements.filter(
         (r) => r.admission_cycle_id === cycleId
      );
      return { data: filtered, total: filtered.length };
   },

   async create(payload: CreateAdmissionRequirementPayload) {
      await delay(500);
      const item: AdmissionRequirement = { id: uid(), ...payload };
      admissionRequirements.push(item);
      return { data: item, message: "Requirement created" };
   },

   async remove(id: string) {
      await delay(300);
      const idx = admissionRequirements.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Requirement not found");
      admissionRequirements.splice(idx, 1);
      return { message: "Requirement deleted" };
   },
};


// ── Admission Applications seed data ────────

const admissionApplications: AdmissionApplication[] = [
   {
      id: "app-1",
      applicant_id: "applicant-1",
      admission_cycle_id: "ac-1",
      session: "2024/2025",
      status: "pending",
      personal_info: {
         first_name: "Chioma",
         last_name: "Okafor",
         middle_name: "Ada",
         date_of_birth: "2002-03-15",
         gender: "female",
         nationality: "Nigerian",
         state_of_origin: "Anambra",
         lga: "Awka South",
         phone: "08012345678",
         email: "chioma.okafor@email.com",
         address: "12 Unity Road, Awka, Anambra State",
         passport_url: "/slides/slide-1.webp",
      },
      academic_records: [
         {
            institution: "Federal Government College, Enugu",
            qualification: "WAEC",
            year_obtained: "2020",
            grade: "7 A1s, 2 B2s",
            certificate_url: "/slides/slide-2.webp",
         },
         {
            institution: "JAMB",
            qualification: "UTME",
            year_obtained: "2024",
            grade: "285",
            certificate_url: "/slides/slide-3.webp",
         },
      ],
      program_choice: {
         first_choice_program_id: "prg-1",
         first_choice_program_name: "B.Sc. Computer Science",
         second_choice_program_id: "prg-4",
         second_choice_program_name: "B.Sc. Biochemistry",
         entry_mode: "utme",
         jamb_reg_no: "20241234567AB",
         jamb_score: 285,
      },
      documents: [
         { id: "doc-1", name: "WAEC Result", type: "certificate", url: "/slides/slide-2.webp", uploaded_at: "2024-06-01T10:00:00Z" },
         { id: "doc-2", name: "JAMB Result Slip", type: "certificate", url: "/slides/slide-3.webp", uploaded_at: "2024-06-01T10:05:00Z" },
         { id: "doc-3", name: "Birth Certificate", type: "identity", url: "/slides/slide-1.webp", uploaded_at: "2024-06-01T10:10:00Z" },
      ],
      submitted_at: "2024-06-15T14:30:00Z",
      reviewed_at: null,
      reviewed_by: null,
      denial_reason: null,
      created_at: "2024-06-01T10:00:00Z",
      updated_at: "2024-06-15T14:30:00Z",
   },
   {
      id: "app-2",
      applicant_id: "applicant-2",
      admission_cycle_id: "ac-1",
      session: "2024/2025",
      status: "pending",
      personal_info: {
         first_name: "Emeka",
         last_name: "Nwosu",
         middle_name: "Chukwudi",
         date_of_birth: "2001-08-22",
         gender: "male",
         nationality: "Nigerian",
         state_of_origin: "Imo",
         lga: "Owerri Municipal",
         phone: "07098765432",
         email: "emeka.nwosu@email.com",
         address: "45 Wetheral Road, Owerri, Imo State",
         passport_url: "/slides/slide-2.webp",
      },
      academic_records: [
         {
            institution: "Holy Ghost College, Owerri",
            qualification: "WAEC",
            year_obtained: "2019",
            grade: "5 A1s, 3 B2s, 1 C4",
            certificate_url: "/slides/slide-1.webp",
         },
         {
            institution: "JAMB",
            qualification: "UTME",
            year_obtained: "2024",
            grade: "256",
            certificate_url: "/slides/slide-3.webp",
         },
      ],
      program_choice: {
         first_choice_program_id: "prg-2",
         first_choice_program_name: "B.Sc. Mechanical Engineering",
         second_choice_program_id: "prg-1",
         second_choice_program_name: "B.Sc. Computer Science",
         entry_mode: "utme",
         jamb_reg_no: "20249876543CD",
         jamb_score: 256,
      },
      documents: [
         { id: "doc-4", name: "WAEC Result", type: "certificate", url: "/slides/slide-1.webp", uploaded_at: "2024-06-02T09:00:00Z" },
         { id: "doc-5", name: "JAMB Result Slip", type: "certificate", url: "/slides/slide-3.webp", uploaded_at: "2024-06-02T09:05:00Z" },
      ],
      submitted_at: "2024-06-18T09:15:00Z",
      reviewed_at: null,
      reviewed_by: null,
      denial_reason: null,
      created_at: "2024-06-02T09:00:00Z",
      updated_at: "2024-06-18T09:15:00Z",
   },
   {
      id: "app-3",
      applicant_id: "applicant-3",
      admission_cycle_id: "ac-1",
      session: "2024/2025",
      status: "under_review",
      personal_info: {
         first_name: "Fatima",
         last_name: "Abdullahi",
         middle_name: "",
         date_of_birth: "2003-01-10",
         gender: "female",
         nationality: "Nigerian",
         state_of_origin: "Kano",
         lga: "Kano Municipal",
         phone: "08145678901",
         email: "fatima.abdullahi@email.com",
         address: "8 Ibrahim Taiwo Road, Kano",
         passport_url: "/slides/slide-3.webp",
      },
      academic_records: [
         {
            institution: "Queens College, Kano",
            qualification: "WAEC",
            year_obtained: "2021",
            grade: "6 A1s, 2 B2s, 1 B3",
            certificate_url: "/slides/slide-2.webp",
         },
      ],
      program_choice: {
         first_choice_program_id: "prg-3",
         first_choice_program_name: "B.A. Economics",
         second_choice_program_id: "prg-4",
         second_choice_program_name: "B.Sc. Biochemistry",
         entry_mode: "utme",
         jamb_reg_no: "20245556677EF",
         jamb_score: 270,
      },
      documents: [
         { id: "doc-6", name: "WAEC Result", type: "certificate", url: "/slides/slide-2.webp", uploaded_at: "2024-06-05T11:00:00Z" },
         { id: "doc-7", name: "Birth Certificate", type: "identity", url: "/slides/slide-1.webp", uploaded_at: "2024-06-05T11:10:00Z" },
         { id: "doc-8", name: "LGA Identification", type: "identity", url: "/slides/slide-3.webp", uploaded_at: "2024-06-05T11:15:00Z" },
      ],
      submitted_at: "2024-06-20T16:00:00Z",
      reviewed_at: null,
      reviewed_by: null,
      denial_reason: null,
      created_at: "2024-06-05T11:00:00Z",
      updated_at: "2024-06-20T16:00:00Z",
   },
   {
      id: "app-4",
      applicant_id: "applicant-4",
      admission_cycle_id: "ac-1",
      session: "2024/2025",
      status: "approved",
      personal_info: {
         first_name: "Oluwaseun",
         last_name: "Adeyemi",
         middle_name: "Femi",
         date_of_birth: "2002-11-05",
         gender: "male",
         nationality: "Nigerian",
         state_of_origin: "Osun",
         lga: "Ilesa West",
         phone: "09034567890",
         email: "seun.adeyemi@email.com",
         address: "22 Oba Adesoji Road, Ilesa, Osun State",
         passport_url: "/slides/slide-1.webp",
      },
      academic_records: [
         {
            institution: "Ilesa Grammar School",
            qualification: "WAEC",
            year_obtained: "2020",
            grade: "8 A1s, 1 B2",
            certificate_url: "/slides/slide-2.webp",
         },
         {
            institution: "JAMB",
            qualification: "UTME",
            year_obtained: "2024",
            grade: "310",
            certificate_url: "/slides/slide-3.webp",
         },
      ],
      program_choice: {
         first_choice_program_id: "prg-1",
         first_choice_program_name: "B.Sc. Computer Science",
         second_choice_program_id: "prg-3",
         second_choice_program_name: "B.A. Economics",
         entry_mode: "utme",
         jamb_reg_no: "20241112233GH",
         jamb_score: 310,
      },
      documents: [
         { id: "doc-9", name: "WAEC Result", type: "certificate", url: "/slides/slide-2.webp", uploaded_at: "2024-05-20T08:00:00Z" },
         { id: "doc-10", name: "JAMB Result Slip", type: "certificate", url: "/slides/slide-3.webp", uploaded_at: "2024-05-20T08:05:00Z" },
         { id: "doc-11", name: "Birth Certificate", type: "identity", url: "/slides/slide-1.webp", uploaded_at: "2024-05-20T08:10:00Z" },
      ],
      submitted_at: "2024-06-10T12:00:00Z",
      reviewed_at: "2024-06-25T09:00:00Z",
      reviewed_by: "Admin User",
      denial_reason: null,
      created_at: "2024-05-20T08:00:00Z",
      updated_at: "2024-06-25T09:00:00Z",
   },
   {
      id: "app-5",
      applicant_id: "applicant-5",
      admission_cycle_id: "ac-1",
      session: "2024/2025",
      status: "denied",
      personal_info: {
         first_name: "Amina",
         last_name: "Bello",
         middle_name: "Hauwa",
         date_of_birth: "2004-06-30",
         gender: "female",
         nationality: "Nigerian",
         state_of_origin: "Kaduna",
         lga: "Kaduna North",
         phone: "08167890123",
         email: "amina.bello@email.com",
         address: "5 Kawo Road, Kaduna",
         passport_url: "/slides/slide-2.webp",
      },
      academic_records: [
         {
            institution: "Government Girls College, Kaduna",
            qualification: "WAEC",
            year_obtained: "2022",
            grade: "3 B2s, 4 C4s, 2 C5s",
            certificate_url: "/slides/slide-1.webp",
         },
      ],
      program_choice: {
         first_choice_program_id: "prg-2",
         first_choice_program_name: "B.Sc. Mechanical Engineering",
         second_choice_program_id: "prg-4",
         second_choice_program_name: "B.Sc. Biochemistry",
         entry_mode: "utme",
         jamb_reg_no: "20248889900IJ",
         jamb_score: 180,
      },
      documents: [
         { id: "doc-12", name: "WAEC Result", type: "certificate", url: "/slides/slide-1.webp", uploaded_at: "2024-06-10T07:00:00Z" },
      ],
      submitted_at: "2024-06-22T10:30:00Z",
      reviewed_at: "2024-06-28T14:00:00Z",
      reviewed_by: "Admin User",
      denial_reason: "JAMB score below minimum cut-off for the selected program. Missing Birth Certificate document.",
      created_at: "2024-06-10T07:00:00Z",
      updated_at: "2024-06-28T14:00:00Z",
   },
   {
      id: "app-6",
      applicant_id: "applicant-6",
      admission_cycle_id: "ac-1",
      session: "2024/2025",
      status: "pending",
      personal_info: {
         first_name: "David",
         last_name: "Okonkwo",
         middle_name: "Chinedu",
         date_of_birth: "2001-12-20",
         gender: "male",
         nationality: "Nigerian",
         state_of_origin: "Enugu",
         lga: "Nsukka",
         phone: "07023456789",
         email: "david.okonkwo@email.com",
         address: "15 University Road, Nsukka, Enugu State",
         passport_url: "/slides/slide-3.webp",
      },
      academic_records: [
         {
            institution: "Community Secondary School, Nsukka",
            qualification: "WAEC",
            year_obtained: "2019",
            grade: "6 A1s, 3 B2s",
            certificate_url: "/slides/slide-1.webp",
         },
         {
            institution: "JAMB",
            qualification: "UTME",
            year_obtained: "2024",
            grade: "292",
            certificate_url: "/slides/slide-2.webp",
         },
      ],
      program_choice: {
         first_choice_program_id: "prg-4",
         first_choice_program_name: "B.Sc. Biochemistry",
         second_choice_program_id: "prg-3",
         second_choice_program_name: "B.A. Economics",
         entry_mode: "utme",
         jamb_reg_no: "20243334455KL",
         jamb_score: 292,
      },
      documents: [
         { id: "doc-13", name: "WAEC Result", type: "certificate", url: "/slides/slide-1.webp", uploaded_at: "2024-06-08T14:00:00Z" },
         { id: "doc-14", name: "JAMB Result Slip", type: "certificate", url: "/slides/slide-2.webp", uploaded_at: "2024-06-08T14:05:00Z" },
         { id: "doc-15", name: "Passport Photograph", type: "photo", url: "/slides/slide-3.webp", uploaded_at: "2024-06-08T14:10:00Z" },
      ],
      submitted_at: "2024-06-25T11:45:00Z",
      reviewed_at: null,
      reviewed_by: null,
      denial_reason: null,
      created_at: "2024-06-08T14:00:00Z",
      updated_at: "2024-06-25T11:45:00Z",

   },
];

// ── Admission Applications API ──────────────

export const dummyAdmissionApplicationApi = {
   async list(filters?: { status?: string }) {
      await delay();
      let result = [...admissionApplications];
      if (filters?.status && filters.status !== "all") {
         result = result.filter((a) => a.status === filters.status);
      }
      return { data: result, total: result.length };
   },

   async getById(id: string) {
      await delay(200);
      const app = admissionApplications.find((x) => x.id === id);
      if (!app) throw new Error("Application not found");
      return { data: { ...app } };
   },

   async getByApplicantId(applicantId: string) {
      await delay(200);
      const app = admissionApplications.find((x) => x.applicant_id === applicantId);
      if (!app) throw new Error("Application not found");
      return { data: { ...app } };
   },

   async update(id: string, payload: UpdateApplicationPayload) {
      await delay(500);
      const app = admissionApplications.find((x) => x.id === id);
      if (!app) throw new Error("Application not found");
      if (payload.personal_info) {
         app.personal_info = { ...app.personal_info, ...payload.personal_info };
      }
      if (payload.academic_records) {
         app.academic_records = payload.academic_records;
      }
      if (payload.program_choice) {
         app.program_choice = { ...app.program_choice, ...payload.program_choice };
      }
      if (payload.documents) {
         app.documents = payload.documents;
      }
      app.updated_at = new Date().toISOString();
      return { data: { ...app }, message: "Application updated" };
   },

   async review(id: string, payload: ReviewApplicationPayload) {
      await delay(600);
      const app = admissionApplications.find((x) => x.id === id);
      if (!app) throw new Error("Application not found");
      app.status = payload.status;
      app.denial_reason = payload.status === "denied" ? (payload.denial_reason ?? null) : null;
      app.reviewed_at = new Date().toISOString();
      app.reviewed_by = "Current Manager";
      app.updated_at = new Date().toISOString();
      return { data: { ...app }, message: `Application ${payload.status}` };
   },
};

// ─────────────────────────────────────────────
// CONFIGURATION / SETTINGS
// ─────────────────────────────────────────────

let _settingsNextId = 200;
const settingUid = () => ++_settingsNextId;

const settings: Setting[] = [
   // ── university ─────────────────────────────
   { id: 1, key: "university_name", value: "ODL University", group: "university", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 2, key: "university_logo", value: "/logo/logo.png", group: "university", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 3, key: "university_motto", value: "Knowledge, Truth, Service", group: "university", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 4, key: "university_email", value: "info@odl.edu.ng", group: "university", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 5, key: "university_phone", value: "+234-800-000-0000", group: "university", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 6, key: "university_address", value: "1 University Road, Abuja, Nigeria", group: "university", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 7, key: "university_website", value: "https://odl.edu.ng", group: "university", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   // ── academic ───────────────────────────────
   { id: 8, key: "academic_max_credit_units", value: "24", group: "academic", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 9, key: "academic_min_attendance_pct", value: "75", group: "academic", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 10, key: "academic_grading_system", value: "5.0", group: "academic", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 11, key: "academic_pass_mark", value: "40", group: "academic", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 12, key: "academic_probation_cgpa", value: "1.5", group: "academic", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   // ── payment ────────────────────────────────
   { id: 13, key: "payment_gateway", value: "paystack", group: "payment", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 14, key: "payment_gateway_key", value: "sk_live_xxxxxxxxxxxx", group: "payment", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 15, key: "payment_application_fee", value: "10000", group: "payment", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 16, key: "payment_acceptance_fee", value: "30000", group: "payment", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 17, key: "payment_tuition_fee", value: "195000", group: "payment", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   // ── moodle ─────────────────────────────────
   { id: 18, key: "moodle_base_url", value: "https://lms.odl.edu.ng", group: "moodle", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 19, key: "moodle_api_token", value: "abc123moodletoken", group: "moodle", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 20, key: "moodle_student_role_id", value: "5", group: "moodle", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 21, key: "moodle_teacher_role_id", value: "3", group: "moodle", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 22, key: "moodle_auto_sync_enabled", value: "true", group: "moodle", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 23, key: "moodle_sync_cron_interval", value: "15", group: "moodle", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   // ── system ─────────────────────────────────
   { id: 24, key: "system_maintenance_mode", value: "false", group: "system", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 25, key: "system_app_version", value: "1.0.0", group: "system", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 26, key: "system_max_upload_size_mb", value: "10", group: "system", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
   { id: 27, key: "system_support_email", value: "support@odl.edu.ng", group: "system", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
];

export const dummySettingsApi = {
   list: async (params?: SettingsQueryParams): Promise<ApiListResponse<Setting>> => {
      await delay();
      let result = [...settings];
      if (params?.group) result = result.filter((s) => s.group === params.group);
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 50;
      const start = (page - 1) * limit;
      return { data: result.slice(start, start + limit), total: result.length };
   },

   getById: async (id: number): Promise<ApiSingleResponse<Setting>> => {
      await delay();
      const item = settings.find((s) => s.id === id);
      if (!item) throw new Error("Setting not found");
      return { data: { ...item } };
   },

   getByKey: async (key: string): Promise<ApiSingleResponse<Setting>> => {
      await delay();
      const item = settings.find((s) => s.key === key);
      if (!item) throw new Error("Setting not found");
      return { data: { ...item } };
   },

   create: async (payload: CreateSettingPayload): Promise<ApiSingleResponse<Setting>> => {
      await delay();
      if (settings.some((s) => s.key === payload.key)) throw new Error("Key already exists");
      const now = new Date().toISOString();
      const item: Setting = { id: settingUid(), ...payload, createdAt: now, updatedAt: now };
      settings.push(item);
      return { data: { ...item } };
   },

   update: async (id: number, payload: UpdateSettingPayload): Promise<ApiSingleResponse<Setting>> => {
      await delay();
      const item = settings.find((s) => s.id === id);
      if (!item) throw new Error("Setting not found");
      if (payload.value !== undefined) item.value = payload.value;
      if (payload.group !== undefined) item.group = payload.group;
      item.updatedAt = new Date().toISOString();
      return { data: { ...item } };
   },

   remove: async (id: number): Promise<{ message: string }> => {
      await delay();
      const idx = settings.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error("Setting not found");
      settings.splice(idx, 1);
      return { message: "Setting deleted" };
   },
};

// ─────────────────────────────────────────────
// NOTIFICATION MODULE
// ─────────────────────────────────────────────

import type {
   NotificationTemplate,
   Notification,
   CreateTemplatePayload,
   UpdateTemplatePayload,
   SendNotificationPayload,
   BulkNotificationPayload,
   BulkNotificationResponse,
   NotificationsQueryParams,
   NotificationListResponse,
   TemplateListResponse,
} from "@/types/notifications";

let _notifNextId = 300;
const notifUid = () => ++_notifNextId;

// ── Seed: Templates ───────────────────────────

const notificationTemplates: NotificationTemplate[] = [
   {
      id: 1,
      name: "welcome_email",
      subject: "Welcome to {{university_name}}, {{firstName}}!",
      body: "Dear {{firstName}},\n\nWelcome to {{university_name}}. Your account has been created successfully.\n\nYour login email is {{email}}.\n\nBest regards,\nAdmin Team",
      channel: "EMAIL",
      isActive: true,
      createdAt: "2024-01-10T08:00:00Z",
      updatedAt: "2024-01-10T08:00:00Z",
   },
   {
      id: 2,
      name: "application_received",
      subject: "Admission Application Received — {{applicationNumber}}",
      body: "Dear {{firstName}},\n\nWe have received your admission application (Ref: {{applicationNumber}}).\n\nYou will be notified once a decision is made.\n\nAdmissions Office",
      channel: "EMAIL",
      isActive: true,
      createdAt: "2024-01-15T09:00:00Z",
      updatedAt: "2024-01-15T09:00:00Z",
   },
   {
      id: 3,
      name: "application_approved",
      subject: "Congratulations! Your Admission Has Been Approved",
      body: "Dear {{firstName}},\n\nWe are pleased to inform you that your application has been APPROVED.\n\nPlease log in to complete your acceptance process.\n\nAdmissions Office",
      channel: "EMAIL",
      isActive: true,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
   },
   {
      id: 4,
      name: "payment_confirmed",
      subject: "Payment Confirmed — Invoice {{invoiceNumber}}",
      body: "Dear {{firstName}},\n\nYour payment for invoice {{invoiceNumber}} (₦{{amount}}) has been confirmed.\n\nThank you.\n\nBursary",
      channel: "EMAIL",
      isActive: true,
      createdAt: "2024-02-01T08:00:00Z",
      updatedAt: "2024-02-01T08:00:00Z",
   },
   {
      id: 5,
      name: "result_published",
      subject: "Your {{semester}} Results Are Now Available",
      body: "Dear {{firstName}},\n\nYour results for {{semester}} have been published. Log in to your portal to view your grades.\n\nAcademic Registry",
      channel: "IN_APP",
      isActive: true,
      createdAt: "2024-03-01T08:00:00Z",
      updatedAt: "2024-03-01T08:00:00Z",
   },
   {
      id: 6,
      name: "sms_otp",
      subject: "OTP Verification",
      body: "Your OTP is {{otp}}. Valid for 10 minutes. Do not share with anyone.",
      channel: "SMS",
      isActive: true,
      createdAt: "2024-01-10T08:00:00Z",
      updatedAt: "2024-01-10T08:00:00Z",
   },
   {
      id: 7,
      name: "maintenance_alert",
      subject: "Scheduled Maintenance Notice",
      body: "The portal will be offline for maintenance on {{date}} from {{start_time}} to {{end_time}}. Please plan accordingly.",
      channel: "IN_APP",
      isActive: false,
      createdAt: "2024-04-01T08:00:00Z",
      updatedAt: "2024-04-15T10:00:00Z",
   },
];

// ── Seed: Notifications ───────────────────────

const notifications: Notification[] = [
   {
      id: 1,
      userId: 101,
      userEmail: "chidi.okafor@odl.edu.ng",
      userName: "Chidi Okafor",
      templateId: 1,
      subject: "Welcome to ODL University, Chidi!",
      body: "Dear Chidi,\n\nWelcome to ODL University. Your account has been created successfully.",
      channel: "EMAIL",
      status: "SENT",
      sentAt: "2024-06-01T09:00:00Z",
      readAt: null,
      createdAt: "2024-06-01T09:00:00Z",
   },
   {
      id: 2,
      userId: 102,
      userEmail: "amara.nwosu@odl.edu.ng",
      userName: "Amara Nwosu",
      templateId: 2,
      subject: "Admission Application Received — APP-2024-0042",
      body: "Dear Amara,\n\nWe have received your admission application (Ref: APP-2024-0042).",
      channel: "EMAIL",
      status: "SENT",
      sentAt: "2024-06-10T11:00:00Z",
      readAt: "2024-06-10T14:00:00Z",
      createdAt: "2024-06-10T11:00:00Z",
   },
   {
      id: 3,
      userId: 103,
      userEmail: "emeka.eze@odl.edu.ng",
      userName: "Emeka Eze",
      templateId: 3,
      subject: "Congratulations! Your Admission Has Been Approved",
      body: "Dear Emeka,\n\nWe are pleased to inform you that your application has been APPROVED.",
      channel: "EMAIL",
      status: "SENT",
      sentAt: "2024-06-20T10:00:00Z",
      readAt: "2024-06-20T12:00:00Z",
      createdAt: "2024-06-20T10:00:00Z",
   },
   {
      id: 4,
      userId: 104,
      userEmail: "fatima.bello@odl.edu.ng",
      userName: "Fatima Bello",
      templateId: 4,
      subject: "Payment Confirmed — INV-2024-0089",
      body: "Dear Fatima,\n\nYour payment for invoice INV-2024-0089 (₦195,000) has been confirmed.",
      channel: "EMAIL",
      status: "FAILED",
      sentAt: null,
      readAt: null,
      createdAt: "2024-07-01T08:00:00Z",
   },
   {
      id: 5,
      userId: 101,
      userEmail: "chidi.okafor@odl.edu.ng",
      userName: "Chidi Okafor",
      templateId: 5,
      subject: "Your 1st Semester Results Are Now Available",
      body: "Dear Chidi,\n\nYour results for 1st Semester 2024/2025 have been published.",
      channel: "IN_APP",
      status: "READ",
      sentAt: "2024-11-15T08:00:00Z",
      readAt: "2024-11-15T10:00:00Z",
      createdAt: "2024-11-15T08:00:00Z",
   },
   {
      id: 6,
      userId: 102,
      userEmail: "amara.nwosu@odl.edu.ng",
      userName: "Amara Nwosu",
      subject: "Portal Maintenance Tonight",
      body: "The portal will be offline for maintenance tonight from 11pm to 2am.",
      channel: "IN_APP",
      status: "PENDING",
      sentAt: null,
      readAt: null,
      createdAt: "2024-12-01T16:00:00Z",
   },
];

// ── Dummy API: Templates ──────────────────────

export const dummyNotificationTemplateApi = {
   list: async (): Promise<TemplateListResponse> => {
      await delay();
      return {
         data: [...notificationTemplates],
         meta: { total: notificationTemplates.length, page: 1, limit: 50 },
      };
   },

   getById: async (id: number): Promise<{ data: NotificationTemplate }> => {
      await delay();
      const item = notificationTemplates.find((t) => t.id === id);
      if (!item) throw new Error("Template not found");
      return { data: { ...item } };
   },

   create: async (payload: CreateTemplatePayload): Promise<{ data: NotificationTemplate }> => {
      await delay();
      if (notificationTemplates.some((t) => t.name === payload.name))
         throw new Error("Template name already exists");
      const now = new Date().toISOString();
      const item: NotificationTemplate = { id: notifUid(), ...payload, isActive: true, createdAt: now, updatedAt: now };
      notificationTemplates.push(item);
      return { data: { ...item } };
   },

   update: async (id: number, payload: UpdateTemplatePayload): Promise<{ data: NotificationTemplate }> => {
      await delay();
      const item = notificationTemplates.find((t) => t.id === id);
      if (!item) throw new Error("Template not found");
      Object.assign(item, payload, { updatedAt: new Date().toISOString() });
      return { data: { ...item } };
   },

   remove: async (id: number): Promise<{ message: string }> => {
      await delay();
      const idx = notificationTemplates.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error("Template not found");
      notificationTemplates.splice(idx, 1);
      return { message: "Template deleted" };
   },
};

// ── Dummy API: Notifications ──────────────────

export const dummyNotificationApi = {
   list: async (params?: NotificationsQueryParams): Promise<NotificationListResponse> => {
      await delay();
      let result = [...notifications];
      if (params?.status) result = result.filter((n) => n.status === params.status);
      if (params?.channel) result = result.filter((n) => n.channel === params.channel);
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const start = (page - 1) * limit;
      const unreadCount = result.filter((n) => n.status !== "READ").length;
      return {
         data: result.slice(start, start + limit),
         meta: { total: result.length, page, limit, unreadCount },
      };
   },

   getById: async (id: number): Promise<{ data: Notification }> => {
      await delay();
      const item = notifications.find((n) => n.id === id);
      if (!item) throw new Error("Notification not found");
      return { data: { ...item } };
   },

   unreadCount: async (): Promise<{ count: number }> => {
      await delay(150);
      return { count: notifications.filter((n) => n.status !== "READ").length };
   },

   send: async (payload: SendNotificationPayload): Promise<{ data: Notification }> => {
      await delay();
      const now = new Date().toISOString();
      const item: Notification = {
         id: notifUid(),
         userId: payload.userId,
         templateId: payload.templateId,
         subject: payload.subject,
         body: payload.body,
         channel: payload.channel,
         status: payload.channel === "IN_APP" ? "SENT" : "PENDING",
         sentAt: payload.channel === "IN_APP" ? now : null,
         readAt: null,
         createdAt: now,
      };
      notifications.unshift(item);
      return { data: { ...item } };
   },

   sendBulk: async (payload: BulkNotificationPayload): Promise<BulkNotificationResponse> => {
      await delay(600);
      const now = new Date().toISOString();
      for (const userId of payload.userIds) {
         notifications.unshift({
            id: notifUid(),
            userId,
            templateId: payload.templateId,
            subject: payload.subject,
            body: payload.body,
            channel: payload.channel,
            status: payload.channel === "IN_APP" ? "SENT" : "PENDING",
            sentAt: payload.channel === "IN_APP" ? now : null,
            readAt: null,
            createdAt: now,
         });
      }
      return { sent: payload.userIds.length, errors: [] };
   },

   markRead: async (id: number): Promise<{ data: Notification }> => {
      await delay(150);
      const item = notifications.find((n) => n.id === id);
      if (!item) throw new Error("Notification not found");
      item.status = "READ";
      item.readAt = new Date().toISOString();
      return { data: { ...item } };
   },

   markAllRead: async (): Promise<{ message: string }> => {
      await delay(300);
      const now = new Date().toISOString();
      notifications.forEach((n) => {
         if (n.status !== "READ") {
            n.status = "READ";
            n.readAt = now;
         }
      });
      return { message: "All notifications marked as read" };
   },
};
