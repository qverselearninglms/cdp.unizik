// src/lib/services/studentService.ts
import { ApiResponse } from '@/types/auth';
import { apiClient } from '@/core/client';
import { parseAmount, toEnrollments, type Enrollment } from './enrollments';

export type {
  Enrollment,
  EnrollmentFee,
  EnrollmentFeeStatus,
} from './enrollments';
export { toEnrollments, parseAmount } from './enrollments';

/**
 * Moodle Course Interface
 */
export interface MoodleCourse {
  id: number;
  category: number;
  sortorder: number;
  fullname: string;
  shortname: string;
  idnumber: string;
  summary: string;
  summaryformat: number;
  format: string;
  showgrades: number;
  newsitems: number;
  startdate: number;
  enddate: number;
  relativedatesmode: number;
  marker: number;
  maxbytes: number;
  legacyfiles: number;
  showreports: number;
  visible: number;
  visibleold: number;
  downloadcontent: any;
  groupmode: number;
  groupmodeforce: number;
  defaultgroupingid: number;
  lang: string;
  calendartype: string;
  theme: string;
  timecreated: number;
  timemodified: number;
  requested: number;
  enablecompletion: number;
  completionnotify: number;
  cacherev: number;
  originalcourseid: number | null;
  showactivitydates: number;
  showcompletionconditions: number | null;
  pdfexportfont: number | null;
}

/**
 * Course Grades Response Interfaces
 */
export interface CourseGradesResponse {
  course_id: number;
  course_code: string;
  course_name: string;
  course_image_url: string;
  instructors: Instructor[];
  students: StudentGrade[];
}

export interface Instructor {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

export interface StudentActivity {
  activity_name: string;
  type: 'quiz' | 'assign' | 'exam' | 'other';
  grade: number;
  max_grade: number;
}

export interface StudentGrade {
  student_id: number;
  student_email: string;
  student_username: string;
  final_grade: number;
  letter_grade: string;
  quality_points: number;
  credit_load: number;
  activities: StudentActivity[];
}

/**
 * Domain types
 */
export interface StudentProfile {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  username: string | null;
  address: string | null;
  state: string | null;
  country: string;
  admission_no: string | null;
  registration_date: string | null;
  enrollment_status: string;
  current_class_id: number | null;
  meta: any | null;
}

export interface GamificationProfile {
  id: string;
  name: string;
  points: number;
  level: number;
  rank: number;
  streak: number;
  attendance: number;
  averageGrade: number;
  nextLevelPoints: number;
  totalStudents: number;
  progressToNextLevel: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  level: number;
  avatar: string;
}

export interface GamificationBadge {
  id: number;
  name: string;
  description: string;
  icon?: string; // Frontend only
  points: number;
  earned: boolean;
  category?: string;
}

export interface RecentActivity {
  id: number;
  title: string;
  description: string;
  points: number;
  type: 'badge' | 'assignment' | 'quiz' | 'streak' | 'attendance' | 'other';
  timestamp: string;
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  cost: number;
  available: boolean;
}

export interface Analytics {
  badgeSummary: {
    totalBadges: number;
    earnedBadges: number;
    totalPointsFromBadges: number;
    categories: string[];
  };
  activityPoints: {
    last7Days: number;
    last30Days: number;
    allTime: number;
  };
}

export interface GamificationData {
  profile: GamificationProfile;
  leaderboard: LeaderboardEntry[];
  badges: GamificationBadge[];
  recentActivities: RecentActivity[];
  rewards: Reward[];
  analytics: Analytics;
}

export interface Payment {
  id: string;
  studentId: string;
  description: string;
  amount: number;
  dueDate: string | null;
  paymentDate: string | null;
  status: 'pending' | 'paid' | 'overdue';
  referenceNumber: string;
  paymentMethod: string | null;
  program: string | null;
}

export interface PaymentStats {
  studentPayments?: {
    summary: {
      totalPaid: number;
      totalPending: number;
      totalOverdue: number;
      totalDue: number;
    };
    payments: Payment[];
    analytics: {
      byStatus: {
        paid: number;
        pending: number;
        overdue: number;
      };
      byProgram: any[];
    };
  };
  summary?: any;
  payments?: any;
  analytics?: any;
}

/**
 * Programme (Moodle category) attached to a student's admission record.
 * `tuition` / `access_fee` arrive as formatted strings, e.g. "500,000".
 */
export interface AdmissionLmsCategory {
  id: number;
  name: string;
  parent: number;
  sortorder: number;
  tuition?: string;
  access_fee?: string;
  duration?: string;
  meta?: Array<string | number>;
}

/** Payload of GET /admission/student */
export interface AdmissionSummary {
  id: number | string;
  name: string;
  email: string;
  department: string;
  faculty: string;
  application_payment_status: string;
  application_status: string;
  admission_status: string;
  acceptance_payment_status: string;
  tuition_payment_status: string;
  tuition_amount_paid: number;
  has_applied: boolean;
  is_admitted: boolean;
  progress_status: string | null;
  session: string;
  offer_expiry_date: string | null;
  lms_category: AdmissionLmsCategory | null;
}

export interface Assessment {
  id: number;
  title: string;
  type: string;
  score: number | null;
  max_score: number;
  date: string;
  subject: string;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  subject: string;
  teacher: string;
  remarks: string | null;
}

export interface StudentClass {
  id: number;
  name: string;
  code: string;
  subject: string;
  teacher_name: string;
  teacher_email: string;
  schedule: string;
  room: string;
  term: string;
  current_grade: string | null;
  attendance_percentage: number | null;
}

export interface StudentCourse {
  id: number;
  name: string;
  code: string;
  course: string;
  currentGrade: string;
  progress: number;
  attendance: {
    headers: any;
    original: {
      status: string;
      message: string;
      data: any[];
    };
    exception: any;
  };
  studentCount: number;
  assignments: number;
  materials: number;
  nextTopic: string;
  teacher: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    Course: string;
  };
  assessments: any[];
}

