import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, TrendingUp, Award } from "lucide-react";
import type { Course, Progress as UserProgress } from "@shared/schema";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: isAuthenticated,
  });

  const { data: allProgress } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/progress"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 py-24">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const enrolledCourses = courses?.filter(
    (course) =>
      course.isFree ||
      user?.subscriptionStatus === "active" ||
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Welcome Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-6">
            <h1
              className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2"
              data-testid="text-dashboard-welcome"
            >
              {t("dashboard.welcome")}, {user?.firstName || user?.email}!
            </h1>
            <p className="text-muted-foreground">
              {language === "ar"
                ? "تابع رحلة التعلم الخاصة بك"
                : "Continue your learning journey"}
            </p>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="hover-elevate active-elevate-2 transition-all"
                  data-testid={`card-stat-${index}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      <span className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* My Courses */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-foreground">
                {t("dashboard.my-courses")}
              </h2>
              <Button asChild variant="outline">
                <Link href="/courses">
                  <a data-testid="button-browse-courses">{language === "ar" ? "تصفح الدورات" : "Browse Courses"}</a>
                </Link>
              </Button>
            </div>

            {enrolledCourses && enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => {
                  const progress = getCourseProgress(course.id);

                  return (
                    <Card
                      key={course.id}
                      className="hover-elevate active-elevate-2 transition-all"
                      data-testid={`card-my-course-${course.id}`}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {language === "ar" ? course.titleAr : course.titleEn}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">
                                {t("dashboard.stats.progress")}
                              </span>
                              <span className="font-medium text-foreground">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <Progress value={progress} />
                          </div>
                          <Button
                            asChild
                            className="w-full"
                            data-testid={`button-continue-course-${course.id}`}
                          >
                            <Link href={`/course/${course.id}`}>
                              <a>{t("courses.continue")}</a>
                            </Link>
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
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {language === "ar"
                      ? "لم تقم بالتسجيل في أي دورة بعد"
                      : "You haven't enrolled in any courses yet"}
                  </p>
                  <Button asChild>
                    <Link href="/courses">
                      <a data-testid="button-explore-courses">
                        {language === "ar"
                          ? "استكشف الدورات"
                          : "Explore Courses"}
                      </a>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
