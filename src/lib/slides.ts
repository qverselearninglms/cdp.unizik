import { SlideData } from "@/types/slide";

export const slidesData: SlideData[] = [
    {
        id: 1,
        title: "Great Zikites",
        subtitle: "Excellence and Service (Ut Prosit)",
        description: "Join a community of disciplined scholars and innovators. Access quality education at Nnamdi Azikiwe University and connect with peers who embody the Zikite spirit.",
        image: "/slides/ai1.jpg",
        category: "Academic Excellence",
        primaryAction: { text: "View Faculties", icon: "▶", url: "programs" },
        secondaryAction: { text: "Apply Now", icon: "ℹ", url: "/auth/create-account" }
    },
    {
        id: 2,
        title: "Research & Impact",
        subtitle: "Solving Local & Global Challenges",
        description: "From the labs at the Faculty of Engineering to the Chike Okoli Centre, engage in groundbreaking research that impacts our nation and the world.",
        image: "/slides/Nnamdi-Azikiwe-University.jpg",
        category: "Research & Innovation",
        primaryAction: { text: "Research Hubs", icon: "🔬", url: "programs" },
        secondaryAction: { text: "Our Discoveries", icon: "👥", url: "/auth/create-account" }
    },
    {
        id: 3,
        title: "Campus Life",
        subtitle: "The Full Zikite Experience",
        description: "Immerse yourself in a vibrant culture from the Perm Site to the Temp Site. From SUG week to inter-faculty sports, discover your passion and build lifelong bonds.",
        image: "/slides/medium-shot-students-classroom.jpg",
        category: "Student Life",
        primaryAction: { text: "Campus Events", icon: "📅", url: "programs" },
        secondaryAction: { text: "Student Affairs", icon: "🏠", url: "/auth/create-account" }
    },
    {
        id: 4,
        title: "Your Future",
        subtitle: "Global Ready Graduates",
        description: "Launch your career with the strength of the UNIZIK name. Access internship opportunities and join our prestigious alumni network spanning across Nigeria and beyond.",
        image: "/slides/portrait-african-american-scholar-arriving-library-with-learning-materials.jpg",
        category: "Career Development",
        primaryAction: { text: "Career Services", icon: "💼", url: "programs" },
        secondaryAction: { text: "Alumni Portal", icon: "🤝", url: "/auth/create-account" }
    },
    {
    id: 5,
    title: "A Journey",
    subtitle: "Your Journey Starts Here",
    description: "Apply seamlessly into Nnamdi Azikiwe University through a transparent and fully digital admission process. From UTME screening to final clearance.",
    image: "/slides/study-group-african-people.jpg",
    category: "Admissions",
    primaryAction: { text: "Start Application", icon: "📝", url: "/auth/create-account" },
    secondaryAction: { text: "Admission Guide", icon: "📘", url: "programs" }
},
 {
    id: 6,
    title: "Digital Campus",
    subtitle: "Everything You Need in One Place",
    description: "Manage courses, register exams, access results, pay fees, and stay updated — all through a unified digital student portal designed for efficiency and transparency.",
    image: "/slides/diverse-students-team-engaging-video-call-with-doctor.jpg",
    category: "Digital Transformation",
    primaryAction: { text: "Access Portal", icon: "💻", url: "/auth/create-account" },
    secondaryAction: { text: "Explore Features", icon: "⚙️", url: "programs" }
}
];