import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Gift, Users, Wallet } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

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

export default function ReferralTab() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: stats, isLoading } = useQuery<ReferralStats>({
    queryKey: ["/api/referral/stats"],
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
                {stats?.code}
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
            <div className="text-3xl font-bold">${parseFloat(stats?.earnings || "0").toFixed(2)}</div>
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

      {/* Transactions History */}
      {stats?.transactions && stats.transactions.length > 0 && (
        <Card data-testid="card-transactions">
          <CardHeader>
            <CardTitle>
              {language === "ar" ? "سجل المعاملات" : "Transaction History"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  data-testid={`transaction-${tx.id}`}
                >
                  <div>
                    <p className="font-semibold">
                      +${parseFloat(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {tx.status === "completed"
                      ? language === "ar"
                        ? "مكتمل"
                        : "Completed"
                      : language === "ar"
                      ? "قيد الانتظار"
                      : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
