import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, TrendingUp, Award, CreditCard, CheckCircle2, AlertCircle, XCircle, Calendar } from "lucide-react";
import type { Course, Progress as UserProgress, Subscription, SubscriptionPlan } from "@shared/schema";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
        window.location.href = "/auth";
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

  const { data: subscription, isLoading: isLoadingSubscription } = useQuery<
    (Subscription & { plan: SubscriptionPlan | null }) | null
  >({
    queryKey: ["/api/user/subscription"],
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

  // Only show courses where user has started watching (has progress)
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

  const getSubscriptionStatus = () => {
    if (!subscription) return "none";

    const now = new Date();
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;

    if (subscription.status === "active" && endDate && now > endDate) {
      return "expired";
    }

    return subscription.status;
  };

  const subscriptionStatus = getSubscriptionStatus();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          icon: CheckCircle2,
          label: t("subscription.status.active"),
          variant: "default" as const,
          color: "text-green-500",
        };
      case "pending":
        return {
          icon: AlertCircle,
          label: t("subscription.status.pending"),
          variant: "secondary" as const,
          color: "text-yellow-500",
        };
      case "expired":
        return {
          icon: XCircle,
          label: t("subscription.status.expired"),
          variant: "destructive" as const,
          color: "text-red-500",
        };
      default:
        return {
          icon: AlertCircle,
          label: t("subscription.status.inactive"),
          variant: "outline" as const,
          color: "text-muted-foreground",
        };
    }
  };

  const statusConfig = getStatusConfig(subscriptionStatus);

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

        {/* Subscription Status */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
              {t("subscription.title")}
            </h2>

            {isLoadingSubscription ? (
              <Card>
                <CardContent className="p-12">
                  <div className="h-32 bg-muted animate-pulse rounded-lg" />
                </CardContent>
              </Card>
            ) : subscription && subscription.plan ? (
              <Card className="hover-elevate transition-all" data-testid="card-subscription-status">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle className="text-xl mb-1">
                          {language === "ar" ? subscription.plan.nameAr : subscription.plan.nameEn}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {t("subscription.current-plan")}
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusConfig.variant} className="flex items-center gap-1" data-testid="badge-subscription-status">
                      <statusConfig.icon className="h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {subscription.startDate && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {t("subscription.started")}
                        </p>
                        <p className="font-medium text-foreground" data-testid="text-subscription-start-date">
                          {format(new Date(subscription.startDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                    )}
                    {subscription.endDate && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {subscriptionStatus === "expired"
                            ? t("subscription.expired-on")
                            : t("subscription.expires")}
                        </p>
                        <p className={`font-medium ${subscriptionStatus === "expired" ? "text-destructive" : "text-foreground"}`} data-testid="text-subscription-end-date">
                          {format(new Date(subscription.endDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("pricing.features")}
                      </p>
                      <p className="font-medium text-foreground">
                        {subscription.plan.featuresEn?.length || 0} {language === "ar" ? "ميزات" : "features"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="default" data-testid="button-upgrade-plan">
                      <Link href="/pricing">
                        <a>
                          {subscriptionStatus === "active"
                            ? t("subscription.upgrade")
                            : subscriptionStatus === "expired"
                              ? t("subscription.view-plans")
                              : t("subscription.change")}
                        </a>
                      </Link>
                    </Button>
                    {subscriptionStatus === "pending" && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          {language === "ar"
                            ? "سيتم تفعيل اشتراكك بعد موافقة الإدارة على الدفع"
                            : "Your subscription will be activated after admin approves your payment"}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="hover-elevate transition-all" data-testid="card-no-subscription">
                <CardContent className="p-12 text-center">
                  <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                    {t("subscription.no-subscription")}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {t("subscription.no-subscription-desc")}
                  </p>
                  <Button asChild size="lg" data-testid="button-view-plans">
                    <Link href="/pricing">
                      <a>{t("subscription.view-plans")}</a>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
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
