import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import type { AdminLog } from "@shared/schema";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminLogs() {
  const { language } = useLanguage();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [pageFilter, setPageFilter] = useState<string>("all");
  const [userSearch, setUserSearch] = useState<string>("");

  // Debug logs
  console.log("📱 [AdminLogs] Component mounted/re-rendered", {
    isAuthenticated,
    userRole: user?.role,
    startDate,
    endDate,
  });

  const { data: logs, isLoading: logsLoading } = useQuery<AdminLog[]>({
    queryKey: ["/api/admin/logs", startDate, endDate],
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Debug API response
  console.log("🔍 [AdminLogs] Query status:", {
    logsLoading,
    logsCount: logs?.length || 0,
    logs: logs?.slice(0, 2),
  });

  // Filter logs
  const filteredLogs = logs?.filter((log) => {
    const matchAction = actionFilter === "all" || log.action === actionFilter;
    const matchPage = pageFilter === "all" || log.page === pageFilter;
    const searchLower = userSearch.toLowerCase();
    const matchUser =
      !userSearch ||
      log.adminName.toLowerCase().includes(searchLower) ||
      log.adminEmail.toLowerCase().includes(searchLower);
    return matchAction && matchPage && matchUser;
  });

  // Debug filtered logs
  console.log("📊 [AdminLogs] Filtered logs:", {
    totalLogs: logs?.length || 0,
    filteredCount: filteredLogs?.length || 0,
    filters: { actionFilter, pageFilter, userSearch },
    filtered: filteredLogs?.slice(0, 2),
  });

  // Get unique actions and pages for filter dropdowns
  const uniqueActions = [...new Set(logs?.map((l) => l.action) || [])];
  const uniquePages = [...new Set(logs?.map((l) => l.page) || [])];

  const getActionColor = (action: string) => {
    if (action.includes("create")) return "bg-green-100 text-green-800";
    if (action.includes("delete")) return "bg-red-100 text-red-800";
    if (action.includes("approve")) return "bg-blue-100 text-blue-800";
    if (action.includes("reject")) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  // Admin-only access check
  if (isLoading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive">
              {language === "ar" ? "يسمح فقط للمسؤولين" : "Only admins can access this page"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (logsLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-4" data-testid="text-admin-logs-title">
          {language === "ar" ? "سجلات الإدارة" : "Admin Logs"}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium">{language === "ar" ? "من التاريخ" : "From Date"}</label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} data-testid="input-start-date" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{language === "ar" ? "إلى التاريخ" : "To Date"}</label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} data-testid="input-end-date" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{language === "ar" ? "الإجراء" : "Action"}</label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger data-testid="select-action-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "ar" ? "جميع الإجراءات" : "All Actions"}</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">{language === "ar" ? "الصفحة" : "Page"}</label>
            <Select value={pageFilter} onValueChange={setPageFilter}>
              <SelectTrigger data-testid="select-page-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "ar" ? "جميع الصفحات" : "All Pages"}</SelectItem>
                {uniquePages.map((page) => (
                  <SelectItem key={page} value={page}>{page}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">{language === "ar" ? "البحث عن المستخدم" : "Search User"}</label>
            <Input 
              placeholder={language === "ar" ? "اسم أو بريد إلكتروني" : "Name or email..."}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              data-testid="input-user-search"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredLogs?.map((log) => (
          <Card key={log.id} className="hover-elevate" data-testid={`card-log-${log.id}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={getActionColor(log.action)} data-testid={`badge-action-${log.id}`}>
                      {log.action}
                    </Badge>
                    <Badge variant="outline" data-testid={`badge-page-${log.id}`}>
                      {log.page}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {log.createdAt && format(new Date(log.createdAt), "MMM dd, yyyy HH:mm:ss")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground" data-testid={`text-description-${log.id}`}>
                    {log.description || "No description"}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span data-testid={`text-admin-name-${log.id}`}>{language === "ar" ? "بواسطة:" : "By:"} {log.adminName}</span>
                    <span data-testid={`text-admin-email-${log.id}`}>{log.adminEmail}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs?.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {language === "ar" ? "لا توجد سجلات" : "No logs found"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
