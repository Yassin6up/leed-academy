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
import { Check, X, Eye } from "lucide-react";
import type { Payment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminPayments() {
  const { language } = useLanguage();
  const { toast } = useToast();

  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/admin/payments"],
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "ar" ? "المبلغ" : "Amount"}</TableHead>
                <TableHead>{language === "ar" ? "الطريقة" : "Method"}</TableHead>
                <TableHead>{language === "ar" ? "الحالة" : "Status"}</TableHead>
                <TableHead>{language === "ar" ? "التاريخ" : "Date"}</TableHead>
                <TableHead>{language === "ar" ? "الإثبات" : "Proof"}</TableHead>
                <TableHead>{language === "ar" ? "الإجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.map((payment) => (
                <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
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
        </CardContent>
      </Card>
    </div>
  );
}
