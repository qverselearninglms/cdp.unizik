import { LucideIcon, BadgeDollarSign, BriefcaseBusiness, GraduationCap, Landmark, BookOpenCheck, Globe2, Users } from "lucide-react";
import { Category } from "@/store/useProgramStore";

const PROGRAM_ICONS: LucideIcon[] = [
  BadgeDollarSign,
  BriefcaseBusiness,
  GraduationCap,
  Landmark,
  BookOpenCheck,
  Globe2,
  Users,
];

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export interface ProgramCardData {
  id: number;
  courseCode: string;
  title: string;
  description: string;
  tuition: string;
  applicationFee: string;
  duration: string;
  parent: number;
  sortorder: number;
  icon: LucideIcon;
}

function normalizeValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return `${value}`;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function formatCurrencyLabel(value: string | null, fallback: string): string {
  if (!value) return fallback;

  if (value.includes("₦")) {
    return value;
  }

  const numeric = Number(value.replace(/[\s,]/g, ""));
  if (Number.isFinite(numeric)) {
    return currencyFormatter.format(numeric);
  }

  return value;
}

function cleanDescription(value: string | null): string {
  if (!value) return "Professional certificate programme with practical, career-focused outcomes.";

  const normalized = value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (normalized.length === 0) {
    return "Professional certificate programme with practical, career-focused outcomes.";
  }

  if (normalized.length === 1) {
    return normalized[0];
  }

  return normalized[normalized.length - 1];
}

function getDetailLines(category: Category): string[] {
  const descriptionLines = normalizeValue(category.description)
    ?.replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean) ?? [];

  if (Array.isArray(category.meta)) {
    const metaLines = category.meta
      .map((item) => normalizeValue(item))
      .filter((item): item is string => Boolean(item));

    if (metaLines.length > 0) return metaLines;
  }

  return descriptionLines;
}

const PRIORITY_LANGUAGES = ["chinese", "japanese", "german"] as const;

/** "500,000", "500000", "₦500,000" -> 500000. Returns null if there is no number. */
function parseAmount(value: string | null | undefined): number | null {
  if (!value) return null;
  const digits = String(value).replace(/[^\d.]/g, "");
  if (!digits) return null;
  const amount = Number(digits);
  return Number.isFinite(amount) ? amount : null;
}

/** 0-2 if the program is one of the priority languages (in your order), otherwise -1. */
function getLanguageRank(name: string): number {
  const lower = name.toLowerCase();
  return PRIORITY_LANGUAGES.findIndex((lang) => lower.includes(`${lang} language`));
}

function toProgramCard(category: Category, index: number): ProgramCardData {
  const detailLines = getDetailLines(category);

  const tuition = normalizeValue(category.tuition) ?? detailLines[0] ?? null;
  const applicationFee = normalizeValue(category.application_fee) ?? detailLines[1] ?? null;
  const duration = normalizeValue(category.duration) ?? detailLines[2] ?? null;

  return {
    id: category.id,
    courseCode: `CCP-${String(category.id).padStart(3, "0")}`,
    title: category.name.trim(),
    description: cleanDescription(normalizeValue(category.description)),
    tuition: formatCurrencyLabel('-', "Tuition TBA"),
    applicationFee: formatCurrencyLabel(applicationFee, "Application Fee TBA"),
    duration: duration ?? "Duration TBA",
    parent: category.parent,
    sortorder: category.sortorder,
    icon: PROGRAM_ICONS[index % PROGRAM_ICONS.length],
  };
}

export function mapCategoriesToProgramCards(categories: Category[]): ProgramCardData[] {
  const getTuitionAmount = (category: Category): number | null => {
    const detailLines = getDetailLines(category);
    return parseAmount(normalizeValue(category.tuition) ?? detailLines[0] ?? null);
  };

  // Group 0: priority languages, 1: tuition of 500,000, 2: everything else
  const getGroup = (category: Category): number => {
    if (getLanguageRank(category.name) !== -1) return 0;
    if (getTuitionAmount(category) === 500000) return 1;
    return 2;
  };

  return categories
    .filter((category) => category.parent === 1)
    .sort((a, b) => {
      const groupA = getGroup(a);
      const groupB = getGroup(b);
      if (groupA !== groupB) return groupA - groupB;

      // Inside the language group: Chinese, then Japanese, then German
      if (groupA === 0) {
        const rankDiff = getLanguageRank(a.name) - getLanguageRank(b.name);
        if (rankDiff !== 0) return rankDiff;
      }

      // Otherwise keep the original Moodle ordering
      return a.sortorder - b.sortorder;
    })
    .map(toProgramCard);
}

// // export function mapCategoriesToProgramCards(categories: Category[]): ProgramCardData[] {
// //   const categoryIdsWithChildren = new Set(categories.filter((cat) => cat.parent !== 0).map((cat) => cat.parent));
// //   console.log("FETCHED PROGRAM:", categories)
// //   return categories
// //     .filter((category) => category.parent !== 0 && !categoryIdsWithChildren.has(category.id))
// //     .sort((a, b) => a.sortorder - b.sortorder)
// //     .map((category, index) => {
// //       const detailLines = getDetailLines(category);

// //       const tuition = normalizeValue(category.tuition) ?? detailLines[0] ?? null;
// //       const applicationFee = normalizeValue(category.application_fee) ?? detailLines[1] ?? null;
// //       const duration = normalizeValue(category.duration) ?? detailLines[2] ?? null;

// //       return {
// //         id: category.id,
// //         courseCode: `CCP-${String(category.id).padStart(3, "0")}`,
// //         title: category.name.trim(),
// //         description: cleanDescription(normalizeValue(category.description)),
// //         tuition: formatCurrencyLabel("-", "Tuition TBA"),
// //         applicationFee: formatCurrencyLabel(applicationFee, "Application Fee TBA"),
// //         duration: duration ?? "Duration TBA",
// //         parent: category.parent,
// //         sortorder: category.sortorder,
// //         icon: PROGRAM_ICONS[index % PROGRAM_ICONS.length],
// //       };
// //     });
// // }