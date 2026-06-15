import { apiClient } from "@/core/client";
import {
   createApiMutationOptions,
   createApiQueryOptions,
} from "@/lib/clients/apiClient";
import type {
   AdmissionApplication,
   ApiListResponse,
   ApiSingleResponse,
   UpdateApplicationPayload,
   ReviewApplicationPayload,
   ApplicationReviewStatus,
   ApplicantAcademicRecord,
   ApplicantDocument,
   StudentInfoData,
   ApplicationFormData,
   ProgramChoice,
   ApplicantNextOfKin,
} from "@/types/school";

// ── Types ────────────────────────────────────────────────────────────────────

interface ListFilters {
   status?: string;
}

interface AdminApplicationParams {
   user_id?: string | number;
   application_payment_id?: string | number;
}

// ── Raw API functions ────────────────────────────────────────────────────────

export const applicationReviewApi = {
   /**
    * Admin: fetch all student applications.
    * Optionally filter by user_id or application_payment_id.
    * Falls back to listing all when no param is supplied.
    */
   list: async (
      filters?: ListFilters,
      adminParams?: AdminApplicationParams
   ) => {
      const params: Record<string, string | number | undefined> = {
         ...adminParams,
         ...(filters?.status ? { status: filters.status } : {}),
      };

      return apiClient.get<ApiListResponse<AdmissionApplication>>(
         "/application/all-applications",
         { params }
      );
   },

   /**
    * Admin: fetch a single application by its student ID.
    * (Your API uses ?user_id=X as the per-record lookup.)
    */
   getById: async (studentId: string) => {
      return apiClient.get<ApiSingleResponse<any>>(
         "/application/student-application",
         { params: { user_id: studentId } }
      );
   },

   /**
    * Admin: fetch application(s) for a specific user.
    */
   getByApplicantId: async (userId: string | number) => {
      return apiClient.get<ApiSingleResponse<AdmissionApplication>>(
         "/application/my-application",
         { params: { user_id: userId } }
      );
   },

   /**
    * Student: fetch own application.
    */
   getMyApplication: async () => {
      return apiClient.get<ApiSingleResponse<AdmissionApplication>>(
         "/application/my-application"
      );
   },

   /**
    * Update editable fields on an application.
    */
   // update: async (id: string, payload: UpdateApplicationPayload) => {
   //    return apiClient.put<ApiSingleResponse<AdmissionApplication>>(
   //       "/application/update-application-form",
   //       { id, ...payload }
   //    );
   // },
   update: async (id: string, payload: UpdateApplicationPayload, asAdmin = false) => {
      const endpoint = asAdmin
         ? "/application/admin-update-application-form"
         : "/application/update-application-form";

      return apiClient.put<ApiSingleResponse<AdmissionApplication>>(
         endpoint,
         { user_id: id, ...payload }
      );
   },

   /**
    * Admin: approve or deny an application.
    * Adjust the endpoint path if your backend differs.
    */
   review: async (id: string, payload: ReviewApplicationPayload) => {
      return apiClient.post<ApiSingleResponse<AdmissionApplication>>(
         // `/admission/respond`,
         `/application/update-admission-status`,
         { user_id: id, ...payload }
      );
   },
};

// ── Query keys ───────────────────────────────────────────────────────────────

export const applicationReviewKeys = {
   all: ["admission-applications"] as const,

   list: (filters?: ListFilters, adminParams?: AdminApplicationParams) =>
      [
         ...applicationReviewKeys.all,
         "list",
         filters ?? {},
         adminParams ?? {},
      ] as const,

   detail: (studentId: string) =>
      [
         ...applicationReviewKeys.all,
         "detail",
         studentId,
      ] as const,

   byApplicant: (userId: string | number) =>
      [...applicationReviewKeys.all, "applicant", userId] as const,

   mine: () => [...applicationReviewKeys.all, "mine"] as const,
} as const;

// ── Query options ────────────────────────────────────────────────────────────

