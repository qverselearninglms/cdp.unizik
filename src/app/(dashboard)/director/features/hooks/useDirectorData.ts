import { useCallback, useEffect } from "react";
import { useDirectorStore } from "../store/director.store";
import { DirectorFilter } from "../types/director.types";

// ─── Overview Hook ────────────────────────────────────────────────────────────

export function useDirectorOverview() {
  const {
    overview,
    enrollmentData,
    facultyDistribution,
    loading,
    errors,
    fetchOverview,
  } = useDirectorStore();

  useEffect(() => {
    if (!overview) fetchOverview();
  }, []);

  return {
    overview,
    enrollmentData,
    facultyDistribution,
    isLoading: !!loading["overview"],
    error: errors["overview"],
    refetch: fetchOverview,
  };
}

// ─── Financial Hook ───────────────────────────────────────────────────────────

export function useDirectorFinancial() {
  const {
    financialSummary,
    paymentRecords,
    pagination,
    filter,
    loading,
    errors,
    fetchFinancialSummary,
    setFilter,
    resetFilter,
    setPagination,
  } = useDirectorStore();

  const refresh = useCallback(
    (f?: DirectorFilter) => fetchFinancialSummary(f),
    []
  );

  useEffect(() => {
    fetchFinancialSummary();
  }, []);

  return {
    financialSummary,
    paymentRecords,
    pagination,
    filter,
    isLoading: !!loading["financial"],
    error: errors["financial"],
    setFilter,
    resetFilter,
    setPagination,
    refetch: refresh,
  };
}

// ─── Statistical Hook ─────────────────────────────────────────────────────────

export function useDirectorStatistical() {
  const {
    statisticalReport,
    filter,
    loading,
    errors,
    fetchStatisticalReport,
    setFilter,
    resetFilter,
  } = useDirectorStore();

  const refresh = useCallback(
    (f?: DirectorFilter) => fetchStatisticalReport(f),
    []
  );

  useEffect(() => {
    fetchStatisticalReport();
  }, []);

  return {
    statisticalReport,
    filter,
    isLoading: !!loading["statistical"],
    error: errors["statistical"],
    setFilter,
    resetFilter,
    refetch: refresh,
  };
}

// ─── Grades Hook ──────────────────────────────────────────────────────────────

export function useDirectorGrades() {
  const {
    gradeReport,
    filter,
    loading,
    errors,
    fetchGradeReport,
    setFilter,
    resetFilter,
  } = useDirectorStore();

  const refresh = useCallback(
    (f?: DirectorFilter) => fetchGradeReport(f),
    []
  );

  useEffect(() => {
    fetchGradeReport();
  }, []);

  return {
    gradeReport,
    filter,
    isLoading: !!loading["grades"],
    error: errors["grades"],
    setFilter,
    resetFilter,
    refetch: refresh,
  };
}
