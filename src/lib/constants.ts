import { NavItem, Feature, Program, Stat, FooterSection, CampusHighlights } from "../types";


export const ADMIN_SUBPAGES = [
    { href: '/administration/directors-office', label: "Director's Office" },
    { href: '/administration/administrative-structure', label: 'Administrative Structure' },
    { href: '/administration/units-and-functions', label: 'Units and Functions' },
    { href: '/administration/policies-and-procedures', label: 'Policies and Procedures' },
    { href: '/administration/staff-directory', label: 'Staff Directory' },
    { href: '/administration/committees', label: 'Committees' },
    { href: '/administration/service-charter', label: 'Service Charter' },
     { href: '/administration/contact-administration', label: 'Contact Administration' }
];

export const NAV_ITEMS: NavItem[] = [
    { href: '#home', label: 'Home' },
    { href: '#features', label: 'Features' },
    { href: '#programs', label: 'Programs' },
    { href: '#calender_view', label: 'Updates' },
    { href: '#campus_highlight', label: 'Highlights' },
    { 
        href: '#administration', 
        label: 'Administration',
        isDropdown: true,
        subItems: ADMIN_SUBPAGES 
    },
];

export const FEATURES: Feature[] = [
    {
        icon: '🎓',
        title: 'World-Class Faculty',
        description: 'Learn from distinguished professors and industry experts who bring real-world experience to the classroom.',
    },
    {
        icon: '💼',
        title: 'Industry Connections',
        description: 'Access our extensive network of corporate partners and alumni for internships, mentorship, and career opportunities.',
    },
    {
        icon: '🌍',
        title: 'Global Perspective',
        description: 'Gain international exposure through exchange programs, global case studies, and multicultural learning environments.',
    },
];

export const PROGRAMS: Program[] = [
    {
        courseCode: "CCP-001",
        title: "Financial Management Program",
        description: "Core financial planning, budgeting strategy, and practical cash-flow management for professionals.",
        icon: BadgeDollarSign,
        duration: "1 Month Period",
        tuition: "₦50,000.00",
    },
    {
        courseCode: "CCP-002",
        title: "Human Resource Management Program",
        description: "Workforce planning, performance systems, and modern HR operations for organizational growth.",
        icon: UserRoundPen,
        duration: "2 Months Period",
        tuition: "₦100,000.00",
    },
    {
        courseCode: "CCP-003",
        title: "Sales Management Program",
        description: "Build high-converting sales pipelines, negotiation systems, and customer retention strategies.",
        icon: Briefcase,
        duration: "2 Months Period",
        tuition: "₦50,000.00",
    },
    {
        courseCode: "CCP-004",
        title: "Digital Marketing (e-commerce) Program",
        description: "Practical digital acquisition, social commerce, and analytics for growth-focused e-commerce teams.",
        icon: SendHorizonal,
        duration: "2 Months Period",
        tuition: "₦100,000.00",
    },
    {
        courseCode: "CCP-005",
        title: "Business of Fashion Program",
        description: "Learn fashion business models, merchandising, branding, and market positioning essentials.",
        icon: Flag,
        duration: "2 Months Period",
        tuition: "₦100,000.00",
    },
    {
        courseCode: "CCP-006",
        title: "Business Emotional Intelligence [BEI] Program",
        description: "Strengthen leadership communication, team empathy, and emotional decision-making at work.",
        icon: ShieldUser,
        duration: "2 Months Period",
        tuition: "₦100,000.00",
    },
    {
        courseCode: "CCP-007",
        title: "Graphic Design Essentials for Business and Creatives",
        description: "Master practical visual communication, brand assets, and conversion-oriented design workflows.",
        icon: BookOpen,
        duration: "2 Months Period",
        tuition: "₦100,000.00",
    },
    {
        courseCode: "CCP-008",
        title: "Advanced Certificate in Human Resources Administration",
        description: "Advanced HR administration, policy development, and people analytics for HR leaders.",
        icon: Users,
        duration: "3 Months Period",
        tuition: "₦100,000.00",
    },
    {
        courseCode: "CCP-017",
        title: "Portfolio Management",
        description: "Build resilient portfolios using diversification, risk controls, and performance attribution.",
        icon: PieChart,
        duration: "2 Months Period",
        tuition: "₦500,000.00",
    },
    {
        courseCode: "CCP-018",
        title: "Certificate in Fintech and Digital Banking",
        description: "Understand fintech rails, digital banking products, and payment ecosystem operations.",
        icon: CreditCard,
        duration: "2 Months Period",
        tuition: "₦500,000.00",
    },
    {
        courseCode: "CCP-019",
        title: "Certificate in Data Analytics for Finance and Investment",
        description: "Use modern analytics to evaluate assets, forecast performance, and drive investment decisions.",
        icon: LayoutDashboard,
        duration: "2 Months Period",
        tuition: "₦500,000.00",
    },
    {
        courseCode: "CCP-020",
        title: "Certificate in Financial Modelling and Valuation",
        description: "Hands-on valuation methods and spreadsheet modelling for corporate and capital markets use-cases.",
        icon: DollarSign,
        duration: "2 Months Period",
        tuition: "₦500,000.00",
    },
];

