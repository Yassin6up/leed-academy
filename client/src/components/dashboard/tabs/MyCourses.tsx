import { useLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, TrendingUp, Award } from "lucide-react";
import type { Course, Progress as UserProgress } from "@shared/schema";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function MyCourses() {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: allProgress } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/progress"],
  });

  const enrolledCourses = courses?.filter((course) =>
    allProgress?.some((p) => p.courseId === course.id)
  );

  const completedLessons = allProgress?.filter((p) => p.completed).length || 0;
  const totalHours = Math.floor(completedLessons * 0.75);

  const stats = [
    {
      icon: BookOpen,
      label: t("dashboard.stats.enrolled"),
      value: enrolledCourses?.length || 0,
      color: "text-blue-500",
    },
    {
      icon: Award,
      label: t("dashboard.stats.completed"),
      value: completedLessons,
      color: "text-green-500",
    },
    {
      icon: Clock,
      label: t("dashboard.stats.hours"),
      value: totalHours,
      color: "text-purple-500",
    },
    {
      icon: TrendingUp,
      label: t("dashboard.stats.progress"),
      value: `${completedLessons > 0 ? Math.min(Math.round((completedLessons / 50) * 100), 100) : 0}%`,
      color: "text-orange-500",
    },
  ];

  const getCourseProgress = (courseId: string) => {
    const courseProgress = allProgress?.filter((p) => p.courseId === courseId);
    const completed = courseProgress?.filter((p) => p.completed).length || 0;
    const total = courseProgress?.length || 1;
    return (completed / total) * 100;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-heading font-bold text-foreground mb-2">
          {t("dashboard.welcome")}, {user?.firstName}!
        </h2>
        <p className="text-muted-foreground">
          {language === "ar" ? "تابع رحلة التعلم الخاصة بك" : "Continue your learning journey"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover-elevate active-elevate-2 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-3xl font-bold text-foreground">{stat.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-heading font-bold text-foreground">
            {t("dashboard.my-courses")}
          </h3>
          <Button asChild variant="outline">
            <Link href="/courses">{language === "ar" ? "تصفح الدورات" : "Browse Courses"}</Link>
          </Button>
        </div>

        {enrolledCourses && enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => {
              const progress = getCourseProgress(course.id);
              return (
                <Card key={course.id} className="hover-elevate active-elevate-2 transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {language === "ar" ? course.titleAr : course.titleEn}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">{t("dashboard.stats.progress")}</span>
                          <span className="font-medium text-foreground">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                      <Button asChild className="w-full">
                        <Link href={`/course/${course.id}`}>{t("courses.continue")}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "ar" ? "لم تبدأ أي دورات بعد" : "No Courses Started Yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {language === "ar"
                  ? "ابدأ مشاهدة الدروس لتظهر هنا"
                  : "Start watching lessons to see them here"}
              </p>
              <Button asChild>
                <Link href="/courses">{language === "ar" ? "تصفح الدورات" : "Browse Courses"}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
