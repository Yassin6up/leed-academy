import { useLanguage } from "@/lib/i18n";
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  CreditCard,
  Users,
  Settings,
  Star,
  GraduationCap,
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

export function UserSidebar() {
  const { language } = useLanguage();
  const [location] = useLocation();

  const learningItems = [
    {
      title: language === "ar" ? "دوراتي" : "My Courses",
      icon: BookOpen,
      path: "/dashboard",
    },
    {
      title: language === "ar" ? "اشتراكي" : "My Subscription",
      icon: CreditCard,
      path: "/dashboard/subscription",
    },
  ];

  const communityItems = [
    {
      title: language === "ar" ? "انضم للمجموعة" : "Join Group",
      icon: Users,
      path: "/dashboard/join-group",
    },
    {
      title: language === "ar" ? "التقييمات" : "Ratings",
      icon: Star,
      path: "/dashboard/ratings",
    },
  ];

  const accountItems = [
    {
      title: language === "ar" ? "الإعدادات" : "Settings",
      icon: Settings,
      path: "/dashboard/settings",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <Link href="/dashboard">
          <a className="flex items-center gap-2 px-2 py-1 hover-elevate active-elevate-2 rounded-md transition-colors">
            <GraduationCap className="h-6 w-6 text-primary" />
            <div className="flex flex-col">
              <span className="font-heading font-bold text-base">Leed Academy</span>
              <span className="text-xs text-muted-foreground">
                {language === "ar" ? "لوحة التحكم" : "Dashboard"}
              </span>
            </div>
          </a>
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-4">
        {/* Learning Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4">
            {language === "ar" ? "التعلم" : "Learning"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {learningItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.path}
                    data-testid={`user-link-${item.path.split("/").pop()}`}
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

        {/* Community Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4">
            {language === "ar" ? "المجتمع" : "Community"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.path}
                    data-testid={`user-link-${item.path.split("/").pop()}`}
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

        {/* Account Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4">
            {language === "ar" ? "الحساب" : "Account"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.path}
                    data-testid={`user-link-${item.path.split("/").pop()}`}
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