export const CAMPUSHIGHLIGHTS: CampusHighlights[] = [
    {
        title: "Prof. Festus Aghagbo Nwako Library",
        imageUrl: "/campus/ca-1.jpeg",
    },
    {
        title: "Chike Okoli Centre for Entrepreneurial Studies",
        imageUrl: "/campus/ca-2.jpeg",
    },
    {
        title: "UNIZIK Sports Center (Perm Site)",
        imageUrl: "/campus/ca-3.jpeg",
    },
    {
        title: "UNIZIK Halls of Residence",
        imageUrl: "/campus/ca-4.jpeg",
    },
];

export const STATS: Stat[] = [
    { number: '5000+', label: 'Alumni Network' },
    { number: '95%', label: 'Employment Rate' },
    { number: '50+', label: 'Industry Partners' },
    { number: '25', label: 'Years of Excellence' },
];

export const FOOTER_SECTIONS: FooterSection[] = [
    {
        title: 'Quick Links',
        links: [
            { label: 'Programs', href: '#programs' },
            { label: 'Admissions', href: '#admissions' },
            { label: 'Research', href: '#research' },
            { label: 'Faculty', href: '#faculty' },
            { label: 'Careers', href: '#careers' },
        ],
    },
    {
        title: 'Student Resources',
        links: [
            { label: 'Student Portal', href: '/auth/signin' },
            { label: 'Library', href: '#library' },
            { label: 'Academic Calendar', href: '#calendar' },
            { label: 'Student Services', href: '#services' },
            { label: 'Alumni Network', href: '#alumni' },
        ],
    },
];


// AUTH DASHBOARD CONFIG
import {
    BookOpen,
    DollarSign,
    Flag,
    GraduationCap,
    MapPinHouse,
    PieChart,
    UserRoundPen,
    CalendarCheck,
    School2,
    MessageSquare,
    Settings2,
    LucideIcon,
    School,
    ClipboardList,
    BookOpenCheck,
    Gamepad,
    Gamepad2,
    ShieldUser,
    SendHorizonal,
    BanknoteArrowDown,
    Users,
    CreditCard,
    Atom,
    Book,
    Briefcase,
    Code,
    Globe,
    Microscope,
    LayoutDashboard,
    BadgeDollarSign,
    LucideSchool2
} from "lucide-react";
export interface SidebarNavItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: { title: string; url: string }[];
    display: boolean;
}

export interface SidebarNavConfig {
    compound: SidebarNavItem[];
    flat?: {
        title: string;
        url: string;
        icon: LucideIcon;
        display: boolean;
    }[];
}

export const AdminNavMain: SidebarNavConfig = {
    compound: [
        {
            title: "DASHBOARD",
            url: "#",
            icon: PieChart,
            isActive: true,
            items: [
                {
                    title: "Statistics",
                    url: "/admin/dashboard",
                },
            ],
            display: true,
        },
        {
            title: "ADMISSIONS",
            url: "#",
            icon: LucideSchool2,
            items: [
                {
                    title: "Review Applications",
                    url: "/admin/review-applications",
                },
            ],
            display: true,
        },
        {
            title: "USERS",
            url: "#",
            icon: Users,
            items: [
                {
                    title: "Students Listing",
                    url: "/admin/students",
                },
                {
                    title: "Teachers Listing",
                    url: "/admin/teachers",
                },
                {
                    title: "Parents Listing",
                    url: "/admin/parents",
                },
            ],
            display: true,
        },

        {
            title: "MESSAGES",
            url: "#",
            icon: SendHorizonal,
            items: [
                {
                    title: "Messages",
                    url: "/admin/messages",
                },



            ],
            display: true,
        },
        {
            title: "PAYMENT HISTORY",
            url: "#",
            icon: CreditCard,
            items: [
                {
                    title: "Payments",
                    url: "/admin/payments",
                },
            ],
            display: true,
        },
        {
            title: "STUDENT REPORTS",
            url: "#",
            icon: ClipboardList,
            items: [
                {
                    title: "View Reports",
                    url: "/admin/reports",
                },
            ],
            display: true,
        },
        // {
        //     title: "SETTINGS",
        //     url: "#",
        //     icon: Settings2,
        //     items: [
        //         {
        //             title: "Profile Settings",
        //             url: "/admin/settings",
        //         },
        //     ],
        //     display: true,
        // },
    ]
}

