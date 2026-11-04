/**
 * A course the student is enrolled in on the LMS, as shown on the dashboard.
 * Built by lmsCourseService from `/student/my-enrolled-courses-with-category`.
 */
export interface EnrolledCourse {
    id: string;
    title: string;
    description: string;
    instructor: string;
    rating: number;
    studentsEnrolled: number;
    imageUrl: string;

    course_group: string;
    course_group_id: number;
    course_id: number;
    course_name: string;
    short_name: string;
}

export interface CourseEnrollment {
    id: string;
    courseId: string;
    course: EnrolledCourse;
    enrolledAt: string;
    progress: number;
    completed: boolean;
}
