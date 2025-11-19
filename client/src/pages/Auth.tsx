import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { LogIn, UserPlus, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useEffect } from "react";

export default function Auth() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [referralCode, setReferralCode] = useState("");
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [referralValid, setReferralValid] = useState<boolean | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Validate referral code when user types
  const validateReferralCode = async (code: string) => {
    if (!code) {
      setReferralValid(null);
      return;
    }

    setValidatingReferral(true);
    try {
      const response = await fetch(`/api/referral/validate/${code}`);
      if (response.ok) {
        const data = await response.json();
        setReferralValid(data.valid === true);
      } else {
        setReferralValid(false);
      }
    } catch (error) {
      setReferralValid(false);
    } finally {
      setValidatingReferral(false);
    }
  };

  // Debounced referral validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (referralCode) {
        validateReferralCode(referralCode);
      } else {
        setReferralValid(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [referralCode]);

  const handleLogin = async () => {
    // Store referral intent if on register tab
    window.location.href = "/api/login";
  };

  const handleRegister = async () => {
    // Store referral intent in session before redirecting to OIDC
    if (referralCode && referralValid) {
      try {
        const response = await fetch("/api/auth/referral-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ referralCode }),
          credentials: "include",
        });

        if (!response.ok) {
          toast({
            title: language === "ar" ? "خطأ" : "Error",
            description: language === "ar" 
              ? "فشل حفظ كود الإحالة" 
              : "Failed to save referral code",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error("Failed to store referral intent:", error);
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description: language === "ar" 
            ? "فشل حفظ كود الإحالة" 
            : "Failed to save referral code",
          variant: "destructive",
        });
        return;
      }
    }

    // Redirect to OIDC login
    window.location.href = "/api/login";
  };

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {language === "ar" ? "مرحباً بك" : "Welcome"}
            </CardTitle>
            <CardDescription className="text-center">
              {language === "ar" 
                ? "قم بتسجيل الدخول أو إنشاء حساب جديد" 
                : "Login or create a new account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="tab-login">
                  {language === "ar" ? "تسجيل الدخول" : "Login"}
                </TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">
                  {language === "ar" ? "إنشاء حساب" : "Register"}
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-4">
                  <div className="text-center text-sm text-muted-foreground">
                    {language === "ar" 
                      ? "انقر أدناه لتسجيل الدخول باستخدام حساب Replit الخاص بك" 
                      : "Click below to login with your Replit account"}
                  </div>
                  
                  <Button
                    onClick={handleLogin}
                    className="w-full"
                    size="lg"
                    data-testid="button-login-submit"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {language === "ar" ? "تسجيل الدخول مع Replit" : "Login with Replit"}
                  </Button>
                </div>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="referralCode">
                      {language === "ar" ? "كود الإحالة (اختياري)" : "Referral Code (Optional)"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="referralCode"
                        placeholder={language === "ar" ? "أدخل كود الإحالة" : "Enter referral code"}
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        data-testid="input-referral-code"
                        className={
                          referralCode
                            ? referralValid
                              ? "border-green-500 dark:border-green-600"
                              : referralValid === false
                              ? "border-red-500 dark:border-red-600"
                              : ""
                            : ""
                        }
                      />
                      {referralCode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {validatingReferral ? (
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : referralValid ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 dark:text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                    {referralCode && referralValid === false && (
                      <p className="text-sm text-red-500 dark:text-red-600">
                        {language === "ar" ? "كود الإحالة غير صالح" : "Invalid referral code"}
                      </p>
                    )}
                    {referralCode && referralValid === true && (
                      <p className="text-sm text-green-600 dark:text-green-500">
                        {language === "ar" ? "كود إحالة صالح!" : "Valid referral code!"}
                      </p>
                    )}
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    {language === "ar" 
                      ? "سيتم إنشاء حسابك تلقائياً عند تسجيل الدخول لأول مرة" 
                      : "Your account will be created automatically on first login"}
                  </div>
                  
                  <Button
                    onClick={handleRegister}
                    className="w-full"
                    size="lg"
                    disabled={validatingReferral || (referralCode.length > 0 && referralValid !== true)}
                    data-testid="button-register-submit"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {language === "ar" ? "إنشاء حساب مع Replit" : "Register with Replit"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
