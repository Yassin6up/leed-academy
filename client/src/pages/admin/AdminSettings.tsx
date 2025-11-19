import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { Save } from "lucide-react";

const paymentSettingsSchema = z.object({
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolderName: z.string().optional(),
  iban: z.string().optional(),
  swiftCode: z.string().optional(),
  bankAddress: z.string().optional(),
  btcAddress: z.string().optional(),
  ethAddress: z.string().optional(),
  usdtAddress: z.string().optional(),
  usdtNetwork: z.string().optional(),
  paymentInstructionsEn: z.string().optional(),
  paymentInstructionsAr: z.string().optional(),
});

type PaymentSettingsForm = z.infer<typeof paymentSettingsSchema>;

export default function AdminSettings() {
  const { language } = useLanguage();
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, isAdmin, isLoading, toast]);

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/payment-settings"],
    enabled: isAuthenticated && isAdmin,
  });

  const form = useForm<PaymentSettingsForm>({
    resolver: zodResolver(paymentSettingsSchema),
    values: settings || {
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      iban: "",
      swiftCode: "",
      bankAddress: "",
      btcAddress: "",
      ethAddress: "",
      usdtAddress: "",
      usdtNetwork: "TRC20",
      paymentInstructionsEn: "",
      paymentInstructionsAr: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PaymentSettingsForm) => {
      const res = await fetch("/api/admin/payment-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        // Store the response for error handling
        const error: any = new Error("Failed to save settings");
        error.response = res;
        throw error;
      }
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return res.json();
      }
      return undefined;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-settings"] });
      toast({
        title: language === "ar" ? "تم الحفظ" : "Saved",
        description: language === "ar" ? "تم حفظ إعدادات الدفع بنجاح" : "Payment settings saved successfully",
      });
    },
    onError: async (error: any) => {
      // Try to get the response and parse validation errors
      if (error.response) {
        try {
          const errorData = await error.response.json();
          
          // Handle Zod validation errors
          if (errorData.issues && Array.isArray(errorData.issues)) {
            let hasFieldErrors = false;
            
            errorData.issues.forEach((issue: any) => {
              // Only handle simple, single-level field paths
              if (issue.path && issue.path.length === 1) {
                const fieldName = issue.path[0] as keyof PaymentSettingsForm;
                
                // Verify field exists in form before setting error
                if (fieldName in form.getValues()) {
                  form.setError(fieldName, {
                    type: "server",
                    message: issue.message,
                  });
                  hasFieldErrors = true;
                }
              }
            });
            
            if (hasFieldErrors) {
              toast({
                title: language === "ar" ? "خطأ في التحقق" : "Validation Error",
                description: language === "ar" 
                  ? "يرجى التحقق من الحقول المميزة" 
                  : "Please check the highlighted fields",
                variant: "destructive",
              });
              return;
            }
          }
        } catch (e) {
          // Fall through to generic error
        }
      }
      
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentSettingsForm) => {
    updateMutation.mutate(data);
  };

  if (isLoading || !isAuthenticated || !isAdmin) {
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
        data-testid="text-admin-settings-title"
      >
        {language === "ar" ? "إعدادات الدفع" : "Payment Settings"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Bank Information */}
          <Card data-testid="card-bank-info">
            <CardHeader>
              <CardTitle>{language === "ar" ? "معلومات البنك" : "Bank Information"}</CardTitle>
              <CardDescription>
                {language === "ar"
                  ? "أدخل تفاصيل حسابك البنكي للتحويلات البنكية"
                  : "Enter your bank account details for bank transfers"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "ar" ? "اسم البنك" : "Bank Name"}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-bank-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "ar" ? "اسم صاحب الحساب" : "Account Holder Name"}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-account-holder" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "ar" ? "رقم الحساب" : "Account Number"}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-account-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IBAN</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-iban" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="swiftCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SWIFT/BIC Code</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-swift" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "ar" ? "عنوان البنك" : "Bank Address"}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-bank-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cryptocurrency Wallets */}
          <Card data-testid="card-crypto-wallets">
            <CardHeader>
              <CardTitle>{language === "ar" ? "محافظ العملات الرقمية" : "Cryptocurrency Wallets"}</CardTitle>
              <CardDescription>
                {language === "ar"
                  ? "أدخل عناوين محافظك للمدفوعات بالعملات الرقمية"
                  : "Enter your wallet addresses for cryptocurrency payments"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="btcAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bitcoin (BTC) Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="bc1..." data-testid="input-btc-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ethAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ethereum (ETH) Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="0x..." data-testid="input-eth-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="usdtAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>USDT Address</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-usdt-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="usdtNetwork"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "ar" ? "شبكة USDT" : "USDT Network"}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-usdt-network">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TRC20">TRC20 (Tron)</SelectItem>
                          <SelectItem value="ERC20">ERC20 (Ethereum)</SelectItem>
                          <SelectItem value="BEP20">BEP20 (BSC)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          <Card data-testid="card-payment-instructions">
            <CardHeader>
              <CardTitle>{language === "ar" ? "تعليمات الدفع" : "Payment Instructions"}</CardTitle>
              <CardDescription>
                {language === "ar"
                  ? "أضف تعليمات مخصصة للمستخدمين حول كيفية إتمام الدفع"
                  : "Add custom instructions for users on how to complete payment"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="paymentInstructionsEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions (English)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Enter payment instructions in English..."
                        data-testid="textarea-instructions-en"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentInstructionsAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions (Arabic)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="أدخل تعليمات الدفع بالعربية..."
                        data-testid="textarea-instructions-ar"
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateMutation.isPending || settingsLoading}
              className="min-w-32"
              data-testid="button-save-settings"
            >
              {updateMutation.isPending ? (
                language === "ar" ? "جاري الحفظ..." : "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {language === "ar" ? "حفظ الإعدادات" : "Save Settings"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
