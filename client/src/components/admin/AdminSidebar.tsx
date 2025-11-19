import { useLanguage } from "@/lib/i18n";
import { Link, useLocation } from "wouter";
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
} from "@/components/ui/sidebar";

export function AdminSidebar() {
  const { t, language } = useLanguage();
  const [location] = useLocation();

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
      title: language === "ar" ? "المستخدمون" : "Users",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: language === "ar" ? "المدفوعات" : "Payments",
      icon: CreditCard,
      path: "/admin/payments",
    },
  ];

  const systemItems = [
    {
      title: language === "ar" ? "الإعدادات" : "Settings",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <Link href="/admin/dashboard">
          <a className="flex items-center gap-2 px-2 py-1 hover-elevate active-elevate-2 rounded-md transition-colors">
            <GraduationCap className="h-6 w-6 text-primary" />
            <div className="flex flex-col">
              <span className="font-heading font-bold text-base">TradeMaster</span>
              <span className="text-xs text-muted-foreground">
                {language === "ar" ? "لوحة الإدارة" : "Admin Panel"}
              </span>
            </div>
          </a>
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-4">
        {/* Overview Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4">
            {language === "ar" ? "نظرة عامة" : "Overview"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {overviewItems.map((item) => (
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

        {/* Content Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4">
            {language === "ar" ? "إدارة المحتوى" : "Content"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentItems.map((item) => (
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

        {/* Business Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4">
            {language === "ar" ? "الأعمال" : "Business"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item) => (
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
    </Sidebar>
  );
}
