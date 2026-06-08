// ──────────────────────────────────────────────
// Shared Admin Domain Types
// ──────────────────────────────────────────────

export interface AcademicSession {
   id: string;
   name: string;
   start_date: string;
   end_date: string;
   is_active: boolean;
}

export interface Semester {
   id: string;
   academic_session_id: string;
   name: string;
   sequence_no: number;
   is_active: boolean;
}

export interface FeeStructure {
   id: string;
   academic_session_id: string;
   semester_id: string;
   program_id: string;
   level: number;
   total_amount: number;
   description: string;
}

export interface StudentFeeAccount {
   id: string;
   student_id: string;
   academic_session_id: string;
   total_fee: number;
   paid_amount: number;
   balance: number;
   status: "pending" | "partially_paid" | "fully_paid" | "overdue";
}

export interface Program {
   id: string;
   name: string;
   code: string;
}

export interface FresherFeeItem {
   id: string;
   academic_session_id: string;
   name: string;
   amount: number;
}

export interface OtherFeeItem {
   id: string;
   academic_session_id: string;
   semester_id: string; // "" means "All Semesters"
   level: number;       // 0 means "All Levels"
   name: string;
   amount: number;
   description: string;
}

// ── Form / Payload types ────────────────────

export type CreateAcademicSessionPayload = Omit<AcademicSession, "id">;
export type UpdateAcademicSessionPayload = Partial<CreateAcademicSessionPayload>;

export type CreateSemesterPayload = Omit<Semester, "id">;

export type CreateFeeStructurePayload = Omit<FeeStructure, "id">;

export type CreateFresherFeePayload = Omit<FresherFeeItem, "id">;

export type CreateOtherFeePayload = Omit<OtherFeeItem, "id">;

// ── Course Structure ────────────────────────

export interface Faculty {
   id: string;
   name: string;
   code: string;
   description: string;
   dean_user_id: number | null;
   email: string;
   phone_number: string;
   is_active: boolean;
   departments_count: number;
}

export interface Department {
   id: string;
   faculty_id: string;
   name: string;
   code: string;
   description: string;
   hod_user_id: number | null;
   email: string;
   phone_number: string;
   is_active: boolean;
   programs_count: number;
}

export interface Program {
   id: string;
   department_id: string;
   name: string;
   code: string;
   degree_type: string;
   duration_years: number;
   description: string;
   min_credit_units: number;
   is_active: boolean;
}

export interface CurriculumLevel {
   id: string;
   name: string;
   numeric_value: number;
   semesters_count: number;
}

export interface CurriculumSemester {
   id: string;
   level_id: string;
   name: string;
   sequence_no: number;
   courses_count: number;
}

export interface CreateFacultyPayload {
   name: string;
   code: string;
   description?: string;
   email?: string;
   phone_number?: string;
}

export type UpdateFacultyPayload = Partial<CreateFacultyPayload>;

export interface CreateDepartmentPayload {
   faculty_id: string;
   name: string;
   code: string;
   description?: string;
   email?: string;
   phone_number?: string;
}

export type UpdateDepartmentPayload = Partial<Omit<CreateDepartmentPayload, "faculty_id">>;

export interface CreateProgramPayload {
   department_id: string;
   name: string;
   code: string;
   degree_type: string;
   duration_years: number;
   description?: string;
   min_credit_units: number;
}

export type UpdateProgramPayload = Partial<Omit<CreateProgramPayload, "department_id">>;

export interface CreateCurriculumLevelPayload {
   name: string;
   numeric_value: number;
}

export type UpdateCurriculumLevelPayload = Partial<CreateCurriculumLevelPayload>;

export interface CreateCurriculumSemesterPayload {
   level_id: string;
   name: string;
   sequence_no: number;
}

export type UpdateCurriculumSemesterPayload = Partial<Omit<CreateCurriculumSemesterPayload, "level_id">>;

// ── Course Management ───────────────────────

export type CourseType = "GENERAL" | "FACULTY" | "DEPARTMENTAL" | "ELECTIVE";

export interface Course {
   id: string;
   code: string;
   title: string;
   description: string;
   credit_units: number;
   course_type: CourseType;
   curriculum_semester_id: string;
   owning_department_id: string | null;
   is_active: boolean;
   // denormalized for display
   level_name: string;
   semester_name: string;
   department_name: string | null;
}

export interface ProgramCourse {
   id: string;
   program_id: string;
   course_id: string;
   is_required: boolean;
   // denormalized for display
   program_name: string;
   program_code: string;
}

