import { createApiMutationOptions, createApiQueryOptions } from "@/lib/clients/apiClient";
import type {
   Faculty,
   Department,
   Program,
   CurriculumLevel,
   CurriculumSemester,
   CreateFacultyPayload,
   UpdateFacultyPayload,
   CreateDepartmentPayload,
   UpdateDepartmentPayload,
   CreateProgramPayload,
   UpdateProgramPayload,
   CreateCurriculumLevelPayload,
   UpdateCurriculumLevelPayload,
   CreateCurriculumSemesterPayload,
   UpdateCurriculumSemesterPayload,
   ApiListResponse,
   ApiSingleResponse,
} from "@/types/school";

// ── helpers ─────────────────────────────────
let _nextId = 500;
const uid = () => String(++_nextId);
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ── seed: faculties ─────────────────────────

const faculties: Faculty[] = [
   {
      id: "fac-1", name: "Faculty of Science", code: "SCI",
      description: "Covers all science-related departments and programs",
      dean_user_id: null, email: "science@unilag.edu.ng", phone_number: "01-4560001",
      is_active: true, departments_count: 2,
   },
   {
      id: "fac-2", name: "Faculty of Engineering", code: "ENG",
      description: "Engineering and technology departments",
      dean_user_id: null, email: "engineering@unilag.edu.ng", phone_number: "01-4560002",
      is_active: true, departments_count: 1,
   },
   {
      id: "fac-3", name: "Faculty of Arts", code: "ART",
      description: "Arts, humanities, and social science departments",
      dean_user_id: null, email: "arts@unilag.edu.ng", phone_number: "01-4560003",
      is_active: true, departments_count: 0,
   },
];

// ── seed: departments ───────────────────────

const departments: Department[] = [
   {
      id: "dept-1", faculty_id: "fac-1", name: "Computer Science", code: "CSC",
      description: "Department of Computer Science", hod_user_id: null,
      email: "csc@unilag.edu.ng", phone_number: "01-4561001",
      is_active: true, programs_count: 1,
   },
   {
      id: "dept-2", faculty_id: "fac-1", name: "Mathematics", code: "MTH",
      description: "Department of Mathematics", hod_user_id: null,
      email: "mth@unilag.edu.ng", phone_number: "01-4561002",
      is_active: true, programs_count: 1,
   },
   {
      id: "dept-3", faculty_id: "fac-2", name: "Mechanical Engineering", code: "MEE",
      description: "Department of Mechanical Engineering", hod_user_id: null,
      email: "mee@unilag.edu.ng", phone_number: "01-4561003",
      is_active: true, programs_count: 1,
   },
];

// ── seed: programs ──────────────────────────

const programs: Program[] = [
   {
      id: "prog-1", department_id: "dept-1", name: "B.Sc. Computer Science", code: "CSC",
      degree_type: "B.Sc.", duration_years: 4, description: "Bachelor of Science in Computer Science",
      min_credit_units: 150, is_active: true,
   },
   {
      id: "prog-2", department_id: "dept-2", name: "B.Sc. Mathematics", code: "MTH",
      degree_type: "B.Sc.", duration_years: 4, description: "Bachelor of Science in Mathematics",
      min_credit_units: 140, is_active: true,
   },
   {
      id: "prog-3", department_id: "dept-3", name: "B.Eng. Mechanical Engineering", code: "MEE",
      degree_type: "B.Eng.", duration_years: 5, description: "Bachelor of Engineering in Mechanical Engineering",
      min_credit_units: 180, is_active: true,
   },
];

// ── seed: levels (university-wide) ──────────

const levels: CurriculumLevel[] = [
   { id: "lvl-1", name: "100 Level", numeric_value: 100, semesters_count: 2 },
   { id: "lvl-2", name: "200 Level", numeric_value: 200, semesters_count: 2 },
   { id: "lvl-3", name: "300 Level", numeric_value: 300, semesters_count: 2 },
   { id: "lvl-4", name: "400 Level", numeric_value: 400, semesters_count: 2 },
];

// ── seed: semesters (per level) ─────────────

