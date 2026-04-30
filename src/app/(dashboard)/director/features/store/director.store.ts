import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { DirectorStore, DirectorFilter } from "../types/director.types";
import { directorService } from "../services/director.service";

const DEFAULT_FILTER: DirectorFilter = {
  faculty: "all",
  department: "all",
  academicYear: "2024/2025",
  semester: "all",
  level: "all",
  status: "all",
  search: "",
};

export const useDirectorStore = create<DirectorStore>()(
  devtools(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────────────────
      overview: null,
      enrollmentData: [],
      facultyDistribution: [],
      financialSummary: null,
      paymentRecords: [],
      statisticalReport: null,
      gradeReport: null,
      filter: DEFAULT_FILTER,
      pagination: { page: 1, pageSize: 20, total: 0 },
      loading: {},
      errors: {},

      // ── Helpers ────────────────────────────────────────────────────────────
      setLoading: (key, value) =>
        set((s) => ({ loading: { ...s.loading, [key]: value } })),

      setError: (key, error) =>
        set((s) => ({ errors: { ...s.errors, [key]: error } })),

      setFilter: (partial) =>
        set((s) => ({ filter: { ...s.filter, ...partial }, pagination: { ...s.pagination, page: 1 } })),

      resetFilter: () =>
        set({ filter: DEFAULT_FILTER, pagination: { page: 1, pageSize: 20, total: 0 } }),

      setPagination: (partial) =>
        set((s) => ({ pagination: { ...s.pagination, ...partial } })),

      // ── Fetch Actions ──────────────────────────────────────────────────────

      fetchOverview: async () => {
        const { setLoading, setError } = get();
        setLoading("overview", true);
        setError("overview", null);
        try {
          const [overview, enrollmentData, facultyDistribution] = await Promise.all([
            directorService.fetchOverview(),
            directorService.fetchEnrollmentData(),
            directorService.fetchFacultyDistribution(),
          ]);
          set({ overview, enrollmentData, facultyDistribution });
        } catch (err: any) {
          setError("overview", err?.message || "Failed to load overview");
        } finally {
          setLoading("overview", false);
        }
      },

      fetchFinancialSummary: async (filter) => {
        const { setLoading, setError } = get();
        setLoading("financial", true);
        setError("financial", null);
        try {
          const f = filter ?? get().filter;
          const [summary, paymentData] = await Promise.all([
            directorService.fetchFinancialSummary(f),
            directorService.fetchPaymentRecords(f),
          ]);
          set({
            financialSummary: summary,
            paymentRecords: paymentData.records,
            pagination: { ...get().pagination, total: paymentData.total },
          });
        } catch (err: any) {
          setError("financial", err?.message || "Failed to load financial data");
        } finally {
          setLoading("financial", false);
        }
      },

      fetchStatisticalReport: async (filter) => {
        const { setLoading, setError } = get();
        setLoading("statistical", true);
        setError("statistical", null);
        try {
          const f = filter ?? get().filter;
          const report = await directorService.fetchStatisticalReport(f);
          set({ statisticalReport: report });
        } catch (err: any) {
          setError("statistical", err?.message || "Failed to load statistical report");
        } finally {
          setLoading("statistical", false);
        }
      },

      fetchGradeReport: async (filter) => {
        const { setLoading, setError } = get();
        setLoading("grades", true);
        setError("grades", null);
        try {
          const f = filter ?? get().filter;
          const report = await directorService.fetchGradeReport(f);
          set({ gradeReport: report });
        } catch (err: any) {
          setError("grades", err?.message || "Failed to load grade report");
        } finally {
          setLoading("grades", false);
        }
      },
    }),
    { name: "DirectorStore" }
  )
);