export const applicationReviewQueryOptions = {
   list: (filters?: ListFilters, adminParams?: AdminApplicationParams) =>
      createApiQueryOptions({
         queryKey: applicationReviewKeys.list(filters, adminParams),
         queryFn: async () => {
            const res = await applicationReviewApi.list(filters, adminParams);
            const raw = (res.data as any) || [];

            // Transform each item exactly like the detail query does
            return raw.map((item: any) => {
               // The list endpoint may return a flat structure or a nested one —
               // handle both shapes
               if (item.student_info && item.application_info) {
                  // Nested shape (same as detail)
                  return transformApiApplication(
                     item.student_info,
                     item.application_info,
                     item.program_choice
                  );
               }

               // Flat shape — build minimal student_info and application_info from the flat object
               // so mapToReviewStatus can do its job
               const synthetic_student_info: Partial<StudentInfoData> = {
                  id: item.id,
                  first_name: item.first_name ?? item.personal_info?.first_name ?? "",
                  last_name: item.last_name ?? item.personal_info?.last_name ?? "",
                  other_name: item.other_name ?? item.personal_info?.middle_name ?? null,
                  email: item.email ?? item.personal_info?.email ?? "",
                  phone_number: item.phone_number ?? item.personal_info?.phone ?? "",
                  admission_status: item.admission_status ?? "",
                  application_payment_status: item.application_payment_status ?? "",
                  progress_status: item.progress_status ?? "",
                  reason_for_denial: item.reason_for_denial ?? null,
                  academic_session: item.session ?? item.academic_session ?? "",
                  created_at: item.created_at ?? new Date().toISOString(),
                  updated_at: item.updated_at ?? new Date().toISOString(),
                  program: item.program ?? "",
                  program_id: item.program_id ?? 0,
                  nationality: item.nationality ?? "Nigeria",
                  state: item.state ?? "",
                  images: item.images ?? null,
               };

               const synthetic_application_info: Partial<ApplicationFormData> = {
                  id: item.application_id ?? item.id,
                  user_id: item.id,
                  gender: item.gender ?? "male",
                  lga: item.lga ?? "",
                  contact_address: item.contact_address ?? "",
                  hometown_address: item.hometown_address ?? "",
                  dob: item.dob ?? "",
                  images: item.images ?? null,
                  passport: item.passport ?? null,
                  other_documents: item.other_documents ?? null,
                  next_of_kin_name: item.next_of_kin_name ?? "",
                  next_of_kin_relationship: item.next_of_kin_relationship ?? "",
                  next_of_kin_phone_number: item.next_of_kin_phone_number ?? "",
                  next_of_kin_email: item.next_of_kin_email ?? "",
                  next_of_kin_address: item.next_of_kin_address ?? "",
                  next_of_kin_occupation: item.next_of_kin_occupation ?? "",
                  next_of_kin_workplace: item.next_of_kin_workplace ?? "",
                  is_next_of_kin_primary_contact: item.is_next_of_kin_primary_contact ?? 0,
                  next_of_kin_alternate_phone_number: item.next_of_kin_alternate_phone_number ?? null,
                  updated_at: item.updated_at ?? new Date().toISOString(),
                  created_at: item.created_at ?? new Date().toISOString(),
               };

               return transformApiApplication(
                  synthetic_student_info as StudentInfoData,
                  synthetic_application_info as ApplicationFormData,
                  item.program_choice
               );
            });
         },
      }),

   detail: (studentId: string) =>
      createApiQueryOptions({
         queryKey: applicationReviewKeys.detail(studentId),
         queryFn: async () => {
            const res = await applicationReviewApi.getById(studentId);
            // Safely reference the root nested payload data
            const targetData = (res.data as any);

            if (!targetData || !targetData.student_info) {
               throw new Error("Application data record not found");
            }

            // Pass structural objects directly to our data mapper transformer
            return transformApiApplication(targetData.student_info, targetData.application_info, targetData.program_choice);
         },
      }),

   byApplicant: (userId: string | number) =>
      createApiQueryOptions({
         queryKey: applicationReviewKeys.byApplicant(userId),
         queryFn: async () => {
            const res = await applicationReviewApi.getByApplicantId(userId);
            return res.data as unknown as AdmissionApplication;
         },
      }),

   mine: () =>
      createApiQueryOptions({
         queryKey: applicationReviewKeys.mine(),
         queryFn: async () => {
            const res = await applicationReviewApi.getMyApplication();
            return res.data as unknown as AdmissionApplication;
         },
      }),
};

