import { useLanguage } from "@/lib/i18n";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  DollarSign,
  BarChart3,
  Video,
  Settings,
  GraduationCap,
  CreditCard,
  Home,
  LogOut,
  ArrowDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function AdminSidebar() {
  const { t, language } = useLanguage();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

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

  const overviewItems = [
    {
      title: language === "ar" ? "لوحة التحكم" : "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      title: language === "ar" ? "التحليلات" : "Analytics",
      icon: BarChart3,
      path: "/admin/analytics",
    },
  ];

  const contentItems = [
    {
      title: language === "ar" ? "الدورات" : "Courses",
      icon: BookOpen,
      path: "/admin/courses",
    },
    {
      title: language === "ar" ? "اجتماعات Zoom" : "Zoom Meetings",
      icon: Video,
      path: "/admin/meetings",
    },
  ];

  const businessItems = [
    {
      title: language === "ar" ? "خطط الاشتراك" : "Pricing Plans",
      icon: DollarSign,
      path: "/admin/pricing",
    },
    {
      title: language === "ar" ? "المستخدمون" : "Users",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: language === "ar" ? "المدفوعات" : "Payments",
      icon: CreditCard,
      path: "/admin/payments",
    },
    {
      title: language === "ar" ? "طلبات السحب" : "Withdrawals",
      icon: ArrowDown,
      path: "/admin/withdrawals",
    },
  ];

  const systemItems = [
    ...(user?.role === "admin" ? [{
      title: language === "ar" ? "إدارة الأدوار" : "Role Management",
      icon: Users,
      path: "/admin/roles",
    }] : []),
    {
      title: language === "ar" ? "السجلات" : "Logs",
      icon: BarChart3,
      path: "/admin/logs",
    },
    ...(user?.role === "admin" ? [{
      title: language === "ar" ? "الإعدادات" : "Settings",
      icon: Settings,
      path: "/admin/settings",
    }] : []),
  ];

  // Filter business items based on role
  const getBusinessItems = () => {
    if (user?.role === "admin") {
      return businessItems;
    }
    if (user?.role === "support") {
      return businessItems.filter(item => 
        item.path === "/admin/payments" || 
        item.path === "/admin/users" || 
        item.path === "/admin/withdrawals"
      );
    }
    if (user?.role === "manager") {
      return businessItems.filter(item => item.path !== "/admin/settings");
    }
    return [];
  };

  // Filter content items based on role
  const getContentItems = () => {
    if (user?.role === "support") return [];
    return contentItems;
  };

  // Filter overview items based on role
  const getOverviewItems = () => {
    if (user?.role === "support") return [];
    return overviewItems;
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <Link href="/admin/dashboard">
          <a className="flex items-center gap-2 px-2 py-1 hover-elevate active-elevate-2 rounded-md transition-colors">
            <GraduationCap className="h-6 w-6 text-primary" />
            <div className="flex flex-col">
              <span className="font-heading font-bold text-base">Leedacademya</span>
              <span className="text-xs text-muted-foreground">
                {language === "ar" ? "لوحة الإدارة" : "Admin Panel"}
              </span>
            </div>
          </a>
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-4">
        {/* Overview Section */}
        {getOverviewItems().length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4">
            {language === "ar" ? "نظرة عامة" : "Overview"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getOverviewItems().map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.path}
                    data-testid={`admin-link-${item.path.split("/").pop()}`}
                  >
                    <Link href={item.path}>
                      <a className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </a>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {/* Content Management Section */}
        {getContentItems().length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4">
            {language === "ar" ? "إدارة المحتوى" : "Content"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getContentItems().map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.path}
                    data-testid={`admin-link-${item.path.split("/").pop()}`}
                  >
                    <Link href={item.path}>
                      <a className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </a>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {/* Business Section */}
        {getBusinessItems().length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4">
            {language === "ar" ? "الأعمال" : "Business"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getBusinessItems().map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.path}
                    data-testid={`admin-link-${item.path.split("/").pop()}`}
                  >
                    <Link href={item.path}>
                      <a className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </a>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4">
            {language === "ar" ? "النظام" : "System"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.path}
                    data-testid={`admin-link-${item.path.split("/").pop()}`}
                  >
                    <Link href={item.path}>
                      <a className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </a>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sm"
          onClick={() => navigate("/")}
          data-testid="button-admin-home"
        >
          <Home className="h-4 w-4" />
          {language === "ar" ? "الرئيسية" : "Home"}
        </Button>
        <Button
          variant="destructive"
          className="w-full justify-start gap-3 text-sm"
          onClick={handleLogout}
          data-testid="button-admin-logout"
        >
          <LogOut className="h-4 w-4" />
          {language === "ar" ? "تسجيل الخروج" : "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
