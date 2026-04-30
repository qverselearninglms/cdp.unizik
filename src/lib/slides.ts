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
        image: "/slides/ai2.jpg",
        category: "Research & Innovation",
        primaryAction: { text: "Research Hubs", icon: "🔬", url: "programs" },
        secondaryAction: { text: "Our Discoveries", icon: "👥", url: "/auth/create-account" }
    },
    {
        id: 3,
        title: "Campus Life",
        subtitle: "The Full Zikite Experience",
        description: "Immerse yourself in a vibrant culture from the Perm Site to the Temp Site. From SUG week to inter-faculty sports, discover your passion and build lifelong bonds.",
        image: "/slides/ai3.jpg",
        category: "Student Life",
        primaryAction: { text: "Campus Events", icon: "📅", url: "programs" },
        secondaryAction: { text: "Student Affairs", icon: "🏠", url: "/auth/create-account" }
    },
    {
        id: 4,
        title: "Your Future",
        subtitle: "Global Ready Graduates",
        description: "Launch your career with the strength of the UNIZIK name. Access internship opportunities and join our prestigious alumni network spanning across Nigeria and beyond.",
        image: "/slides/ai4.jpg",
        category: "Career Development",
        primaryAction: { text: "Career Services", icon: "💼", url: "programs" },
        secondaryAction: { text: "Alumni Portal", icon: "🤝", url: "/auth/create-account" }
    }
];