// ── Mutation options ─────────────────────────────────────────────────────────
export const applicationReviewMutationOptions = {
   update: () =>
      createApiMutationOptions<ApiSingleResponse<AdmissionApplication>,
         { id: string; payload: UpdateApplicationPayload; asAdmin?: boolean }>({
            mutationKey: [...applicationReviewKeys.all, "update"],
            mutationFn: ({ id, payload, asAdmin }) =>
               applicationReviewApi.update(id, payload, asAdmin) as unknown as Promise<ApiSingleResponse<AdmissionApplication>>,
         }),

   review: () =>
      createApiMutationOptions<
         ApiSingleResponse<AdmissionApplication>,
         { id: string; payload: ReviewApplicationPayload }
      >({
         mutationKey: [...applicationReviewKeys.all, "review"],
         mutationFn: ({ id, payload }) =>
            applicationReviewApi.review(id, payload) as unknown as Promise<ApiSingleResponse<AdmissionApplication>>,
      }),
};


function mapToReviewStatus(student_info: StudentInfoData): ApplicationReviewStatus {
   // Denial takes precedence — backend sets reason_for_denial on reject
   if (student_info?.reason_for_denial) {
      return "denied";
   }
   // Backend sends "admitted" when admin approves
   if (
      student_info?.progress_status === "accepted" ||
      student_info?.admission_status === "offered" ||   // ← was "admitted", backend actually sends "offered"
      student_info?.admission_status === "admitted"
   ) {
      return "approved";
   }
   // Application fee paid → in the queue for review
   if (student_info?.application_payment_status === "paid") {
      return "under_review";
   }
   return "pending";
}

// ── Transform ────────────────────────────────────────────────────────────────

