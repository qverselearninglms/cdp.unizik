import { Category, Enrollment, ApiCategory, ApiCourse, Course, SubCategory, PaymentData, EnrollmentApiResponse, VerifyPaymentResponse } from '../types/course.types';
import { mockCategories, mockCourses, mockSubCategories } from '../data/mock-data';
import { apiClient } from '@/core/client';
import { ApiError } from '@/types/auth';
import { lmsBaseUrl } from '@/config';

interface EnrolledCourseResponseType {
    course_id: number | string;
    course_name: string;
    course_group?: string;
    course_group_id?: number;
    short_name?: string;
}
class CourseService {
    // Cache for API data
    private apiCategoriesCache: ApiCategory[] | null = null;
    private apiCoursesCache: ApiCourse[] | null = null;

    /**
     * Pull the course list out of whatever shape the endpoint returns.
     *
     * `apiClient.get` already unwraps the HTTP response to the body, but the body
     * itself is inconsistent across these endpoints — some put the array at
     * `courses`, some at `data.courses`, some return `data` as the array outright.
     * Rather than betting on one, try each in turn. An array that exists but is
     * empty is a real answer (no enrolments) and stops the search.
     */
    private extractEnrolledCourses = (body: unknown): any[] => {
        if (!body) return [];
        if (Array.isArray(body)) return this.flattenCourseGroups(body);

        const shape = body as Record<string, any>;
        const candidates = [
            shape.courses,
            shape.data?.courses,
            shape.data?.data?.courses,
            shape.data,
            shape.data?.data,
        ];

        const found = candidates.find(Array.isArray);
        return found ? this.flattenCourseGroups(found) : [];
    }

    /**
     * The "with-category" variant may nest courses under a category wrapper.
     * Flatten those, carrying the category down onto each course so the card can
     * still show which programme it belongs to.
     */
    private flattenCourseGroups = (items: any[]): any[] =>
        items.flatMap((item) => {
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

    getEnrolledCourseWithCategories = async (): Promise<Enrollment[]> => {
        try {
            const response = await apiClient.get<EnrollmentApiResponse>("/student/my-enrolled-courses-with-category");
            const apiCourses = this.extractEnrolledCourses(response);

            if (apiCourses.length === 0) {
                // Shape drift here is silent and looks identical to "no courses",
                // so leave a breadcrumb naming the keys we actually received.
                console.warn(
                    '[enrollment] no courses extracted from /student/my-enrolled-courses-with-category — body keys:',
                    response && typeof response === 'object' ? Object.keys(response) : typeof response,
                    response
                );
            }

            return apiCourses.map((apiCourse) => this.transformApiCourseToEnrollment(apiCourse));
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to fetch enrollments from API [${apiError?.statusCode ?? 'unknown'}]:`, apiError?.message ?? String(error));
            return [];
        }
    }

    getPaidCategories = async (): Promise<Enrollment[]> => {
        try {
            const response = await apiClient.get<EnrollmentApiResponse>("/student/paid-courses-category");
            const paidCategories = (response as any).data || [];

            return paidCategories
        } catch (error) {
            const apiError = error as ApiError;
            console.error(
                `Failed to fetch paid categories from API [${apiError?.statusCode ?? 'unknown'}]:`,
                apiError?.message ?? String(error)
            );
            return [];
        }
    }

    getEnrolledCourse = async (): Promise<Enrollment[]> => {
        try {
            const results = await apiClient.get<EnrollmentApiResponse>("/student/my-enrolled-courses");
            const apiCourses = this.extractEnrolledCourses(results);

            // Transform API courses to Enrollment format
            return apiCourses.map(apiCourse => this.transformApiCourseToEnrollment(apiCourse));
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to fetch enrolled courses from API [${apiError?.statusCode ?? 'unknown'}]:`, apiError?.message ?? String(error));
            return [];
        }
    }

    fetchApiCategories = async (): Promise<ApiCategory[]> => {
        if (this.apiCategoriesCache) return this.apiCategoriesCache;

        try {
            const results = await apiClient.get<ApiCategory[]>("/odl/categories");
            this.apiCategoriesCache = results.data;
            return this.apiCategoriesCache as ApiCategory[];
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to fetch categories from API [${apiError?.statusCode ?? 'unknown'}]:`, apiError?.message ?? String(error));
            return [];
        }
    }

    fetchApiCourses = async (): Promise<ApiCourse[]> => {
        if (this.apiCoursesCache) return this.apiCoursesCache;

        try {
            const results = await apiClient.get<ApiCourse[]>("/odl/courses");
            this.apiCoursesCache = results.data;
            return this.apiCoursesCache as ApiCourse[];
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to fetch courses from API [${apiError?.statusCode ?? 'unknown'}]:`, apiError?.message ?? String(error));
            return [];
        }
    }

