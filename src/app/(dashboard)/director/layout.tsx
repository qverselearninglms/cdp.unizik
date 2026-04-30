import { SITE_NAME, UserRole } from "@/config";
import { Metadata } from "next";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = {
    title: `${SITE_NAME}`,
    description: "Director Dashboard",
};

const layout = async ({ children }: { children: React.ReactNode }) => {

    return (
        <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.DIRECTOR]}>
            {children}
        </ProtectedRoute>
    )
}

export default layout