export const DirectorNavMain: SidebarNavConfig = {
    compound: [
        {
            title: "DASHBOARD",
            url: "#",
            icon: LayoutDashboard,
            isActive: true,
            items: [
                {
                    title: "Dashboard",
                    url: "/director/dashboard",
                },
            ],
            display: true,
        },
        {
            title: "USERS",
            url: "#",
            icon: Users,
            items: [
                {
                    title: "Statistical Reports",
                    url: "/director/students",
                },
            ],
            display: true,
        },

        {
            title: "Grade Reports",
            url: "/director/grades",
            icon: GraduationCap,
            display: true,
        },
        {
            title: "Financial Reports",
            url: "/director/financial-reports",
            icon: BadgeDollarSign,
            display: true,
        },
    ]
}
export const StudentNavMain: SidebarNavConfig = {
    compound: [
        {
            title: "DASHBOARD",
            url: "#",
            icon: PieChart,
            isActive: true,
            items: [
                {
                    title: "Statistics",
                    url: "/student/dashboard",
                },
            ],
            display: true,
        },
        {
            title: "PAYMENTS",
            url: "#",
            icon: DollarSign,
            items: [
                {
                    title: "Pay Acceptance Fee",
                    url: "/history/student-payments/acceptance",
                },
                {
                    title: "Pay Tuition Fee",
                    url: "/history/student-payments/tuition",
                },
            ],
            display: false,
        },
        {
            title: "MY APPLICATION",
            url: "#",
            icon: School,
            items: [
                {
                    title: "My Appplication",
                    url: "/student/my-application",
                },

            ],
            display: true,
        },
        {
            title: "MY COURSES",
            url: "#",
            icon: School,
            items: [
                {
                    title: "My Courses",
                    url: "/student/classes",
                },

            ],
            display: true,
        },
        {
            title: "HISTORY",
            url: "#",
            icon: DollarSign,
            items: [
                {
                    title: "Payment History",
                    url: "/student/history/student-payments",
                },
                {
                    title: "Result History",
                    url: "/student/history/student-results",
                },
            ],
            display: true,
        },
        {
            title: "PERFORMANCES",
            url: "#",
            icon: Gamepad2,
            items: [
                {
                    title: "Leaderboard & Performances",
                    url: "/student/leaderboard",
                },

            ],
            display: true,
        },
        // {
        //     title: "REPORTS",
        //     url: "#",
        //     icon: Flag,
        //     items: [
        //         {
        //             title: "Grade Report",
        //             url: "/student/grade-report",
        //         },
        //     ],
        //     display: true,
        // },

        {
            title: "PROFILE",
            url: "#",
            icon: ShieldUser,
            items: [
                {
                    title: "Profile Settings",
                    url: "/student/profile",
                },
            ],
            display: true,
        },
    ]
}
export const TeacherNavMain: SidebarNavConfig = {
    compound: [
        {
            title: "DASHBOARD",
            url: "#",
            icon: PieChart,
            isActive: true,
            items: [
                {
                    title: "Overview",
                    url: "/teacher/dashboard",
                },
            ],
            display: true,
        },
    ],
    flat: [

        // {
        //     title: "STUDENTS",
        //     url: "/teacher/students",
        //     icon: GraduationCap,
        //     display: true,
        // },
        {
            title: "COURSES",
            url: "/teacher/classes",
            icon: School,
            display: true,
        },
        {
            title: "STUDENT REPORTS",
            url: "/teacher/grade-reports",
            icon: BookOpenCheck,
            display: true,
        },
        // {
        //     title: "CALENDER",
        //     url: "/teacher/calender",
        //     icon: CalendarCheck,
        //     display: true,
        // },
        {
            title: "ATTENDANCE",
            url: "/teacher/attendance",
            icon: ClipboardList,
            display: true,
        },
        {
            title: "MESSAGES",
            url: "/teacher/messages",
            icon: MessageSquare,
            display: true,
        },

        {
            title: "SETTINGS",
            url: "/teacher/settings",
            icon: Settings2,
            display: false,
        },
    ],
};
export const ParentNavMain: SidebarNavConfig = {
    compound: [
        {
            title: "DASHBOARD",
            url: "#",
            icon: PieChart,
            isActive: true,
            items: [
                {
                    title: "Overview",
                    url: "/parent/dashboard",
                },
            ],
            display: true,
        },
    ],
    flat: [

        // {
        //     title: "MESSAGES",
        //     url: "/parent/messages",
        //     icon: SendHorizonal,
        //     display: true,
        // },


        {

            title: "COURSES",
            url: "/parent/classes",
            icon: BookOpen,
            display: true,
        },
        {
            title: "PAYMENT HISTORY",
            url: "/parent/payments",
            icon: BanknoteArrowDown,
            display: true,
        },
        {
            title: "STUDENT REPORTS",
            url: "/parent/reports",
            icon: MessageSquare,
            display: true,
        },
        {
            title: "SETTINGS",
            url: "/parent/settings",
            icon: Settings2,
            display: false,
        },
    ],
};