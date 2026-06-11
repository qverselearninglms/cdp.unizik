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
   update: async (id: string, payload: UpdateApplicationPayload) => {
      return apiClient.put<ApiSingleResponse<AdmissionApplication>>(
         "/application/update-application-form",
         { id, ...payload }
      );
   },

   /**
    * Admin: approve or deny an application.
    * Adjust the endpoint path if your backend differs.
    */
   review: async (id: string, payload: ReviewApplicationPayload) => {
      return apiClient.post<ApiSingleResponse<AdmissionApplication>>(
         // `/application/all-applications/${id}/review`,
         `/admission/respond`,
         payload
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
            // Return the data array directly
            return (res.data as any) || [];
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
            return transformApiApplication(targetData.student_info, targetData.application_info);
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

// export const applicationReviewQueryOptions = {
//    list: (filters?: ListFilters, adminParams?: AdminApplicationParams) =>
//       createApiQueryOptions({
//          queryKey: applicationReviewKeys.list(filters, adminParams),
//          queryFn: async () => {
//             const res = await applicationReviewApi.list(filters, adminParams);
//             // Normalise: some endpoints return { data: T[] }, others { data: { data: T[] } }
//             const payload = res.data;
//             if (Array.isArray(payload)) return payload;
//             if ("data" in payload && Array.isArray((payload as ApiListResponse<AdmissionApplication>).data)) {
//                return (payload as ApiListResponse<AdmissionApplication>).data;
//             }
//             return [] as AdmissionApplication[];
//          },
//       }),

//    detail: (student_info: string) =>
//       createApiQueryOptions({
//          queryKey: applicationReviewKeys.detail(student_info),
//          queryFn: async () => {
//             const res = await applicationReviewApi.getById(student_info);
//             return res.data as unknown as AdmissionApplication;
//          },
//       }),

//    byApplicant: (userId: string | number) =>
//       createApiQueryOptions({
//          queryKey: applicationReviewKeys.byApplicant(userId),
//          queryFn: async () => {
//             const res = await applicationReviewApi.getByApplicantId(userId);
//             return res.data as unknown as AdmissionApplication;
//          },
//       }),

//    mine: () =>
//       createApiQueryOptions({
//          queryKey: applicationReviewKeys.mine(),
//          queryFn: async () => {
//             const res = await applicationReviewApi.getMyApplication();
//             return res.data as unknown as AdmissionApplication;
//          },
//       }),
// };

// ── Mutation options ─────────────────────────────────────────────────────────

export const applicationReviewMutationOptions = {
   update: () =>
      createApiMutationOptions<
         ApiSingleResponse<AdmissionApplication>,
         { id: string; payload: UpdateApplicationPayload }
      >({
         mutationKey: [...applicationReviewKeys.all, "update"],
         mutationFn: ({ id, payload }) =>
            applicationReviewApi.update(id, payload) as unknown as Promise<ApiSingleResponse<AdmissionApplication>>,
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

// Add this helper function
export function transformApiApplication(student_info: any, application_info: any) {
   // Normalize backend admission states to your application view review tokens
   let status: ApplicationReviewStatus = "pending";
   if (student_info?.reason_for_denial) {
      status = "denied";
   } else if (student_info?.progress_status === "accepted" || student_info?.admission_status === "offered") {
      status = "approved";
   } else if (student_info?.application_payment_status === "paid") {
      status = "under_review";
   }

   // 1. Compile file uploads dynamically from incoming form object attributes
   const documents: ApplicantDocument[] = [];
   const documentProperties = [
      "first_school_leaving",
      "o_level",
      "degree",
      "ond",
      "hnd",
      "masters",
      "phd",
      "professional",
      "degree_transcript",
      "others"
   ];

   documentProperties.forEach((field) => {
      if (application_info?.[field]) {
         documents.push({
            id: `${field}-${application_info.id}`,
            name: field.replace(/_/g, " ").toUpperCase(),
            type: field === "o_level" ? "o_level" : "other",
            url: application_info[field],
            uploaded_at: application_info.updated_at || new Date().toISOString(),
         });
      }
   });

   // 2. Parse structural academic entries
   const academic_records: ApplicantAcademicRecord[] = [];
   if (application_info?.university || application_info?.undergraduateDegree) {
      academic_records.push({
         institution: application_info.university || "Not Specified",
         qualification: application_info.undergraduateDegree || "N/A",
         year_obtained: application_info.graduationYear || "N/A",
         grade: application_info.gpa || "N/A",
         certificate_url: application_info.degree || null,
      });
   }

   // Append a fallback placeholder row to keep array bindings safe if empty
   if (academic_records.length === 0) {
      academic_records.push({
         institution: "No records captured",
         qualification: "N/A",
         year_obtained: "N/A",
         grade: "N/A",
         certificate_url: '',
      });
   }

   // Return values matching your component layout expectations 
   return {
      id: String(student_info?.id || application_info?.user_id || ""),
      session: student_info?.academic_session || "N/A",
      status,
      denial_reason: student_info?.reason_for_denial || null,
      reviewed_by: "System Admin",
      reviewed_at: student_info?.updated_at || null,
      personal_info: {
         first_name: student_info?.first_name || "",
         last_name: student_info?.last_name || "",
         middle_name: student_info?.other_name || "",
         passport_url: application_info?.passport || "/placeholder-avatar.png", // Provide fallback placeholder path
         email: student_info?.email || "",
         date_of_birth: application_info?.dob || "",
         gender: (application_info?.gender || "other").toLowerCase() as "male" | "female" | "other",
         nationality: student_info?.nationality || "Nigeria",
         state_of_origin: student_info?.state || "",
         lga: application_info?.lga || "",
         phone: student_info?.phone_number || "",
         address: application_info?.contact_address || application_info?.hometown_address || "No address supplied",
      },
      program_choice: {
         first_choice_program_name: student_info?.program || "N/A",
         second_choice_program_name: "N/A",
         entry_mode: (application_info?.studyMode || "utme") as "utme" | "direct_entry" | "transfer",
         jamb_reg_no: student_info?.reg_number || "N/A",
         jamb_score: 0, // Fallback if JAMB metrics aren't inside student_info schema
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










// import {
//    createApiMutationOptions,
//    createApiQueryOptions,
// } from "@/lib/clients/apiClient";
// import { dummyAdmissionApplicationApi } from "@/services/dummyData";
// import type {
//    AdmissionApplication,
//    ApiSingleResponse,
//    UpdateApplicationPayload,
//    ReviewApplicationPayload,
// } from "@/types/school";

// export const applicationReviewApi = {
//    list: async (filters?: { status?: string }) => {
//       return dummyAdmissionApplicationApi.list(filters);
//       // return apiClient.get<ApiListResponse<AdmissionApplication>>(`/admission-applications`, AUTH, { params: filters })
//    },

//    getById: async (id: string) => {
//       return dummyAdmissionApplicationApi.getById(id);
//       // return apiClient.get<ApiSingleResponse<AdmissionApplication>>(`/admission-applications/${id}`, AUTH)
//    },

//    getByApplicantId: async (applicantId: string) => {
//       return dummyAdmissionApplicationApi.getByApplicantId(applicantId);
//       // return apiClient.get<ApiSingleResponse<AdmissionApplication>>(`/admission-applications/applicant/${applicantId}`, AUTH)
//    },

//    update: async (id: string, payload: UpdateApplicationPayload) => {
//       return dummyAdmissionApplicationApi.update(id, payload);
//       // return apiClient.put<ApiSingleResponse<AdmissionApplication>, UpdateApplicationPayload>(`/admission-applications/${id}`, payload, AUTH)
//    },

//    review: async (id: string, payload: ReviewApplicationPayload) => {
//       return dummyAdmissionApplicationApi.review(id, payload);
//       // return apiClient.patch<ApiSingleResponse<AdmissionApplication>, ReviewApplicationPayload>(`/admission-applications/${id}/review`, payload, AUTH)
//    },
// };

// export const applicationReviewKeys = {
//    all: ["admission-applications"] as const,
//    list: (filters?: { status?: string }) => [...applicationReviewKeys.all, "list", filters ?? {}] as const,
//    detail: (id: string) => [...applicationReviewKeys.all, "detail", id] as const,
//    byApplicant: (applicantId: string) => [...applicationReviewKeys.all, "applicant", applicantId] as const,
// };

// export const applicationReviewQueryOptions = {
//    list: (filters?: { status?: string }) =>
//       createApiQueryOptions({
//          queryKey: applicationReviewKeys.list(filters),
//          queryFn: async () => (await applicationReviewApi.list(filters)).data,
//       }),

//    detail: (id: string) =>
//       createApiQueryOptions({
//          queryKey: applicationReviewKeys.detail(id),
//          queryFn: async () => (await applicationReviewApi.getById(id)).data,
//       }),

//    byApplicant: (applicantId: string) =>
//       createApiQueryOptions({
//          queryKey: applicationReviewKeys.byApplicant(applicantId),
//          queryFn: async () => (await applicationReviewApi.getByApplicantId(applicantId)).data,
//       }),
// };

// export const applicationReviewMutationOptions = {
//    update: () =>
//       createApiMutationOptions<ApiSingleResponse<AdmissionApplication>, { id: string; payload: UpdateApplicationPayload }>({
//          mutationKey: [...applicationReviewKeys.all, "update"],
//          mutationFn: ({ id, payload }) => applicationReviewApi.update(id, payload),
//       }),

//    review: () =>
//       createApiMutationOptions<ApiSingleResponse<AdmissionApplication>, { id: string; payload: ReviewApplicationPayload }>({
//          mutationKey: [...applicationReviewKeys.all, "review"],
//          mutationFn: ({ id, payload }) => applicationReviewApi.review(id, payload),
//       }),
// };
