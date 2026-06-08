import {
   createApiMutationOptions,
   createApiQueryOptions,
} from "@/lib/clients/apiClient";
import { dummyAdmissionApplicationApi } from "@/services/dummyData";
import type {
   AdmissionApplication,
   ApiSingleResponse,
   UpdateApplicationPayload,
   ReviewApplicationPayload,
} from "@/types/school";

export const applicationReviewApi = {
   list: async (filters?: { status?: string }) => {
      return dummyAdmissionApplicationApi.list(filters);
      // return apiClient.get<ApiListResponse<AdmissionApplication>>(`/api/v1/admission-applications`, AUTH, { params: filters })
   },

   getById: async (id: string) => {
      return dummyAdmissionApplicationApi.getById(id);
      // return apiClient.get<ApiSingleResponse<AdmissionApplication>>(`/api/v1/admission-applications/${id}`, AUTH)
   },

   getByApplicantId: async (applicantId: string) => {
      return dummyAdmissionApplicationApi.getByApplicantId(applicantId);
      // return apiClient.get<ApiSingleResponse<AdmissionApplication>>(`/api/v1/admission-applications/applicant/${applicantId}`, AUTH)
   },

   update: async (id: string, payload: UpdateApplicationPayload) => {
      return dummyAdmissionApplicationApi.update(id, payload);
      // return apiClient.put<ApiSingleResponse<AdmissionApplication>, UpdateApplicationPayload>(`/api/v1/admission-applications/${id}`, payload, AUTH)
   },

   review: async (id: string, payload: ReviewApplicationPayload) => {
      return dummyAdmissionApplicationApi.review(id, payload);
      // return apiClient.patch<ApiSingleResponse<AdmissionApplication>, ReviewApplicationPayload>(`/api/v1/admission-applications/${id}/review`, payload, AUTH)
   },
};

export const applicationReviewKeys = {
   all: ["admission-applications"] as const,
   list: (filters?: { status?: string }) => [...applicationReviewKeys.all, "list", filters ?? {}] as const,
   detail: (id: string) => [...applicationReviewKeys.all, "detail", id] as const,
   byApplicant: (applicantId: string) => [...applicationReviewKeys.all, "applicant", applicantId] as const,
};

export const applicationReviewQueryOptions = {
   list: (filters?: { status?: string }) =>
      createApiQueryOptions({
         queryKey: applicationReviewKeys.list(filters),
         queryFn: async () => (await applicationReviewApi.list(filters)).data,
      }),

   detail: (id: string) =>
      createApiQueryOptions({
         queryKey: applicationReviewKeys.detail(id),
         queryFn: async () => (await applicationReviewApi.getById(id)).data,
      }),

   byApplicant: (applicantId: string) =>
      createApiQueryOptions({
         queryKey: applicationReviewKeys.byApplicant(applicantId),
         queryFn: async () => (await applicationReviewApi.getByApplicantId(applicantId)).data,
      }),
};

export const applicationReviewMutationOptions = {
   update: () =>
      createApiMutationOptions<ApiSingleResponse<AdmissionApplication>, { id: string; payload: UpdateApplicationPayload }>({
         mutationKey: [...applicationReviewKeys.all, "update"],
         mutationFn: ({ id, payload }) => applicationReviewApi.update(id, payload),
      }),

   review: () =>
      createApiMutationOptions<ApiSingleResponse<AdmissionApplication>, { id: string; payload: ReviewApplicationPayload }>({
         mutationKey: [...applicationReviewKeys.all, "review"],
         mutationFn: ({ id, payload }) => applicationReviewApi.review(id, payload),
      }),
};