const curriculumSemesters: CurriculumSemester[] = [
   { id: "csem-1", level_id: "lvl-1", name: "1st Semester", sequence_no: 1, courses_count: 6 },
   { id: "csem-2", level_id: "lvl-1", name: "2nd Semester", sequence_no: 2, courses_count: 5 },
   { id: "csem-3", level_id: "lvl-2", name: "1st Semester", sequence_no: 1, courses_count: 7 },
   { id: "csem-4", level_id: "lvl-2", name: "2nd Semester", sequence_no: 2, courses_count: 6 },
   { id: "csem-5", level_id: "lvl-3", name: "1st Semester", sequence_no: 1, courses_count: 0 },
   { id: "csem-6", level_id: "lvl-3", name: "2nd Semester", sequence_no: 2, courses_count: 0 },
   { id: "csem-7", level_id: "lvl-4", name: "1st Semester", sequence_no: 1, courses_count: 0 },
   { id: "csem-8", level_id: "lvl-4", name: "2nd Semester", sequence_no: 2, courses_count: 0 },
];

// ── Faculties API ───────────────────────────

export const facultiesApi = {
   async list(): Promise<ApiListResponse<Faculty>> {
      await delay();
      return { data: [...faculties], total: faculties.length };
   },

   async getById(id: string): Promise<ApiSingleResponse<Faculty>> {
      await delay(200);
      const item = faculties.find((x) => x.id === id);
      if (!item) throw new Error("Faculty not found");
      return { data: { ...item } };
   },

   async create(payload: CreateFacultyPayload): Promise<ApiSingleResponse<Faculty>> {
      await delay(500);
      if (faculties.some((f) => f.code === payload.code)) throw new Error("Faculty code already exists");
      const item: Faculty = {
         id: uid(), name: payload.name, code: payload.code,
         description: payload.description ?? "",
         dean_user_id: null, email: payload.email ?? "", phone_number: payload.phone_number ?? "",
         is_active: true, departments_count: 0,
      };
      faculties.push(item);
      return { data: item, message: "Faculty created" };
   },

   async update(id: string, payload: UpdateFacultyPayload): Promise<ApiSingleResponse<Faculty>> {
      await delay(500);
      const idx = faculties.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Faculty not found");
      faculties[idx] = { ...faculties[idx], ...payload };
      return { data: { ...faculties[idx] }, message: "Faculty updated" };
   },
};

// ── Departments API ─────────────────────────

export const departmentsApi = {
   async listByFaculty(facultyId: string): Promise<ApiListResponse<Department>> {
      await delay();
      const result = departments.filter((d) => d.faculty_id === facultyId);
      return { data: [...result], total: result.length };
   },

   async getById(id: string): Promise<ApiSingleResponse<Department>> {
      await delay(200);
      const item = departments.find((x) => x.id === id);
      if (!item) throw new Error("Department not found");
      return { data: { ...item } };
   },

   async create(payload: CreateDepartmentPayload): Promise<ApiSingleResponse<Department>> {
      await delay(500);
      if (departments.some((d) => d.code === payload.code)) throw new Error("Department code already exists");
      const item: Department = {
         id: uid(), faculty_id: payload.faculty_id, name: payload.name, code: payload.code,
         description: payload.description ?? "",
         hod_user_id: null, email: payload.email ?? "", phone_number: payload.phone_number ?? "",
         is_active: true, programs_count: 0,
      };
      departments.push(item);
      // bump count
      const fac = faculties.find((f) => f.id === payload.faculty_id);
      if (fac) fac.departments_count++;
      return { data: item, message: "Department created" };
   },

   async update(id: string, payload: UpdateDepartmentPayload): Promise<ApiSingleResponse<Department>> {
      await delay(500);
      const idx = departments.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Department not found");
      departments[idx] = { ...departments[idx], ...payload };
      return { data: { ...departments[idx] }, message: "Department updated" };
   },
};

// ── Programs API ────────────────────────────

export const programsApi = {
   async listByDepartment(departmentId: string): Promise<ApiListResponse<Program>> {
      await delay();
      const result = programs.filter((p) => p.department_id === departmentId);
      return { data: [...result], total: result.length };
   },

   async create(payload: CreateProgramPayload): Promise<ApiSingleResponse<Program>> {
      await delay(500);
      if (programs.some((p) => p.code === payload.code)) throw new Error("Program code already exists");
      const item: Program = {
         id: uid(), department_id: payload.department_id,
         name: payload.name, code: payload.code,
         degree_type: payload.degree_type,
         duration_years: payload.duration_years,
         description: payload.description ?? "",
         min_credit_units: payload.min_credit_units,
         is_active: true,
      };
      programs.push(item);
      // bump count
      const dept = departments.find((d) => d.id === payload.department_id);
      if (dept) dept.programs_count++;
      return { data: item, message: "Program created" };
   },

   async update(id: string, payload: UpdateProgramPayload): Promise<ApiSingleResponse<Program>> {
      await delay(500);
      const idx = programs.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Program not found");
      programs[idx] = { ...programs[idx], ...payload };
      return { data: { ...programs[idx] }, message: "Program updated" };
   },
};