export interface StudentCoursesResponse {
  status: number;
  message: string;
  data: StudentCourse[];
}

const getBadgeIcon = (index: number): string => {
  const icons = ['🏆', '⭐', '👑', '🎯', '⚡', '🛡️', '🚀', '💎', '💡', '🏅'];
  return icons[index % icons.length];
};

const mapActivityType = (type: string): RecentActivity['type'] => {
  const map: Record<string, RecentActivity['type']> = {
    badge: 'badge',
    assignment: 'assignment',
    quiz: 'quiz',
    streak: 'streak',
    attendance: 'attendance',
    homework: 'assignment',
    exam: 'quiz',
  };
  return map[type] || 'other';
};

const getDefaultGamificationData = (): GamificationData => ({
  profile: {
    id: '0',
    name: 'Student',
    points: 0,
    level: 1,
    rank: 1,
    streak: 0,
    attendance: 0,
    averageGrade: 0,
    nextLevelPoints: 500,
    totalStudents: 1,
    progressToNextLevel: 0,
  },
  leaderboard: [],
  badges: [],
  recentActivities: [],
  rewards: [],
  analytics: {
    badgeSummary: {
      totalBadges: 0,
      earnedBadges: 0,
      totalPointsFromBadges: 0,
      categories: [],
    },
    activityPoints: {
      last7Days: 0,
      last30Days: 0,
      allTime: 0,
    },
  },
});

/* =========================================================
   NORMALIZER
========================================================= */

function normalize<T>(res: any): ApiResponse<T> {
  return {
    status: res.status,
    message: res.data?.message ?? 'OK',
    data: (res.data?.data ?? res.data) as T,
  };
}

/** Map the admission API's fee states onto the payment states the UI renders. */
function mapAdmissionFeeStatus(status: string | undefined): Payment['status'] {
  switch ((status || '').toLowerCase()) {
    case 'paid':
    case 'success':
    case 'completed':
      return 'paid';
    case 'partial':
    case 'pending':
    case 'processing':
      return 'pending';
    case 'failed':
    case 'overdue':
      return 'overdue';
    default:
      return 'pending';
  }
}

