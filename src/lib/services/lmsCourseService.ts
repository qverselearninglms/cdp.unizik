import { apiClient } from "@/core/client";
import { lmsBaseUrl } from "@/config";
import type { ApiError } from "@/types/auth";
import type { CourseEnrollment, EnrolledCourse } from "@/types/course";

/* eslint-disable @typescript-eslint/no-explicit-any -- the enrolled-courses body has no stable shape */

/**
 * Pull the course list out of whatever shape the endpoint returns.
 *
 * The body is inconsistent across deployments — some put the array at
 * `courses`, some at `data.courses`, some return `data` as the array outright.
 * Try each in turn. An array that exists but is empty is a real answer (no
 * enrolments) and stops the search.
 */
function extractEnrolledCourses(body: unknown): any[] {
    if (!body) return [];
    if (Array.isArray(body)) return flattenCourseGroups(body);

    const shape = body as Record<string, any>;
    const candidates = [
        shape.courses,
        shape.data?.courses,
        shape.data?.data?.courses,
        shape.data,
        shape.data?.data,
    ];

    const found = candidates.find(Array.isArray);
    return found ? flattenCourseGroups(found) : [];
}

/**
 * The "with-category" variant may nest courses under a category wrapper.
 * Flatten those, carrying the category down onto each course so the card can
 * still show which programme it belongs to.
 */
function flattenCourseGroups(items: any[]): any[] {
    return items.flatMap((item) => {
        if (item && Array.isArray(item.courses)) {
            const groupName = item.category?.name ?? item.course_group ?? item.name ?? null;
            const groupId = item.category?.id ?? item.course_group_id ?? item.id ?? null;

            return item.courses.map((course: any) => ({
                ...course,
                course_group: course.course_group ?? groupName,
                course_group_id: course.course_group_id ?? groupId,
            }));
        }
        return [item];
    });
}

/**
 * Field names differ between the portal's own shape (course_id/course_name)
 * and a raw Moodle course (id/fullname/shortname), so accept either.
 */
function toCourseEnrollment(apiCourse: any): CourseEnrollment {
    const courseId = apiCourse.course_id ?? apiCourse.id ?? apiCourse.courseId;
    const courseName = apiCourse.course_name ?? apiCourse.fullname ?? apiCourse.name ?? "Untitled course";
    const shortName = apiCourse.short_name ?? apiCourse.shortname ?? "";

    const course: EnrolledCourse = {
        id: `${courseId}`,
        title: courseName,
        description: apiCourse.summary ?? "",
        instructor: "Instructor",
        rating: 0,
        studentsEnrolled: 0,
        imageUrl: "",

        course_group: apiCourse.course_group,
        course_group_id: apiCourse.course_group_id ?? apiCourse.category,
        course_id: courseId,
        course_name: courseName,
        short_name: shortName,
    };

    return {
        id: `enroll-${courseId}`,
        courseId: `${courseId}`,
        course,
        enrolledAt: apiCourse.enrolled_at ?? new Date().toISOString(),
        progress: Number(apiCourse.progress ?? 0),
        completed: Boolean(apiCourse.completed ?? false),
    };
}

export const lmsCourseService = {
    /** Courses the student is enrolled in on the LMS. Never throws; [] on failure. */
    async getEnrolledCourses(): Promise<CourseEnrollment[]> {
        try {
            const response = await apiClient.get("/student/my-enrolled-courses-with-category");
            const apiCourses = extractEnrolledCourses(response);

            if (apiCourses.length === 0) {
                // Shape drift is silent and looks identical to "no courses",
                // so leave a breadcrumb naming the keys we actually received.
                console.warn(
                    "[lms] no courses extracted from /student/my-enrolled-courses-with-category — body keys:",
                    response && typeof response === "object" ? Object.keys(response) : typeof response,
                    response
                );
            }

            return apiCourses.map(toCourseEnrollment);
        } catch (error) {
            const apiError = error as ApiError;
            console.error(
                `Failed to fetch enrolled courses [${apiError?.statusCode ?? "unknown"}]:`,
                apiError?.message ?? String(error)
            );
            return [];
        }
    },

    /** Open the LMS (signed in via the SSO script) in a new tab. */
    redirectToCourseWarePlatform(username: string): void {
        const courseUrl = `${lmsBaseUrl}/ssotester/index.php?sso_loggers=1&u=${username}&password=1`;
        window.open(courseUrl, "_blank");
    },
};
