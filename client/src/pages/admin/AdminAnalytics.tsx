import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, DollarSign, BookOpen } from "lucide-react";

interface AnalyticsData {
  revenueTrends: {
    daily: Array<{ date: string; amount: number }>;
    weekly: Array<{ week: string; amount: number }>;
    monthly: Array<{ month: string; amount: number }>;
  };
  userRegistrationTrends: {
    daily: Array<{ date: string; count: number }>;
    monthly: Array<{ month: string; count: number }>;
  };
  courseEnrollments: {
    byCourse: Array<{ courseTitle: string; enrollments: number }>;
    byLevel: Array<{ level: number; enrollments: number }>;
  };
  topCourses: Array<{
    courseId: string;
    title: string;
    enrollments: number;
    completionRate: number;
  }>;
  paymentStatusBreakdown: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

const COLORS = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6"];

export default function AdminAnalytics() {
  const { language } = useLanguage();

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">
          {language === "ar" ? "لا توجد بيانات متاحة" : "No data available"}
        </p>
      </div>
    );
  }

  const totalRevenue = analytics.revenueTrends.daily.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalUsers = analytics.userRegistrationTrends.daily.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const totalEnrollments = analytics.courseEnrollments.byCourse.reduce(
    (sum, item) => sum + item.enrollments,
    0
  );

  const paymentStatusData = [
    {
      name: language === "ar" ? "قيد الانتظار" : "Pending",
      value: analytics.paymentStatusBreakdown.pending,
      color: COLORS[3],
    },
    {
      name: language === "ar" ? "موافق عليها" : "Approved",
      value: analytics.paymentStatusBreakdown.approved,
      color: COLORS[0],
    },
    {
      name: language === "ar" ? "مرفوضة" : "Rejected",
      value: analytics.paymentStatusBreakdown.rejected,
      color: COLORS[2],
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1
        className="text-3xl font-heading font-bold text-foreground"
        data-testid="text-admin-analytics-title"
      >
        {language === "ar" ? "تحليلات متقدمة" : "Advanced Analytics"}
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "ar" ? "الإيرادات الكلية" : "Total Revenue"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {language === "ar" ? "آخر 30 يوم" : "Last 30 days"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "ar" ? "المستخدمون الجدد" : "New Users"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {language === "ar" ? "آخر 30 يوم" : "Last 30 days"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "ar" ? "التسجيلات الكلية" : "Total Enrollments"}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              {language === "ar" ? "جميع الدورات" : "All courses"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "ar" ? "الدورات النشطة" : "Active Courses"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.courseEnrollments.byCourse.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {language === "ar" ? "مع تسجيلات" : "With enrollments"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "ar" ? "الإيرادات اليومية" : "Daily Revenue"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.revenueTrends.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any) => [`$${value.toFixed(2)}`, "Revenue"]}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString();
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={COLORS[0]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "ar" ? "الإيرادات الأسبوعية" : "Weekly Revenue"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.revenueTrends.weekly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => [`$${value.toFixed(2)}`, "Revenue"]} />
                <Bar dataKey="amount" fill={COLORS[1]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "ar"
                ? "تسجيلات المستخدمين"
                : "User Registrations"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.userRegistrationTrends.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any) => [value, "Users"]}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString();
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS[4]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "ar" ? "حالة المدفوعات" : "Payment Status"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
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
          </CardContent>
        </Card>

        {/* Course Enrollments by Level */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "ar"
                ? "التسجيلات حسب المستوى"
                : "Enrollments by Level"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.courseEnrollments.byLevel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="level"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    language === "ar" ? `المستوى ${value}` : `Level ${value}`
                  }
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any) => [value, "Enrollments"]}
                  labelFormatter={(label) =>
                    language === "ar" ? `المستوى ${label}` : `Level ${label}`
                  }
                />
                <Bar dataKey="enrollments" fill={COLORS[3]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Courses */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "ar" ? "أفضل الدورات" : "Top Courses"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCourses.slice(0, 5).map((course, index) => (
                <div
                  key={course.courseId}
                  className="flex items-center justify-between"
                  data-testid={`top-course-${index}`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.enrollments}{" "}
                      {language === "ar" ? "تسجيلات" : "enrollments"} •{" "}
                      {course.completionRate.toFixed(1)}%{" "}
                      {language === "ar" ? "إكمال" : "completion"}
                    </p>
                  </div>
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                      color: "white",
                    }}
                  >
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
