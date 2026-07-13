"use client";

// import ProtectedRoute from "@/components/ProtectedRoute";
import { Navigation } from "@/components/navigation/Navigation";
// import { UserRole } from "@/config";
import type { Metadata } from "next";
import { useAdmissionStore } from "./store/admissionStore";
import { useEffect } from "react";

// export const metadata: Metadata = {
//     title: "Admission Process | QHUB University Portal",
//     description: "Complete your admission process — pay fees, submit forms, and get enrolled.",
// };

export default function AdmissionLayout({
    children,
}: {
    children: React.ReactNode;
    }) {
    const fetchFeatureData = useAdmissionStore((s) => s.fetchFeatureData);
    useEffect(() => {
        fetchFeatureData(); // called once on mount
    }, []);

    return (
        // <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <div className="relative min-h-screen bg-background">
                {/* Subtle background pattern */}
                <div
                    className="pointer-events-none fixed inset-0 opacity-[0.015] dark:opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                        backgroundSize: "32px 32px",
                    }}
                />

                {/* Top decorative gradient */}
                <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-linear-to-b from-primary/3 to-transparent dark:from-primary/6" />

                <div className="relative z-10">
                    {/* Navigation */}
                    <Navigation />
                    {/* Main content */}
                    {children}
                </div>
            </div>
        // </ProtectedRoute>
    );
}