export interface CreateCoursePayload {
   code: string;
   title: string;
   description?: string;
   credit_units: number;
   course_type: CourseType;
   curriculum_semester_id: string;
   owning_department_id?: string | null;
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>;

export interface AssignCourseToProgramPayload {
   program_id: string;
   course_id: string;
   is_required: boolean;
}

export interface UpdateProgramCoursePayload {
   is_required: boolean;
}

// ── Admissions ──────────────────────────────

export type AdmissionStatus = "draft" | "open" | "closed";

export interface AdmissionCycle {
   id: string;
   academic_session_id: string;
   status: AdmissionStatus;
   application_start_date: string;
   application_end_date: string; // "" means no deadline (infinite)
   late_application_allowed: boolean;
   late_application_fee: number;
   max_applications: number; // 0 means unlimited
   require_documents: boolean;
   required_documents: string[];
   notification_email: string;
   instructions: string;
   created_at: string;
   updated_at: string;
}

export interface AdmissionRequirement {
   id: string;
   admission_cycle_id: string;
   program_id: string; // "" means all programs
   min_age: number; // 0 means no min
   max_age: number; // 0 means no max
   min_credits: number;
   required_subjects: string[];
   description: string;
}

export type CreateAdmissionCyclePayload = Omit<AdmissionCycle, "id" | "created_at" | "updated_at">;
export type UpdateAdmissionCyclePayload = Partial<CreateAdmissionCyclePayload>;
export type CreateAdmissionRequirementPayload = Omit<AdmissionRequirement, "id">;

export interface GenerateFeeAccountsPayload {
   academic_session_id: string;
}

export interface GenerateFeeAccountsResponse {
   generated_count: number;
   message: string;
}

// ── Admission Applications (Review) ─────────

export type ApplicationReviewStatus = "pending" | "under_review" | "approved" | "denied";

export interface ApplicantPersonalInfo {
   first_name: string;
   last_name: string;
   middle_name: string;
   date_of_birth: string;
   gender: "male" | "female" | "other";
   nationality: string;
   state_of_origin: string;
   lga: string;
   phone: string;
   email: string;
   address: string;
   passport_url: string;
}

export interface ApplicantAcademicRecord {
   institution: string;
   qualification: string;
   year_obtained: string;
   grade: string;
   certificate_url: string;
}

export interface ApplicantDocument {
   id: string;
   name: string;
   type: string;
   url: string;
   uploaded_at: string;
}

export interface ApplicantProgramChoice {
   first_choice_program_id: string;
   first_choice_program_name: string;
   second_choice_program_id: string;
   second_choice_program_name: string;
   entry_mode: "utme" | "direct_entry" | "transfer";
   jamb_reg_no: string;
   jamb_score: number;
}

export interface AdmissionApplication {
   id: string;
   applicant_id: string;
   admission_cycle_id: string;
   session: string;
   status: ApplicationReviewStatus;
   personal_info: ApplicantPersonalInfo;
   academic_records: ApplicantAcademicRecord[];
   program_choice: ApplicantProgramChoice;
   documents: ApplicantDocument[];
   submitted_at: string;
   reviewed_at: string | null;
   reviewed_by: string | null;
   denial_reason: string | null;
   created_at: string;
   updated_at: string;
}

export type UpdateApplicationPayload = {
   personal_info?: Partial<ApplicantPersonalInfo>;
   academic_records?: ApplicantAcademicRecord[];
   program_choice?: Partial<ApplicantProgramChoice>;
   documents?: ApplicantDocument[];
};

export type ReviewApplicationPayload = {
   status: "approved" | "denied";
   denial_reason?: string;
};

// ── API response wrappers ───────────────────

export interface ApiListResponse<T> {
   data: T[];
   total: number;
}

export interface ApiSingleResponse<T> {
   data: T;
   message?: string;
}

// ── Configuration / Settings ─────────────────

export type SettingGroup = "university" | "academic" | "payment" | "moodle" | "system";

export interface Setting {
   id: number;
   key: string;
   value: string;
   group: string;
   createdAt: string;
   updatedAt: string;
}

export interface CreateSettingPayload {
   key: string;
   value: string;
   group: string;
}

export interface UpdateSettingPayload {
   value?: string;
   group?: string;
}

export interface SettingsQueryParams {
   group?: string;
   page?: number;
   limit?: number;
}