// ── Levels API (university-wide) ────────────

export const levelsApi = {
   async list(): Promise<ApiListResponse<CurriculumLevel>> {
      await delay();
      const result = [...levels].sort((a, b) => a.numeric_value - b.numeric_value);
      return { data: result, total: result.length };
   },

   async create(payload: CreateCurriculumLevelPayload): Promise<ApiSingleResponse<CurriculumLevel>> {
      await delay(500);
      if (levels.some((l) => l.numeric_value === payload.numeric_value)) {
         throw new Error("Level with this value already exists");
      }
      const item: CurriculumLevel = {
         id: uid(), name: payload.name, numeric_value: payload.numeric_value,
         semesters_count: 0,
      };
      levels.push(item);
      return { data: item, message: "Level created" };
   },

   async update(id: string, payload: UpdateCurriculumLevelPayload): Promise<ApiSingleResponse<CurriculumLevel>> {
      await delay(500);
      const idx = levels.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Level not found");
      levels[idx] = { ...levels[idx], ...payload };
      return { data: { ...levels[idx] }, message: "Level updated" };
   },
};

// ── Semesters API ───────────────────────────

export const curriculumSemestersApi = {
   async listByLevel(levelId: string): Promise<ApiListResponse<CurriculumSemester>> {
      await delay();
      const result = curriculumSemesters
         .filter((s) => s.level_id === levelId)
         .sort((a, b) => a.sequence_no - b.sequence_no);
      return { data: [...result], total: result.length };
   },

   async create(payload: CreateCurriculumSemesterPayload): Promise<ApiSingleResponse<CurriculumSemester>> {
      await delay(500);
      if (curriculumSemesters.some((s) => s.level_id === payload.level_id && s.sequence_no === payload.sequence_no)) {
         throw new Error("Semester with this sequence already exists for the level");
      }
      const item: CurriculumSemester = {
         id: uid(), level_id: payload.level_id,
         name: payload.name, sequence_no: payload.sequence_no,
         courses_count: 0,
      };
      curriculumSemesters.push(item);
      // bump count
      const lvl = levels.find((l) => l.id === payload.level_id);
      if (lvl) lvl.semesters_count++;
      return { data: item, message: "Semester created" };
   },

   async update(id: string, payload: UpdateCurriculumSemesterPayload): Promise<ApiSingleResponse<CurriculumSemester>> {
      await delay(500);
      const idx = curriculumSemesters.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Semester not found");
      curriculumSemesters[idx] = { ...curriculumSemesters[idx], ...payload };
      return { data: { ...curriculumSemesters[idx] }, message: "Semester updated" };
   },
};

// ── Query keys ──────────────────────────────

export const courseStructureKeys = {
   faculties: {
      all: ["course-structure", "faculties"] as const,
      list: () => [...courseStructureKeys.faculties.all, "list"] as const,
      detail: (id: string) => [...courseStructureKeys.faculties.all, "detail", id] as const,
   },
   departments: {
      all: ["course-structure", "departments"] as const,
      byFaculty: (facultyId: string) => [...courseStructureKeys.departments.all, "by-faculty", facultyId] as const,
      detail: (id: string) => [...courseStructureKeys.departments.all, "detail", id] as const,
   },
   programs: {
      all: ["course-structure", "programs"] as const,
      byDepartment: (departmentId: string) => [...courseStructureKeys.programs.all, "by-dept", departmentId] as const,
   },
   levels: {
      all: ["course-structure", "levels"] as const,
      list: () => [...courseStructureKeys.levels.all, "list"] as const,
   },
   semesters: {
      all: ["course-structure", "semesters"] as const,
      byLevel: (levelId: string) => [...courseStructureKeys.semesters.all, "by-level", levelId] as const,
   },
};

// ── Query options ───────────────────────────

