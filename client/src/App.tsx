import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import "@/i18n/config";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Contact from "@/pages/Contact";
import Pricing from "@/pages/Pricing";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import CoursePreview from "@/pages/CoursePreview";
import News from "@/pages/News";
import DashboardNew from "@/pages/DashboardNew";
import Subscribe from "@/pages/Subscribe";
import Auth from "@/pages/Auth";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminCourses from "@/pages/admin/AdminCourses";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminMeetings from "@/pages/admin/AdminMeetings";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminWithdrawals from "@/pages/admin/AdminWithdrawals";
import AdminPricing from "@/pages/admin/AdminPricing";
import AdminLogs from "@/pages/admin/AdminLogs";
import AdminRoles from "@/pages/admin/AdminRoles";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/contact" component={Contact} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/courses" component={Courses} />
      <Route path="/preview/:id" component={CoursePreview} />
      <Route path="/course/:id" component={CourseDetail} />
      <Route path="/news" component={News} />

      {/* Protected Routes */}
      {isAuthenticated && (
        <>
          <Route path="/dashboard" component={DashboardNew} />
          <Route path="/subscribe/:planId?" component={Subscribe} />

          {/* Admin Routes */}
          <Route path="/admin">
            {() => {
              // Redirect /admin to /admin/dashboard
              window.location.href = "/admin/dashboard";
              return null;
            }}
          </Route>
          <Route path="/admin/dashboard">
            {() => (
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/users">
            {() => (
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/courses">
            {() => (
              <AdminLayout>
                <AdminCourses />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/payments">
            {() => (
              <AdminLayout>
                <AdminPayments />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/analytics">
            {() => (
              <AdminLayout>
                <AdminAnalytics />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/meetings">
            {() => (
              <AdminLayout>
                <AdminMeetings />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/pricing">
            {() => (
              <AdminLayout>
                <AdminPricing />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/settings">
            {() => (
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/withdrawals">
            {() => (
              <AdminLayout>
                <AdminWithdrawals />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/logs">
            {() => (
              <AdminLayout>
                <AdminLogs />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/roles">
            {() => (
              <AdminLayout>
                <AdminRoles />
              </AdminLayout>
            )}
          </Route>
        </>
      )}

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
