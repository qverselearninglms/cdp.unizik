import { useCourseStore } from '../stores/course-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus, Award, Database, Home, BookOpen, CreditCard, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCourseQueries } from '../hooks/use-course-queries';
import { courseService } from '../services/course-service';
import { ConfirmModal } from '@/components/global/confirm-modal';
import Link from 'next/link';

export function DashboardView({ userId }: { userId: string }) {
    const { enrolledCourses, toggleShowAllCategories, clearCache } = useCourseStore();
    // const { user } = useAuthContext();
    const {
        reloadCategoriesAndCourses,
        isLoading,
        isFetching,
        unenrollFromCourseMutation,
        isUnenrollmentProcessing,
        user,
        unenrollModalOpen,
        setUnenrollModalOpen,
        courseToUnenroll,
        setCourseToUnenroll,
    } = useCourseQueries(userId);

    const requiresAccessFee = enrolledCourses.length === 0;

    // const handleUnenroll = (courseId: string, courseGroupId: number) => {
    //     unenrollFromCourseMutation.mutate({
    //         courseGroupId: courseGroupId,
    //         courseId: parseInt(courseId)
    //     });
    // };

    const handleUnenrollClick = (courseId: string, courseGroupId: number, courseName: string) => {
        setCourseToUnenroll({ courseId, courseGroupId, courseName });
        setUnenrollModalOpen(true);
    };

    const handleConfirmUnenroll = () => {
        if (courseToUnenroll) {
            unenrollFromCourseMutation.mutate({
                courseGroupId: courseToUnenroll.courseGroupId,
                courseId: parseInt(courseToUnenroll.courseId)
            });
            setUnenrollModalOpen(false);
            setCourseToUnenroll(null);
        }
    };

    // if (enrolledCourses.length === 0) {
    //     return (
    //         <div className="text-center space-y-8 py-12">
    //             <motion.div
    //                 initial={{ scale: 0.8, opacity: 0 }}
    //                 animate={{ scale: 1, opacity: 1 }}
    //                 transition={{ duration: 0.5 }}
    //                 className="space-y-6"
    //             >
    //                 <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
    //                     <Rocket className="w-16 h-16 text-white" />
    //                 </div>

    //                 <div className="space-y-4">
    //                     <h1 className="text-4xl font-bold text-gray-900  dark:text-white">
    //                         Start Your Learning Journey!
    //                     </h1>
    //                     <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed dark:text-white">
    //                         Discover amazing courses tailored for your career growth.
    //                         Learn from industry experts and join a community of passionate learners.
    //                     </p>
    //                 </div>
    //             </motion.div>

    //             <motion.div
    //                 initial={{ y: 20, opacity: 0 }}
    //                 animate={{ y: 0, opacity: 1 }}
    //                 transition={{ delay: 0.3, duration: 0.5 }}
    //                 className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12"
    //             >
    //                 <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/30 dark:border-gray-700">
    //                     <Target className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
    //                     <h3 className="font-semibold text-lg mb-2 dark:text-white">Set Your Goals</h3>
    //                     <p className="text-gray-600 dark:text-gray-300">Choose from 100+ courses aligned with your career objectives</p>
    //                 </div>

    //                 <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/30 dark:border-gray-700">
    //                     <BookOpen className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-4" />
    //                     <h3 className="font-semibold text-lg mb-2 dark:text-white">Learn by Doing</h3>
    //                     <p className="text-gray-600 dark:text-gray-300">Hands-on projects and real-world scenarios</p>
    //                 </div>

    //                 <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/30 dark:border-gray-700">
    //                     <Award className="w-12 h-12 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
    //                     <h3 className="font-semibold text-lg mb-2 dark:text-white">Get Certified</h3>
    //                     <p className="text-gray-600 dark:text-gray-300">Earn certificates to showcase your skills</p>
    //                 </div>
    //             </motion.div>

    //             <motion.div
    //                 initial={{ y: 20, opacity: 0 }}
    //                 animate={{ y: 0, opacity: 1 }}
    //                 transition={{ delay: 0.6, duration: 0.5 }}
    //                 className="pt-8"
    //             >
    //                 <div className="flex flex-col space-x-5 md:flex-row justify-center items-center gap-4">
    //                     <Button
    //                         size="lg"
    //                         onClick={reloadCategoriesAndCourses}
    //                         disabled={isLoading || isFetching}
    //                         className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-lg"
    //                     >
    //                         <RefreshCcw className={`w-6 h-6 mr-3 ${isLoading || isFetching ? ' animate-spin' : ''}`} />
    //                         Reload Courses
    //                     </Button>

    //                     <Button
    //                         size="lg"
    //                         onClick={toggleShowAllCategories}
    //                         className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-lg"
    //                     >
    //                         <Plus className="w-6 h-6 mr-3" />
    //                         Explore All Courses
    //                     </Button>
    //                 </div>

    //                 <p className="text-gray-500 mt-4 text-sm">
    //                     Join 50,000+ students already learning with us
    //                 </p>
    //             </motion.div>
    //         </div>
    //     );
    // }

    return (
        <>
            <div className="space-y-8">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex justify-between items-center"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Book your course access</h1>
                        <p className="text-primary-800 mt-2">Complete the access fee step below to unlock your learning dashboard.</p>
                    </div>
                    <div className="flex items-center space-x-5">
                        <Button
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-600 dark:border-yellow-200 dark:text-yellow-600 dark:hover:bg-yellow-50 dark:hover:text-yellow-600"
                            asChild
                        >
                            <Link href="/student/dashboard">
                                <Home className="w-4 h-4 mr-2" />
                                View Dashboard
                            </Link>
                        </Button>
                    </div>
                </motion.div>

                {requiresAccessFee && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 shadow-sm dark:border-amber-500/40 dark:from-amber-950/50 dark:to-orange-950/60"
                    >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-medium uppercase tracking-[0.15em] text-amber-700 dark:text-amber-300">Next step</p>
                                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Pay your access fee to continue</h2>
                                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                                    Your course access is gated until payment is confirmed. Complete the payment, come back to this page, and your learning button will unlock automatically.
                                </p>
                            </div>
                            <Button
                                size="lg"
                                className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20"
                                asChild
                            >
                                <Link href="/enrollment?step=pay-access-fee">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Pay access fee
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {enrolledCourses.map((enrollment, index) => {
                        return (
                            <motion.div
                                key={enrollment.id}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <Card className="h-full border-2 border-transparent dark:border-gray-600 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg leading-tight">
                                                {enrollment.course.course_name || enrollment.course.title}
                                            </CardTitle>
                                            <Award className="w-5 h-5 text-yellow-500" />
                                        </div>
                                        <CardDescription className="line-clamp-2">
                                            {enrollment.course.course_group}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <span className="text-xs text-gray-500">
                                                    {enrollment.course.short_name}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Progress</span>
                                                    <span className="font-semibold">{enrollment.progress}%</span>
                                                </div>
                                                <Progress value={enrollment.progress} className="h-2" />
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                <Button
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                                    onClick={() => courseService.redirectToCourseWarePlatform(String(user?.school_reg_number))}
                                                >
                                                    Continue Learning
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

                {/* An empty grid is indistinguishable from a broken fetch — say which it is */}
                {enrolledCourses.length === 0 && (
                    <Card className="border-2 border-dashed">
                        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                            <BookOpen className="h-10 w-10 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">No courses yet</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Once your enrolment is confirmed, your courses appear here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
            <ConfirmModal
                open={unenrollModalOpen}
                onOpenChange={setUnenrollModalOpen}
                onConfirm={handleConfirmUnenroll}
                title="Unenroll from Course"
                description={`Are you sure you want to unenroll from "${courseToUnenroll?.courseName}"? `}
                confirmText="Yes, Unenroll"
                cancelText="Cancel"
                variant="destructive"
            />
        </>
    );
}