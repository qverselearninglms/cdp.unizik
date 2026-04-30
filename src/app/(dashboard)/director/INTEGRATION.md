# Director Panel — Integration Guide

## Overview

This module adds a fully-featured **Director's Portal** to the UNIZIK student portal system.

### Pages

| Route | Page | Description |
|-------|------|-------------|
| `/director/dashboard` | Overview Dashboard | Metrics, enrollment trends, faculty distribution |
| `/director/financial` | Financial Reports | Fee collection, revenue analytics, payment records |
| `/director/students`  | Statistical Reports | Student & lecturer population analytics, gender breakdown |
| `/director/grades`    | Grade Reports | GPA analytics, grade distribution, expandable per-student courses |

---

## File Structure

```
src/
├── app/(dashboard)/director/
│   ├── layout.tsx                    ← Director layout (sidebar + topbar)
│   ├── dashboard/
│   │   └── page.tsx                  ← Overview dashboard
│   ├── financial/
│   │   └── page.tsx                  ← Financial reports
│   ├── students/
│   │   └── page.tsx                  ← Statistical reports
│   └── grades/
│       └── page.tsx                  ← Grade reports
│
└── features/director/
    ├── index.ts                      ← Barrel exports
    ├── types/
    │   └── director.types.ts         ← All TypeScript interfaces & types
    ├── schemas/
    │   └── director.schemas.ts       ← Zod validation schemas
    ├── services/
    │   └── director.service.ts       ← API service (simulated; live calls commented)
    ├── store/
    │   └── director.store.ts         ← Zustand store
    ├── hooks/
    │   └── useDirectorData.ts        ← Custom data-fetching hooks
    └── components/
        ├── MetricCard.tsx            ← KPI metric cards + grid
        ├── DirectorFilterBar.tsx     ← Shared filter bar (react-hook-form + zod)
        ├── DataTable.tsx             ← Reusable paginated table + StatusBadge
        └── charts/
            └── DirectorCharts.tsx    ← All Recharts chart components
```

---

## Step 1 — Install Dependencies

```bash
# Already assumed in your project:
npm install zustand zod react-hook-form @hookform/resolvers recharts

# Recharts peer dep (if not installed):
npm install react react-dom
```

---

## Step 2 — Copy Files

Copy the entire `src/features/director/` and `src/app/(dashboard)/director/` folders into your project.

---

## Step 3 — Theme CSS Variables

The components rely on your existing `globals.css` variables (already provided):
- `--primary`, `--accent`, `--background`, `--foreground`, `--card`, `--border`, `--muted`, `--muted-foreground`, `--destructive`, `--sidebar-*`

No changes needed — they map directly to your existing UNIZIK theme.

---

## Step 4 — Add DIRECTOR to the UserRole guard

In your existing role-based routing/auth middleware:

```typescript
// e.g., src/middleware.ts or your auth guard
const DIRECTOR_ROUTES = ["/director"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userRole = getUserRole(request); // your existing util

  if (DIRECTOR_ROUTES.some((r) => pathname.startsWith(r))) {
    if (userRole !== "director" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
}
```

---

## Step 5 — Add to Sidebar (if you have a global sidebar)

If your app has a global dashboard layout, add the director nav items:

```typescript
// In your global nav config
{
  role: "director",
  items: [
    { href: "/director/dashboard", label: "Dashboard",           icon: "LayoutDashboard" },
    { href: "/director/financial", label: "Financial Reports",   icon: "BadgeDollarSign"  },
    { href: "/director/students",  label: "Statistical Reports", icon: "Users"            },
    { href: "/director/grades",    label: "Grade Reports",       icon: "GraduationCap"    },
  ]
}
```

---

## Step 6 — Switch to Live API

Each service method follows the same pattern. To go live, just swap the comment blocks:

```typescript
// In src/features/director/services/director.service.ts

async fetchOverview(): Promise<DashboardOverview> {
  // ── LIVE MODE ────────────────────────────────────
  const res = await apiClient.get<DashboardOverview>("/director/overview");
  return res.data;
  // ── END LIVE MODE ────────────────────────────────

  // SIMULATED (remove the block below when going live):
  await simulateDelay(600);
  const { students, lecturers, payments } = getSeeds();
  // ...
}
```

---

## API Endpoints Expected (Backend Contract)

| Method | Endpoint | Query Params |
|--------|----------|--------------|
| GET | `/director/overview` | — |
| GET | `/director/enrollment-trend` | — |
| GET | `/director/faculty-distribution` | — |
| GET | `/director/financial-summary` | `faculty`, `academicYear`, `semester` |
| GET | `/director/payments` | `faculty`, `department`, `level`, `semester`, `status`, `search`, `page`, `pageSize` |
| GET | `/director/statistical-report` | `faculty`, `department`, `level`, `search` |
| GET | `/director/grade-report` | `faculty`, `department`, `level`, `semester`, `academicYear`, `search` |

All endpoints should return the standard `ApiResponse<T>` envelope:
```json
{ "status": 200, "message": "Success", "data": { ... } }
```

---

## Dark Mode

Dark mode is supported out of the box. Toggle via:
```typescript
document.documentElement.classList.toggle("dark");
```
The sidebar has a built-in toggle button, or you can wire it to your existing theme switcher.

---

## Key Patterns

- **State**: Zustand store (`useDirectorStore`) — devtools enabled for debugging
- **Forms**: `react-hook-form` + `@hookform/resolvers/zod` for filter bar validation
- **Validation**: Zod schemas in `director.schemas.ts`
- **API**: `directorService` wraps `apiClient`; all mock calls are clearly marked
- **Charts**: Recharts with custom tooltips matching the UNIZIK theme palette
- **Tables**: Custom `DataTable<T>` with generics, pagination, and skeleton loading
- **Separation**: Types → Service → Store → Hooks → Components → Pages
