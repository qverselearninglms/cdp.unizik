import { createApiMutationOptions, createApiQueryOptions } from "@/lib/clients/apiClient";
// import apiClient from "@/lib/clients/apiClient";
import {
   dummyNotificationTemplateApi,
   dummyNotificationApi,
} from "@/services/dummyData";
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

const AUTH = { access_token: true };

// ── Templates REST layer ─────────────────────

export const notificationTemplateApi = {
   list: async (): Promise<TemplateListResponse> => {
      return dummyNotificationTemplateApi.list();
      // return apiClient.get<TemplateListResponse>("/api/v1/notifications/templates", AUTH)
   },

   getById: async (id: number): Promise<{ data: NotificationTemplate }> => {
      return dummyNotificationTemplateApi.getById(id);
      // return apiClient.get<{ data: NotificationTemplate }>(`/api/v1/notifications/templates/${id}`, AUTH)
   },

   create: async (payload: CreateTemplatePayload): Promise<{ data: NotificationTemplate }> => {
      return dummyNotificationTemplateApi.create(payload);
      // return apiClient.post<{ data: NotificationTemplate }, CreateTemplatePayload>("/api/v1/notifications/templates", payload, AUTH)
   },

   update: async (id: number, payload: UpdateTemplatePayload): Promise<{ data: NotificationTemplate }> => {
      return dummyNotificationTemplateApi.update(id, payload);
      // return apiClient.patch<{ data: NotificationTemplate }, UpdateTemplatePayload>(`/api/v1/notifications/templates/${id}`, payload, AUTH)
   },

   remove: async (id: number): Promise<{ message: string }> => {
      return dummyNotificationTemplateApi.remove(id);
      // return apiClient.delete<{ message: string }>(`/api/v1/notifications/templates/${id}`, AUTH)
   },
};

// ── Notifications REST layer ──────────────────

export const notificationApi = {
   list: async (params?: NotificationsQueryParams): Promise<NotificationListResponse> => {
      return dummyNotificationApi.list(params);
      // return apiClient.get<NotificationListResponse>("/api/v1/notifications", { ...AUTH, params })
   },

   getById: async (id: number): Promise<{ data: Notification }> => {
      return dummyNotificationApi.getById(id);
      // return apiClient.get<{ data: Notification }>(`/api/v1/notifications/${id}`, AUTH)
   },

   unreadCount: async (): Promise<{ count: number }> => {
      return dummyNotificationApi.unreadCount();
      // return apiClient.get<{ count: number }>("/api/v1/notifications/unread-count", AUTH)
   },

   send: async (payload: SendNotificationPayload): Promise<{ data: Notification }> => {
      return dummyNotificationApi.send(payload);
      // return apiClient.post<{ data: Notification }, SendNotificationPayload>("/api/v1/notifications", payload, AUTH)
   },

   sendBulk: async (payload: BulkNotificationPayload): Promise<BulkNotificationResponse> => {
      return dummyNotificationApi.sendBulk(payload);
      // return apiClient.post<BulkNotificationResponse, BulkNotificationPayload>("/api/v1/notifications/bulk", payload, AUTH)
   },

   markRead: async (id: number): Promise<{ data: Notification }> => {
      return dummyNotificationApi.markRead(id);
      // return apiClient.patch<{ data: Notification }, Record<string, never>>(`/api/v1/notifications/${id}/read`, {}, AUTH)
   },

   markAllRead: async (): Promise<{ message: string }> => {
      return dummyNotificationApi.markAllRead();
      // return apiClient.patch<{ message: string }, Record<string, never>>("/api/v1/notifications/read-all", {}, AUTH)
   },
};

// ── Query keys ───────────────────────────────

export const notificationKeys = {
   all: ["notifications"] as const,
   templates: () => [...notificationKeys.all, "templates"] as const,
   templateDetail: (id: number) => [...notificationKeys.templates(), String(id)] as const,
   list: (params?: NotificationsQueryParams) =>
      [...notificationKeys.all, "list", params ?? {}] as const,
   unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

// ── Query options ────────────────────────────

export const notificationQueryOptions = {
   templates: () =>
      createApiQueryOptions({
         queryKey: notificationKeys.templates(),
         queryFn: async () => (await notificationTemplateApi.list()).data,
      }),

   templateDetail: (id: number) =>
      createApiQueryOptions({
         queryKey: notificationKeys.templateDetail(id),
         queryFn: async () => (await notificationTemplateApi.getById(id)).data,
      }),

   notifications: (params?: NotificationsQueryParams) =>
      createApiQueryOptions({
         queryKey: notificationKeys.list(params),
         queryFn: async () => await notificationApi.list(params),
      }),

   unreadCount: () =>
      createApiQueryOptions({
         queryKey: notificationKeys.unreadCount(),
         queryFn: async () => (await notificationApi.unreadCount()).count,
      }),
};

// ── Mutation options ─────────────────────────

export const notificationMutationOptions = {
   createTemplate: () =>
      createApiMutationOptions<{ data: NotificationTemplate }, CreateTemplatePayload>({
         mutationKey: [...notificationKeys.templates(), "create"],
         mutationFn: notificationTemplateApi.create,
      }),

   updateTemplate: () =>
      createApiMutationOptions<
         { data: NotificationTemplate },
         { id: number; payload: UpdateTemplatePayload }
      >({
         mutationKey: [...notificationKeys.templates(), "update"],
         mutationFn: ({ id, payload }) => notificationTemplateApi.update(id, payload),
      }),

   deleteTemplate: () =>
      createApiMutationOptions<{ message: string }, number>({
         mutationKey: [...notificationKeys.templates(), "delete"],
         mutationFn: notificationTemplateApi.remove,
      }),

   send: () =>
      createApiMutationOptions<{ data: Notification }, SendNotificationPayload>({
         mutationKey: [...notificationKeys.all, "send"],
         mutationFn: notificationApi.send,
      }),

   sendBulk: () =>
      createApiMutationOptions<BulkNotificationResponse, BulkNotificationPayload>({
         mutationKey: [...notificationKeys.all, "send-bulk"],
         mutationFn: notificationApi.sendBulk,
      }),

   markRead: () =>
      createApiMutationOptions<{ data: Notification }, number>({
         mutationKey: [...notificationKeys.all, "mark-read"],
         mutationFn: notificationApi.markRead,
      }),

   markAllRead: () =>
      createApiMutationOptions<{ message: string }, void>({
         mutationKey: [...notificationKeys.all, "mark-all-read"],
         mutationFn: notificationApi.markAllRead,
      }),
};
