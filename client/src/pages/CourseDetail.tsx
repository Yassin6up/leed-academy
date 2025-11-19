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
import { Clock, BookOpen, Lock, Play, CheckCircle2, Calendar, ChevronRight } from "lucide-react";
import type { Course, Lesson, Progress as UserProgress, Meeting } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";

export default function CourseDetail() {
  const [, params] = useRoute("/course/:id");
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);

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

  const updateWatchProgressMutation = useMutation({
    mutationFn: async ({ lessonId, watchProgress, courseId }: { lessonId: string; watchProgress: number; courseId: string }) => {
      return await apiRequest("PATCH", `/api/progress/${lessonId}/watch`, {
        watchProgress,
        courseId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress", params?.id] });
    },
  });

  // Video player event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !lessons || !isAuthenticated) return;

    const currentLesson = lessons[currentLessonIndex];
    if (!currentLesson) return;

    const handleTimeUpdate = () => {
      const currentTime = Math.floor(video.currentTime);
      
      // Update progress every 5 seconds
      if (currentTime > 0 && currentTime - lastProgressUpdate >= 5) {
        setLastProgressUpdate(currentTime);
        updateWatchProgressMutation.mutate({
          lessonId: currentLesson.id,
          watchProgress: currentTime,
          courseId: params?.id!,
        });
      }
    };

    const handleEnded = () => {
      // Video completed - mark as completed
      updateWatchProgressMutation.mutate({
        lessonId: currentLesson.id,
        watchProgress: currentLesson.duration || 0,
        courseId: params?.id!,
      });
      
      toast({
        title: t("common.success"),
        description: language === "ar" ? "تم إكمال الدرس!" : "Lesson completed!",
      });
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [currentLessonIndex, lessons, isAuthenticated, lastProgressUpdate, params?.id, language, toast, t, updateWatchProgressMutation]);

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
              {/* Video Player & Current Lesson */}
              <div className="lg:col-span-2">
                {isAuthenticated && !isLocked ? (
                  <>
                    <Card className="mb-6">
                      <CardContent className="p-0">
                        <video
                          ref={videoRef}
                          className="w-full aspect-video bg-black rounded-t-lg"
                          controls
                          src={lessons[currentLessonIndex]?.videoUrl}
                          data-testid="video-player"
                        >
                          {language === "ar" ? "متصفحك لا يدعم تشغيل الفيديو" : "Your browser does not support the video tag."}
                        </video>
                        <div className="p-6">
                          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                            {language === "ar" ? lessons[currentLessonIndex]?.titleAr : lessons[currentLessonIndex]?.titleEn}
                          </h2>
                          <p className="text-muted-foreground mb-4">
                            {language === "ar" ? lessons[currentLessonIndex]?.descriptionAr : lessons[currentLessonIndex]?.descriptionEn}
                          </p>
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{lessons[currentLessonIndex]?.duration} {language === "ar" ? "دقيقة" : "min"}</span>
                            </div>
                            {currentLessonIndex < lessons.length - 1 && (
                              <Button
                                onClick={() => setCurrentLessonIndex(currentLessonIndex + 1)}
                                disabled={!isLessonAccessible(lessons[currentLessonIndex + 1], currentLessonIndex + 1)}
                                data-testid="button-next-lesson"
                              >
                                {language === "ar" ? "الدرس التالي" : "Next Lesson"}
                                <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Lessons List */}
                    <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                      {language === "ar" ? "قائمة الدروس" : "Lessons"}
                    </h2>
                    <div className="space-y-2">
                      {lessons.map((lesson, index) => {
                        const isCompleted = userProgress?.some(
                          (p) => p.lessonId === lesson.id && p.completed
                        );
                        const isAccessible = isLessonAccessible(lesson, index);
                        const isCurrent = index === currentLessonIndex;

                        return (
                          <Card
                            key={lesson.id}
                            className={isCurrent ? "border-primary bg-primary/5" : ""}
                            data-testid={`card-lesson-${index}`}
                          >
                            <CardContent className="p-4">
                              <button
                                onClick={() => isAccessible && setCurrentLessonIndex(index)}
                                disabled={!isAccessible}
                                className="w-full flex items-center gap-3 text-left disabled:cursor-not-allowed"
                                data-testid={`button-select-lesson-${index}`}
                              >
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted flex-shrink-0">
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  ) : !isAccessible ? (
                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                  ) : (
                                    <Play className="h-5 w-5 text-primary" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className={`font-medium ${isAccessible ? "text-foreground" : "text-muted-foreground"}`}>
                                    {language === "ar" ? lesson.titleAr : lesson.titleEn}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {lesson.duration} {language === "ar" ? "دقيقة" : "min"}
                                    {!isAccessible && lesson.requiresPrevious && (
                                      <span className="mx-2">• {language === "ar" ? "مقفل - أكمل الدرس السابق أولاً" : "Locked - Complete previous lesson first"}</span>
                                    )}
                                  </p>
                                </div>
                              </button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                        {language === "ar" ? "هذه الدورة محظورة" : "This Course is Locked"}
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        {language === "ar"
                          ? "اشترك في خطة للوصول إلى جميع الدروس والمحتوى"
                          : "Subscribe to a plan to access all lessons and content"}
                      </p>
                      <Button asChild>
                        <a href="/pricing" data-testid="button-pricing">{language === "ar" ? "عرض الخطط" : "View Plans"}</a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
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
                              {(!meeting.isPaidOnly || !isLocked) && (
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
                              {meeting.isPaidOnly && isLocked && (
                                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                                  <Lock className="h-3 w-3" />
                                  <span>{language === "ar" ? "يتطلب اشتراكاً" : "Subscription Required"}</span>
                                </div>
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
