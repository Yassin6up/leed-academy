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
} from "@/components/ui/sidebar";

export function AdminSidebar() {
  const { t } = useLanguage();
  const [location] = useLocation();

  const menuItems = [
    {
      title: t("admin.dashboard"),
      icon: LayoutDashboard,
      path: "/admin",
    },
    {
      title: t("admin.users"),
      icon: Users,
      path: "/admin/users",
    },
    {
      title: t("admin.courses"),
      icon: BookOpen,
      path: "/admin/courses",
    },
    {
      title: t("admin.payments"),
      icon: DollarSign,
      path: "/admin/payments",
    },
    {
      title: t("admin.analytics"),
      icon: BarChart3,
      path: "/admin/analytics",
    },
    {
      title: t("admin.meetings"),
      icon: Video,
      path: "/admin/meetings",
    },
    {
      title: t("admin.settings"),
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-heading font-bold px-4 py-6">
            Admin Panel
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.path}
                    data-testid={`admin-link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.path}>
                      <a className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
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
