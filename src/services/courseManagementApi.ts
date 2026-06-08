import { createApiMutationOptions, createApiQueryOptions } from "@/lib/clients/apiClient";
import type {
    Course,
    CourseType,
    ProgramCourse,
    CreateCoursePayload,
    UpdateCoursePayload,
    AssignCourseToProgramPayload,
    UpdateProgramCoursePayload,
    ApiListResponse,
    ApiSingleResponse,
} from "@/types/school";

// ── helpers ─────────────────────────────────
let _nextId = 900;
const uid = () => String(++_nextId);
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ── Reference data look-ups ─────────────────
// These mirror the seed data in courseStructureApi.ts so we can
// denormalize names for display. In production, the API would JOIN.

const semesterLookup: Record<string, { level_name: string; semester_name: string }> = {
    "csem-1": { level_name: "100 Level", semester_name: "1st Semester" },
    "csem-2": { level_name: "100 Level", semester_name: "2nd Semester" },
    "csem-3": { level_name: "200 Level", semester_name: "1st Semester" },
    "csem-4": { level_name: "200 Level", semester_name: "2nd Semester" },
    "csem-5": { level_name: "300 Level", semester_name: "1st Semester" },
    "csem-6": { level_name: "300 Level", semester_name: "2nd Semester" },
    "csem-7": { level_name: "400 Level", semester_name: "1st Semester" },
    "csem-8": { level_name: "400 Level", semester_name: "2nd Semester" },
};

const departmentLookup: Record<string, string> = {
    "dept-1": "Computer Science",
    "dept-2": "Mathematics",
    "dept-3": "Mechanical Engineering",
};

const programLookup: Record<string, { name: string; code: string }> = {
    "prog-1": { name: "B.Sc. Computer Science", code: "CSC" },
    "prog-2": { name: "B.Sc. Mathematics", code: "MTH" },
    "prog-3": { name: "B.Eng. Mechanical Engineering", code: "MEE" },
};

// ── helper to build a Course ────────────────
function makeCourse(
    id: string, code: string, title: string, credits: number,
    type: CourseType, semId: string, deptId: string | null,
): Course {
    const sem = semesterLookup[semId] ?? { level_name: "?", semester_name: "?" };
    return {
        id, code, title, description: "", credit_units: credits,
        course_type: type, curriculum_semester_id: semId,
        owning_department_id: deptId, is_active: true,
        level_name: sem.level_name, semester_name: sem.semester_name,
        department_name: deptId ? (departmentLookup[deptId] ?? null) : null,
    };
}

// ── seed: courses ───────────────────────────

