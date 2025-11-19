import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 relative z-0">
          <header className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-border bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </header>
          <main className="flex-1 overflow-auto bg-background">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
