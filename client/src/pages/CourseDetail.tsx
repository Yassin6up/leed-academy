import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  BookOpen,
  Lock,
  Play,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
} from "lucide-react";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Prevent video download and right-click
  const handleVideoContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const handleVideoDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

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
    mutationFn: async ({
      lessonId,
      watchProgress,
      courseId,
    }: {
      lessonId: string;
      watchProgress: number;
      courseId: string;
    }) => {
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
  }, [
    currentLessonIndex,
    lessons,
    isAuthenticated,
    lastProgressUpdate,
    params?.id,
    language,
    toast,
    t,
    updateWatchProgressMutation,
  ]);

  if (!course || !lessons) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-24">
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  const isLocked = !course.isFree && user?.subscriptionStatus !== "active";
  const completedLessons = userProgress?.filter((p) => p.completed).length || 0;
  const totalLessons = lessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const isLessonAccessible = (lesson: Lesson, index: number) => {
    if (lesson.isFree) return true;
    if (isLocked) return false;
    if (!lesson.requiresPrevious || index === 0) return true;
    const previousLesson = lessons[index - 1];
    return userProgress?.some((p) => p.lessonId === previousLesson.id && p.completed);
  };

  const currentLesson = lessons[currentLessonIndex];
  const canGoNext = currentLessonIndex < lessons.length - 1;
  const canGoPrev = currentLessonIndex > 0;

  // If user is not logged in or course is locked, show landing page view
  if (!isAuthenticated || isLocked) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                  <a href="/courses" data-testid="button-back-courses">
                    <ChevronLeft className="h-5 w-5" />
                  </a>
                </Button>
                <div>
                  <h1 className="text-xl font-heading font-bold text-foreground">
                    {language === "ar" ? course.titleAr : course.titleEn}
                  </h1>
                </div>
              </div>
              {!isAuthenticated ? (
                <Button asChild data-testid="button-login">
                  <a href="/api/login">{t("nav.login")}</a>
                </Button>
              ) : (
                <Button asChild data-testid="button-subscribe">
                  <a href="/pricing">{language === "ar" ? "اشترك الآن" : "Subscribe Now"}</a>
                </Button>
              )}
            </div>
          </div>
        </div>

        <main className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-12 text-center">
                <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                  {!isAuthenticated
                    ? language === "ar"
                      ? "سجل الدخول للوصول"
                      : "Login to Access"
                    : language === "ar"
                      ? "هذه الدورة محظورة"
                      : "This Course is Locked"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {!isAuthenticated
                    ? language === "ar"
                      ? "يرجى تسجيل الدخول للوصول إلى محتوى الدورة"
                      : "Please login to access course content"
                    : language === "ar"
                      ? "اشترك في خطة للوصول إلى جميع الدروس والمحتوى"
                      : "Subscribe to a plan to access all lessons and content"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 border rounded-lg">
                    <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      {totalLessons} {t("courses.lessons")}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      {course.duration || 8} {t("courses.hours")}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <PlayCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      {language === "ar" ? "محتوى HD" : "HD Content"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Udemy-style player view for authenticated users with access
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <div className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Button variant="ghost" size="icon" asChild>
                <a href="/courses" data-testid="button-back-courses">
                  <ChevronLeft className="h-5 w-5" />
                </a>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-heading font-bold text-foreground truncate">
                  {language === "ar" ? course.titleAr : course.titleEn}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {completedLessons} / {totalLessons} {language === "ar" ? "مكتمل" : "completed"}
                  </span>
                  <span>•</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={progressPercentage} className="w-24 h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Video & Content Area */}
        <div className={`flex-1 transition-all ${sidebarCollapsed ? "mr-0" : "mr-80 lg:mr-96"}`}>
          {/* Video Player */}
          <div className="bg-black select-none">
            <div className="container mx-auto">
              <video
                ref={videoRef}
                className="w-full aspect-video pointer-events-auto"
                controls
                src={currentLesson?.videoUrl || undefined}
                data-testid="video-player"
                controlsList="nodownload"
                onContextMenu={handleVideoContextMenu}
                onDragStart={handleVideoDragStart}
                style={{
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MsUserSelect: "none",
                }}
              >
                {language === "ar"
                  ? "متصفحك لا يدعم تشغيل الفيديو"
                  : "Your browser does not support the video tag."}
              </video>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="border-b bg-background">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentLessonIndex(currentLessonIndex - 1)}
                  disabled={!canGoPrev}
                  data-testid="button-prev-lesson"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {language === "ar" ? "السابق" : "Previous"}
                </Button>
                <Button
                  onClick={() => setCurrentLessonIndex(currentLessonIndex + 1)}
                  disabled={!canGoNext || !isLessonAccessible(lessons[currentLessonIndex + 1], currentLessonIndex + 1)}
                  data-testid="button-next-lesson"
                >
                  {language === "ar" ? "التالي" : "Next"}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabbed Content */}
          <div className="container mx-auto px-6 py-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList data-testid="tabs-content">
                <TabsTrigger value="overview" data-testid="tab-overview">
                  {language === "ar" ? "نظرة عامة" : "Overview"}
                </TabsTrigger>
                <TabsTrigger value="resources" data-testid="tab-resources">
                  {language === "ar" ? "الموارد" : "Resources"}
                </TabsTrigger>
                <TabsTrigger value="meetings" data-testid="tab-meetings">
                  {language === "ar" ? "الجلسات" : "Sessions"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                      {language === "ar" ? currentLesson?.titleAr : currentLesson?.titleEn}
                    </h2>
                    <p className="text-muted-foreground">
                      {language === "ar" ? currentLesson?.descriptionAr : currentLesson?.descriptionEn}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-heading font-semibold text-foreground mb-4">
                      {language === "ar" ? "عن هذه الدورة" : "About this Course"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {language === "ar" ? course.descriptionAr : course.descriptionEn}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === "ar" ? "المستوى" : "Level"}
                        </p>
                        <p className="font-semibold text-foreground">
                          {t("courses.level")} {course.level}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === "ar" ? "الدروس" : "Lessons"}
                        </p>
                        <p className="font-semibold text-foreground">{totalLessons}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === "ar" ? "المدة" : "Duration"}
                        </p>
                        <p className="font-semibold text-foreground">
                          {course.duration || 8} {t("courses.hours")}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === "ar" ? "المدرب" : "Instructor"}
                        </p>
                        <p className="font-semibold text-foreground">
                          {language === "ar" ? course.instructorAr : course.instructorEn}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground text-center">
                      {language === "ar"
                        ? "لا توجد موارد إضافية لهذا الدرس"
                        : "No additional resources for this lesson"}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="meetings" className="mt-6">
                <div className="space-y-4">
                  {meetings && meetings.length > 0 ? (
                    meetings.map((meeting) => (
                      <Card key={meeting.id} data-testid={`card-meeting-${meeting.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">
                                {language === "ar" ? meeting.titleAr : meeting.titleEn}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {new Date(meeting.scheduledAt).toLocaleString(language === "ar" ? "ar" : "en")}
                              </p>
                              {!meeting.isPaidOnly || !isLocked ? (
                                <Button asChild size="sm" data-testid={`button-join-meeting-${meeting.id}`}>
                                  <a href={meeting.zoomLink} target="_blank" rel="noopener noreferrer">
                                    {language === "ar" ? "انضم الآن" : "Join Now"}
                                  </a>
                                </Button>
                              ) : (
                                <Badge variant="secondary">
                                  <Lock className="h-3 w-3 mr-1" />
                                  {language === "ar" ? "يتطلب اشتراكاً" : "Subscription Required"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground text-center">
                          {language === "ar" ? "لا توجد جلسات مجدولة" : "No scheduled sessions"}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Lessons Sidebar */}
        <div className="fixed right-0 top-[73px] bottom-0 w-80 lg:w-96 bg-background border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-heading font-bold text-foreground mb-2">
              {language === "ar" ? "محتوى الدورة" : "Course Content"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {completedLessons} / {totalLessons} {language === "ar" ? "دروس مكتملة" : "lessons completed"}
            </p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {lessons.map((lesson, index) => {
                const isCompleted = userProgress?.some((p) => p.lessonId === lesson.id && p.completed);
                const isAccessible = isLessonAccessible(lesson, index);
                const isCurrent = index === currentLessonIndex;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => isAccessible && setCurrentLessonIndex(index)}
                    disabled={!isAccessible}
                    className={`w-full p-3 rounded-lg text-left transition-all hover-elevate active-elevate-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isCurrent ? "bg-primary/10 border-l-4 border-l-primary" : "bg-muted/30"
                    }`}
                    data-testid={`button-select-lesson-${index}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 pt-1">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : !isAccessible ? (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        ) : isCurrent ? (
                          <PlayCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Play className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm mb-1 ${isAccessible ? "text-foreground" : "text-muted-foreground"}`}>
                          {index + 1}. {language === "ar" ? lesson.titleAr : lesson.titleEn}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {lesson.duration} {language === "ar" ? "دقيقة" : "min"}
                          </span>
                          {!isAccessible && lesson.requiresPrevious && (
                            <>
                              <span>•</span>
                              <Lock className="h-3 w-3" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
