import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [location, navigate] = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  // Check if user has admin panel access (admin, manager, or support)
  const hasAdminAccess = user?.role === "admin" || user?.role === "manager" || user?.role === "support";

  // Get admin panel route based on role
  const getAdminRoute = () => {
    if (user?.role === "support") {
      return "/admin/users";
    }
    return "/admin/dashboard"; // admin and manager
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

  const navItems = [
    { path: "/", label: t("nav.home") },
    { path: "/about", label: t("nav.about") },
    { path: "/services", label: t("nav.services") },
    { path: "/courses", label: t("nav.courses") },
    { path: "/news", label: language === "ar" ? "الأخبار" : "News" },
    { path: "/pricing", label: t("nav.pricing") },
    { path: "/contact", label: t("nav.contact") },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            href="/"
            className="text-2xl font-heading font-bold text-primary hover-elevate active-elevate-2 px-3 py-2 rounded-lg transition-colors"
            data-testid="link-home-logo"
          >
            Leedacademya
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`px-4 py-2 rounded-lg font-medium transition-colors hover-elevate active-elevate-2 ${
                  isActive(item.path)
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground"
                }`}
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="button-language-toggle"
                >
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setLanguage("en")}
                  data-testid="option-language-en"
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("ar")}
                  data-testid="option-language-ar"
                >
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
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

            {/* User Menu or Login */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.profileImageUrl || ""} />
                      <AvatarFallback>
                        {user.firstName?.[0] || user.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" data-testid="link-dashboard">
                      {t("nav.dashboard")}
                    </Link>
                  </DropdownMenuItem>
                  {hasAdminAccess && (
                    <DropdownMenuItem asChild>
                      <Link href={getAdminRoute()} data-testid="link-admin">
                        {t("nav.admin")}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    data-testid="button-logout"
                  >
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild data-testid="button-login">
                <Link href="/auth">{t("nav.login")}</Link>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors hover-elevate active-elevate-2 ${
                    isActive(item.path)
                      ? "text-foreground bg-accent"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