export const courseStructureQueryOptions = {
   faculties: {
      list: () =>
         createApiQueryOptions({ queryKey: courseStructureKeys.faculties.list(), queryFn: () => facultiesApi.list() }),
      detail: (id: string) =>
         createApiQueryOptions({ queryKey: courseStructureKeys.faculties.detail(id), queryFn: () => facultiesApi.getById(id) }),
   },
   departments: {
      byFaculty: (facultyId: string) =>
         createApiQueryOptions({ queryKey: courseStructureKeys.departments.byFaculty(facultyId), queryFn: () => departmentsApi.listByFaculty(facultyId) }),
      detail: (id: string) =>
         createApiQueryOptions({ queryKey: courseStructureKeys.departments.detail(id), queryFn: () => departmentsApi.getById(id) }),
   },
   programs: {
      byDepartment: (departmentId: string) =>
         createApiQueryOptions({ queryKey: courseStructureKeys.programs.byDepartment(departmentId), queryFn: () => programsApi.listByDepartment(departmentId) }),
   },
   levels: {
      list: () =>
         createApiQueryOptions({ queryKey: courseStructureKeys.levels.list(), queryFn: () => levelsApi.list() }),
   },
   semesters: {
      byLevel: (levelId: string) =>
         createApiQueryOptions({ queryKey: courseStructureKeys.semesters.byLevel(levelId), queryFn: () => curriculumSemestersApi.listByLevel(levelId) }),
   },
};

// ── Mutation options ────────────────────────

export const courseStructureMutationOptions = {
   createFaculty: () =>
      createApiMutationOptions<ApiSingleResponse<Faculty>, CreateFacultyPayload>({
         mutationKey: [...courseStructureKeys.faculties.all, "create"],
         mutationFn: (payload) => facultiesApi.create(payload),
      }),
   updateFaculty: () =>
      createApiMutationOptions<ApiSingleResponse<Faculty>, { id: string; payload: UpdateFacultyPayload }>({
         mutationKey: [...courseStructureKeys.faculties.all, "update"],
         mutationFn: ({ id, payload }) => facultiesApi.update(id, payload),
      }),
   createDepartment: () =>
      createApiMutationOptions<ApiSingleResponse<Department>, CreateDepartmentPayload>({
         mutationKey: [...courseStructureKeys.departments.all, "create"],
         mutationFn: (payload) => departmentsApi.create(payload),
      }),
   updateDepartment: () =>
      createApiMutationOptions<ApiSingleResponse<Department>, { id: string; payload: UpdateDepartmentPayload }>({
         mutationKey: [...courseStructureKeys.departments.all, "update"],
         mutationFn: ({ id, payload }) => departmentsApi.update(id, payload),
      }),
   createProgram: () =>
      createApiMutationOptions<ApiSingleResponse<Program>, CreateProgramPayload>({
         mutationKey: [...courseStructureKeys.programs.all, "create"],
         mutationFn: (payload) => programsApi.create(payload),
      }),
   updateProgram: () =>
      createApiMutationOptions<ApiSingleResponse<Program>, { id: string; payload: UpdateProgramPayload }>({
         mutationKey: [...courseStructureKeys.programs.all, "update"],
         mutationFn: ({ id, payload }) => programsApi.update(id, payload),
      }),
   createLevel: () =>
      createApiMutationOptions<ApiSingleResponse<CurriculumLevel>, CreateCurriculumLevelPayload>({
         mutationKey: [...courseStructureKeys.levels.all, "create"],
         mutationFn: (payload) => levelsApi.create(payload),
      }),
   updateLevel: () =>
      createApiMutationOptions<ApiSingleResponse<CurriculumLevel>, { id: string; payload: UpdateCurriculumLevelPayload }>({
         mutationKey: [...courseStructureKeys.levels.all, "update"],
         mutationFn: ({ id, payload }) => levelsApi.update(id, payload),
      }),
   createSemester: () =>
      createApiMutationOptions<ApiSingleResponse<CurriculumSemester>, CreateCurriculumSemesterPayload>({
         mutationKey: [...courseStructureKeys.semesters.all, "create"],
         mutationFn: (payload) => curriculumSemestersApi.create(payload),
      }),
   updateSemester: () =>
      createApiMutationOptions<ApiSingleResponse<CurriculumSemester>, { id: string; payload: UpdateCurriculumSemesterPayload }>({
         mutationKey: [...courseStructureKeys.semesters.all, "update"],
         mutationFn: ({ id, payload }) => curriculumSemestersApi.update(id, payload),
      }),
};
