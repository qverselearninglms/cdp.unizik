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
   gender: "male" | "female";
   nationality: string;
   state_of_origin: string;
   lga: string;
   phone: string;
   email: string;
   address: string;
   passport_url: string;
}
export type ApplicationTransformer = (response: ApplicationDetailApiResponse) => AdmissionApplication;

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

// Add these new interfaces before the existing types

// ── API Response for Application Detail ─────────────────

export interface StudentInfoData {
   id: number;
   first_name: string;
   last_name: string;
   other_name: string | null;
   username: string | null;
   email: string;
   phone_number: string;
   role: string | null;
   nationality: string;
   state: string;
   level: string | null;
   faculty_id: string | null;
   department_id: string | null;
   program: string;
   program_id: number;
   academic_session: string;
   academic_semester: string;
   start_year: string;
   amount: string;
   reference: string;
   is_applied: number;
   admission_status: string;
   application_payment_status: string;
   acceptance_fee_payment_status: string;
   tuition_payment_status: string;
   tuition_amount_paid: string;
   progress_status: string;
   reg_number: string;
   reason_for_denial: string | null;
   disability: string | null;
   images: string | null;
   created_at: string;
   updated_at: string;
   deleted_at: string | null;
}

export interface ApplicantNextOfKin {
  name: string;
  relationship: string;
  phone_number: string;
  alternate_phone_number: string | null;
  email: string;
  address: string;
  occupation: string;
  workplace: string;
  is_primary_contact: boolean;
}

export interface ApplicationFormData {
   id: number;
   user_id: number;
   gender: string;
   lga: string;
   hometown: string;
   hometown_address: string;
   contact_address: string;
   religion: string;
   disability: string;
   other_disability: string | null;
   dob: string;
   sponsor_name: string | null;
   sponsor_relationship: string | null;
   sponsor_phone_number: string | null;
   sponsor_email: string | null;
   sponsor_contact_address: string | null;
   has_sponsor: number;
   awaiting_result: number;
   first_sitting: string | null;
   second_sitting: string | null;
   passport: string | null;
   undergraduateDegree: string | null;
   university: string | null;
   gpa: string | null;
   graduationYear: string | null;
   workExperience: string | null;
   currentPosition: string | null;
   company: string | null;
   yearsOfExperience: string | null;
   program: string | null;
   startTerm: string;
   studyMode: string;
   personalStatement: string | null;
   careerGoals: string | null;
   agreeToTerms: number;
   images: string | null;
   other_documents: string[] | null;
   next_of_kin_name: string;
   next_of_kin_relationship: string;
   next_of_kin_phone_number: string;
   next_of_kin_email: string;
   next_of_kin_address: string;
   is_next_of_kin_primary_contact: number;
   next_of_kin_alternate_phone_number: string | null;
   next_of_kin_occupation: string;
   next_of_kin_workplace: string;
   first_school_leaving: string | null;
   first_sitting_type: string | null;
   first_sitting_year: number | null;
   first_sitting_exam_number: string | null;
   first_sitting_result: string | null;
   second_sitting_type: string | null;
   second_sitting_year: number | null;
   second_sitting_exam_number: string | null;
   second_sitting_result: string | null;
   o_level: string | null;
   degree: string | null;
   college: string | null;
   ond: string | null;
   hnd: string | null;
   masters: string | null;
   phd: string | null;
   professional: string | null;
   degree_transcript: string | null;
   academic_session: string | null;
   others: string | null;
   created_at: string;
   updated_at: string;
   deleted_at: string | null;
}

export interface ProgramChoice {
   first_choice_program_id: string;
   first_choice_program_name: string;
   second_choice_program_id: string;
   second_choice_program_name: string;
   entry_mode: "utme" | "direct_entry" | "transfer";
   jamb_reg_no: string;
   jamb_score: number;
}

export interface ApplicationDetailApiResponse {
   status: number;
   response: string;
   data: {
      student_info: StudentInfoData;
      application_info: ApplicationFormData;
      program_choice: ProgramChoice;
   };
}

export interface AdmissionApplication {
   id: string;
   applicant_id: string;
   admission_cycle_id: string;
   session: string;
   status: ApplicationReviewStatus;
   personal_info: ApplicantPersonalInfo;
   next_of_kin: ApplicantNextOfKin | null;
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

// export type UpdateApplicationPayload = {
//    personal_info?: Partial<ApplicantPersonalInfo>;
//    academic_records?: ApplicantAcademicRecord[];
//    program_choice?: Partial<ApplicantProgramChoice>;
//    documents?: ApplicantDocument[];
// };
// One field at a time — id is passed separately at the call site
export type UpdateApplicationPayload = Partial<{
   // Personal info
   first_name: string;
   last_name: string;
   other_name: string;
   dob: string;
   gender: string;
   nationality: string;
   state: string;
   lga: string;
   phone_number: string;
   email: string;
   contact_address: string;
   // Next of kin
   next_of_kin_name: string;
   next_of_kin_relationship: string;
   next_of_kin_phone_number: string;
   next_of_kin_alternate_phone_number: string;
   next_of_kin_email: string;
   next_of_kin_address: string;
   next_of_kin_occupation: string;
   next_of_kin_workplace: string;
   is_next_of_kin_primary_contact: number;
   // Program choice
   first_choice_program_name: string;
   second_choice_program_name: string;
   entry_mode: string;
   jamb_reg_no: string;
   jamb_score: number;
   // Composite fields (full array replace)
   academic_records: ApplicantAcademicRecord[];
   documents: ApplicantDocument[];
}>;

export type ReviewApplicationPayload = {
   application_status: "offered" | "rejected" | "accepted" //AdmissionOfferStatus //"approved" | "denied";
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
   status?: number;
   response?: string;
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
