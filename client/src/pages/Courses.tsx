import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Lock, CheckCircle2 } from "lucide-react";
import type { Course } from "@shared/schema";
import { Link } from "wouter";
import { useState } from "react";
import level1Image from "@assets/generated_images/Level_1_course_thumbnail_58124b24.png";
import level2Image from "@assets/generated_images/Level_2_course_thumbnail_6fc26317.png";
import level3Image from "@assets/generated_images/Level_3_course_thumbnail_442d6b44.png";
import { useAuth } from "@/hooks/useAuth";

export default function Courses() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [filterFree, setFilterFree] = useState<boolean | null>(null);

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const levelImages: Record<number, string> = {
    1: level1Image,
    2: level2Image,
    3: level3Image,
  };

  const filteredCourses = courses?.filter((course) => {
    if (filterLevel !== null && course.level !== filterLevel) return false;
    if (filterFree !== null && course.isFree !== filterFree) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <div className="h-48 bg-muted animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-32 bg-muted animate-pulse rounded-lg" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1
                className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6"
                data-testid="text-courses-title"
              >
                {t("courses.title")}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {language === "ar"
                  ? "استكشف دوراتنا الشاملة واختر المستوى المناسب لك"
                  : "Explore our comprehensive courses and choose the level that's right for you"}
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant={filterLevel === null && filterFree === null ? "default" : "outline"}
                onClick={() => {
                  setFilterLevel(null);
                  setFilterFree(null);
                }}
                data-testid="button-filter-all"
              >
                {t("courses.filter.all")}
              </Button>
              <Button
                variant={filterFree === true ? "default" : "outline"}
                onClick={() => {
                  setFilterFree(filterFree === true ? null : true);
                  setFilterLevel(null);
                }}
                data-testid="button-filter-free"
              >
                {t("courses.filter.free")}
              </Button>
              {[1, 2, 3].map((level) => (
                <Button
                  key={level}
                  variant={filterLevel === level ? "default" : "outline"}
                  onClick={() => {
                    setFilterLevel(filterLevel === level ? null : level);
                    setFilterFree(null);
                  }}
                  data-testid={`button-filter-level-${level}`}
                >
                  {t("courses.filter.level")} {level}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            {filteredCourses && filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => {
                  const isLocked = !course.isFree && user?.subscriptionStatus !== "active";

                  return (
                    <Card
                      key={course.id}
                      className="hover-elevate active-elevate-2 transition-all overflow-hidden"
                      data-testid={`card-course-${course.id}`}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={course.thumbnailUrl || levelImages[course.level]}
                          alt={language === "ar" ? course.titleAr : course.titleEn}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (course.thumbnailUrl && target.src !== levelImages[course.level]) {
                              target.src = levelImages[course.level];
                            }
                          }}
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          {course.isFree && (
                            <Badge
                              className="bg-green-500 text-white"
                              data-testid="badge-free"
                            >
                              {t("courses.free")}
                            </Badge>
                          )}
                          <Badge data-testid={`badge-level-${course.level}`}>
                            {t("courses.level")} {course.level}
                          </Badge>
                        </div>
                        {isLocked && (
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                            <Lock className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {language === "ar" ? course.titleAr : course.titleEn}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {language === "ar"
                            ? course.descriptionAr
                            : course.descriptionEn}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span data-testid={`text-lesson-count-${course.id}`}>
                              {(course as any).lessonCount || 0} {t("courses.lessons")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span data-testid={`text-duration-${course.id}`}>
                              {course.duration || 8} {t("courses.hours")}
                            </span>
                          </div>
                        </div>
                        {isAuthenticated ? (
                          <Button
                            asChild
                            className="w-full"
                            disabled={isLocked}
                          >
                            <Link href={`/course/${course.id}`}>
                              <a className="flex items-center justify-center gap-2" data-testid={`button-view-course-${course.id}`}>
                                {isLocked ? (
                                  <>
                                    <Lock className="h-4 w-4" />
                                    {t("courses.locked")}
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    {t("courses.continue")}
                                  </>
                                )}
                              </a>
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            asChild
                            className="w-full"
                          >
                            <a href="/api/login" data-testid={`button-enroll-${course.id}`}>{t("courses.enroll")}</a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {language === "ar"
                    ? "لا توجد دورات متاحة حالياً"
                    : "No courses available"}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
