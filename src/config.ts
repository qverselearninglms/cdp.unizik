import { getApiHost } from "./lib/utils";

// APPLICATION BASE URLS
export const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "");
export const remoteApiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "")
export const lmsBaseUrl = (process.env.NEXT_PUBLIC_LMS_BASE_URL ?? "")

export const apiUrl = baseUrl + "/api";
export const remoteApiUrl = remoteApiBaseUrl + "/api/v1";
export const ROOT_IMAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || (remoteApiBaseUrl + "/storage");
export const remoteApiHost = getApiHost(remoteApiBaseUrl);

// APPLICATION BASE CONFIG
export const SITE_SHORT_NAME = "CDP-UNIZIK";
export const SITE_NAME = "CDP - Nnamdi Azikiwe University, Awka";
export const SITE_TITLE = "CDP - Nnamdi Azikiwe University, Awka";

// COOKIE AND SESSION CONFIG
export const ssoSessionKey = "cdp_unizik_sso_auth_session";
export const loginSessionKey = "cdp_unizik_login_session";
export const appSessionKey = "cdp_unizik_session";

export const sessionSecret = process.env.NEXT_PUBLIC_SESSION_SECRET ?? "";
export const sessionPassword =
    process.env.NEXT_PUBLIC_SESSION_PASSWORD ?? "";

const secretKey = process.env.NEXT_PUBLIC_SESSION_SECRET;
export const encodedKey = new TextEncoder().encode(secretKey);
export type PaymentStatus = "FULLY_PAID" | "PART_PAID" | "UNPAID" | null;

export type SessionPayload<T = Record<string, unknown>> = T & {
    issuedAt?: number;
    expiresAt: number;
};
export enum UserRole {
    ADMIN = "ADMIN",
    STUDENT = "STUDENT",
    TEACHER = "TEACHER",
    MANAGER = "MANAGER",
    DIRECTOR = "DIRECTOR",
    PARENT = "PARENT",
}

export const APPLICATION_FEE = 37000;
export const ACCEPTANCE_FEE = 30000;
export const FULL_TUITION_FEE = 195000;

export const APP_CONFIG = {
    name: SITE_NAME,
    short_name: SITE_SHORT_NAME,
    version: "1.0.0",
    apiUrl: remoteApiUrl,
    description: "Unizik Learn - E-Learning Platform for Nnamdi Azikiwe University, Awka",
    keywords: ["Unizik", "Unizik Learn", "E-Learning", "University", "University Portal", "University Student Portal", "Awka", "Nigeria"],
    authors: [{ name: "Unizik LMS" }],
    creator: "Q-verse Limited",
    publisher: "Q-verse Limited",
    icons: [
        { url: "/logo/logo.jpg", sizes: "any" },
        { url: "/logo/logo.jpg", type: "image/jpg" },
    ],
} as const;

export const ROUTES = {
    home: '/',
    login: '/auth/signin',
    dashboard: '/dashboard',
    profile: '/profile',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
} as const;

export const QUERY_KEYS = {
    auth: {
        user: ['auth', 'user'] as const,
        profile: ['auth', 'profile'] as const,
    },
    dashboard: {
        stats: ['dashboard', 'stats'] as const,
    },
} as const;

export const LOCAL_STORAGE_KEYS = {
    accessToken: 'cdp_access_token',
    refreshToken: 'cdp_refresh_token',
    user: 'cdp_user',
    rememberMe: 'cdp_remember_me',
    parentOTP: 'false',
} as const;
