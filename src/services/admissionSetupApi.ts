import {
    createApiMutationOptions,
    createApiQueryOptions,
} from "@/lib/clients/apiClient";
import {
    dummyAdmissionCycleApi,
    dummyAdmissionRequirementApi,
} from "@/services/dummyData";
import type {
    AdmissionCycle,
    AdmissionRequirement,
    AdmissionStatus,
    ApiSingleResponse,
    CreateAdmissionCyclePayload,
    CreateAdmissionRequirementPayload,
    UpdateAdmissionCyclePayload,
} from "@/types/school";

export const admissionSetupApi = {
    listCyclesBySession: async (sessionId: string) => {
        return dummyAdmissionCycleApi.listBySession(sessionId);
        // return apiClient.get<ApiListResponse<AdmissionCycle>>(`/api/v1/academic-sessions/${sessionId}/admission-cycles`, AUTH)
    },

    getCycleById: async (id: string) => {
        return dummyAdmissionCycleApi.getById(id);
        // return apiClient.get<ApiSingleResponse<AdmissionCycle>>(`/api/v1/admission-cycles/${id}`, AUTH)
    },

    createCycle: async (payload: CreateAdmissionCyclePayload) => {
        return dummyAdmissionCycleApi.create(payload);
        // return apiClient.post<ApiSingleResponse<AdmissionCycle>, CreateAdmissionCyclePayload>("/api/v1/admission-cycles", payload, AUTH)
    },

    updateCycle: async (id: string, payload: UpdateAdmissionCyclePayload) => {
        return dummyAdmissionCycleApi.update(id, payload);
        // return apiClient.put<ApiSingleResponse<AdmissionCycle>, UpdateAdmissionCyclePayload>(`/api/v1/admission-cycles/${id}`, payload, AUTH)
    },

    deleteCycle: async (id: string) => {
        return dummyAdmissionCycleApi.remove(id);
        // return apiClient.delete<{ message: string }>(`/api/v1/admission-cycles/${id}`, AUTH)
    },

    updateCycleStatus: async (id: string, status: AdmissionStatus) => {
        return dummyAdmissionCycleApi.updateStatus(id, status);
        // return apiClient.patch<ApiSingleResponse<AdmissionCycle>, { status: AdmissionStatus }>(`/api/v1/admission-cycles/${id}/status`, { status }, AUTH)
    },

    listRequirementsByCycle: async (cycleId: string) => {
        return dummyAdmissionRequirementApi.listByCycle(cycleId);
        // return apiClient.get<ApiListResponse<AdmissionRequirement>>(`/api/v1/admission-cycles/${cycleId}/requirements`, AUTH)
    },

    createRequirement: async (payload: CreateAdmissionRequirementPayload) => {
        return dummyAdmissionRequirementApi.create(payload);
        // return apiClient.post<ApiSingleResponse<AdmissionRequirement>, CreateAdmissionRequirementPayload>("/api/v1/admission-requirements", payload, AUTH)
    },

    deleteRequirement: async (id: string) => {
        return dummyAdmissionRequirementApi.remove(id);
        // return apiClient.delete<{ message: string }>(`/api/v1/admission-requirements/${id}`, AUTH)
    },
};

export const admissionSetupKeys = {
    all: ["admission-setup"] as const,
    cyclesBySession: (sessionId: string) => [...admissionSetupKeys.all, "cycles", sessionId] as const,
    cycleDetail: (id: string) => [...admissionSetupKeys.all, "cycles", id] as const,
    requirementsByCycle: (cycleId: string) => [...admissionSetupKeys.all, "requirements", cycleId] as const,
};

export const admissionSetupQueryOptions = {
    cyclesBySession: (sessionId: string) =>
        createApiQueryOptions({
            queryKey: admissionSetupKeys.cyclesBySession(sessionId),
            queryFn: async () => (await admissionSetupApi.listCyclesBySession(sessionId)).data,
        }),

    cycleDetail: (id: string) =>
        createApiQueryOptions({
            queryKey: admissionSetupKeys.cycleDetail(id),
            queryFn: async () => (await admissionSetupApi.getCycleById(id)).data,
        }),

    requirementsByCycle: (cycleId: string) =>
        createApiQueryOptions({
            queryKey: admissionSetupKeys.requirementsByCycle(cycleId),
            queryFn: async () => (await admissionSetupApi.listRequirementsByCycle(cycleId)).data,
        }),
};

export const admissionSetupMutationOptions = {
    createCycle: () =>
        createApiMutationOptions<ApiSingleResponse<AdmissionCycle>, CreateAdmissionCyclePayload>({
            mutationKey: [...admissionSetupKeys.all, "cycles", "create"],
            mutationFn: admissionSetupApi.createCycle,
        }),

    updateCycle: () =>
        createApiMutationOptions<
            ApiSingleResponse<AdmissionCycle>,
            { id: string; payload: UpdateAdmissionCyclePayload }
        >({
            mutationKey: [...admissionSetupKeys.all, "cycles", "update"],
            mutationFn: ({ id, payload }) => admissionSetupApi.updateCycle(id, payload),
        }),

    deleteCycle: () =>
        createApiMutationOptions<{ message: string }, string>({
            mutationKey: [...admissionSetupKeys.all, "cycles", "delete"],
            mutationFn: admissionSetupApi.deleteCycle,
        }),

    updateCycleStatus: () =>
        createApiMutationOptions<ApiSingleResponse<AdmissionCycle>, { id: string; status: AdmissionStatus }>({
            mutationKey: [...admissionSetupKeys.all, "cycles", "status"],
            mutationFn: ({ id, status }) => admissionSetupApi.updateCycleStatus(id, status),
        }),

    createRequirement: () =>
        createApiMutationOptions<ApiSingleResponse<AdmissionRequirement>, CreateAdmissionRequirementPayload>({
            mutationKey: [...admissionSetupKeys.all, "requirements", "create"],
            mutationFn: admissionSetupApi.createRequirement,
        }),

    deleteRequirement: () =>
        createApiMutationOptions<{ message: string }, string>({
            mutationKey: [...admissionSetupKeys.all, "requirements", "delete"],
            mutationFn: admissionSetupApi.deleteRequirement,
        }),
};
