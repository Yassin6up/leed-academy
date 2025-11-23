import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Check, X, AlertCircle, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AdminWithdrawalRequest {
  id: string;
  userId: string;
  amount: string;
  walletAddress: string;
  chain: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  approvedAt?: string;
  userName: string;
  userEmail: string;
  referralCode: string;
  referralCount: number;
  referralEarnings: string;
  phone?: string;
  subscriptionStatus?: string;
}

export default function AdminWithdrawals() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "rejected">("all");

  const { data: withdrawals = [], isLoading, refetch } = useQuery<AdminWithdrawalRequest[]>({
    queryKey: ["/api/withdrawals/admin"],
  });

  // Calculate statistics
  const stats = {
    totalAmount: withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0),
    pendingAmount: withdrawals
      .filter((w) => w.status === "pending")
      .reduce((sum, w) => sum + parseFloat(w.amount), 0),
    completedAmount: withdrawals
      .filter((w) => w.status === "completed")
      .reduce((sum, w) => sum + parseFloat(w.amount), 0),
    rejectedAmount: withdrawals
      .filter((w) => w.status === "rejected")
      .reduce((sum, w) => sum + parseFloat(w.amount), 0),
    pendingCount: withdrawals.filter((w) => w.status === "pending").length,
    completedCount: withdrawals.filter((w) => w.status === "completed").length,
    rejectedCount: withdrawals.filter((w) => w.status === "rejected").length,
  };

  // Filter withdrawals based on status
  const filteredWithdrawals = statusFilter === "all" 
    ? withdrawals 
    : withdrawals.filter((w) => w.status === statusFilter);

  const approveMutation = useMutation({
    mutationFn: async (withdrawalId: string) => {
      return await apiRequest("POST", `/api/withdrawals/${withdrawalId}/approve`, {
        adminNotes,
      });
    },
    onSuccess: () => {
      toast({
        title: language === "ar" ? "تم القبول" : "Approved!",
        description: language === "ar" ? "تم قبول طلب السحب" : "Withdrawal request approved",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals/admin"] });
      setSelectedWithdrawal(null);
      setAdminNotes("");
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || (language === "ar" ? "فشل القبول" : "Failed to approve"),
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (withdrawalId: string) => {
      return await apiRequest("POST", `/api/withdrawals/${withdrawalId}/reject`, {
        adminNotes,
      });
    },
    onSuccess: () => {
      toast({
        title: language === "ar" ? "تم الرفض" : "Rejected!",
        description: language === "ar" ? "تم رفض طلب السحب" : "Withdrawal request rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals/admin"] });
      setSelectedWithdrawal(null);
      setAdminNotes("");
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || (language === "ar" ? "فشل الرفض" : "Failed to reject"),
        variant: "destructive",
      });
    },
  });

  const pendingRequests = filteredWithdrawals.filter((w) => w.status === "pending");
  const processedRequests = filteredWithdrawals.filter((w) => w.status !== "pending");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="section-admin-withdrawals">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {language === "ar" ? "إدارة طلبات السحب" : "Manage Withdrawals"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === "ar" ? "قبول أو رفض طلبات سحب الأرباح" : "Approve or reject withdrawal requests"}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card data-testid="card-total-withdrawn">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              {language === "ar" ? "إجمالي المبالغ المسحوبة" : "Total Withdrawn"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">${stats.totalAmount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {language === "ar" ? "جميع الطلبات" : "All requests"}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-withdrawn" className="border-yellow-200 dark:border-yellow-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              {language === "ar" ? "المبالغ المعلقة" : "Pending Amount"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">${stats.pendingAmount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingCount} {language === "ar" ? "طلب" : "requests"}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-completed-withdrawn" className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {language === "ar" ? "المبالغ المكتملة" : "Completed Amount"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">${stats.completedAmount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedCount} {language === "ar" ? "طلب" : "requests"}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-rejected-withdrawn" className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <X className="h-4 w-4 text-red-600" />
              {language === "ar" ? "المبالغ المرفوضة" : "Rejected Amount"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">${stats.rejectedAmount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.rejectedCount} {language === "ar" ? "طلب" : "requests"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {language === "ar" ? "تصفية الطلبات" : "Filter Requests"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "completed", "rejected"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status as any)}
                data-testid={`button-filter-${status}`}
              >
                {status === "all"
                  ? language === "ar" ? "الكل" : "All"
                  : status === "pending"
                  ? language === "ar" ? "المعلقة" : "Pending"
                  : status === "completed"
                  ? language === "ar" ? "المكتملة" : "Completed"
                  : language === "ar" ? "المرفوضة" : "Rejected"}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {language === "ar" ? "الطلبات المعلقة" : "Pending Requests"}
          <Badge>{pendingRequests.length}</Badge>
        </h2>

        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-12 text-center pb-12">
              <p className="text-muted-foreground">
                {language === "ar" ? "لا توجد طلبات معلقة" : "No pending requests"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingRequests.map((withdrawal) => (
              <Card
                key={withdrawal.id}
                data-testid={`card-withdrawal-${withdrawal.id}`}
                className="border-yellow-200 dark:border-yellow-800"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {withdrawal.userName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {language === "ar" ? "البريد:" : "Email:"} {withdrawal.userEmail}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {withdrawal.status === "pending"
                        ? language === "ar" ? "قيد الانتظار" : "Pending"
                        : language === "ar" ? "تم المعالجة" : "Processed"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Withdrawal Details */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "الكود المرجعي" : "Referral Code"}
                      </p>
                      <p className="font-mono font-bold text-lg">{withdrawal.referralCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "المبلغ" : "Withdrawal Amount"}
                      </p>
                      <p className="font-bold text-lg text-green-600">${parseFloat(withdrawal.amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "السلسلة" : "Blockchain"}
                      </p>
                      <p className="font-semibold">{withdrawal.chain.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "التاريخ" : "Requested Date"}
                      </p>
                      <p className="text-sm">{new Date(withdrawal.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Referral Stats */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold mb-3 text-sm">
                      {language === "ar" ? "إحصائيات الإحالة" : "Referral Statistics"}
                    </h4>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "عدد الإحالات" : "Total Referrals"}
                        </p>
                        <p className="text-2xl font-bold text-blue-600">{withdrawal.referralCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "إجمالي الأرباح" : "Total Earnings"}
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${parseFloat(withdrawal.referralEarnings).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "حالة الاشتراك" : "Subscription Status"}
                        </p>
                        <Badge variant={withdrawal.subscriptionStatus === "active" ? "default" : "secondary"}>
                          {withdrawal.subscriptionStatus === "active"
                            ? language === "ar" ? "نشط" : "Active"
                            : language === "ar" ? "غير نشط" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-3">
                      {language === "ar" ? "بيانات المستخدم" : "User Contact Information"}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "رقم الهاتف" : "Phone"}
                        </p>
                        <p className="text-sm font-medium">{withdrawal.phone || (language === "ar" ? "لم يتم تقديمه" : "Not provided")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "البريد الإلكتروني" : "Email"}
                        </p>
                        <p className="text-sm font-medium break-all">{withdrawal.userEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Address */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-2">
                      {language === "ar" ? "عنوان المحفظة" : "Wallet Details"}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {language === "ar" ? "عنوان USDT" : "USDT Wallet Address"}
                    </p>
                    <p className="font-mono text-sm break-all bg-muted p-3 rounded border">
                      {withdrawal.walletAddress}
                    </p>
                  </div>

                  {selectedWithdrawal === withdrawal.id && (
                    <div className="space-y-3 pt-4 border-t">
                      <div>
                        <label className="text-sm font-medium">
                          {language === "ar" ? "ملاحظات إدارية (اختيارية)" : "Admin Notes (Optional)"}
                        </label>
                        <Textarea
                          placeholder={language === "ar" ? "أضف ملاحظات..." : "Add notes..."}
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="mt-2"
                          data-testid="textarea-admin-notes"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => approveMutation.mutate(withdrawal.id)}
                          disabled={approveMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          data-testid="button-approve-withdrawal"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          {approveMutation.isPending
                            ? language === "ar" ? "جاري..." : "Processing..."
                            : language === "ar" ? "قبول" : "Approve"}
                        </Button>
                        <Button
                          onClick={() => rejectMutation.mutate(withdrawal.id)}
                          disabled={rejectMutation.isPending}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                          data-testid="button-reject-withdrawal"
                        >
                          <X className="h-4 w-4 mr-2" />
                          {rejectMutation.isPending
                            ? language === "ar" ? "جاري..." : "Processing..."
                            : language === "ar" ? "رفض" : "Reject"}
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedWithdrawal(null);
                            setAdminNotes("");
                          }}
                          variant="outline"
                          data-testid="button-cancel-action"
                        >
                          {language === "ar" ? "إلغاء" : "Cancel"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedWithdrawal !== withdrawal.id && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => setSelectedWithdrawal(withdrawal.id)}
                        className="flex-1"
                        data-testid="button-select-withdrawal"
                      >
                        {language === "ar" ? "معالجة" : "Process"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            {language === "ar" ? "الطلبات المعالجة" : "Processed Requests"}
          </h2>
          <div className="grid gap-3">
            {processedRequests.map((withdrawal) => (
              <Card key={withdrawal.id} data-testid={`card-processed-${withdrawal.id}`}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{withdrawal.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {withdrawal.referralCode} • ${parseFloat(withdrawal.amount).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          withdrawal.status === "completed"
                            ? "default"
                            : withdrawal.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {withdrawal.status === "completed"
                          ? language === "ar" ? "مكتمل" : "Completed"
                          : withdrawal.status === "rejected"
                          ? language === "ar" ? "مرفوض" : "Rejected"
                          : language === "ar" ? "موافق عليه" : "Approved"}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {new Date(withdrawal.approvedAt || withdrawal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {withdrawal.adminNotes && (
                    <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                      {language === "ar" ? "الملاحظات:" : "Notes:"} {withdrawal.adminNotes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
