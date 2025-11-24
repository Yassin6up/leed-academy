import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/dashboard/UserSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Globe, Moon, Sun } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { Link, useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserLayoutProps {
  children: React.ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: language === "ar" ? "تم تسجيل الخروج" : "Logged out",
        description: language === "ar" ? "تم تسجيل خروجك بنجاح" : "You have been logged out successfully",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل تسجيل الخروج" : "Logout failed",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <UserSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between gap-4 p-4 border-b border-border bg-background">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
            </div>
            
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-language-toggle">
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage("en")} data-testid="option-language-en">
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("ar")} data-testid="option-language-ar">
                    العربية
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle">
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              {user && (
                <>
                  <Link href="/dashboard/settings">
                    <a className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </a>
                  </Link>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </header>
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
