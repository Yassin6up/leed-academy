import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Lock, ExternalLink, Clock } from "lucide-react";
import type { Meeting } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function News() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const { data: meetings, isLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
  });

  const hasActiveSubscription = user?.subscriptionStatus === "active";

  const upcomingMeetings = meetings?.filter(
    (meeting) => new Date(meeting.scheduledAt) > new Date()
  ).sort((a, b) => 
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  const canAccessMeeting = (meeting: Meeting) => {
    if (!meeting.isPaidOnly) return true;
    return isAuthenticated && hasActiveSubscription;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Page Header */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-6">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4" data-testid="text-page-title">
              {language === "ar" ? "الأخبار والجلسات" : "News & Sessions"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {language === "ar"
                ? "ابق على اطلاع على أحدث جلسات Zoom التعليمية والأحداث القادمة"
                : "Stay updated with the latest educational Zoom sessions and upcoming events"}
            </p>
          </div>
        </section>

        {/* Meetings Section */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : upcomingMeetings && upcomingMeetings.length > 0 ? (
                <div className="space-y-6">
                  {upcomingMeetings.map((meeting) => {
                    const canAccess = canAccessMeeting(meeting);
                    const meetingDate = new Date(meeting.scheduledAt);

                    return (
                      <Card key={meeting.id} data-testid={`card-meeting-${meeting.id}`}>
                        <CardHeader>
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Calendar className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-xl text-foreground">
                                    {language === "ar" ? meeting.titleAr : meeting.titleEn}
                                  </CardTitle>
                                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {meetingDate.toLocaleString(
                                        language === "ar" ? "ar" : "en",
                                        {
                                          dateStyle: "full",
                                          timeStyle: "short",
                                        }
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-3">
                                {meeting.isPaidOnly && (
                                  <Badge variant="secondary" data-testid={`badge-paid-only-${meeting.id}`}>
                                    <Lock className="h-3 w-3 mr-1" />
                                    {language === "ar" ? "للمشتركين فقط" : "Subscribers Only"}
                                  </Badge>
                                )}
                                <Badge>
                                  {meeting.duration} {language === "ar" ? "دقيقة" : "min"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">
                            {language === "ar" ? meeting.descriptionAr : meeting.descriptionEn}
                          </p>
                          
                          {canAccess ? (
                            <Button
                              asChild
                              data-testid={`button-join-meeting-${meeting.id}`}
                            >
                              <a
                                href={meeting.zoomLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                {language === "ar" ? "انضم إلى الجلسة" : "Join Session"}
                              </a>
                            </Button>
                          ) : (
                            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-muted">
                              <Lock className="h-5 w-5 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">
                                  {language === "ar"
                                    ? "يتطلب اشتراكاً نشطاً"
                                    : "Subscription Required"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {language === "ar"
                                    ? "اشترك في أحد خططنا للوصول إلى هذه الجلسة"
                                    : "Subscribe to one of our plans to access this session"}
                                </p>
                              </div>
                              {!isAuthenticated ? (
                                <Button asChild variant="outline" size="sm" data-testid={`button-login-${meeting.id}`}>
                                  <a href="/api/login">{t("nav.login")}</a>
                                </Button>
                              ) : (
                                <Button asChild variant="outline" size="sm" data-testid={`button-subscribe-${meeting.id}`}>
                                  <a href="/pricing">{language === "ar" ? "اشترك الآن" : "Subscribe Now"}</a>
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
                      {language === "ar" ? "لا توجد جلسات قادمة" : "No Upcoming Sessions"}
                    </h2>
                    <p className="text-muted-foreground">
                      {language === "ar"
                        ? "لا توجد جلسات مجدولة في الوقت الحالي. تحقق مرة أخرى لاحقاً"
                        : "There are no scheduled sessions at the moment. Check back later"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
