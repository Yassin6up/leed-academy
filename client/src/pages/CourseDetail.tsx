import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Clock, BookOpen, Lock, Play, CheckCircle2, Calendar } from "lucide-react";
import type { Course, Lesson, Progress as UserProgress, Meeting } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CourseDetail() {
  const [, params] = useRoute("/course/:id");
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: course } = useQuery<Course>({
    queryKey: ["/api/courses", params?.id],
    enabled: !!params?.id,
  });

  const { data: lessons } = useQuery<Lesson[]>({
    queryKey: ["/api/courses", params?.id, "lessons"],
    enabled: !!params?.id,
  });

  const { data: userProgress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress", params?.id],
    enabled: !!params?.id && isAuthenticated,
  });

  const { data: meetings } = useQuery<Meeting[]>({
    queryKey: ["/api/courses", params?.id, "meetings"],
    enabled: !!params?.id,
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      return await apiRequest("POST", "/api/progress", {
        lessonId,
        courseId: params?.id,
        completed: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress", params?.id] });
      toast({
        title: t("common.success"),
        description: language === "ar" ? "تم تحديد الدرس كمكتمل" : "Lesson marked as complete",
      });
    },
  });

  if (!course || !lessons) {
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

  const isLocked = !course.isFree && user?.subscriptionStatus !== "active";
  const completedLessons =
    userProgress?.filter((p) => p.completed).length || 0;
  const totalLessons = lessons.length;
  const progressPercentage =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const isLessonAccessible = (lesson: Lesson, index: number) => {
    if (lesson.isFree) return true;
    if (isLocked) return false;
    if (!lesson.requiresPrevious || index === 0) return true;
    const previousLesson = lessons[index - 1];
    return userProgress?.some(
      (p) => p.lessonId === previousLesson.id && p.completed
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Course Header */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <Badge data-testid="badge-course-level">
                    {t("courses.level")} {course.level}
                  </Badge>
                  {course.isFree && (
                    <Badge className="bg-green-500 text-white">{t("courses.free")}</Badge>
                  )}
                </div>
                <h1
                  className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4"
                  data-testid="text-course-title"
                >
                  {language === "ar" ? course.titleAr : course.titleEn}
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {language === "ar" ? course.descriptionAr : course.descriptionEn}
                </p>
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {totalLessons} {t("courses.lessons")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {course.duration || 8} {t("courses.hours")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {language === "ar" ? course.instructorAr : course.instructorEn}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enrollment Card */}
              <div>
                <Card>
                  <CardContent className="p-6">
                    {isAuthenticated ? (
                      <>
                        {isLocked ? (
                          <>
                            <div className="text-3xl font-bold text-foreground mb-2">
                              ${course.price}
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              {language === "ar"
                                ? "يتطلب اشتراكاً نشطاً"
                                : "Requires active subscription"}
                            </p>
                            <Button asChild className="w-full">
                              <a href="/pricing" data-testid="button-subscribe">{t("courses.enroll")}</a>
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">
                                  {t("dashboard.stats.progress")}
                                </span>
                                <span className="font-medium text-foreground">
                                  {Math.round(progressPercentage)}%
                                </span>
                              </div>
                              <Progress value={progressPercentage} />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {completedLessons} / {totalLessons}{" "}
                              {t("courses.lessons")}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-muted-foreground mb-4">
                          {language === "ar"
                            ? "سجل الدخول للوصول إلى الدورة"
                            : "Login to access this course"}
                        </p>
                        <Button asChild className="w-full">
                          <a href="/api/login" data-testid="button-login">{t("nav.login")}</a>
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Curriculum */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  {language === "ar" ? "المنهج الدراسي" : "Curriculum"}
                </h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {lessons.map((lesson, index) => {
                    const isCompleted = userProgress?.some(
                      (p) => p.lessonId === lesson.id && p.completed
                    );
                    const isAccessible = isLessonAccessible(lesson, index);

                    return (
                      <AccordionItem
                        key={lesson.id}
                        value={lesson.id}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger
                          className="hover:no-underline"
                          data-testid={`accordion-lesson-${index}`}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted flex-shrink-0">
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : !isAccessible ? (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Play className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-foreground">
                                {language === "ar" ? lesson.titleAr : lesson.titleEn}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {lesson.duration} {language === "ar" ? "دقيقة" : "min"}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-4 space-y-4">
                            <p className="text-muted-foreground">
                              {language === "ar"
                                ? lesson.descriptionAr
                                : lesson.descriptionEn}
                            </p>
                            {isAccessible && !isCompleted && (
                              <Button
                                onClick={() => markCompleteMutation.mutate(lesson.id)}
                                disabled={markCompleteMutation.isPending}
                                data-testid={`button-complete-lesson-${index}`}
                              >
                                {language === "ar"
                                  ? "تحديد كمكتمل"
                                  : "Mark as Complete"}
                              </Button>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>

              {/* Upcoming Meetings */}
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                  {language === "ar" ? "الجلسات القادمة" : "Upcoming Sessions"}
                </h2>
                <div className="space-y-4">
                  {meetings && meetings.length > 0 ? (
                    meetings.map((meeting) => (
                      <Card key={meeting.id} data-testid={`card-meeting-${meeting.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">
                                {language === "ar" ? meeting.titleAr : meeting.titleEn}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {new Date(meeting.scheduledAt).toLocaleString(
                                  language === "ar" ? "ar" : "en"
                                )}
                              </p>
                              {!isLocked && (
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  data-testid={`button-join-meeting-${meeting.id}`}
                                >
                                  <a
                                    href={meeting.zoomLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {language === "ar" ? "انضم الآن" : "Join Now"}
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {language === "ar"
                        ? "لا توجد جلسات مجدولة"
                        : "No scheduled sessions"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
