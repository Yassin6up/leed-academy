import { useLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, DollarSign, TrendingUp } from "lucide-react";
import { 
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  Line, LineChart, Pie, PieChart, Cell, Legend
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  activeSubscriptions: number;
  recentPayments: Array<{ month: string; amount: number }>;
}

interface Analytics {
  revenueTrends: {
    daily: Array<{ date: string; amount: number }>;
    weekly: Array<{ week: string; amount: number }>;
    monthly: Array<{ month: string; amount: number }>;
  };
  userRegistrationTrends: Array<{ month: string; count: number }>;
  courseEnrollments: Array<{ courseId: string; courseName: string; count: number }>;
  topCourses: Array<{ id: string; titleEn: string; titleAr: string; enrollments: number }>;
  paymentStatusBreakdown: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [revenuePeriod, setRevenuePeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

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

  const { data: analytics, isLoading: analyticsLoading, isError: analyticsError } = useQuery<Analytics>({
    queryKey: ["/api/admin/analytics"],
    enabled: isAuthenticated && isAdmin,
  });

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="p-8">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive">
              {language === "ar" ? "فشل في تحميل التحليلات" : "Failed to load analytics"}
            </p>
          </CardContent>
        </Card>
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

  const totalPayments = analytics 
    ? analytics.paymentStatusBreakdown.pending + analytics.paymentStatusBreakdown.approved + analytics.paymentStatusBreakdown.rejected 
    : 0;
  
  const paymentStatusData = analytics && totalPayments > 0 ? [
    { 
      name: language === "ar" ? "معلق" : "Pending", 
      value: analytics.paymentStatusBreakdown.pending, 
      color: "#f59e0b",
      percentage: Math.round((analytics.paymentStatusBreakdown.pending / totalPayments) * 100)
    },
    { 
      name: language === "ar" ? "موافق عليه" : "Approved", 
      value: analytics.paymentStatusBreakdown.approved, 
      color: "#10b981",
      percentage: Math.round((analytics.paymentStatusBreakdown.approved / totalPayments) * 100)
    },
    { 
      name: language === "ar" ? "مرفوض" : "Rejected", 
      value: analytics.paymentStatusBreakdown.rejected, 
      color: "#ef4444",
      percentage: Math.round((analytics.paymentStatusBreakdown.rejected / totalPayments) * 100)
    },
  ] : [];

  const revenueData = analytics?.revenueTrends[revenuePeriod] || [];

  return (
    <div className="p-8">
      <h1
        className="text-3xl font-heading font-bold text-foreground mb-8"
        data-testid="text-admin-dashboard-title"
      >
        {language === "ar" ? "لوحة التحليلات المتقدمة" : "Advanced Analytics Dashboard"}
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

      {/* Revenue Trends Chart with Tabs */}
      <Card data-testid="card-revenue-trends" className="mb-8">
        <CardHeader>
          <CardTitle>
            {language === "ar" ? "اتجاهات الإيرادات" : "Revenue Trends"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={revenuePeriod} onValueChange={(v) => setRevenuePeriod(v as any)} className="mb-4">
            <TabsList data-testid="tabs-revenue-period">
              <TabsTrigger value="daily" data-testid="tab-daily">
                {language === "ar" ? "يومي" : "Daily"}
              </TabsTrigger>
              <TabsTrigger value="weekly" data-testid="tab-weekly">
                {language === "ar" ? "أسبوعي" : "Weekly"}
              </TabsTrigger>
              <TabsTrigger value="monthly" data-testid="tab-monthly">
                {language === "ar" ? "شهري" : "Monthly"}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {analyticsLoading ? (
            <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
          ) : revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={revenuePeriod === 'daily' ? 'date' : revenuePeriod === 'weekly' ? 'week' : 'month'}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {language === "ar" ? "لا توجد بيانات" : "No revenue data available"}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Registration Trends */}
        <Card data-testid="card-user-registration">
          <CardHeader>
            <CardTitle>
              {language === "ar" ? "تسجيلات المستخدمين" : "User Registrations"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
            ) : analytics?.userRegistrationTrends && analytics.userRegistrationTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.userRegistrationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {language === "ar" ? "لا توجد بيانات" : "No registration data available"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Payment Status Breakdown Pie Chart */}
        <Card data-testid="card-payment-status">
          <CardHeader>
            <CardTitle>
              {language === "ar" ? "حالات الدفع" : "Payment Status"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
            ) : paymentStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value} (${entry.percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {language === "ar" ? "لا توجد بيانات" : "No payment data available"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Enrollments Chart */}
      <Card data-testid="card-course-enrollments" className="mb-8">
        <CardHeader>
          <CardTitle>
            {language === "ar" ? "الالتحاقات بالدورات" : "Course Enrollments"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
          ) : analytics?.courseEnrollments && analytics.courseEnrollments.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.courseEnrollments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="courseName" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {language === "ar" ? "لا توجد بيانات" : "No enrollment data available"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Performing Courses */}
      <Card data-testid="card-top-courses">
        <CardHeader>
          <CardTitle>
            {language === "ar" ? "أفضل الدورات أداءً" : "Top Performing Courses"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.topCourses && analytics.topCourses.length > 0 ? (
              analytics.topCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover-elevate"
                  data-testid={`top-course-${index}`}
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      #{index + 1} {language === "ar" ? course.titleAr : course.titleEn}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" ? "الالتحاقات:" : "Enrollments:"} {course.enrollments}
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {language === "ar" ? "لا توجد بيانات" : "No data available"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