const courses: Course[] = [
    // ─── 100 Level, 1st Semester ─────────────
    makeCourse("crs-1", "GST101", "Use of English I", 2, "GENERAL", "csem-1", null),
    makeCourse("crs-2", "GST103", "Nigerian Peoples & Culture", 2, "GENERAL", "csem-1", null),
    makeCourse("crs-3", "GST105", "Philosophy & Logic", 2, "GENERAL", "csem-1", null),
    makeCourse("crs-4", "MTH101", "Elementary Mathematics I", 3, "FACULTY", "csem-1", "dept-2"),
    makeCourse("crs-5", "CSC101", "Introduction to Computer Science", 3, "DEPARTMENTAL", "csem-1", "dept-1"),
    makeCourse("crs-6", "CSC103", "Introduction to Problem Solving", 2, "DEPARTMENTAL", "csem-1", "dept-1"),

    // ─── 100 Level, 2nd Semester ─────────────
    makeCourse("crs-7", "GST102", "Use of English II", 2, "GENERAL", "csem-2", null),
    makeCourse("crs-8", "GST104", "History & Philosophy of Science", 2, "GENERAL", "csem-2", null),
    makeCourse("crs-9", "MTH102", "Elementary Mathematics II", 3, "FACULTY", "csem-2", "dept-2"),
    makeCourse("crs-10", "CSC102", "Introduction to Programming", 3, "DEPARTMENTAL", "csem-2", "dept-1"),
    makeCourse("crs-11", "CSC104", "Discrete Mathematics", 3, "DEPARTMENTAL", "csem-2", "dept-1"),

    // ─── 200 Level, 1st Semester ─────────────
    makeCourse("crs-12", "GST201", "Entrepreneurship I", 2, "GENERAL", "csem-3", null),
    makeCourse("crs-13", "MTH201", "Mathematical Methods I", 3, "FACULTY", "csem-3", "dept-2"),
    makeCourse("crs-14", "CSC201", "Computer Programming I", 3, "DEPARTMENTAL", "csem-3", "dept-1"),
    makeCourse("crs-15", "CSC203", "Digital Logic Design", 3, "DEPARTMENTAL", "csem-3", "dept-1"),
    makeCourse("crs-16", "CSC205", "Operating Systems I", 3, "DEPARTMENTAL", "csem-3", "dept-1"),
    makeCourse("crs-17", "MTH203", "Linear Algebra I", 3, "FACULTY", "csem-3", "dept-2"),
    makeCourse("crs-18", "CSC207", "Web Technologies", 2, "ELECTIVE", "csem-3", "dept-1"),

    // ─── 200 Level, 2nd Semester ─────────────
    makeCourse("crs-19", "GST202", "Entrepreneurship II", 2, "GENERAL", "csem-4", null),
    makeCourse("crs-20", "CSC202", "Computer Programming II", 3, "DEPARTMENTAL", "csem-4", "dept-1"),
    makeCourse("crs-21", "CSC204", "Data Structures & Algorithms", 3, "DEPARTMENTAL", "csem-4", "dept-1"),
    makeCourse("crs-22", "CSC206", "Operating Systems II", 3, "DEPARTMENTAL", "csem-4", "dept-1"),
    makeCourse("crs-23", "MTH202", "Mathematical Methods II", 3, "FACULTY", "csem-4", "dept-2"),
    makeCourse("crs-24", "CSC208", "Mobile App Development", 2, "ELECTIVE", "csem-4", "dept-1"),

    // ─── MEE courses (100 Level, 1st Sem) ────
    makeCourse("crs-25", "MEE101", "Engineering Drawing I", 3, "DEPARTMENTAL", "csem-1", "dept-3"),
    makeCourse("crs-26", "MEE103", "Workshop Practice I", 2, "DEPARTMENTAL", "csem-1", "dept-3"),
];

// ── seed: program-course mappings ───────────

