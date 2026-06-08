// ──────────────────────────────────────────────
// Notification Module Types
// ──────────────────────────────────────────────

export type NotificationChannel = "EMAIL" | "SMS" | "IN_APP" | "PUSH";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "READ";

// ── Template ─────────────────────────────────

export interface NotificationTemplate {
    id: number;
    name: string;           // unique slug e.g. "welcome_email"
    subject: string;        // supports {{variable}} interpolation
    body: string;
    channel: NotificationChannel;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTemplatePayload {
    name: string;
    subject: string;
    body: string;
    channel: NotificationChannel;
}

export interface UpdateTemplatePayload {
    name?: string;
    subject?: string;
    body?: string;
    channel?: NotificationChannel;
    isActive?: boolean;
}

// ── Notification ─────────────────────────────

export interface Notification {
    id: number;
    userId: number;
    userEmail?: string;    // denormalized for display
    userName?: string;     // denormalized for display
    templateId?: number;
    subject: string;
    body: string;
    channel: NotificationChannel;
    status: NotificationStatus;
    sentAt: string | null;
    readAt: string | null;
    createdAt: string;
}

export interface SendNotificationPayload {
    userId: number;
    templateId?: number;
    subject: string;
    body: string;
    channel: NotificationChannel;
}

export interface BulkNotificationPayload {
    userIds: number[];
    templateId?: number;
    subject: string;
    body: string;
    channel: NotificationChannel;
}

export interface BulkNotificationResponse {
    sent: number;
    errors: { userId: number; message: string }[];
}

export interface MarkReadPayload {
    id: number;
}

// ── Query Params ─────────────────────────────

export interface NotificationsQueryParams {
    status?: NotificationStatus;
    channel?: NotificationChannel;
    page?: number;
    limit?: number;
}

export interface TemplatesQueryParams {
    page?: number;
    limit?: number;
}

// ── API Response helpers ─────────────────────

export interface NotificationListMeta {
    total: number;
    page: number;
    limit: number;
    unreadCount?: number;
}

export interface NotificationListResponse {
    data: Notification[];
    meta: NotificationListMeta;
}

export interface TemplateListResponse {
    data: NotificationTemplate[];
    meta: { total: number; page: number; limit: number };
}