/**
 * Student Service - All Methods
 */
export const studentService = {
  /** Get student profile */
  getProfile: async (): Promise<ApiResponse<StudentProfile>> => {
    const res = await apiClient.get('/application/profile');
    return normalize<StudentProfile>(res);
  },

  /** Update student profile */
  updateProfile: async (
    profileData: Partial<StudentProfile>
  ): Promise<ApiResponse<StudentProfile>> => {
    const res = await apiClient.put('/application/profile', profileData);
    return normalize<StudentProfile>(res);
  },

  /** Admission record — programme, session and fee states for the signed-in student */
  getAdmissionStudent: async (): Promise<ApiResponse<AdmissionSummary | null>> => {
    const res = await apiClient.get('/admission/student');
    return normalize<AdmissionSummary | null>(res);
  },

  /** Payment stats */
  getPaymentStats: async (): Promise<ApiResponse<PaymentStats>> => {
    const res = await apiClient.get('/student/dashboard/payment-stats');
    return normalize<PaymentStats>(res);
  },

  /** Assessments */
  getAssessments: async (): Promise<ApiResponse<Assessment[]>> => {
    const res = await apiClient.get('/student/assessments');
    return normalize<Assessment[]>(res);
  },

  /** Attendance */
  getAttendance: async (): Promise<ApiResponse<AttendanceRecord[]>> => {
    const res = await apiClient.get('/student/attendance');
    return normalize<AttendanceRecord[]>(res);
  },

  /** Classes */
  getClasses: async (): Promise<ApiResponse<StudentClass[]>> => {
    const res = await apiClient.get('/student/classes');
    return normalize<StudentClass[]>(res);
  },

  /** Get Moodle courses */
  getCourses: async (): Promise<ApiResponse<MoodleCourse[]>> => {
    const res = await apiClient.get('/student/courses');
    return normalize<MoodleCourse[]>(res);
  },

  /** Get student course data with progress */
  getStudentCourses: async (): Promise<ApiResponse<StudentCoursesResponse>> => {
    try {
      const res = await apiClient.get('/student/course/data');
      console.log('Student courses response:', res);

      const body: any = res || {};

      const normalized: StudentCoursesResponse = {
        status:
          body.data?.studentCourses?.status ??
          body.data?.status ??
          body.status ??
          200,

        message:
          body.data?.studentCourses?.message ??
          body.data?.message ??
          body.message ??
          'Courses data fetched',

        data:
          body.data?.studentCourses?.data ??
          body.data?.data ??
          body.data ??
          [],
      };

      return {
        status: normalized.status,
        message: normalized.message,
        data: normalized,
      };

    } catch (error: any) {
      console.error('Error fetching student courses:', error);

      return {
        status: 200,
        message: 'Courses data not available',
        data: {
          status: 200,
          message: 'Courses data not available',
          data: [],
        },
      };
    }
  },

  /** Get enrolled courses */
  // In studentService.ts - Replace the getEnrolledCourses method:

  /** Get enrolled courses - USING THE CORRECT ENDPOINT */
  getEnrolledCourses: async (): Promise<ApiResponse<MoodleCourse[]>> => {
    try {
      // Use /student/courses endpoint instead of /student/assessments
      const response = await apiClient.get<any>('/student/courses');

      console.log('Student Courses Response:', response);
      console.log('Response data structure:', response.data);

      // Handle the response structure you showed in Postman
      let coursesData: MoodleCourse[] = [];

      if (response.data && typeof response.data === 'object') {
        // Check for the exact structure from your Postman response
        if (response.data.status === true && Array.isArray(response.data.data)) {
          // Structure: { status: true, message: "Course(s) found", data: [...] }
          coursesData = response.data.data;
          console.log('Found courses using structure 1:', coursesData.length);
        } else if (Array.isArray(response.data.data)) {
          // Structure: { data: [...] }
          coursesData = response.data.data;
          console.log('Found courses using structure 2:', coursesData.length);
        } else if (Array.isArray(response.data)) {
          // Structure: [...]
          coursesData = response.data;
          console.log('Found courses using structure 3:', coursesData.length);
        } else if (response.data && Array.isArray(response.data)) {
          // Direct array response
          coursesData = response.data;
          console.log('Found courses using structure 4:', coursesData.length);
        }
      }

      console.log('Final courses data:', coursesData);

      if (coursesData.length === 0) {
        console.warn('No courses found in the response');
        return {
          status: 200,
          message: 'No courses enrolled',
          data: []
        };
      }

      return {
        status: 200,
        message: `Found ${coursesData.length} courses`,
        data: coursesData
      };
    } catch (error: any) {
      console.error('Error fetching enrolled courses:', error);
      console.error('Error response:', error.response?.data);

      return {
        status: error.statusCode || 500,
        message: error.message || 'Failed to fetch enrolled courses',
        data: []
      };
    }
  },

  /** Get course grades */
  getCourseGrades: async (courseId: number): Promise<ApiResponse<CourseGradesResponse>> => {
    try {
      const response = await apiClient.get<any>(`/student/assessments`);

      console.log('Student Course Grades Response:', response);

      let courseData: any = {};

      if (response.data && typeof response.data === 'object') {
        if (response.data.data) {
          courseData = response.data.data;
        } else {
          courseData = response.data;
        }
      }

      const formattedData: CourseGradesResponse = {
        course_id: courseData.course_id || courseId,
        course_code: courseData.course_code || '',
        course_name: courseData.course_name || '',
        course_image_url: courseData.course_image_url || '',
        instructors: Array.isArray(courseData.instructors) ? courseData.instructors : [],
        students: Array.isArray(courseData.students) ? courseData.students : []
      };

      return {
        status: 200,
        message: 'Success',
        data: formattedData
      };
    } catch (error: any) {
      console.error('Error fetching student course grades:', error);
      return {
        status: error.statusCode || 500,
        message: error.message || 'Failed to fetch course grades',
        data: {
          course_id: courseId,
          course_code: '',
          course_name: '',
          course_image_url: '',
          instructors: [],
          students: []
        }
      };
    }
  },

  /**
   * Dashboard Summary.
   *
   * `/admission/student` is the one endpoint guaranteed to be live for every
   * signed-in student, so it is the spine of this payload: identity, programme
   * and fee state all come from it. The `/student/*` and `/application/profile`
   * endpoints are treated as optional enrichment — when they are missing the
   * dashboard still renders real data instead of blanks. `unavailable` lists
   * whichever of them failed so the UI can say so rather than showing zeroes.
   */
  getDashboardSummary: async (): Promise<ApiResponse<{
    profile: StudentProfile;
    admission: AdmissionSummary | null;
    enrollments: Enrollment[];
    paymentStats: PaymentStats;
    recentAssessments: Assessment[];
    attendance: AttendanceRecord[];
    upcomingDeadlines: any[];
    unavailable: string[];
  }>> => {
    const [adm, p, ps, a, at] = await Promise.allSettled([
      studentService.getAdmissionStudent(),
      studentService.getProfile(),
      studentService.getPaymentStats(),
      studentService.getAssessments(),
      studentService.getAttendance(),
    ]);

    const unavailable: string[] = [];
    const track = (label: string, result: PromiseSettledResult<unknown>) => {
      if (result.status === 'rejected') {
        unavailable.push(label);
        console.warn(`[dashboard] ${label} unavailable:`, result.reason);
      }
    };
    track('admission', adm);
    track('profile', p);
    track('payments', ps);
    track('assessments', a);
    track('attendance', at);

    const admission =
      adm.status === 'fulfilled' ? (adm.value.data ?? null) : null;

    /* ---------- Profile: fetched values win, admission fills the gaps ---------- */
    const admissionNameParts = (admission?.name ?? '').trim().split(/\s+/).filter(Boolean);
    const fetchedProfile = p.status === 'fulfilled' ? p.value.data : null;

    const profile: StudentProfile = {
      user_id: fetchedProfile?.user_id || Number(admission?.id) || 0,
      first_name: fetchedProfile?.first_name || admissionNameParts[0] || 'Student',
      last_name: fetchedProfile?.last_name || admissionNameParts.slice(1).join(' ') || '',
      email: fetchedProfile?.email || admission?.email || '',
      phone: fetchedProfile?.phone || '',
      username: fetchedProfile?.username ?? null,
      address: fetchedProfile?.address ?? null,
      state: fetchedProfile?.state ?? null,
      country: fetchedProfile?.country || '',
      admission_no:
        fetchedProfile?.admission_no ?? (admission?.id != null ? String(admission.id) : null),
      registration_date: fetchedProfile?.registration_date ?? null,
      enrollment_status:
        fetchedProfile?.enrollment_status ||
        (admission?.is_admitted ? 'admitted' : admission?.admission_status || 'pending'),
      current_class_id: fetchedProfile?.current_class_id ?? admission?.lms_category?.id ?? null,
      meta: fetchedProfile?.meta ?? null,
    };

    /* ---------- Enrollments: one entry per programme the student has taken up ---------- */
    const enrollments = toEnrollments(admission);

    const totalDue = enrollments.reduce((sum, e) => sum + e.totalDue, 0);
    const totalPaid = enrollments.reduce((sum, e) => sum + e.totalPaid, 0);

    /* ---------- Payments: derive from the fee state when the
                  payment-stats endpoint is unavailable ---------- */
    const admissionPayments: Payment[] = enrollments.flatMap((enrollment) =>
      enrollment.fees
        .filter((fee) => fee.amount != null && fee.amount > 0)
        .map((fee) => ({
          id: `${enrollment.id}-${fee.key}`,
          studentId: enrollment.id,
          description: `${fee.label} — ${enrollment.programName}`,
          amount: fee.amount as number,
          dueDate: null,
          paymentDate: null,
          status: mapAdmissionFeeStatus(fee.status),
          referenceNumber: `${fee.key}_fee`,
          paymentMethod: null,
          program: enrollment.programName,
        }))
    );

    const admissionPaymentStats: PaymentStats = {
      studentPayments: {
        summary: {
          totalPaid,
          totalPending: Math.max(0, totalDue - totalPaid),
          totalOverdue: 0,
          totalDue,
        },
        payments: admissionPayments,
        analytics: {
          byStatus: {
            paid: admissionPayments.filter((x) => x.status === 'paid').length,
            pending: admissionPayments.filter((x) => x.status === 'pending').length,
            overdue: admissionPayments.filter((x) => x.status === 'overdue').length,
          },
          byProgram: [],
        },
      },
    };

    const fetchedPaymentStats = ps.status === 'fulfilled' ? ps.value.data : null;
    const fetchedSummary =
      fetchedPaymentStats?.studentPayments?.summary ?? fetchedPaymentStats?.summary;
    const hasFetchedPayments =
      !!fetchedSummary &&
      (Number(fetchedSummary.totalDue) > 0 || Number(fetchedSummary.totalPaid) > 0);

    const paymentStats = hasFetchedPayments
      ? (fetchedPaymentStats as PaymentStats)
      : admissionPaymentStats;

    const assessments =
      a.status === 'fulfilled' ? (a.value.data ?? []) : [];

    const attendance =
      at.status === 'fulfilled' ? (at.value.data ?? []) : [];

    const upcomingDeadlines = assessments
      .filter((x) => x.score === null)
      .slice(0, 5)
      .map((a) => ({
        subject: a.subject,
        title: a.title,
        due: a.date,
        priority: 'high',
      }));

    return {
      status: 200,
      message: 'Dashboard data fetched successfully',
      data: {
        profile,
        admission,
        enrollments,
        paymentStats,
        recentAssessments: assessments.slice(0, 10),
        attendance: attendance.slice(0, 30),
        upcomingDeadlines,
        unavailable,
      },
    };
  },

  /** Change password */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> => {
    const res = await apiClient.post('/student/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return normalize<void>(res);
  },

  /** Export data */
  exportData: async (): Promise<ApiResponse<{ downloadUrl: string }>> => {
    const res = await apiClient.post('/student/export-data');
    return normalize<{ downloadUrl: string }>(res);
  },

  /** Gamification data */
  getGamificationData: async (): Promise<ApiResponse<GamificationData>> => {
    try {
      const res = await apiClient.get<any>('/student/gamification');

      console.log('Full gamification response:', res);

      const gamificationResponse = res.data?.gamification || res.data || {};
      console.log('Gamification response object:', gamificationResponse);

      const raw = gamificationResponse.data || {};
      console.log('Raw gamification data:', raw);
      console.log('Rewards data:', raw.rewards);

      const mapped: GamificationData = {
        profile: {
          id: String(raw.profile?.id ?? '0'),
          name: raw.profile?.name ?? 'Student',
          points: raw.profile?.points ?? 0,
          level: raw.profile?.level ?? 1,
          rank: raw.profile?.rank ?? 1,
          streak: raw.profile?.streak ?? 0,
          attendance: raw.profile?.attendance ?? 0,
          averageGrade: raw.profile?.averageGrade ?? 0,
          nextLevelPoints: raw.profile?.nextLevelPoints ?? 500,
          totalStudents: raw.profile?.totalStudents ?? 1,
          progressToNextLevel: raw.profile?.progressToNextLevel ?? 0,
        },

        leaderboard: (raw.leaderboard ?? []).map((e: any, i: number) => ({
          rank: e.rank ?? i + 1,
          name: e.name ?? `Student ${i + 1}`,
          points: e.points ?? 0,
          level: e.level ?? 1,
          avatar:
            e.avatar ??
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              e.name ?? 'User'
            )}&background=0D8ABC&color=fff`,
        })),

        badges: (raw.badges ?? []).map((b: any, i: number) => ({
          id: b.id ?? i,
          name: b.name ?? `Badge ${i + 1}`,
          description: b.description ?? '',
          icon: b.icon ?? getBadgeIcon(i),
          points: b.points ?? 10,
          earned: b.earned ?? false,
          category: b.category ?? 'general',
        })),

        recentActivities: (raw.recentActivities ?? []).map(
          (a: any, i: number) => ({
            id: a.id ?? i,
            title: a.title ?? 'Activity',
            description: a.description ?? '',
            points: a.points ?? 0,
            type: mapActivityType(a.type),
            timestamp: a.timestamp ?? new Date().toISOString(),
          })
        ),

        rewards: (raw.rewards ?? []).map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          cost: r.cost,
          available: r.available ?? false,
        })),

        analytics: {
          badgeSummary: {
            totalBadges: raw.analytics?.badgeSummary?.totalBadges ?? 0,
            earnedBadges: raw.analytics?.badgeSummary?.earnedBadges ?? 0,
            totalPointsFromBadges:
              raw.analytics?.badgeSummary?.totalPointsFromBadges ?? 0,
            categories:
              raw.analytics?.badgeSummary?.categories ?? [],
          },
          activityPoints: {
            last7Days:
              raw.analytics?.activityPoints?.last7Days ?? 0,
            last30Days:
              raw.analytics?.activityPoints?.last30Days ?? 0,
            allTime:
              raw.analytics?.activityPoints?.allTime ?? 0,
          },
        },
      };

      console.log('Mapped rewards:', mapped.rewards);

      return {
        status: gamificationResponse.status || res.status || 200,
        message: gamificationResponse.message || res.message || 'Gamification data fetched successfully',
        data: mapped,
      };
    } catch (error: any) {
      console.error('Gamification error:', error);
      return {
        status: 500,
        message: error.message || 'Failed to fetch gamification data',
        data: getDefaultGamificationData(),
      };
    }
  },

  /** Redeem reward */
  redeemReward: async (
    rewardId: number
  ): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    const res = await apiClient.post(
      `/student/gamification/rewards/${rewardId}/redeem`
    );
    return normalize<{ success: boolean; message: string }>(res);
  },

  /** Export results */
  exportResults: async (format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> => {
    const res = await apiClient.post('/student/export-results', { format });
    return normalize<{ downloadUrl: string }>(res);
  },
};