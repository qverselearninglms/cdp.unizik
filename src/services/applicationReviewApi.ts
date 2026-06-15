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

// Maps the list endpoint's status strings → ApplicationReviewStatus
// The list backend sends mixed case and different values than the detail endpoint
function mapListStatus(rawStatus: string): ApplicationReviewStatus {
   switch (rawStatus) {
      case "offered":
      case "accepted":
      case "admitted":
         return "approved";
      case "rejected":
      case "denied":
         return "denied";
      case "under_review":
         return "under_review";
      case "pending":
      default:
         return "pending";
   }
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

            return raw.map((item: any): AdmissionApplication => {
               // Normalize status — backend sends mixed case ("ACCEPTED", "pending")
               const rawStatus = (item.status ?? item.admission_status ?? "pending").toLowerCase();
               const status = mapListStatus(rawStatus);

               return {
                  id: item.id,
                  applicant_id: item.applicant_id,   // ← correct: used for navigation
                  admission_cycle_id: item.admission_cycle_id ?? "N/A",
                  session: item.session ?? "N/A",
                  status,
                  personal_info: {
                     first_name: item.personal_info?.first_name ?? "",
                     last_name: item.personal_info?.last_name ?? "",
                     middle_name: item.personal_info?.middle_name ?? "",
                     date_of_birth: item.personal_info?.date_of_birth ?? "",
                     gender: (item.personal_info?.gender ?? "male").toLowerCase() as "male" | "female",
                     nationality: item.personal_info?.nationality ?? "Nigeria",
                     state_of_origin: item.personal_info?.state_of_origin ?? "",
                     lga: item.personal_info?.lga ?? "",
                     phone: item.personal_info?.phone ?? "",
                     email: item.personal_info?.email ?? "",
                     address: item.personal_info?.address ?? "",
                     passport_url: item.personal_info?.passport_url ?? "/avatars/default_result_image.jpg",
                  },
                  next_of_kin: null,
                  academic_records: item.academic_records ?? [],
                  program_choice: {
                     first_choice_program_id: String(item.program_choice?.first_choice_program_id ?? "N/A"),
                     first_choice_program_name: item.program_choice?.first_choice_program_name ?? "Not specified",
                     second_choice_program_id: String(item.program_choice?.second_choice_program_id ?? "N/A"),
                     second_choice_program_name: item.program_choice?.second_choice_program_name ?? "N/A",
                     entry_mode: (item.program_choice?.entry_mode ?? "utme") as "utme" | "direct_entry" | "transfer",
                     jamb_reg_no: item.program_choice?.jamb_reg_no ?? "N/A",
                     jamb_score: item.program_choice?.jamb_score ?? 0,
                  },
                  documents: Array.isArray(item.documents)
                     ? item.documents
                        .filter((d: any) => typeof d === "string" ? d : d?.url)
                        .map((d: any, i: number) =>
                           typeof d === "string"
                              ? { id: `doc-${i}`, name: `Document ${i + 1}`, type: "other", url: d, uploaded_at: item.updated_at }
                              : d
                        )
                     : [],
                  submitted_at: item.submitted_at ?? item.created_at ?? new Date().toISOString(),
                  reviewed_at: item.reviewed_at ?? null,
                  reviewed_by: item.reviewed_by ?? null,
                  denial_reason: item.denial_reason ?? null,
                  created_at: item.created_at ?? new Date().toISOString(),
                  updated_at: item.updated_at ?? new Date().toISOString(),
               };
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
