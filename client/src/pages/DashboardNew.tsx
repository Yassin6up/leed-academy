import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, CreditCard, Users, Settings, Star } from "lucide-react";
import MyCourses from "@/components/dashboard/tabs/MyCourses";
import MySubscription from "@/components/dashboard/tabs/MySubscription";
import JoinGroupTab from "@/components/dashboard/tabs/JoinGroupTab";
import SettingsTab from "@/components/dashboard/tabs/SettingsTab";
import RatingsTab from "@/components/dashboard/tabs/RatingsTab";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
      <main className="pt-20">
        <div className="container mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 mb-8 h-auto bg-muted p-2 rounded-lg">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
                  data-testid={`tab-${tab.value}`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="courses" className="mt-0">
              <MyCourses />
            </TabsContent>

            <TabsContent value="subscription" className="mt-0">
              <MySubscription />
            </TabsContent>

            <TabsContent value="join-group" className="mt-0">
              <JoinGroupTab />
            </TabsContent>

            <TabsContent value="ratings" className="mt-0">
              <RatingsTab />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
