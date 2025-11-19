import { useLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, DollarSign, TrendingUp } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  activeSubscriptions: number;
  recentPayments: Array<{ month: string; amount: number }>;
}

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, isAdmin, isLoading, toast]);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && isAdmin,
  });

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="p-8">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: language === "ar" ? "المستخدمون" : "Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: language === "ar" ? "الدورات" : "Courses",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "text-green-500",
    },
    {
      title: language === "ar" ? "الإيرادات" : "Revenue",
      value: `$${stats?.totalRevenue || 0}`,
      icon: DollarSign,
      color: "text-purple-500",
    },
    {
      title: language === "ar" ? "الاشتراكات النشطة" : "Active Subscriptions",
      value: stats?.activeSubscriptions || 0,
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="p-8">
      <h1
        className="text-3xl font-heading font-bold text-foreground mb-8"
        data-testid="text-admin-dashboard-title"
      >
        {language === "ar" ? "لوحة التحكم" : "Dashboard Overview"}
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="hover-elevate active-elevate-2 transition-all"
            data-testid={`card-admin-stat-${index}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-2xl font-bold text-foreground">
                  {stat.value}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card data-testid="card-revenue-chart">
        <CardHeader>
          <CardTitle>
            {language === "ar" ? "الإيرادات الشهرية" : "Monthly Revenue"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.recentPayments || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
