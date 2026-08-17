'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ChevronRight, ExternalLink } from 'lucide-react';
import { courseService } from '@/app/(root)/enrollment/services/course-service';
import { useAuthContext } from '@/providers/AuthProvider';
import type { Enrollment as CourseEnrollment } from '@/app/(root)/enrollment/types/course.types';

export const CoursesPanel: React.FC<{ courses: CourseEnrollment[] }> = ({ courses }) => {
  const { user } = useAuthContext();

  const openCourseware = () => {
    const username = (user as { username?: string; email?: string })?.username
      ?? (user as { email?: string })?.email;
    if (username) courseService.redirectToCourseWarePlatform(username);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-4 md:p-6">
        <div>
          <CardTitle className="text-lg md:text-xl">My courses</CardTitle>
          <CardDescription className="text-sm">
            {courses.length > 0
              ? `${courses.length} ${courses.length === 1 ? 'course' : 'courses'} enrolled`
              : 'Courses appear here once your enrolment is confirmed'}
          </CardDescription>
        </div>
        {courses.length > 0 && (
          <Button variant="outline" size="sm" onClick={openCourseware} className="flex-shrink-0">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open LMS
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
            <BookOpen className="h-9 w-9 text-muted-foreground" />
            <div>
              <p className="font-medium">No courses yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Settle your fees to unlock enrolment.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/enrollment">
                Browse enrolment
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {courses.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {enrollment.course.course_name || enrollment.course.title}
                    </p>
                    {enrollment.course.course_group && (
                      <p className="truncate text-xs text-muted-foreground">
                        {enrollment.course.course_group}
                      </p>
                    )}
                  </div>
                  {enrollment.course.short_name && (
                    <Badge variant="secondary" className="flex-shrink-0 text-[10px]">
                      {enrollment.course.short_name}
                    </Badge>
                  )}
                </div>

                <div className="mt-auto">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium tabular-nums">{enrollment.progress}%</span>
                  </div>
                  <Progress value={enrollment.progress} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoursesPanel;
