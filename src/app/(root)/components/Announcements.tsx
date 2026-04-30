import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertCircle, Calendar, Users, Award } from "lucide-react";
import Link from "next/link";

const announcements = [
    {
        title: "2025/2026 Regular Course Registration Commences",
        date: "April 15, 2025",
        description: "Course registration for the 2025/2026 academic session is now active. All students are advised to pay their school fees and register their courses online via the portal to avoid late entry penalties.",
        icon: Calendar,
        type: "important",
    },
    {
        title: "UNIZIK Research Conference: Call for Abstracts",
        date: "April 12, 2025",
        description: "The University Senate invites submissions for the upcoming multidisciplinary symposium. Submit your abstracts to the faculty secretariat by May 30th, 2025.",
        icon: Award,
        type: "academic",
    },
    {
        title: "Notice of ICT Portal Maintenance",
        date: "April 10, 2025",
        description: "The UNIZIK digital portal will be down for scheduled maintenance on April 20th. Please complete all pending online registrations before 2:00 AM to avoid data loss.",
        icon: AlertCircle,
        type: "alert",
    },
    {
        title: "SUG General Elections - E-Voting Schedule",
        date: "April 8, 2025",
        description: "Great Zikites! Cast your votes for the Student Union Government elections. Voting will take place via the e-platform on April 25-26, 2025. Exercise your franchise!",
        icon: Users,
        type: "community",
    },
];

export default function Announcements() {
    return (
        <Card className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-gray-700/30">
            <CardHeader className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#23608c] dark:text-blue-400">Announcements</h2>
                <Link
                    href="#"
                    className="text-sm font-medium text-[#d25400] dark:text-orange-400 hover:text-[#b34800] dark:hover:text-orange-300"
                >
                    View all
                </Link>
            </CardHeader>

            <CardContent className="space-y-6">
                {announcements.map((announcement, index) => (
                    <div
                        key={index}
                        className="flex gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
                    >
                        <div
                            className={`
                        flex-shrink-0 p-2 rounded-full
                        ${announcement.type === 'important' ? 'bg-red-100 dark:bg-red-900/30' : ''}
                        ${announcement.type === 'academic' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                        ${announcement.type === 'alert' ? 'bg-amber-100 dark:bg-amber-900/30' : ''}
                        ${announcement.type === 'community' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                    `}
                        >
                            <announcement.icon
                                className={`h-5 w-5
                            ${announcement.type === 'important' ? 'text-red-500 dark:text-red-400' : ''}
                            ${announcement.type === 'academic' ? 'text-blue-500 dark:text-blue-400' : ''}
                            ${announcement.type === 'alert' ? 'text-amber-500 dark:text-amber-400' : ''}
                            ${announcement.type === 'community' ? 'text-green-500 dark:text-green-400' : ''}
                        `}
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold dark:text-white">{announcement.title}</h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{announcement.date}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{announcement.description}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}