    // Helper to transform API course data to Enrollment.
    // Field names differ between the portal's own shape (course_id/course_name)
    // and a raw Moodle course (id/fullname/shortname), so accept either.
    private transformApiCourseToEnrollment = (apiCourse: any): Enrollment => {
        const courseId = apiCourse.course_id ?? apiCourse.id ?? apiCourse.courseId;
        const courseName =
            apiCourse.course_name ?? apiCourse.fullname ?? apiCourse.name ?? 'Untitled course';
        const shortName = apiCourse.short_name ?? apiCourse.shortname ?? '';

        // Create course object from API data
        const course: Course = {
            id: `${courseId}`,
            title: courseName,
            description: apiCourse.summary ?? '',
            instructor: 'Instructor', // Default value
            rating: 0, // Default value
            studentsEnrolled: 0, // Default value
            imageUrl: '', // Default value

            // Map API fields
            course_group: apiCourse.course_group,
            course_group_id: apiCourse.course_group_id ?? apiCourse.category,
            course_id: courseId,
            course_name: courseName,
            short_name: shortName
        };

        return {
            id: `enroll-${courseId}`,
            courseId: `${courseId}`,
            course: course,
            enrolledAt: apiCourse.enrolled_at ?? new Date().toISOString(),
            progress: Number(apiCourse.progress ?? 0),
            completed: Boolean(apiCourse.completed ?? false)
        };
    }

    private augmentCourse = (
        apiCourse: ApiCourse
    ): Partial<Course> => {
        // Pick mock course data sequentially based on course ID
        const mockIndex = (apiCourse.id - 1) % mockCourses.length;
        const mockCourse = mockCourses[mockIndex];

        // Use API summary if available, otherwise use mock description
        const description = apiCourse.summary && apiCourse.summary.trim() !== ''
            ? apiCourse.summary
            : mockCourse.description;

        return {
            // API data - kept as is
            id: `${apiCourse.id}`,
            title: apiCourse.fullname,
            shortname: apiCourse.shortname,
            apiId: apiCourse.id,
            visible: apiCourse.visible,
            startdate: apiCourse.startdate,
            summary: apiCourse.summary,

            // Augmented fields from mock data
            description: description,
            instructor: mockCourse.instructor,
            rating: mockCourse.rating,
            studentsEnrolled: mockCourse.studentsEnrolled,
            imageUrl: mockCourse.imageUrl,

            // Map to enrollment structure fields
            course_group: '', // Will be populated from category data if available
            course_group_id: apiCourse.category, // Use category as group_id
            course_id: apiCourse.id,
            course_name: apiCourse.fullname,
            short_name: apiCourse.shortname
        };
    }

    getMergedCategoriesWithCourses = async (): Promise<Category[]> => {
        try {
            const [apiCategories, apiCourses] = await Promise.all([
                this.fetchApiCategories(),
                this.fetchApiCourses()
            ]);

            // If no data was fetched, return empty array
            if (apiCategories.length === 0 || apiCourses.length === 0) {
                return [];
            }

            return this.buildAugmentedCategories(apiCategories, apiCourses);
        } catch (error) {
            console.error('Error in getMergedCategoriesWithCourses:', error);
            return [];
        }
    }

    private buildAugmentedCategories = (
        apiCategories: ApiCategory[],
        apiCourses: ApiCourse[]
    ): Category[] => {
        // Filter out only visible courses (visible === 1) and exclude category 0
        const visibleApiCourses = apiCourses.filter(course => course.visible === 1 && course.category !== 0);

        // Build the category tree from API data
        const rootCategories = apiCategories.filter(cat => cat.parent === 0);
        const subCategories = apiCategories.filter(cat => cat.parent !== 0);

        // Map API categories to our enhanced Category structure
        return rootCategories.map(apiCategory => {
            // Get subcategories for this root category
            const categorySubCategories = subCategories.filter(sub => sub.parent === apiCategory.id);

            // Build enhanced subcategories
            const enhancedSubCategories = categorySubCategories.map(apiSubCategory => {
                // Get courses for this subcategory
                const subCategoryCourses = visibleApiCourses.filter(course => course.category === apiSubCategory.id);

                // Build enhanced courses
                const enhancedCourses = subCategoryCourses.map(apiCourse => {
                    return this.augmentCourse(apiCourse);
                });

                return this.augmentSubCategory(apiSubCategory, enhancedCourses);
            });

            return this.augmentCategory(apiCategory, enhancedSubCategories);
        });
    }

