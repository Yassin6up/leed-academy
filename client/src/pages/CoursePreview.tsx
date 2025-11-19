import { useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/i18n";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  Clock,
  Globe,
  Award,
  Eye,
  Calendar,
  PlayCircle,
  CheckCircle2,
  Lock,
  Crown,
} from "lucide-react";
import type { Course, Lesson, SubscriptionPlan } from "@shared/schema";
import { format } from "date-fns";

export default function CoursePreview() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const hasIncrementedRef = useRef<Set<string>>(new Set());

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${id}`],
    enabled: !!id,
  });

  const { data: lessons = [] } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${id}/lessons`],
    enabled: !!id,
  });

  const { data: plan } = useQuery<SubscriptionPlan>({
    queryKey: [`/api/subscription-plans/${course?.requiredPlanId}`],
    enabled: !!course?.requiredPlanId,
  });

  useEffect(() => {
    if (id && course && !hasIncrementedRef.current.has(id)) {
      hasIncrementedRef.current.add(id);
      
      apiRequest("POST", `/api/courses/${id}/increment-views`, {})
        .then(() => {
          queryClient.invalidateQueries({ queryKey: [`/api/courses/${id}`] });
        })
        .catch((error) => {
          console.error("Failed to increment views:", error);
          hasIncrementedRef.current.delete(id);
        });
    }
  }, [id, course]);

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 py-12">
            <div className="animate-pulse space-y-6">
              <div className="h-96 bg-muted rounded-lg" />
              <div className="h-40 bg-muted rounded-lg" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 py-24 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {language === "ar" ? "الدورة غير موجودة" : "Course Not Found"}
            </h1>
            <Button onClick={() => navigate("/courses")}>
              {language === "ar" ? "العودة للدورات" : "Back to Courses"}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const title = language === "ar" ? course.titleAr : course.titleEn;
  const description = language === "ar" ? course.descriptionAr : course.descriptionEn;
  const instructor = language === "ar" ? course.instructorAr : course.instructorEn;

  const totalDuration = lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0);
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;

  const handleStartCourse = () => {
    if (!id) return;
    navigate(`/course/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
          <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Course Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="breadcrumb-navigation">
                  <span
                    className="hover:text-foreground cursor-pointer"
                    onClick={() => navigate("/courses")}
                    data-testid="link-courses"
                  >
                    {language === "ar" ? "الدورات" : "Courses"}
                  </span>
                  <span>/</span>
                  <span className="text-foreground" data-testid="text-course-title">{title}</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground leading-tight" data-testid="heading-course-title">
                  {title}
                </h1>

                {/* Description */}
                <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-course-description">
                  {description}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4" data-testid="course-meta-info">
                  {/* Rating */}
                  <div className="flex items-center gap-2" data-testid="course-rating">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-5 w-5 fill-yellow-400 text-yellow-400"
                          data-testid={`star-${star}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground" data-testid="text-rating-value">5.0</span>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Views Count */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="course-views">
                    <Eye className="h-4 w-4" />
                    <span data-testid="text-views-count">
                      {course.viewsCount?.toLocaleString() || 0}{" "}
                      {language === "ar" ? "مشاهدة" : "views"}
                    </span>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Launch Date */}
                  {course.createdAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="course-launch-date">
                      <Calendar className="h-4 w-4" />
                      <span data-testid="text-launch-date">
                        {language === "ar" ? "تم الإطلاق: " : "Launched: "}
                        {format(new Date(course.createdAt), "MMM yyyy")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="gap-2">
                    <Globe className="h-3 w-3" />
                    {course.language === "ar"
                      ? language === "ar"
                        ? "عربي"
                        : "Arabic"
                      : language === "ar"
                        ? "إنجليزي"
                        : "English"}
                  </Badge>

                  {course.hasCertificate && (
                    <Badge variant="secondary" className="gap-2">
                      <Award className="h-3 w-3" />
                      {language === "ar"
                        ? "شهادة إتمام"
                        : "Certificate of Completion"}
                    </Badge>
                  )}

                  {course.requiredPlanId && plan ? (
                    <Badge variant="default" className="gap-2">
                      <Crown className="h-3 w-3" />
                      {language === "ar" ? plan.nameAr : plan.nameEn}
                    </Badge>
                  ) : (
                    <Badge variant="default">{language === "ar" ? "مجاني" : "Free"}</Badge>
                  )}

                  <Badge variant="outline">
                    {language === "ar" ? `المستوى ${course.level}` : `Level ${course.level}`}
                  </Badge>
                </div>

                {/* Instructor */}
                {instructor && (
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {instructor.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "المدرب" : "Instructor"}
                      </p>
                      <p className="font-medium text-foreground">{instructor}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Course Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardContent className="p-0">
                    {/* Thumbnail */}
                    <div className="aspect-video w-full bg-muted relative overflow-hidden rounded-t-lg">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <PlayCircle className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Plan Name or Free Badge */}
                      {course.requiredPlanId && plan ? (
                        <div className="flex items-center gap-2">
                          <Crown className="h-6 w-6 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {language === "ar" ? "يتطلب خطة" : "Requires Plan"}
                            </p>
                            <p className="text-xl font-bold text-foreground">
                              {language === "ar" ? plan.nameAr : plan.nameEn}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="default" className="text-lg px-4 py-2 w-full justify-center">
                          {language === "ar" ? "مجاني" : "Free"}
                        </Badge>
                      )}

                      {/* Start Course Button */}
                      <Button
                        onClick={handleStartCourse}
                        className="w-full h-12 text-lg"
                        data-testid="button-start-course"
                      >
                        <PlayCircle className="h-5 w-5 mr-2" />
                        {language === "ar" ? "ابدأ الدورة" : "Start Course"}
                      </Button>

                      <Separator />

                      {/* Course Stats */}
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            {language === "ar" ? "المدة الإجمالية" : "Total Duration"}
                          </span>
                          <span className="font-medium flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {hours}h {minutes}m
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            {language === "ar" ? "عدد الدروس" : "Lessons"}
                          </span>
                          <span className="font-medium">{lessons.length}</span>
                        </div>

                        {course.hasCertificate && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              {language === "ar" ? "الشهادة" : "Certificate"}
                            </span>
                            <span className="font-medium text-green-600 flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              {language === "ar" ? "متاح" : "Available"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content Section */}
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-6">
              {language === "ar" ? "محتوى الدورة" : "Course Content"}
            </h2>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-1">
                  {lessons.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {language === "ar"
                        ? "لا توجد دروس متاحة بعد"
                        : "No lessons available yet"}
                    </p>
                  ) : (
                    lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 rounded-lg hover-elevate cursor-pointer"
                        data-testid={`lesson-item-${lesson.id}`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">
                              {language === "ar" ? lesson.titleAr : lesson.titleEn}
                            </h3>
                            {lesson.descriptionEn && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {language === "ar"
                                  ? lesson.descriptionAr
                                  : lesson.descriptionEn}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {lesson.duration && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {lesson.duration}m
                            </span>
                          )}
                          {lesson.isFree ? (
                            <Badge variant="secondary" className="gap-1">
                              <PlayCircle className="h-3 w-3" />
                              {language === "ar" ? "مجاني" : "Free"}
                            </Badge>
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Certificate Info */}
            {course.hasCertificate && (
              <Card className="mt-6 bg-gradient-to-r from-primary/5 to-background border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-foreground text-lg mb-2">
                        {language === "ar"
                          ? "احصل على شهادة إتمام"
                          : "Earn a Certificate of Completion"}
                      </h3>
                      <p className="text-muted-foreground">
                        {language === "ar"
                          ? "أكمل جميع دروس الدورة للحصول على شهادة إتمام رسمية يمكنك مشاركتها مع أصحاب العمل والزملاء."
                          : "Complete all course lessons to earn an official certificate of completion that you can share with employers and colleagues."}
                      </p>
                      <div className="flex items-center gap-2 mt-4 text-sm text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">
                          {language === "ar"
                            ? "يتم إنشاء الشهادة تلقائيًا عند الانتهاء"
                            : "Automatically generated upon completion"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