const programCourses: ProgramCourse[] = [
    // B.Sc. Computer Science (prog-1) — 100L 1st Sem
    { id: "pc-1", program_id: "prog-1", course_id: "crs-1", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    { id: "pc-2", program_id: "prog-1", course_id: "crs-2", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    { id: "pc-3", program_id: "prog-1", course_id: "crs-3", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    { id: "pc-4", program_id: "prog-1", course_id: "crs-4", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    { id: "pc-5", program_id: "prog-1", course_id: "crs-5", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    { id: "pc-6", program_id: "prog-1", course_id: "crs-6", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    // B.Sc. Computer Science — 100L 2nd Sem
    { id: "pc-7", program_id: "prog-1", course_id: "crs-7", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    { id: "pc-8", program_id: "prog-1", course_id: "crs-8", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    { id: "pc-9", program_id: "prog-1", course_id: "crs-9", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    { id: "pc-10", program_id: "prog-1", course_id: "crs-10", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    { id: "pc-11", program_id: "prog-1", course_id: "crs-11", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    // B.Sc. Computer Science — 200L 1st Sem (including elective)
    { id: "pc-12", program_id: "prog-1", course_id: "crs-12", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    { id: "pc-13", program_id: "prog-1", course_id: "crs-13", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    { id: "pc-14", program_id: "prog-1", course_id: "crs-14", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    { id: "pc-15", program_id: "prog-1", course_id: "crs-15", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    { id: "pc-16", program_id: "prog-1", course_id: "crs-16", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    { id: "pc-17", program_id: "prog-1", course_id: "crs-17", is_required: true, program_name: "B.Sc. Computer Science", program_code: "CSC" },
    { id: "pc-18", program_id: "prog-1", course_id: "crs-18", is_required: false, program_name: "B.Sc. Computer Science", program_code: "CSC" },

    // B.Sc. Mathematics (prog-2) — shares GST + MTH courses in 100L 1st Sem
    { id: "pc-19", program_id: "prog-2", course_id: "crs-1", is_required: true, program_name: "B.Sc. Mathematics", program_code: "MTH" },
    { id: "pc-20", program_id: "prog-2", course_id: "crs-2", is_required: true, program_name: "B.Sc. Mathematics", program_code: "MTH" },
    { id: "pc-21", program_id: "prog-2", course_id: "crs-3", is_required: true, program_name: "B.Sc. Mathematics", program_code: "MTH" },
    { id: "pc-22", program_id: "prog-2", course_id: "crs-4", is_required: true, program_name: "B.Sc. Mathematics", program_code: "MTH" },

    // B.Eng. Mechanical Engineering (prog-3) — shares GST + has own dept courses
    { id: "pc-23", program_id: "prog-3", course_id: "crs-1", is_required: true, program_name: "B.Eng. Mechanical Engineering", program_code: "MEE" },
    { id: "pc-24", program_id: "prog-3", course_id: "crs-2", is_required: true, program_name: "B.Eng. Mechanical Engineering", program_code: "MEE" },
    { id: "pc-25", program_id: "prog-3", course_id: "crs-3", is_required: true, program_name: "B.Eng. Mechanical Engineering", program_code: "MEE" },
    { id: "pc-26", program_id: "prog-3", course_id: "crs-4", is_required: true, program_name: "B.Eng. Mechanical Engineering", program_code: "MEE" },
    { id: "pc-27", program_id: "prog-3", course_id: "crs-25", is_required: true, program_name: "B.Eng. Mechanical Engineering", program_code: "MEE" },
    { id: "pc-28", program_id: "prog-3", course_id: "crs-26", is_required: true, program_name: "B.Eng. Mechanical Engineering", program_code: "MEE" },
];

// ── Courses API ─────────────────────────────

export const coursesApi = {
    async list(): Promise<ApiListResponse<Course>> {
        await delay();
        return { data: [...courses], total: courses.length };
    },

    async listBySemester(semesterId: string): Promise<ApiListResponse<Course>> {
        await delay();
        const result = courses.filter((c) => c.curriculum_semester_id === semesterId);
        return { data: [...result], total: result.length };
    },

    async getById(id: string): Promise<ApiSingleResponse<Course>> {
        await delay(200);
        const item = courses.find((c) => c.id === id);
        if (!item) throw new Error("Course not found");
        return { data: { ...item } };
    },

    async create(payload: CreateCoursePayload): Promise<ApiSingleResponse<Course>> {
        await delay(500);
        if (courses.some((c) => c.code === payload.code)) throw new Error("Course code already exists");
        const sem = semesterLookup[payload.curriculum_semester_id];
        if (!sem) throw new Error("Invalid semester");
        const item: Course = {
            id: uid(), code: payload.code, title: payload.title,
            description: payload.description ?? "",
            credit_units: payload.credit_units,
            course_type: payload.course_type,
            curriculum_semester_id: payload.curriculum_semester_id,
            owning_department_id: payload.owning_department_id ?? null,
            is_active: true,
            level_name: sem.level_name,
            semester_name: sem.semester_name,
            department_name: payload.owning_department_id
                ? (departmentLookup[payload.owning_department_id] ?? null)
                : null,
        };
        courses.push(item);
        return { data: item, message: "Course created" };
    },

    async update(id: string, payload: UpdateCoursePayload): Promise<ApiSingleResponse<Course>> {
        await delay(500);
        const idx = courses.findIndex((c) => c.id === id);
        if (idx === -1) throw new Error("Course not found");
        const updated = { ...courses[idx], ...payload };
        // re-derive denormalized fields
        if (payload.curriculum_semester_id) {
            const sem = semesterLookup[payload.curriculum_semester_id];
            if (sem) { updated.level_name = sem.level_name; updated.semester_name = sem.semester_name; }
        }
        if (payload.owning_department_id !== undefined) {
            updated.department_name = payload.owning_department_id
                ? (departmentLookup[payload.owning_department_id] ?? null)
                : null;
        }
        courses[idx] = updated;
        return { data: { ...updated }, message: "Course updated" };
    },
};

// ── Program Courses API ─────────────────────

export const programCoursesApi = {
    async listByCourse(courseId: string): Promise<ApiListResponse<ProgramCourse>> {
        await delay();
        const result = programCourses.filter((pc) => pc.course_id === courseId);
        return { data: [...result], total: result.length };
    },

    async listByProgram(programId: string): Promise<ApiListResponse<ProgramCourse>> {
        await delay();
        const result = programCourses.filter((pc) => pc.program_id === programId);
        return { data: [...result], total: result.length };
    },

    async assign(payload: AssignCourseToProgramPayload): Promise<ApiSingleResponse<ProgramCourse>> {
        await delay(500);
        if (programCourses.some((pc) => pc.program_id === payload.program_id && pc.course_id === payload.course_id)) {
            throw new Error("Course is already assigned to this program");
        }
        const prog = programLookup[payload.program_id];
        if (!prog) throw new Error("Program not found");
        const item: ProgramCourse = {
            id: uid(),
            program_id: payload.program_id,
            course_id: payload.course_id,
            is_required: payload.is_required,
            program_name: prog.name,
            program_code: prog.code,
        };
        programCourses.push(item);
        return { data: item, message: "Course assigned to program" };
    },

    async update(id: string, payload: UpdateProgramCoursePayload): Promise<ApiSingleResponse<ProgramCourse>> {
        await delay(500);
        const idx = programCourses.findIndex((pc) => pc.id === id);
        if (idx === -1) throw new Error("Program course mapping not found");
        programCourses[idx] = { ...programCourses[idx], ...payload };
        return { data: { ...programCourses[idx] }, message: "Mapping updated" };
    },

    async remove(id: string): Promise<ApiSingleResponse<null>> {
        await delay(500);
        const idx = programCourses.findIndex((pc) => pc.id === id);
        if (idx === -1) throw new Error("Program course mapping not found");
        programCourses.splice(idx, 1);
        return { data: null, message: "Course removed from program" };
    },
};

// ── Query keys ──────────────────────────────

export const courseManagementKeys = {
    courses: {
        all: ["course-management", "courses"] as const,
        list: () => [...courseManagementKeys.courses.all, "list"] as const,
        bySemester: (semId: string) => [...courseManagementKeys.courses.all, "by-semester", semId] as const,
        detail: (id: string) => [...courseManagementKeys.courses.all, "detail", id] as const,
    },
    programCourses: {
        all: ["course-management", "program-courses"] as const,
        byCourse: (courseId: string) => [...courseManagementKeys.programCourses.all, "by-course", courseId] as const,
        byProgram: (programId: string) => [...courseManagementKeys.programCourses.all, "by-program", programId] as const,
    },
};

// ── Query options ───────────────────────────

export const courseManagementQueryOptions = {
    courses: {
        list: () =>
            createApiQueryOptions({ queryKey: courseManagementKeys.courses.list(), queryFn: () => coursesApi.list() }),
        bySemester: (semId: string) =>
            createApiQueryOptions({ queryKey: courseManagementKeys.courses.bySemester(semId), queryFn: () => coursesApi.listBySemester(semId) }),
        detail: (id: string) =>
            createApiQueryOptions({ queryKey: courseManagementKeys.courses.detail(id), queryFn: () => coursesApi.getById(id) }),
    },
    programCourses: {
        byCourse: (courseId: string) =>
            createApiQueryOptions({ queryKey: courseManagementKeys.programCourses.byCourse(courseId), queryFn: () => programCoursesApi.listByCourse(courseId) }),
        byProgram: (programId: string) =>
            createApiQueryOptions({ queryKey: courseManagementKeys.programCourses.byProgram(programId), queryFn: () => programCoursesApi.listByProgram(programId) }),
    },
};

// ── Mutation options ────────────────────────

export const courseManagementMutationOptions = {
    createCourse: () =>
        createApiMutationOptions<ApiSingleResponse<Course>, CreateCoursePayload>({
            mutationKey: [...courseManagementKeys.courses.all, "create"],
            mutationFn: (payload) => coursesApi.create(payload),
        }),
    updateCourse: () =>
        createApiMutationOptions<ApiSingleResponse<Course>, { id: string; payload: UpdateCoursePayload }>({
            mutationKey: [...courseManagementKeys.courses.all, "update"],
            mutationFn: ({ id, payload }) => coursesApi.update(id, payload),
        }),
    assignCourseToProgram: () =>
        createApiMutationOptions<ApiSingleResponse<ProgramCourse>, AssignCourseToProgramPayload>({
            mutationKey: [...courseManagementKeys.programCourses.all, "assign"],
            mutationFn: (payload) => programCoursesApi.assign(payload),
        }),
    updateProgramCourse: () =>
        createApiMutationOptions<ApiSingleResponse<ProgramCourse>, { id: string; payload: UpdateProgramCoursePayload }>({
            mutationKey: [...courseManagementKeys.programCourses.all, "update"],
            mutationFn: ({ id, payload }) => programCoursesApi.update(id, payload),
        }),
    removeProgramCourse: () =>
        createApiMutationOptions<ApiSingleResponse<null>, string>({
            mutationKey: [...courseManagementKeys.programCourses.all, "remove"],
            mutationFn: (id) => programCoursesApi.remove(id),
        }),
};
