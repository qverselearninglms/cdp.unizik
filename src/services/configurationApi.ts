import { createApiMutationOptions, createApiQueryOptions } from "@/lib/clients/apiClient";
// import apiClient from "@/lib/clients/apiClient";
import { dummySettingsApi } from "@/services/dummyData";
import type {
   Setting,
   CreateSettingPayload,
   UpdateSettingPayload,
   SettingsQueryParams,
   ApiListResponse,
   ApiSingleResponse,
} from "@/types/school";

const AUTH = { access_token: true };

// ── Settings REST layer ──────────────────────
// Each method calls the dummy API today.
// Uncomment the apiClient line and remove the dummy call when the backend is ready.

export const settingsApi = {
   list: async (params?: SettingsQueryParams): Promise<ApiListResponse<Setting>> => {
      return dummySettingsApi.list(params);
      // return apiClient.get<ApiListResponse<Setting>>("/api/v1/configuration/settings", { ...AUTH, params })
   },

   getById: async (id: number): Promise<ApiSingleResponse<Setting>> => {
      return dummySettingsApi.getById(id);
      // return apiClient.get<ApiSingleResponse<Setting>>(`/api/v1/configuration/settings/${id}`, AUTH)
   },

   getByKey: async (key: string): Promise<ApiSingleResponse<Setting>> => {
      return dummySettingsApi.getByKey(key);
      // return apiClient.get<ApiSingleResponse<Setting>>(`/api/v1/configuration/settings/key/${key}`, AUTH)
   },

   create: async (payload: CreateSettingPayload): Promise<ApiSingleResponse<Setting>> => {
      return dummySettingsApi.create(payload);
      // return apiClient.post<ApiSingleResponse<Setting>, CreateSettingPayload>("/api/v1/configuration/settings", payload, AUTH)
   },

   update: async (id: number, payload: UpdateSettingPayload): Promise<ApiSingleResponse<Setting>> => {
      return dummySettingsApi.update(id, payload);
      // return apiClient.patch<ApiSingleResponse<Setting>, UpdateSettingPayload>(`/api/v1/configuration/settings/${id}`, payload, AUTH)
   },

   remove: async (id: number): Promise<{ message: string }> => {
      return dummySettingsApi.remove(id);
      // return apiClient.delete<{ message: string }>(`/api/v1/configuration/settings/${id}`, AUTH)
   },
};

// ── Query keys ───────────────────────────────

export const configurationKeys = {
   all: ["configuration"] as const,
   settings: () => [...configurationKeys.all, "settings"] as const,
   settingsByGroup: (group: string) => [...configurationKeys.settings(), group] as const,
   settingDetail: (id: number) => [...configurationKeys.settings(), String(id)] as const,
};

// ── Query options ────────────────────────────

export const configurationQueryOptions = {
   settings: (params?: SettingsQueryParams) =>
      createApiQueryOptions({
         queryKey: params?.group
            ? configurationKeys.settingsByGroup(params.group)
            : configurationKeys.settings(),
         queryFn: async () => (await settingsApi.list(params)).data,
      }),

   settingDetail: (id: number) =>
      createApiQueryOptions({
         queryKey: configurationKeys.settingDetail(id),
         queryFn: async () => (await settingsApi.getById(id)).data,
      }),
};

// ── Mutation options ─────────────────────────

export const configurationMutationOptions = {
   create: () =>
      createApiMutationOptions<ApiSingleResponse<Setting>, CreateSettingPayload>({
         mutationKey: [...configurationKeys.settings(), "create"],
         mutationFn: settingsApi.create,
      }),

   update: () =>
      createApiMutationOptions<
         ApiSingleResponse<Setting>,
         { id: number; payload: UpdateSettingPayload }
      >({
         mutationKey: [...configurationKeys.settings(), "update"],
         mutationFn: ({ id, payload }) => settingsApi.update(id, payload),
      }),

   remove: () =>
      createApiMutationOptions<{ message: string }, number>({
         mutationKey: [...configurationKeys.settings(), "delete"],
         mutationFn: settingsApi.remove,
      }),
};
