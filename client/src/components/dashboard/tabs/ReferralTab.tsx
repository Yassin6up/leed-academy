import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Gift, Users, Wallet, Send, ArrowDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface ReferralStats {
  code: string;
  count: number;
  earnings: string;
  referrals: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    subscriptionStatus: string;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    referredUserId: string;
    amount: string;
    status: string;
    createdAt: string;
  }>;
}

interface WithdrawalRequest {
  id: string;
  amount: string;
  walletAddress: string;
  chain: string;
  status: string;
  createdAt: string;
}

const withdrawalSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  walletAddress: z.string().min(1, "Wallet address is required"),
  chain: z.string().min(1, "Chain is required"),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

const chains = [
  { value: "ethereum", label: "Ethereum" },
  { value: "polygon", label: "Polygon" },
  { value: "bsc", label: "Binance Smart Chain" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "optimism", label: "Optimism" },
];

export default function ReferralTab() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);

  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: "",
      walletAddress: "",
      chain: "",
    },
  });

  const { data: stats, isLoading } = useQuery<ReferralStats>({
    queryKey: ["/api/referral/stats"],
  });

  const { data: withdrawals = [] } = useQuery<WithdrawalRequest[]>({
    queryKey: ["/api/withdrawals/user"],
  });

  const withdrawalMutation = useMutation({
    mutationFn: async (data: WithdrawalFormData) => {
      return await apiRequest("POST", "/api/withdrawals/request", {
        amount: parseFloat(data.amount),
        walletAddress: data.walletAddress,
        chain: data.chain,
      });
    },
    onSuccess: () => {
      toast({
        title: language === "ar" ? "تم الطلب" : "Success!",
        description: language === "ar" ? "تم تقديم طلب السحب بنجاح" : "Withdrawal request submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals/user"] });
      form.reset();
      setShowWithdrawalForm(false);
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || (language === "ar" ? "فشل تقديم الطلب" : "Failed to submit request"),
        variant: "destructive",
      });
    },
  });

  const handleCopyCode = () => {
    if (stats?.code) {
      navigator.clipboard.writeText(stats.code);
      setCopied(true);
      toast({
        title: language === "ar" ? "تم النسخ" : "Copied!",
        description: language === "ar" ? "تم نسخ الكود بنجاح" : "Referral code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const earningsAmount = parseFloat(stats?.earnings || "0");
  const canWithdraw = earningsAmount >= 100;

  const onSubmit = (data: WithdrawalFormData) => {
    withdrawalMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="section-referral-tab">
      {/* Referral Code Section */}
      <Card data-testid="card-referral-code">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            {language === "ar" ? "برنامج الإحالة" : "Referral Program"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-6 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              {language === "ar" ? "كودك الفريد" : "Your Unique Code"}
            </p>
            <div className="flex items-center gap-3">
              <code className="text-2xl font-bold font-mono bg-background px-4 py-2 rounded">
                {stats?.code || "---"}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                data-testid="button-copy-code"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {language === "ar"
                ? "شارك هذا الكود مع أصدقائك. عندما يسجلون باستخدام هذا الكود ويشترون خطة، تحصل على $10"
                : "Share this code with your friends. When they sign up using this code and purchase a plan, you earn $10"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card data-testid="card-referral-count">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              {language === "ar" ? "الإحالات" : "Referrals"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {language === "ar" ? "أشخاص قاموا بالتسجيل" : "People signed up"}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-earnings">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {language === "ar" ? "الأرباح" : "Earnings"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${earningsAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {language === "ar" ? "USDT في محفظتك" : "USDT in your wallet"}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-per-referral">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gift className="h-4 w-4" />
              {language === "ar" ? "لكل إحالة" : "Per Referral"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$10</div>
            <p className="text-xs text-muted-foreground mt-1">
              {language === "ar" ? "عند الشراء الأول" : "On first purchase"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Section */}
      {!showWithdrawalForm && (
        <Button
          onClick={() => setShowWithdrawalForm(true)}
          disabled={!canWithdraw}
          className="w-full"
          data-testid="button-request-withdrawal"
        >
          <Send className="h-4 w-4 mr-2" />
          {language === "ar" ? "طلب السحب" : "Request Withdrawal"}
          {!canWithdraw && (
            <span className="ml-2 text-xs">
              ({language === "ar" ? `$${100 - earningsAmount} متبقي` : `$${100 - earningsAmount} to go`})
            </span>
          )}
        </Button>
      )}

      {/* Withdrawal Form */}
      {showWithdrawalForm && (
        <Card data-testid="card-withdrawal-form" className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>
              {language === "ar" ? "طلب سحب الأرباح" : "Withdrawal Request"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === "ar" ? "المبلغ (الحد الأدنى $100)" : "Amount (Minimum $100)"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          step="0.01"
                          max={earningsAmount}
                          {...field}
                          data-testid="input-withdrawal-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === "ar" ? "السلسلة" : "Blockchain Network"}
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-chain">
                            <SelectValue placeholder={language === "ar" ? "اختر السلسلة" : "Select chain"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {chains.map((chain) => (
                            <SelectItem key={chain.value} value={chain.value}>
                              {chain.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="walletAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === "ar" ? "عنوان المحفظة (USDT)" : "Wallet Address (USDT)"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0x..."
                          {...field}
                          data-testid="input-wallet-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={withdrawalMutation.isPending}
                    className="flex-1"
                    data-testid="button-submit-withdrawal"
                  >
                    {withdrawalMutation.isPending
                      ? language === "ar" ? "جاري الإرسال..." : "Submitting..."
                      : language === "ar" ? "تقديم الطلب" : "Submit Request"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowWithdrawalForm(false);
                      form.reset();
                    }}
                    data-testid="button-cancel-withdrawal"
                  >
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Withdrawal History */}
      <Card data-testid="card-withdrawal-history">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDown className="h-5 w-5" />
            {language === "ar" ? "سجل الانسحابات" : "Withdrawal History"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <ArrowDown className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground mb-2">
                {language === "ar" ? "لا توجد طلبات انسحاب بعد" : "No withdrawal requests yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "ar" 
                  ? "عندما تقوم بطلب سحب، سيظهر هنا" 
                  : "When you request a withdrawal, it will appear here"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  data-testid={`withdrawal-item-${withdrawal.id}`}
                >
                  <div>
                    <p className="font-semibold">${parseFloat(withdrawal.amount).toFixed(2)} - {withdrawal.chain.toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      withdrawal.status === "completed"
                        ? "default"
                        : withdrawal.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {withdrawal.status === "pending"
                      ? language === "ar" ? "قيد الانتظار" : "Pending"
                      : withdrawal.status === "approved"
                      ? language === "ar" ? "موافق عليه" : "Approved"
                      : withdrawal.status === "completed"
                      ? language === "ar" ? "مكتمل" : "Completed"
                      : language === "ar" ? "مرفوض" : "Rejected"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referrals List */}
      {stats?.referrals && stats.referrals.length > 0 && (
        <Card data-testid="card-referrals-list">
          <CardHeader>
            <CardTitle>
              {language === "ar" ? "من قاموا بالتسجيل" : "Your Referrals"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.referrals.map((referral, index) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  data-testid={`referral-item-${index}`}
                >
                  <div className="flex-1">
                    <p className="font-semibold">
                      {referral.firstName} {referral.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{referral.email}</p>
                  </div>
                  <Badge
                    variant={
                      referral.subscriptionStatus === "active" ? "default" : "secondary"
                    }
                  >
                    {referral.subscriptionStatus === "active"
                      ? language === "ar"
                        ? "نشط"
                        : "Active"
                      : language === "ar"
                      ? "غير نشط"
                      : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!stats?.referrals || stats.referrals.length === 0 ? (
        <Card data-testid="card-empty-referrals">
          <CardContent className="pt-12 text-center pb-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">
              {language === "ar"
                ? "لم تقم بإحالة أي شخص حتى الآن"
                : "No referrals yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === "ar"
                ? "ابدأ في مشاركة كودك للحصول على أرباح"
                : "Start sharing your code to earn rewards"}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
