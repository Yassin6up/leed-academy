import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, Calendar, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import type { Subscription, SubscriptionPlan } from "@shared/schema";

export default function SubscriptionPage() {
  const { language } = useLanguage();
  const { user } = useAuth();

  const { data: subscription, isLoading, isError, error } = useQuery<
    (Subscription & { plan: SubscriptionPlan | null }) | null
  >({
    queryKey: ["/api/user/subscription"],
  });

  const getSubscriptionStatus = () => {
    if (!subscription) return "none";
    
    const now = new Date();
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    
    if (subscription.status === "active" && endDate && now > endDate) {
      return "expired";
    }
    
    return subscription.status;
  };

  const subscriptionStatus = getSubscriptionStatus();
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          icon: CheckCircle2,
          label: language === "ar" ? "نشط" : "Active",
          variant: "default" as const,
          color: "text-green-500",
        };
      case "pending":
        return {
          icon: AlertCircle,
          label: language === "ar" ? "قيد الموافقة" : "Pending Approval",
          variant: "secondary" as const,
          color: "text-yellow-500",
        };
      case "expired":
        return {
          icon: XCircle,
          label: language === "ar" ? "منتهي" : "Expired",
          variant: "destructive" as const,
          color: "text-red-500",
        };
      default:
        return {
          icon: AlertCircle,
          label: language === "ar" ? "غير نشط" : "Inactive",
          variant: "outline" as const,
          color: "text-muted-foreground",
        };
    }
  };

  const statusConfig = getStatusConfig(subscriptionStatus);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-heading font-bold text-foreground mb-2">
              {language === "ar" ? "خطأ في التحميل" : "Error Loading Subscription"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {language === "ar"
                ? "فشل في تحميل معلومات الاشتراك. الرجاء المحاولة مرة أخرى."
                : "Failed to load subscription information. Please try again."}
            </p>
            <Button onClick={() => window.location.reload()}>
              {language === "ar" ? "إعادة المحاولة" : "Retry"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="text-subscription-title">
          {language === "ar" ? "اشتراكي" : "My Subscription"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === "ar"
            ? "إدارة اشتراكك ومعلومات الدفع"
            : "Manage your subscription and payment information"}
        </p>
      </div>

      {subscription && subscription.plan ? (
        <div className="space-y-6">
          {/* Current Plan Card */}
          <Card data-testid="card-current-subscription">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-xl mb-1">
                      {language === "ar" ? subscription.plan.nameAr : subscription.plan.nameEn}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" ? "خطتك الحالية" : "Current Plan"}
                    </p>
                  </div>
                </div>
                <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                  <statusConfig.icon className="h-3 w-3" />
                  {statusConfig.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscription.startDate && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {language === "ar" ? "تاريخ البدء" : "Start Date"}
                    </p>
                    <p className="font-medium text-foreground">
                      {format(new Date(subscription.startDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}
                {subscription.endDate && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {subscriptionStatus === "expired"
                        ? (language === "ar" ? "انتهى في" : "Expired on")
                        : (language === "ar" ? "ينتهي في" : "Expires on")}
                    </p>
                    <p className={`font-medium ${subscriptionStatus === "expired" ? "text-destructive" : "text-foreground"}`}>
                      {format(new Date(subscription.endDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}
              </div>

              {/* Features */}
              {subscription.plan.featuresEn && subscription.plan.featuresEn.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    {language === "ar" ? "المميزات المشمولة" : "Included Features"}
                  </h3>
                  <ul className="space-y-2">
                    {(language === "ar" ? subscription.plan.featuresAr : subscription.plan.featuresEn)?.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <Button asChild variant="default">
                  <Link href="/pricing">
                    {subscriptionStatus === "active"
                      ? (language === "ar" ? "ترقية الخطة" : "Upgrade Plan")
                      : subscriptionStatus === "expired"
                        ? (language === "ar" ? "تجديد الاشتراك" : "Renew Subscription")
                        : (language === "ar" ? "تغيير الخطة" : "Change Plan")}
                  </Link>
                </Button>
                {subscriptionStatus === "pending" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {language === "ar"
                        ? "سيتم تفعيل اشتراكك بعد موافقة الإدارة على الدفع"
                        : "Your subscription will be activated after payment approval"}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card data-testid="card-no-subscription">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-heading font-bold text-foreground mb-2">
              {language === "ar" ? "لا يوجد اشتراك نشط" : "No Active Subscription"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {language === "ar"
                ? "ليس لديك اشتراك نشط حتى الآن. اختر خطة لفتح الدورات والميزات المميزة."
                : "You don't have an active subscription yet. Choose a plan to unlock premium courses and features."}
            </p>
            <Button asChild size="lg">
              <Link href="/pricing">
                {language === "ar" ? "عرض الخطط" : "View Plans"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
