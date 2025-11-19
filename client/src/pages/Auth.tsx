import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, UserPlus, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { queryClient } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  referredBy: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function Auth() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [referralCode, setReferralCode] = useState("");
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      referredBy: "",
    },
  });

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

  const onLogin = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const result = await response.json();

      toast({
        title: language === "ar" ? "تم تسجيل الدخول بنجاح" : "Login successful",
        description: language === "ar" ? "مرحباً بعودتك!" : "Welcome back!",
      });

      // Invalidate queries and redirect
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      if (result.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: language === "ar" ? "خطأ في تسجيل الدخول" : "Login failed",
        description: error.message || (language === "ar" ? "بريد إلكتروني أو كلمة مرور غير صحيحة" : "Invalid email or password"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegister = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          referredBy: referralCode || undefined,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const result = await response.json();

      toast({
        title: language === "ar" ? "تم التسجيل بنجاح" : "Registration successful",
        description: language === "ar" ? "مرحباً بك في أكاديمية TradeMaster!" : "Welcome to TradeMaster Academy!",
      });

      // Invalidate queries and redirect
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      if (result.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: language === "ar" ? "خطأ في التسجيل" : "Registration failed",
        description: error.message || (language === "ar" ? "فشل إنشاء الحساب" : "Failed to create account"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update referredBy field when referral code changes
  useEffect(() => {
    registerForm.setValue("referredBy", referralCode);
  }, [referralCode, registerForm]);

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {language === "ar" ? "مرحباً بك" : "Welcome"}
            </CardTitle>
            <CardDescription className="text-center">
              {language === "ar" 
                ? "سجل الدخول أو أنشئ حساباً جديداً" 
                : "Login or create a new account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="tab-login">
                  {language === "ar" ? "تسجيل الدخول" : "Login"}
                </TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">
                  {language === "ar" ? "إنشاء حساب" : "Register"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === "ar" ? "البريد الإلكتروني" : "Email"}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={language === "ar" ? "البريد الإلكتروني" : "Email"}
                              data-testid="input-login-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === "ar" ? "كلمة المرور" : "Password"}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={language === "ar" ? "كلمة المرور" : "Password"}
                              data-testid="input-login-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
                      data-testid="button-login-submit"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {isSubmitting 
                        ? (language === "ar" ? "جاري تسجيل الدخول..." : "Logging in...") 
                        : (language === "ar" ? "تسجيل الدخول" : "Login")}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-4">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{language === "ar" ? "الاسم الأول" : "First Name"}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={language === "ar" ? "الاسم الأول" : "First Name"}
                                data-testid="input-register-firstname"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{language === "ar" ? "اسم العائلة" : "Last Name"}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={language === "ar" ? "اسم العائلة" : "Last Name"}
                                data-testid="input-register-lastname"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === "ar" ? "البريد الإلكتروني" : "Email"}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={language === "ar" ? "البريد الإلكتروني" : "Email"}
                              data-testid="input-register-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === "ar" ? "كلمة المرور" : "Password"}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={language === "ar" ? "كلمة المرور" : "Password"}
                              data-testid="input-register-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === "ar" ? "رقم الهاتف (اختياري)" : "Phone (Optional)"}</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder={language === "ar" ? "رقم الهاتف" : "Phone"}
                              data-testid="input-register-phone"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormLabel>
                        {language === "ar" ? "كود الإحالة (اختياري)" : "Referral Code (Optional)"}
                      </FormLabel>
                      <div className="relative">
                        <Input
                          placeholder={language === "ar" ? "أدخل كود الإحالة" : "Enter referral code"}
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          data-testid="input-register-referral"
                          className={
                            referralValid === true
                              ? "border-green-500 pr-10"
                              : referralValid === false
                              ? "border-red-500 pr-10"
                              : "pr-10"
                          }
                        />
                        {validatingReferral && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-t-transparent border-primary rounded-full animate-spin" />
                          </div>
                        )}
                        {!validatingReferral && referralValid === true && (
                          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                        )}
                        {!validatingReferral && referralValid === false && (
                          <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                        )}
                      </div>
                      {referralValid === true && (
                        <p className="text-sm text-green-600">
                          {language === "ar" ? "كود إحالة صالح" : "Valid referral code"}
                        </p>
                      )}
                      {referralValid === false && (
                        <p className="text-sm text-red-600">
                          {language === "ar" ? "كود إحالة غير صالح" : "Invalid referral code"}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting || (referralCode.length > 0 && referralValid !== true)}
                      data-testid="button-register-submit"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {isSubmitting 
                        ? (language === "ar" ? "جاري إنشاء الحساب..." : "Creating account...") 
                        : (language === "ar" ? "إنشاء حساب" : "Register")}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
