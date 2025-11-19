import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Save, Lock, User as UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function UserSettings() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      return await apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description: language === "ar" ? "تم تحديث الملف الشخصي بنجاح" : "Profile updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || (language === "ar" ? "فشل في تحديث الملف الشخصي" : "Failed to update profile"),
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      return await apiRequest("PATCH", "/api/user/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description: language === "ar" ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || (language === "ar" ? "فشل في تغيير كلمة المرور" : "Failed to change password"),
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordForm) => {
    updatePasswordMutation.mutate(data);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="text-settings-title">
          {language === "ar" ? "الإعدادات" : "Settings"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === "ar"
            ? "إدارة معلوماتك الشخصية وإعدادات الحساب"
            : "Manage your personal information and account settings"}
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            <CardTitle>{language === "ar" ? "المعلومات الشخصية" : "Profile Information"}</CardTitle>
          </div>
          <CardDescription>
            {language === "ar"
              ? "قم بتحديث معلومات ملفك الشخصي"
              : "Update your profile information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "ar" ? "الاسم الأول" : "First Name"}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={language === "ar" ? "الاسم الأول" : "First Name"}
                          data-testid="input-first-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "ar" ? "اسم العائلة" : "Last Name"}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={language === "ar" ? "اسم العائلة" : "Last Name"}
                          data-testid="input-last-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "ar" ? "رقم الهاتف" : "Phone Number"}</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder={language === "ar" ? "رقم الهاتف" : "Phone Number"}
                        data-testid="input-phone"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-muted p-3 rounded-lg">
                <Label className="text-sm font-medium">
                  {language === "ar" ? "البريد الإلكتروني" : "Email"}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === "ar"
                    ? "لا يمكن تغيير البريد الإلكتروني"
                    : "Email cannot be changed"}
                </p>
              </div>

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending
                  ? (language === "ar" ? "جاري الحفظ..." : "Saving...")
                  : (language === "ar" ? "حفظ التغييرات" : "Save Changes")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>{language === "ar" ? "تغيير كلمة المرور" : "Change Password"}</CardTitle>
          </div>
          <CardDescription>
            {language === "ar"
              ? "قم بتحديث كلمة المرور الخاصة بك"
              : "Update your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "ar" ? "كلمة المرور الحالية" : "Current Password"}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={language === "ar" ? "كلمة المرور الحالية" : "Current Password"}
                        data-testid="input-current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "ar" ? "كلمة المرور الجديدة" : "New Password"}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                        data-testid="input-new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                        data-testid="input-confirm-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={updatePasswordMutation.isPending}
                data-testid="button-save-password"
              >
                <Lock className="h-4 w-4 mr-2" />
                {updatePasswordMutation.isPending
                  ? (language === "ar" ? "جاري التحديث..." : "Updating...")
                  : (language === "ar" ? "تغيير كلمة المرور" : "Change Password")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
