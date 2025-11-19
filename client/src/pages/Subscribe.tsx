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
import { Wallet, Building2, Upload, CheckCircle2 } from "lucide-react";
import type { SubscriptionPlan, PaymentSettings } from "@shared/schema";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function Subscribe() {
  const [, params] = useRoute("/subscribe/:planId");
  const { t, language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "bank">("crypto");
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: plan } = useQuery<SubscriptionPlan>({
    queryKey: ["/api/subscription-plans", params?.planId],
    enabled: !!params?.planId && isAuthenticated,
  });

  const { data: paymentSettings } = useQuery<PaymentSettings>({
    queryKey: ["/api/payment-settings"],
    enabled: isAuthenticated,
  });

  const submitPaymentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/payments", data);
    },
    onSuccess: () => {
      setStep(3);
      toast({
        title: t("common.success"),
        description:
          language === "ar"
            ? "تم إرسال إثبات الدفع بنجاح. سنقوم بمراجعته قريباً."
            : "Payment proof submitted successfully. We'll review it soon.",
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

    if (proofFile) {
      formData.append("proofImage", proofFile);
    }

    submitPaymentMutation.mutate(formData);
  };

  if (authLoading || !isAuthenticated || !plan) {
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
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`flex-1 h-2 rounded-full mx-1 ${
                        s <= step ? "bg-primary" : "bg-muted"
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
                  <span className={step >= 3 ? "text-foreground" : "text-muted-foreground"}>
                    {t("subscription.upload-proof")}
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
                          setPaymentMethod(value as "crypto" | "bank")
                        }
                        data-testid="radio-payment-method"
                      >
                        <div className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate active-elevate-2">
                          <RadioGroupItem value="crypto" id="crypto" />
                          <Label
                            htmlFor="crypto"
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                          >
                            <Wallet className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">
                                {t("subscription.crypto")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                BTC, ETH, USDT
                              </p>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate active-elevate-2">
                          <RadioGroupItem value="bank" id="bank" />
                          <Label
                            htmlFor="bank"
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                          >
                            <Building2 className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">
                                {t("subscription.bank")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {language === "ar"
                                  ? "تحويل مصرفي"
                                  : "Wire transfer"}
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

                      <div>
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          {t("subscription.upload-proof")}
                        </Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover-elevate active-elevate-2 transition-all">
                          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="proof-upload"
                            required
                            data-testid="input-proof-upload"
                          />
                          <Label
                            htmlFor="proof-upload"
                            className="cursor-pointer text-sm text-muted-foreground"
                          >
                            {proofFile
                              ? proofFile.name
                              : language === "ar"
                                ? "اضغط لتحميل إثبات الدفع"
                                : "Click to upload payment proof"}
                          </Label>
                        </div>
                      </div>

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

              {/* Step 3: Success */}
              {step === 3 && (
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
                        ? "تم إرسال إثبات الدفع الخاص بك. سنقوم بمراجعته وإخطارك قريباً."
                        : "Your payment proof has been submitted. We'll review it and notify you soon."}
                    </p>
                    <Button asChild>
                      <a href="/dashboard" data-testid="button-dashboard">
                        {language === "ar"
                          ? "العودة إلى لوحة التحكم"
                          : "Go to Dashboard"}
                      </a>
                    </Button>
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
