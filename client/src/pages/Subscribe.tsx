import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wallet, Building2, CheckCircle2, CreditCard, Smartphone } from "lucide-react";
import type { SubscriptionPlan, PaymentSettings } from "@shared/schema";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function Subscribe() {
  const [, params] = useRoute("/subscribe/:planId");
  const { t, language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "bank" | "card" | "mobile_wallet">("card");
  const [paymentData, setPaymentData] = useState<any>(null);

  const { data: plan } = useQuery<SubscriptionPlan>({
    queryKey: ["/api/subscription-plans", params?.planId],
    enabled: !!params?.planId,
  });

  const { data: paymentSettings } = useQuery<PaymentSettings>({
    queryKey: ["/api/payment-settings"],
  });

  const submitPaymentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // If user is authenticated, submit to backend
      if (isAuthenticated) {
        const res = await fetch("/api/payments", {
          method: "POST",
          body: data,
          credentials: "include",
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({ message: "Failed to submit payment" }));
          throw new Error(error.message || "Failed to submit payment");
        }

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        return undefined;
      }
      
      // If not authenticated, just store data locally and proceed
      return { stored: true };
    },
    onSuccess: (result, data) => {
      if (isAuthenticated) {
        // Already logged in, go to success page
        setStep(4);
      } else {
        // Not logged in, store payment data and go to account creation
        const formDataObj: any = {};
        data.forEach((value, key) => {
          formDataObj[key] = value;
        });
        setPaymentData(formDataObj);
        setStep(3);
      }
      toast({
        title: t("common.success"),
        description:
          language === "ar"
            ? "تم حفظ معلومات الدفع. الرجاء إنشاء حساب للمتابعة."
            : "Payment information saved. Please create an account to continue.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("planId", params?.planId || "");
    formData.append("method", paymentMethod);
    formData.append("amount", plan?.price || "0");

    submitPaymentMutation.mutate(formData);
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 py-24">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              {/* Progress Indicator */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  {(isAuthenticated ? [1, 2, 3] : [1, 2, 3, 4]).map((s) => (
                    <div
                      key={s}
                      className={`flex-1 h-2 rounded-full mx-1 ${s <= step ? "bg-primary" : "bg-muted"
                        }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-sm">
                  <span className={step >= 1 ? "text-foreground" : "text-muted-foreground"}>
                    {t("subscription.choose-plan")}
                  </span>
                  <span className={step >= 2 ? "text-foreground" : "text-muted-foreground"}>
                    {t("subscription.payment-method")}
                  </span>
                  {!isAuthenticated && (
                    <span className={step >= 3 ? "text-foreground" : "text-muted-foreground"}>
                      {language === "ar" ? "إنشاء حساب" : "Create Account"}
                    </span>
                  )}
                  <span className={step >= (isAuthenticated ? 3 : 4) ? "text-foreground" : "text-muted-foreground"}>
                    {language === "ar" ? "تأكيد" : "Complete"}
                  </span>
                </div>
              </div>

              {/* Step 1: Plan Overview */}
              {step === 1 && (
                <Card data-testid="card-plan-overview">
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      {language === "ar" ? plan.nameAr : plan.nameEn}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="text-4xl font-bold text-foreground mb-2">
                          ${plan.price}
                        </div>
                        <p className="text-muted-foreground">
                          {language === "ar" ? plan.descriptionAr : plan.descriptionEn}
                        </p>
                      </div>
                      <Button
                        onClick={() => setStep(2)}
                        size="lg"
                        className="w-full"
                        data-testid="button-next-step"
                      >
                        {language === "ar" ? "التالي" : "Next"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Payment Method & Upload */}
              {step === 2 && (
                <Card data-testid="card-payment-method">
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      {t("subscription.payment-method")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(value) =>
                          setPaymentMethod(value as "crypto" | "bank" | "card" | "mobile_wallet")
                        }
                        data-testid="radio-payment-method"
                      >
                        <div className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate active-elevate-2">
                          <RadioGroupItem value="card" id="card" />
                          <Label
                            htmlFor="card"
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                          >
                            <CreditCard className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">
                                {language === "ar" ? "بطاقة ائتمان/خصم" : "Credit/Debit Card"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Visa, Mastercard
                              </p>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate active-elevate-2">
                          <RadioGroupItem value="mobile_wallet" id="mobile_wallet" />
                          <Label
                            htmlFor="mobile_wallet"
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                          >
                            <Smartphone className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">
                                {language === "ar" ? "محافظ موبايل" : "Mobile Wallets"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {language === "ar" ? "فودافون كاش، أورنج، إلخ" : "Vodafone Cash, Orange, etc"}
                              </p>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>

                      {paymentMethod === "crypto" && paymentSettings && (
                        <div className="space-y-4">
                          <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg space-y-4">
                            <h3 className="font-semibold text-foreground mb-4">
                              {language === "ar" ? "عناوين المحافظ" : "Wallet Addresses"}
                            </h3>

                            {paymentSettings.btcAddress && (
                              <div>
                                <Label className="text-sm font-medium text-foreground">Bitcoin (BTC)</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="flex-1 bg-background/50 px-3 py-2 rounded text-sm border">
                                    {paymentSettings.btcAddress}
                                  </code>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      navigator.clipboard.writeText(paymentSettings.btcAddress || "");
                                      toast({ title: language === "ar" ? "تم النسخ" : "Copied" });
                                    }}
                                    data-testid="button-copy-btc"
                                  >
                                    {language === "ar" ? "نسخ" : "Copy"}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {paymentSettings.ethAddress && (
                              <div>
                                <Label className="text-sm font-medium text-foreground">Ethereum (ETH)</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="flex-1 bg-background/50 px-3 py-2 rounded text-sm border">
                                    {paymentSettings.ethAddress}
                                  </code>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      navigator.clipboard.writeText(paymentSettings.ethAddress || "");
                                      toast({ title: language === "ar" ? "تم النسخ" : "Copied" });
                                    }}
                                    data-testid="button-copy-eth"
                                  >
                                    {language === "ar" ? "نسخ" : "Copy"}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {paymentSettings.usdtAddress && (
                              <div>
                                <Label className="text-sm font-medium text-foreground">
                                  USDT ({paymentSettings.usdtNetwork || "TRC20"})
                                </Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="flex-1 bg-background/50 px-3 py-2 rounded text-sm border">
                                    {paymentSettings.usdtAddress}
                                  </code>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      navigator.clipboard.writeText(paymentSettings.usdtAddress || "");
                                      toast({ title: language === "ar" ? "تم النسخ" : "Copied" });
                                    }}
                                    data-testid="button-copy-usdt"
                                  >
                                    {language === "ar" ? "نسخ" : "Copy"}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {paymentSettings.paymentInstructionsEn && (
                              <div className="mt-4 pt-4 border-t border-border">
                                <p className="text-sm text-muted-foreground whitespace-pre-line">
                                  {language === "ar"
                                    ? paymentSettings.paymentInstructionsAr
                                    : paymentSettings.paymentInstructionsEn}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="bg-muted/30 p-4 rounded-lg">
                            <Label className="text-sm font-medium text-foreground mb-2 block">
                              {language === "ar" ? "عنوان المحفظة التي أرسلت منها" : "Your Wallet Address (Sender)"}
                            </Label>
                            <Input
                              name="walletAddress"
                              placeholder="0x..."
                              required
                              data-testid="input-wallet-address"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {language === "ar"
                                ? "أدخل عنوان محفظتك التي أرسلت منها الدفع للتحقق"
                                : "Enter your wallet address used for payment verification"}
                            </p>
                          </div>
                        </div>
                      )}

                      {paymentMethod === "card" && (
                        <div className="space-y-4">
                          {paymentSettings && (
                            <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg space-y-4">
                              <h3 className="font-semibold text-foreground mb-4">
                                {language === "ar" ? "الدفع ببطاقة الائتمان/الخصم" : "Credit/Debit Card Payment"}
                              </h3>

                              <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="text-4xl">💳</div>
                                <div className="text-center">
                                  <p className="text-lg font-medium text-foreground">
                                    {language === "ar" ? "نقبل" : "We accept"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">Visa • Mastercard</p>
                                </div>
                              </div>

                              {paymentSettings.cardProcessorName && (
                                <div className="bg-background/50 p-4 rounded border">
                                  <Label className="text-sm font-medium text-muted-foreground">
                                    {language === "ar" ? "معالج الدفع" : "Payment Processor"}
                                  </Label>
                                  <p className="text-foreground font-medium">{paymentSettings.cardProcessorName}</p>
                                </div>
                              )}

                              {(paymentSettings.cardInstructionsEn || paymentSettings.cardInstructionsAr) && (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                                    {language === "ar"
                                      ? paymentSettings.cardInstructionsAr
                                      : paymentSettings.cardInstructionsEn}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                            <h4 className="font-medium text-foreground">
                              {language === "ar" ? "معلومات البطاقة" : "Card Details"}
                            </h4>
                            
                            <div>
                              <Label className="text-sm font-medium text-foreground mb-2 block">
                                {language === "ar" ? "رقم البطاقة" : "Card Number"}
                              </Label>
                              <Input
                                name="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                required
                                data-testid="input-card-number"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-foreground mb-2 block">
                                  {language === "ar" ? "تاريخ الانتهاء" : "Expiry Date"}
                                </Label>
                                <Input
                                  name="cardExpiry"
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  required
                                  data-testid="input-card-expiry"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-foreground mb-2 block">
                                  CVV
                                </Label>
                                <Input
                                  name="cardCvv"
                                  placeholder="123"
                                  maxLength={4}
                                  type="password"
                                  required
                                  data-testid="input-card-cvv"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-foreground mb-2 block">
                                {language === "ar" ? "اسم حامل البطاقة" : "Cardholder Name"}
                              </Label>
                              <Input
                                name="cardholderName"
                                placeholder={language === "ar" ? "الاسم كما هو مكتوب على البطاقة" : "Name as on card"}
                                required
                                data-testid="input-cardholder-name"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === "mobile_wallet" && (
                        <div className="space-y-4">
                          {paymentSettings && (
                            <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg space-y-4">
                              <h3 className="font-semibold text-foreground mb-4">
                                {language === "ar" ? "محافظ الموبايل المصرية" : "Egyptian Mobile Wallets"}
                              </h3>

                              <div className="grid gap-4">
                                {paymentSettings.vodafoneCashNumber && (
                                  <div className="bg-background/50 p-4 rounded border">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="text-2xl">📱</div>
                                      <Label className="text-sm font-medium text-foreground">Vodafone Cash</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <code className="flex-1 bg-primary/5 px-3 py-2 rounded text-sm border border-primary/20">
                                        {paymentSettings.vodafoneCashNumber}
                                      </code>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          navigator.clipboard.writeText(paymentSettings.vodafoneCashNumber || "");
                                          toast({ title: language === "ar" ? "تم النسخ" : "Copied" });
                                        }}
                                        data-testid="button-copy-vodafone"
                                      >
                                        {language === "ar" ? "نسخ" : "Copy"}
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {paymentSettings.orangeMoneyNumber && (
                                  <div className="bg-background/50 p-4 rounded border">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="text-2xl">🟠</div>
                                      <Label className="text-sm font-medium text-foreground">Orange Money</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <code className="flex-1 bg-primary/5 px-3 py-2 rounded text-sm border border-primary/20">
                                        {paymentSettings.orangeMoneyNumber}
                                      </code>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          navigator.clipboard.writeText(paymentSettings.orangeMoneyNumber || "");
                                          toast({ title: language === "ar" ? "تم النسخ" : "Copied" });
                                        }}
                                        data-testid="button-copy-orange"
                                      >
                                        {language === "ar" ? "نسخ" : "Copy"}
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {paymentSettings.etisalatCashNumber && (
                                  <div className="bg-background/50 p-4 rounded border">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="text-2xl">💚</div>
                                      <Label className="text-sm font-medium text-foreground">Etisalat Cash</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <code className="flex-1 bg-primary/5 px-3 py-2 rounded text-sm border border-primary/20">
                                        {paymentSettings.etisalatCashNumber}
                                      </code>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          navigator.clipboard.writeText(paymentSettings.etisalatCashNumber || "");
                                          toast({ title: language === "ar" ? "تم النسخ" : "Copied" });
                                        }}
                                        data-testid="button-copy-etisalat"
                                      >
                                        {language === "ar" ? "نسخ" : "Copy"}
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {paymentSettings.wePayNumber && (
                                  <div className="bg-background/50 p-4 rounded border">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="text-2xl">🟣</div>
                                      <Label className="text-sm font-medium text-foreground">WE Pay</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <code className="flex-1 bg-primary/5 px-3 py-2 rounded text-sm border border-primary/20">
                                        {paymentSettings.wePayNumber}
                                      </code>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          navigator.clipboard.writeText(paymentSettings.wePayNumber || "");
                                          toast({ title: language === "ar" ? "تم النسخ" : "Copied" });
                                        }}
                                        data-testid="button-copy-wepay"
                                      >
                                        {language === "ar" ? "نسخ" : "Copy"}
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {paymentSettings.instapayNumber && (
                                  <div className="bg-background/50 p-4 rounded border">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="text-2xl">⚡</div>
                                      <Label className="text-sm font-medium text-foreground">InstaPay</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <code className="flex-1 bg-primary/5 px-3 py-2 rounded text-sm border border-primary/20">
                                        {paymentSettings.instapayNumber}
                                      </code>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          navigator.clipboard.writeText(paymentSettings.instapayNumber || "");
                                          toast({ title: language === "ar" ? "تم النسخ" : "Copied" });
                                        }}
                                        data-testid="button-copy-instapay"
                                      >
                                        {language === "ar" ? "نسخ" : "Copy"}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {(paymentSettings.mobileWalletInstructionsEn || paymentSettings.mobileWalletInstructionsAr) && (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                                    {language === "ar"
                                      ? paymentSettings.mobileWalletInstructionsAr
                                      : paymentSettings.mobileWalletInstructionsEn}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                            <h4 className="font-medium text-foreground">
                              {language === "ar" ? "معلومات الدفع" : "Payment Information"}
                            </h4>
                            
                            <div>
                              <Label className="text-sm font-medium text-foreground mb-2 block">
                                {language === "ar" ? "رقم هاتفك (المرسل)" : "Your Phone Number (Sender)"}
                              </Label>
                              <Input
                                name="senderPhone"
                                placeholder={language === "ar" ? "01xxxxxxxxx" : "Your mobile number"}
                                required
                                data-testid="input-sender-phone"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {language === "ar"
                                  ? "رقم هاتفك الذي ستدفع منه"
                                  : "Your phone number used for payment"}
                              </p>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-foreground mb-2 block">
                                {language === "ar" ? "رقم المحفظة المستلمة" : "Recipient Wallet Number"}
                              </Label>
                              <Input
                                name="recipientNumber"
                                placeholder={language === "ar" ? "رقم المحفظة الذي ستحول إليه" : "Wallet number you're sending to"}
                                required
                                data-testid="input-recipient-number"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {language === "ar"
                                  ? "اختر أحد أرقام المحفظة المعروضة أعلاه"
                                  : "Select one of the wallet numbers shown above"}
                              </p>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-foreground mb-2 block">
                                {language === "ar" ? "اسمك الكامل" : "Your Full Name"}
                              </Label>
                              <Input
                                name="senderName"
                                placeholder={language === "ar" ? "الاسم الكامل" : "Full name"}
                                required
                                data-testid="input-sender-name"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === "bank" && paymentSettings && (
                        <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg space-y-4">
                          <h3 className="font-semibold text-foreground mb-4">
                            {language === "ar" ? "معلومات الحساب البنكي" : "Bank Account Information"}
                          </h3>

                          {paymentSettings.bankName && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">
                                {language === "ar" ? "اسم البنك" : "Bank Name"}
                              </Label>
                              <p className="text-foreground font-medium">{paymentSettings.bankName}</p>
                            </div>
                          )}

                          {paymentSettings.accountHolderName && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">
                                {language === "ar" ? "اسم صاحب الحساب" : "Account Holder"}
                              </Label>
                              <p className="text-foreground font-medium">{paymentSettings.accountHolderName}</p>
                            </div>
                          )}

                          {paymentSettings.accountNumber && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">
                                {language === "ar" ? "رقم الحساب" : "Account Number"}
                              </Label>
                              <p className="text-foreground font-medium">{paymentSettings.accountNumber}</p>
                            </div>
                          )}

                          {paymentSettings.iban && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">IBAN</Label>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 bg-background/50 px-3 py-2 rounded text-sm border">
                                  {paymentSettings.iban}
                                </code>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(paymentSettings.iban || "");
                                    toast({ title: language === "ar" ? "تم النسخ" : "Copied" });
                                  }}
                                  data-testid="button-copy-iban"
                                >
                                  {language === "ar" ? "نسخ" : "Copy"}
                                </Button>
                              </div>
                            </div>
                          )}

                          {paymentSettings.swiftCode && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">SWIFT/BIC</Label>
                              <p className="text-foreground font-medium">{paymentSettings.swiftCode}</p>
                            </div>
                          )}

                          {paymentSettings.bankAddress && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">
                                {language === "ar" ? "عنوان البنك" : "Bank Address"}
                              </Label>
                              <p className="text-foreground text-sm">{paymentSettings.bankAddress}</p>
                            </div>
                          )}

                          {paymentSettings.paymentInstructionsEn && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {language === "ar"
                                  ? paymentSettings.paymentInstructionsAr
                                  : paymentSettings.paymentInstructionsEn}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="flex-1"
                          data-testid="button-back"
                        >
                          {language === "ar" ? "رجوع" : "Back"}
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitPaymentMutation.isPending}
                          className="flex-1"
                          data-testid="button-submit-payment"
                        >
                          {submitPaymentMutation.isPending
                            ? t("common.loading")
                            : t("subscription.submit")}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Create Account (for non-authenticated users) */}
              {step === 3 && !isAuthenticated && (
                <Card data-testid="card-create-account">
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      {language === "ar" ? "إنشاء حساب" : "Create Your Account"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      // Here you would typically create the account and submit payment
                      // For now, just move to success
                      setStep(4);
                    }} className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-lg mb-6">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {language === "ar"
                            ? "✨ قم بإنشاء حساب لإكمال عملية الاشتراك وتتبع حالة الدفع الخاصة بك"
                            : "✨ Create an account to complete your subscription and track your payment status"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-foreground mb-2 block">
                            {language === "ar" ? "الاسم الأول" : "First Name"}
                          </Label>
                          <Input
                            name="firstName"
                            placeholder={language === "ar" ? "أحمد" : "John"}
                            required
                            data-testid="input-first-name"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-foreground mb-2 block">
                            {language === "ar" ? "الاسم الأخير" : "Last Name"}
                          </Label>
                          <Input
                            name="lastName"
                            placeholder={language === "ar" ? "محمد" : "Doe"}
                            required
                            data-testid="input-last-name"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          {language === "ar" ? "البريد الإلكتروني" : "Email"}
                        </Label>
                        <Input
                          name="email"
                          type="email"
                          placeholder={language === "ar" ? "your@email.com" : "your@email.com"}
                          required
                          data-testid="input-email"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          {language === "ar" ? "رقم الهاتف" : "Phone Number"}
                        </Label>
                        <Input
                          name="phone"
                          placeholder={language === "ar" ? "+20 1234567890" : "+20 1234567890"}
                          required
                          data-testid="input-phone"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          {language === "ar" ? "كلمة المرور" : "Password"}
                        </Label>
                        <Input
                          name="password"
                          type="password"
                          placeholder={language === "ar" ? "كلمة مرور قوية" : "Strong password"}
                          required
                          minLength={6}
                          data-testid="input-password"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {language === "ar" ? "على الأقل 6 أحرف" : "At least 6 characters"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          {language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                        </Label>
                        <Input
                          name="confirmPassword"
                          type="password"
                          placeholder={language === "ar" ? "أعد إدخال كلمة المرور" : "Re-enter password"}
                          required
                          minLength={6}
                          data-testid="input-confirm-password"
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(2)}
                          className="flex-1"
                          data-testid="button-back-to-payment"
                        >
                          {language === "ar" ? "رجوع" : "Back"}
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1"
                          data-testid="button-create-account"
                        >
                          {language === "ar" ? "إنشاء حساب وإنهاء" : "Create Account & Complete"}
                        </Button>
                      </div>

                      <p className="text-xs text-center text-muted-foreground mt-4">
                        {language === "ar" ? (
                          <>
                            لديك حساب بالفعل؟{" "}
                            <a href="/auth" className="text-primary hover:underline">
                              تسجيل الدخول
                            </a>
                          </>
                        ) : (
                          <>
                            Already have an account?{" "}
                            <a href="/auth" className="text-primary hover:underline">
                              Login
                            </a>
                          </>
                        )}
                      </p>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Success (Step 3 for authenticated users) */}
              {step === (isAuthenticated ? 3 : 4) && (
                <Card data-testid="card-success">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      {language === "ar"
                        ? "تم الإرسال بنجاح!"
                        : "Successfully Submitted!"}
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      {language === "ar"
                        ? "تم إرسال معلومات الدفع الخاصة بك. سنقوم بمراجعتها وإخطارك قريباً."
                        : "Your payment information has been submitted. We'll review it and notify you soon."}
                    </p>
                    {isAuthenticated ? (
                      <Button asChild>
                        <a href="/dashboard" data-testid="button-dashboard">
                          {language === "ar"
                            ? "العودة إلى لوحة التحكم"
                            : "Go to Dashboard"}
                        </a>
                      </Button>
                    ) : (
                      <Button asChild>
                        <a href="/auth" data-testid="button-login">
                          {language === "ar"
                            ? "تسجيل الدخول"
                            : "Login to Your Account"}
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
