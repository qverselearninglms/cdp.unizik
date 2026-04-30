"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Filter, RotateCcw, Download } from "lucide-react";
import { DirectorFilterSchema, DirectorFilterInput } from "../schemas/director.schemas";
import { DirectorFilter } from "../types/director.types";

const FACULTIES = [
  "Engineering", "Sciences", "Arts", "Social Sciences",
  "Medicine", "Law", "Education", "Management Sciences",
];

const DEPARTMENTS: Record<string, string[]> = {
  Engineering: ["Civil Engineering", "Electrical Engineering", "Mechanical Engineering", "Chemical Engineering"],
  Sciences: ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
  Arts: ["English", "History", "Philosophy", "Linguistics", "Theatre Arts"],
  "Social Sciences": ["Economics", "Political Science", "Sociology", "Mass Communication", "Psychology"],
  Medicine: ["Medicine & Surgery", "Nursing Science", "Medical Laboratory Science", "Physiotherapy"],
  Law: ["Law"],
  Education: ["Educational Management", "Guidance & Counselling", "Science Education", "Arts Education"],
  "Management Sciences": ["Accounting", "Business Administration", "Banking & Finance", "Marketing"],
};

const ACADEMIC_YEARS = ["2024/2025", "2023/2024", "2022/2023", "2021/2022", "2020/2021"];
const LEVELS = ["100", "200", "300", "400", "500"];

interface FilterBarProps {
  filter: DirectorFilter;
  onFilter: (f: Partial<DirectorFilter>) => void;
  onReset: () => void;
  onExport?: () => void;
  showSemester?: boolean;
  showLevel?: boolean;
  showStatus?: boolean;
  statusOptions?: { label: string; value: string }[];
  isLoading?: boolean;
  title?: string;
}

export function DirectorFilterBar({
  filter,
  onFilter,
  onReset,
  onExport,
  showSemester = true,
  showLevel = true,
  showStatus = false,
  statusOptions = [],
  isLoading = false,
  title,
}: FilterBarProps) {
  const { register, handleSubmit, watch, reset } = useForm<DirectorFilterInput>({
    resolver: zodResolver(DirectorFilterSchema),
    defaultValues: {
      faculty: filter.faculty as any,
      department: filter.department,
      academicYear: filter.academicYear,
      semester: filter.semester as any,
      level: filter.level as any,
      search: filter.search,
    },
  });

  const selectedFaculty = watch("faculty");
  const depts = selectedFaculty && selectedFaculty !== "all" ? DEPARTMENTS[selectedFaculty] || [] : [];

  const onSubmit = (data: DirectorFilterInput) => {
    onFilter(data as Partial<DirectorFilter>);
  };

  const handleReset = () => {
    reset();
    onReset();
  };

  return (
    <div className="director-filter-bar">
      {title && <h3 className="filter-bar-title">{title}</h3>}

      <form onSubmit={handleSubmit(onSubmit)} className="filter-form">
        {/* Search */}
        <div className="filter-field search-field">
          <Search size={16} className="search-icon" />
          <input
            {...register("search")}
            type="text"
            placeholder="Search by name, matric no…"
            className="filter-input search-input"
            disabled={isLoading}
          />
        </div>

        {/* Faculty */}
        <div className="filter-field">
          <select {...register("faculty")} className="filter-select" disabled={isLoading}>
            <option value="all">All Faculties</option>
            {FACULTIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Department (conditional) */}
        {depts.length > 0 && (
          <div className="filter-field">
            <select {...register("department")} className="filter-select" disabled={isLoading}>
              <option value="all">All Departments</option>
              {depts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}

        {/* Academic Year */}
        <div className="filter-field">
          <select {...register("academicYear")} className="filter-select" disabled={isLoading}>
            {ACADEMIC_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Semester */}
        {showSemester && (
          <div className="filter-field">
            <select {...register("semester")} className="filter-select" disabled={isLoading}>
              <option value="all">Both Semesters</option>
              <option value="First">First Semester</option>
              <option value="Second">Second Semester</option>
            </select>
          </div>
        )}

        {/* Level */}
        {showLevel && (
          <div className="filter-field">
            <select {...register("level")} className="filter-select" disabled={isLoading}>
              <option value="all">All Levels</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}L</option>
              ))}
            </select>
          </div>
        )}

        {/* Status */}
        {showStatus && statusOptions.length > 0 && (
          <div className="filter-field">
            <select {...register("status" as any)} className="filter-select" disabled={isLoading}>
              <option value="all">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Actions */}
        <div className="filter-actions">
          <button type="submit" className="btn-filter" disabled={isLoading}>
            <Filter size={15} />
            <span>Apply</span>
          </button>
          <button type="button" className="btn-reset" onClick={handleReset} disabled={isLoading}>
            <RotateCcw size={15} />
          </button>
          {onExport && (
            <button type="button" className="btn-export" onClick={onExport} disabled={isLoading}>
              <Download size={15} />
              <span>Export</span>
            </button>
          )}
        </div>
      </form>

      <style jsx>{`
        .director-filter-bar {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
        }
        .filter-bar-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 0.75rem;
        }
        .filter-form {
          display: flex;
          flex-wrap: wrap;
          gap: 0.625rem;
          align-items: center;
        }
        .filter-field {
          position: relative;
          flex: 1;
          min-width: 160px;
        }
        .search-field {
          min-width: 220px;
          flex: 2;
        }
        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted-foreground);
          pointer-events: none;
        }
        .filter-input,
        .filter-select {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.8125rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--foreground);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          appearance: none;
          -webkit-appearance: none;
        }
        .search-input {
          padding-left: 2rem;
        }
        .filter-input:focus,
        .filter-select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary) 15%, transparent);
        }
        .filter-input:disabled,
        .filter-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .filter-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .btn-filter,
        .btn-reset,
        .btn-export {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 0.875rem;
          border-radius: 8px;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.15s;
        }
        .btn-filter {
          background: var(--primary);
          color: var(--primary-foreground);
        }
        .btn-filter:hover:not(:disabled) { opacity: 0.88; }
        .btn-reset {
          background: var(--muted);
          color: var(--muted-foreground);
          border-color: var(--border);
          padding: 0.5rem;
        }
        .btn-reset:hover:not(:disabled) {
          background: var(--border);
          color: var(--foreground);
        }
        .btn-export {
          background: var(--accent);
          color: var(--accent-foreground);
        }
        .btn-export:hover:not(:disabled) { opacity: 0.88; }
        .btn-filter:disabled,
        .btn-reset:disabled,
        .btn-export:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .filter-form { flex-direction: column; }
          .filter-field, .search-field { min-width: 100%; }
        }
      `}</style>
    </div>
  );
}
