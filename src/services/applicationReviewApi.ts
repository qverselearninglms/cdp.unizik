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
         "/api/v1/application/student-application",
         { params }
      );
   },

   /**
    * Admin: fetch a single application by its payment ID.
    * (Your API uses ?application_payment_id=X as the per-record lookup.)
    */
   getById: async (applicationPaymentId: string) => {
      return apiClient.get<ApiSingleResponse<AdmissionApplication>>(
         "/api/v1/application/student-application",
         { params: { application_payment_id: applicationPaymentId } }
      );
   },

   /**
    * Admin: fetch application(s) for a specific user.
    */
   getByApplicantId: async (userId: string | number) => {
      return apiClient.get<ApiSingleResponse<AdmissionApplication>>(
         "/api/v1/application/student-application",
         { params: { user_id: userId } }
      );
   },

   /**
    * Student: fetch own application.
    */
   getMyApplication: async () => {
      return apiClient.get<ApiSingleResponse<AdmissionApplication>>(
         "/api/v1/application/my-application"
      );
   },

   /**
    * Update editable fields on an application.
    */
   update: async (id: string, payload: UpdateApplicationPayload) => {
      return apiClient.put<ApiSingleResponse<AdmissionApplication>>(
         "/api/v1/application/update-application-form",
         { id, ...payload }
      );
   },

   /**
    * Admin: approve or deny an application.
    * Adjust the endpoint path if your backend differs.
    */
   review: async (id: string, payload: ReviewApplicationPayload) => {
      return apiClient.patch<ApiSingleResponse<AdmissionApplication>>(
         `/api/v1/application/student-application/${id}/review`,
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

   detail: (applicationPaymentId: string) =>
      [
         ...applicationReviewKeys.all,
         "detail",
         applicationPaymentId,
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
            // Normalise: some endpoints return { data: T[] }, others { data: { data: T[] } }
            const payload = res.data;
            if (Array.isArray(payload)) return payload;
            if ("data" in payload && Array.isArray((payload as ApiListResponse<AdmissionApplication>).data)) {
               return (payload as ApiListResponse<AdmissionApplication>).data;
            }
            return [] as AdmissionApplication[];
         },
      }),

   detail: (applicationPaymentId: string) =>
      createApiQueryOptions({
         queryKey: applicationReviewKeys.detail(applicationPaymentId),
         queryFn: async () => {
            const res = await applicationReviewApi.getById(applicationPaymentId);
            return res.data as unknown as AdmissionApplication;
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
//       // return apiClient.get<ApiListResponse<AdmissionApplication>>(`/api/v1/admission-applications`, AUTH, { params: filters })
//    },

//    getById: async (id: string) => {
//       return dummyAdmissionApplicationApi.getById(id);
//       // return apiClient.get<ApiSingleResponse<AdmissionApplication>>(`/api/v1/admission-applications/${id}`, AUTH)
//    },

//    getByApplicantId: async (applicantId: string) => {
//       return dummyAdmissionApplicationApi.getByApplicantId(applicantId);
//       // return apiClient.get<ApiSingleResponse<AdmissionApplication>>(`/api/v1/admission-applications/applicant/${applicantId}`, AUTH)
//    },

//    update: async (id: string, payload: UpdateApplicationPayload) => {
//       return dummyAdmissionApplicationApi.update(id, payload);
//       // return apiClient.put<ApiSingleResponse<AdmissionApplication>, UpdateApplicationPayload>(`/api/v1/admission-applications/${id}`, payload, AUTH)
//    },

//    review: async (id: string, payload: ReviewApplicationPayload) => {
//       return dummyAdmissionApplicationApi.review(id, payload);
//       // return apiClient.patch<ApiSingleResponse<AdmissionApplication>, ReviewApplicationPayload>(`/api/v1/admission-applications/${id}/review`, payload, AUTH)
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