    private augmentCategory = (
        apiCategory: ApiCategory,
        subCategories: SubCategory[]
    ): Category => {
        // Pick mock category data sequentially based on category ID
        const mockIndex = (apiCategory.id - 1) % mockCategories.length;
        const mockCategory = mockCategories[mockIndex];

        return {
            // API data - kept as is
            id: `${apiCategory.id}`,
            name: apiCategory.name,
            parent: apiCategory.parent,
            sortorder: apiCategory.sortorder,
            apiId: apiCategory.id,

            // Augmented fields from mock data
            description: mockCategory.description,
            icon: mockCategory.icon,
            color: mockCategory.color,

            // Computed fields
            subCategories: subCategories,
        };
    }

    private augmentSubCategory = (
        apiSubCategory: ApiCategory,
        courses: Partial<Course>[]
    ): SubCategory => {
        // Pick mock subcategory data sequentially based on subcategory ID
        const mockIndex = (apiSubCategory.id - 1) % mockSubCategories.length;
        const mockSubCategory = mockSubCategories[mockIndex];

        return {
            // API data - kept as is
            id: `${apiSubCategory.id}`,
            name: apiSubCategory.name,
            parent: apiSubCategory.parent,
            sortorder: apiSubCategory.sortorder,
            apiId: apiSubCategory.id,

            // Augmented fields from mock data
            description: mockSubCategory.description,
            icon: mockSubCategory.icon,

            // Computed fields
            courseCount: courses.length,
            courses: courses as Course[],
        };
    }

    processPayment = async (programId: string, paymentData: Record<string, unknown>): Promise<PaymentData> => {
        try {
            const response = await apiClient.post<PaymentData>('/student/course-payment', {
                "department": paymentData.program_name,
                "course_group_id": programId,
                "amount": paymentData.amount,
            });

            if (response.status !== 200) {
                throw new Error(response.message || 'Failed to initialize payment');
            }

            if (!response.data) {
                throw new Error('No payment data received');
            }

            return response.data;
        } catch (error) {
            console.error('error', error);
            throw error as ApiError;
        }
    }

    verifyCoursePayment = async (verifyCredentials: VerifyPaymentResponse): Promise<VerifyPaymentResponse> => {
        try {
            // Build query string from parameters
            const queryParams = new URLSearchParams({
                transAmount: verifyCredentials.transAmount,
                reference: verifyCredentials.reference,
                transRef: verifyCredentials.transRef,
                processorFee: verifyCredentials.processorFee,
                errorMessage: verifyCredentials.errorMessage,
                currency: verifyCredentials.currency,
                gateway: verifyCredentials.gateway,
                status: verifyCredentials.status,
            }).toString();

            const response = await apiClient.get<VerifyPaymentResponse>(
                `/student/verify-payment?${queryParams}`
            );

            // Check if status is "Successful" (string)
            const responseData = response.data || response;

            // Check if status is "Successful" (string)
            if (responseData.status !== "Successful") {
                throw new Error(responseData.message || 'Payment verification failed');
            }

            return responseData;
        } catch (error) {
            throw error as ApiError;
        }
    }

    processEnrollInCourse = async (enrollmentRequestData: Record<string, unknown>): Promise<any> => {
        try {
            const response = await apiClient.post<any>('/student/enroll-course', {
                "course_group_id": enrollmentRequestData.programId,
                "course_id": enrollmentRequestData.courseId,
                "department": enrollmentRequestData.program_name,
            });

            if (String(response?.status) === 'Success') {
                return response.message;
            }

            if (response?.status && String(response?.status) !== 'Success') {
                throw new Error(response.message || 'Failed to enroll in course');
            }

            throw new Error(response?.message || 'Unexpected response format');
        } catch (error) {
            console.error('error', error);
            throw error as ApiError;
        }
    }

    processUnEnrollFromCourse = async (courseGroupId: number, courseId: number): Promise<any> => {
        try {
            const response = await apiClient.post<any>('/student/unenroll-course', {
                course_group_id: courseGroupId,
                course_id: courseId
            });

            if (String(response?.status) === 'Success') {
                return response.message;
            }

            if (response?.status && String(response?.status) !== 'Success') {
                throw new Error(response.message || 'Failed to unenroll from course');
            }

            throw new Error(response?.message || 'Unexpected response format');
        } catch (error) {
            console.error('Error unenrolling from course:', error);
            throw error as ApiError;
        }
    }

    redirectToCourseWarePlatform = (username: string): void => {
        const courseUrl = `${lmsBaseUrl}/ssotester/index.php?sso_loggers=1&u=${username}&password=1`;
        window.open(courseUrl, '_blank');
    }

    clearCache = (): void => {
        this.apiCategoriesCache = null;
        this.apiCoursesCache = null;
    }

    getCacheStatus = (): { categoriesCached: boolean; coursesCached: boolean } => {
        return {
            categoriesCached: this.apiCategoriesCache !== null,
            coursesCached: this.apiCoursesCache !== null
        };
    }
}

// Export a singleton instance
export const courseService = new CourseService();
