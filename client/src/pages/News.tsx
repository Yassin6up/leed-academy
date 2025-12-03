import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Lock, ExternalLink, Clock, TrendingUp } from "lucide-react";
import type { Meeting } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function News() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const { data: meetings, isLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
  });

  // Fetch financial news from Reddit - sorted by NEW to get latest posts
  const { data: newsArticles, isLoading: newsLoading } = useQuery({
    queryKey: ["financial-news", new Date().toDateString()], // Refresh daily
    queryFn: async () => {
      try {
        // Fetch from multiple financial subreddits
        const subreddits = ['wallstreetbets', 'stocks', 'cryptocurrency', 'bitcoin', 'investing'];
        
        // Fetch from all subreddits and combine
        const promises = subreddits.map(subreddit =>
          fetch(`https://www.reddit.com/r/${subreddit}/new.json?limit=10`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        );
        
        const results = await Promise.all(promises);
        
        // Combine all posts
        const allPosts: any[] = [];
        results.forEach(data => {
          if (data?.data?.children) {
            allPosts.push(...data.data.children);
          }
        });
        
        // Get current date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime() / 1000;
        
        // Filter and format posts from today only
        const todaysPosts = allPosts
          .filter((post: any) => {
            const postDate = post.data.created_utc;
            return postDate >= todayTimestamp && 
                   !post.data.title.toLowerCase().includes('[removed]') &&
                   !post.data.stickied; // Exclude pinned posts
          })
          .map((post: any) => ({
            title: post.data.title,
            description: post.data.selftext?.substring(0, 150) || 'Click to read more...',
            url: `https://www.reddit.com${post.data.permalink}`,
            source: `r/${post.data.subreddit}`,
            publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
            thumbnail: post.data.thumbnail && post.data.thumbnail.startsWith('http') 
              ? post.data.thumbnail 
              : null,
            score: post.data.score,
            numComments: post.data.num_comments,
            createdAt: post.data.created_utc,
          }))
          .sort((a: any, b: any) => b.createdAt - a.createdAt) // Sort by newest first
          .slice(0, 12); // Get top 12 newest posts from today
        
        return todaysPosts;
      } catch (error) {
        console.error('Error fetching Reddit news:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    refetchInterval: 1000 * 60 * 30, // Auto-refetch every 30 minutes
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
                : "Stay updated with the latest educational Zoom sessions and financial market discussions"}
            </p>
          </div>
        </section>

        {/* Two Column Layout */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
              
              {/* Left Column - Zoom Meetings */}
              <div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  {language === "ar" ? "الجلسات القادمة" : "Upcoming Sessions"}
                </h2>
                
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
                                    <a href="/auth">{t("nav.login")}</a>
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

              {/* Right Column - Financial News from Reddit */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    {language === "ar" ? "أخبار اليوم" : "Today's News"}
                  </h2>
                  <Badge variant="outline" className="text-xs">
                    {new Date().toLocaleDateString(language === "ar" ? "ar" : "en", { 
                      month: "short", 
                      day: "numeric" 
                    })}
                  </Badge>
                </div>
                
                {newsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : newsArticles && newsArticles.length > 0 ? (
                  <div className="space-y-4">
                    {newsArticles.map((article: any, index: number) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {article.thumbnail && (
                              <img
                                src={article.thumbnail}
                                alt={article.title}
                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground mb-1 line-clamp-2 hover:text-primary text-sm">
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {article.title}
                                </a>
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {article.description}
                              </p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="font-medium">{article.source}</span>
                                <div className="flex items-center gap-3">
                                  <span>↑ {article.score}</span>
                                  <span>💬 {article.numComments}</span>
                                  <span>
                                    {new Date(article.publishedAt).toLocaleTimeString(
                                      language === "ar" ? "ar" : "en",
                                      { hour: '2-digit', minute: '2-digit' }
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          {language === "ar" 
                            ? `تم العثور على ${newsArticles.length} خبر من اليوم` 
                            : `Found ${newsArticles.length} posts from today`}
                          {" • "}
                          {language === "ar" 
                            ? "يتم التحديث كل 30 دقيقة" 
                            : "Updates every 30 minutes"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        {language === "ar"
                          ? "لا توجد أخبار متاحة حالياً"
                          : "No news available at the moment"}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}