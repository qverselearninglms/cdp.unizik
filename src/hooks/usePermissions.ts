// hooks/usePermissions.ts

import { useCallback } from "react";
import { useAuth } from "./use-auth";

// Mirror whatever role strings your backend returns
export type AppRole  =
    | "admin"
    | "super_admin"
    | "student"
    | "teacher"
    | "applicant";

export function usePermissions() {
    const auth = useAuth();
    const user = auth.user;
    const userRole = user?.role.toLowerCase();

    const hasRole = useCallback(
        (...roles: AppRole []): boolean => {
            if (!userRole) return false;
            return roles.includes(userRole as AppRole );
        },
        [userRole]
    );

    const hasAnyRole = useCallback(
        (roles: AppRole []): boolean => hasRole(...roles),
        [hasRole]
    );

    const isAdmin = hasRole("admin", "super_admin");
    const isStudent = hasRole("student", "applicant");
    const isStaff = hasRole("teacher");

    return {
        user,
        hasRole,
        hasAnyRole,
        isAdmin,
        isStudent,
        isStaff,
    };
}