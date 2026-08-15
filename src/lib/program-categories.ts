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
  accessFee: string;
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

export function mapCategoriesToProgramCards(categories: Category[]): ProgramCardData[] {
  const categoryIdsWithChildren = new Set(categories.filter((cat) => cat.parent !== 0).map((cat) => cat.parent));

  return categories
    .filter((category) => category.parent !== 0 && !categoryIdsWithChildren.has(category.id))
    .sort((a, b) => a.sortorder - b.sortorder)
    .map((category, index) => {
      const detailLines = getDetailLines(category);

      const tuition = normalizeValue(category.tuition) ?? detailLines[0] ?? null;
      const accessFee = normalizeValue(category.access_fee) ?? detailLines[1] ?? null;
      const duration = normalizeValue(category.duration) ?? detailLines[2] ?? null;

      return {
        id: category.id,
        courseCode: `CCP-${String(category.id).padStart(3, "0")}`,
        title: category.name.trim(),
        description: cleanDescription(normalizeValue(category.description)),
        tuition: formatCurrencyLabel(tuition, "Tuition TBA"),
        accessFee: formatCurrencyLabel(accessFee, "Access Fee TBA"),
        duration: duration ?? "Duration TBA",
        parent: category.parent,
        sortorder: category.sortorder,
        icon: PROGRAM_ICONS[index % PROGRAM_ICONS.length],
      };
    });
}