export function transformApiApplication(
   student_info: StudentInfoData,
   application_info: ApplicationFormData,
   program_choice?: ProgramChoice
): AdmissionApplication {

   const status = mapToReviewStatus(student_info);

   // ── Documents ─────────────────────────────────────────────
   const namedDocFields: Array<keyof ApplicationFormData> = [
      "first_school_leaving", "o_level", "degree", "college", "ond",
      "hnd", "masters", "phd", "professional", "degree_transcript", "others",
   ];

   const documents: ApplicantDocument[] = [];

   namedDocFields.forEach((field) => {
      const val = application_info?.[field];
      if (val && typeof val === "string") {
         documents.push({
            id: `${field}-${application_info.id}`,
            name: field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            type: field,
            url: val,
            uploaded_at: application_info.updated_at ?? new Date().toISOString(),
         });
      }
   });

   const otherDocs = application_info?.other_documents;
   if (Array.isArray(otherDocs)) {
      otherDocs.forEach((url, i) => {
         if (url) {
            documents.push({
               id: `other_doc_${i}-${application_info.id}`,
               name: `Supporting Document ${i + 1}`,
               type: "other",
               url,
               uploaded_at: application_info.updated_at ?? new Date().toISOString(),
            });
         }
      });
   }

   // ── Academic records ──────────────────────────────────────
   const academic_records: ApplicantAcademicRecord[] = [];

   if (application_info?.university || application_info?.undergraduateDegree) {
      academic_records.push({
         institution: application_info.university ?? "Not Specified",
         qualification: application_info.undergraduateDegree ?? "N/A",
         year_obtained: application_info.graduationYear ?? "N/A",
         grade: application_info.gpa ?? "N/A",
         certificate_url: application_info.degree ?? "",
      });
   }

   if (application_info?.first_sitting_type || application_info?.first_sitting_result) {
      academic_records.push({
         institution: application_info.first_sitting_type ?? "N/A",
         qualification: `${application_info.first_sitting_type ?? ""} — ${application_info.first_sitting_exam_number ?? ""}`.trim(),
         year_obtained: String(application_info.first_sitting_year ?? "N/A"),
         grade: "See certificate",
         certificate_url: application_info.first_sitting_result ?? "",
      });
   }

   if (application_info?.second_sitting_type || application_info?.second_sitting_result) {
      academic_records.push({
         institution: application_info.second_sitting_type ?? "N/A",
         qualification: `${application_info.second_sitting_type ?? ""} — ${application_info.second_sitting_exam_number ?? ""}`.trim(),
         year_obtained: String(application_info.second_sitting_year ?? "N/A"),
         grade: "See certificate",
         certificate_url: application_info.second_sitting_result ?? "",
      });
   }

   if (application_info?.o_level && academic_records.length === 0) {
      academic_records.push({
         institution: "Secondary School",
         qualification: "O-Level",
         year_obtained: "",
         grade: "N/A",
         certificate_url: application_info.o_level,
      });
   }

   if (academic_records.length === 0) {
      academic_records.push({
         institution: "No records captured",
         qualification: "N/A",
         year_obtained: "N/A",
         grade: "N/A",
         certificate_url: "",
      });
   }

   // ── Next of kin ───────────────────────────────────────────
   const next_of_kin: ApplicantNextOfKin | null = application_info?.next_of_kin_name
      ? {
         name: application_info.next_of_kin_name,
         relationship: application_info.next_of_kin_relationship,
         phone_number: application_info.next_of_kin_phone_number,
         alternate_phone_number: application_info.next_of_kin_alternate_phone_number ?? null,
         email: application_info.next_of_kin_email,
         address: application_info.next_of_kin_address,
         occupation: application_info.next_of_kin_occupation,
         workplace: application_info.next_of_kin_workplace,
         is_primary_contact: Boolean(application_info.is_next_of_kin_primary_contact),
      }
      : null;

   // ── Passport URL ──────────────────────────────────────────
   const passportUrl =
      application_info?.images ||
      (application_info?.passport && !application_info.passport.startsWith("/tmp/")
         ? application_info.passport
         : null) ||
      "/avatars/default_result_image.jpg";

   return {
      id: String(student_info?.id ?? application_info?.user_id ?? ""),
      applicant_id: String(student_info?.id ?? application_info?.user_id ?? ""),
      admission_cycle_id: student_info?.academic_session ?? "N/A",
      submitted_at: student_info?.created_at ?? new Date().toISOString(),
      created_at: student_info?.created_at ?? new Date().toISOString(),
      updated_at: student_info?.updated_at ?? new Date().toISOString(),
      session: student_info?.academic_session ?? "N/A",
      status,                                              // ← ApplicationReviewStatus
      denial_reason: student_info?.reason_for_denial ?? null,
      reviewed_by: "System Admin",
      reviewed_at: student_info?.updated_at ?? null,
      next_of_kin,
      personal_info: {
         first_name: student_info?.first_name ?? "",
         last_name: student_info?.last_name ?? "",
         middle_name: student_info?.other_name ?? "",
         passport_url: passportUrl,
         email: student_info?.email ?? "",
         date_of_birth: application_info?.dob ?? "",
         gender: (application_info?.gender ?? "male").toLowerCase() as "male" | "female",
         nationality: student_info?.nationality ?? "Nigeria",
         state_of_origin: student_info?.state ?? "",
         lga: application_info?.lga ?? "",
         phone: student_info?.phone_number ?? "",
         address:
            application_info?.contact_address ||
            application_info?.hometown_address ||
            "No address supplied",
      },
      program_choice: {
         first_choice_program_id: String(
            program_choice?.first_choice_program_id ?? student_info?.program_id ?? "N/A"
         ),
         first_choice_program_name:
            program_choice?.first_choice_program_name ||
            student_info?.program ||
            `Program ID: ${student_info?.program_id ?? "N/A"}`,
         second_choice_program_id: String(program_choice?.second_choice_program_id ?? "N/A"),
         second_choice_program_name: program_choice?.second_choice_program_name ?? "N/A",
         entry_mode: (program_choice?.entry_mode ?? "utme") as "utme" | "direct_entry" | "transfer",
         jamb_reg_no: program_choice?.jamb_reg_no ?? "N/A",
         jamb_score: program_choice?.jamb_score ?? 0,
      },
      academic_records,
      documents,
   };
}

function mapApplicationStatus(apiApp: any): ApplicationReviewStatus {
   if (apiApp.is_admitted === true) return "approved";
   if (apiApp.application_status === "submitted") return "under_review";
   return "pending";
}

function extractAcademicRecords(apiApp: any): ApplicantAcademicRecord[] {
   const records = [];

   if (apiApp.o_level) {
      records.push({
         institution: "Secondary School",
         qualification: "O-Level",
         year_obtained: "",
         grade: apiApp.o_level,
         certificate_url: "",
      });
   }

   if (apiApp.degree) {
      records.push({
         institution: apiApp.university || "",
         qualification: "Degree",
         year_obtained: apiApp.graduationYear || "",
         grade: apiApp.gpa || "",
         certificate_url: "",
      });
   }

   return records;
}
