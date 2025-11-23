import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Check, X, Eye } from "lucide-react";
import type { Payment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function AdminPayments() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/admin/payments"],
  });

  const filteredPayments = payments?.filter((payment) => {
    const matchStatus = statusFilter === "all" || !statusFilter || payment.status === statusFilter;
    const matchMethod = methodFilter === "all" || !methodFilter || payment.method === methodFilter;
    const searchLower = searchFilter.toLowerCase();
    const matchSearch =
      !searchFilter ||
      payment.userName?.toLowerCase().includes(searchLower) ||
      payment.userEmail?.toLowerCase().includes(searchLower) ||
      payment.id.toLowerCase().includes(searchLower);
    return matchStatus && matchMethod && matchSearch;
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({
      paymentId,
      status,
    }: {
      paymentId: string;
      status: string;
    }) => {
      return await apiRequest("PATCH", `/api/admin/payments/${paymentId}`, {
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description:
          language === "ar"
            ? "تم تحديث حالة الدفع"
            : "Payment status updated successfully",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1
        className="text-3xl font-heading font-bold text-foreground mb-8"
        data-testid="text-admin-payments-title"
      >
        {language === "ar" ? "إدارة المدفوعات" : "Payment Management"}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>
            {language === "ar" ? "جميع المدفوعات" : "All Payments"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder={language === "ar" ? "ابحث بالاسم أو البريد..." : "Search by name or email..."}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              data-testid="input-search-payments"
            />
            <Select value={statusFilter || "all"} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder={language === "ar" ? "كل الحالات" : "All Status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "ar" ? "كل الحالات" : "All Status"}</SelectItem>
                <SelectItem value="pending">{language === "ar" ? "قيد الانتظار" : "Pending"}</SelectItem>
                <SelectItem value="approved">{language === "ar" ? "موافق عليه" : "Approved"}</SelectItem>
                <SelectItem value="rejected">{language === "ar" ? "مرفوض" : "Rejected"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter || "all"} onValueChange={setMethodFilter}>
              <SelectTrigger data-testid="select-method-filter">
                <SelectValue placeholder={language === "ar" ? "كل الطرق" : "All Methods"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "ar" ? "كل الطرق" : "All Methods"}</SelectItem>
                <SelectItem value="bank_transfer">{language === "ar" ? "تحويل بنكي" : "Bank Transfer"}</SelectItem>
                <SelectItem value="crypto">{language === "ar" ? "عملات رقمية" : "Crypto"}</SelectItem>
              </SelectContent>
            </Select>
            {((statusFilter && statusFilter !== "all") || (methodFilter && methodFilter !== "all") || searchFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("all");
                  setMethodFilter("all");
                  setSearchFilter("");
                }}
                data-testid="button-clear-filters"
              >
                {language === "ar" ? "مسح الفلترة" : "Clear Filters"}
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {language === "ar" ? "النتائج: " : "Results: "} {filteredPayments?.length || 0}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "ar" ? "المستخدم" : "User"}</TableHead>
                <TableHead>{language === "ar" ? "البريد الإلكتروني" : "Email"}</TableHead>
                <TableHead>{language === "ar" ? "المبلغ" : "Amount"}</TableHead>
                <TableHead>{language === "ar" ? "الطريقة" : "Method"}</TableHead>
                <TableHead>{language === "ar" ? "الحالة" : "Status"}</TableHead>
                <TableHead>{language === "ar" ? "التاريخ" : "Date"}</TableHead>
                <TableHead>{language === "ar" ? "الإثبات" : "Proof"}</TableHead>
                <TableHead>{language === "ar" ? "الإجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments?.map((payment) => (
                <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                  <TableCell className="font-medium">
                    {payment.userName || "N/A"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.userEmail || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${payment.amount} {payment.currency}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.method}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "approved"
                          ? "default"
                          : payment.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.createdAt
                      ? new Date(payment.createdAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {payment.proofImageUrl && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-view-proof-${payment.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {language === "ar"
                                ? "إثبات الدفع"
                                : "Payment Proof"}
                            </DialogTitle>
                          </DialogHeader>
                          <img
                            src={payment.proofImageUrl}
                            alt="Payment proof"
                            className="w-full rounded-lg"
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                  <TableCell>
                    {payment.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            updatePaymentMutation.mutate({
                              paymentId: payment.id,
                              status: "approved",
                            })
                          }
                          disabled={updatePaymentMutation.isPending}
                          data-testid={`button-approve-${payment.id}`}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            updatePaymentMutation.mutate({
                              paymentId: payment.id,
                              status: "rejected",
                            })
                          }
                          disabled={updatePaymentMutation.isPending}
                          data-testid={`button-reject-${payment.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredPayments?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {language === "ar" ? "لا توجد مدفوعات" : "No payments found"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
