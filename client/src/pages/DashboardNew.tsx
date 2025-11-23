import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, CreditCard, Users, Settings, Star, Home, LogOut } from "lucide-react";
import MyCourses from "@/components/dashboard/tabs/MyCourses";
import MySubscription from "@/components/dashboard/tabs/MySubscription";
import JoinGroupTab from "@/components/dashboard/tabs/JoinGroupTab";
import SettingsTab from "@/components/dashboard/tabs/SettingsTab";
import RatingsTab from "@/components/dashboard/tabs/RatingsTab";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";

export default function DashboardNew() {
  const { language } = useLanguage();
  const [location, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  const searchParams = new URLSearchParams(window.location.search);
  const urlTab = searchParams.get("tab") || "courses";
  const [activeTab, setActiveTab] = useState(urlTab);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") || "courses";
    setActiveTab(tab);
  }, [location]);

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/dashboard?tab=${value}`, { replace: true });
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      navigate("/");
      
      toast({
        title: language === "ar" ? "تم تسجيل الخروج" : "Logged out",
        description: language === "ar" ? "تم تسجيل خروجك بنجاح" : "You have been logged out successfully",
      });
    } catch (error) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل تسجيل الخروج" : "Logout failed",
        variant: "destructive",
      });
    }
  };

  const tabs = [
    {
      value: "courses",
      label: language === "ar" ? "دوراتي" : "My Courses",
      icon: BookOpen,
    },
    {
      value: "subscription",
      label: language === "ar" ? "اشتراكي" : "Subscription",
      icon: CreditCard,
    },
    {
      value: "join-group",
      label: language === "ar" ? "انضم للمجموعة" : "Join Group",
      icon: Users,
    },
    {
      value: "ratings",
      label: language === "ar" ? "التقييمات" : "Ratings",
      icon: Star,
    },
    {
      value: "settings",
      label: language === "ar" ? "الإعدادات" : "Settings",
      icon: Settings,
    },
  ];

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-20 md:pb-0">
        <div className="container mx-auto px-0 md:px-6">
          <div className="flex flex-col md:flex-row gap-0 md:gap-6 py-0 md:py-8">
            {/* Desktop Sidebar - Hidden on Mobile */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-4 p-4 bg-muted rounded-lg">
                <h2 className="px-4 py-2 text-lg font-heading font-bold text-foreground">
                  {language === "ar" ? "لوحة التحكم" : "Dashboard"}
                </h2>
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <Button
                      key={tab.value}
                      variant={activeTab === tab.value ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 text-base",
                        activeTab === tab.value && "bg-background"
                      )}
                      onClick={() => handleTabChange(tab.value)}
                      data-testid={`sidebar-tab-${tab.value}`}
                    >
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </Button>
                  ))}
                </nav>
                <div className="border-t border-border pt-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-base"
                    onClick={() => navigate("/")}
                    data-testid="button-dashboard-home"
                  >
                    <Home className="h-5 w-5" />
                    {language === "ar" ? "الرئيسية" : "Home"}
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start gap-3 text-base"
                    onClick={handleLogout}
                    data-testid="button-dashboard-logout"
                  >
                    <LogOut className="h-5 w-5" />
                    {language === "ar" ? "تسجيل الخروج" : "Logout"}
                  </Button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 px-4 md:px-0">
              {activeTab === "courses" && <MyCourses />}
              {activeTab === "subscription" && <MySubscription />}
              {activeTab === "join-group" && <JoinGroupTab />}
              {activeTab === "ratings" && <RatingsTab />}
              {activeTab === "settings" && <SettingsTab />}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation - Hidden on Desktop */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
          <div className="grid grid-cols-5 gap-1 p-2">
            {tabs.map((tab) => (
              <Button
                key={tab.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-2 px-1",
                  activeTab === tab.value && "bg-muted text-primary"
                )}
                onClick={() => handleTabChange(tab.value)}
                data-testid={`mobile-tab-${tab.value}`}
              >
                <tab.icon className={cn(
                  "h-5 w-5",
                  activeTab === tab.value && "text-primary"
                )} />
                <span className="text-xs truncate w-full text-center">
                  {tab.label}
                </span>
              </Button>
            ))}
          </div>
        </nav>
      </main>
      <Footer />
    </div>
  );
}
