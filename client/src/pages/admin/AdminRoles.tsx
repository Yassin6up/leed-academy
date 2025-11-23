import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Edit, Shield, Headphones, Settings, UserPlus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export default function AdminRoles() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Create user form state
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
  });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description: language === "ar" ? "تم تحديث دور المستخدم" : "User role updated successfully",
      });
      setSelectedUserId(null);
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.response?.data?.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof createForm) => {
      return await apiRequest("POST", "/api/admin/users/create", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: language === "ar" ? "تم الإنشاء" : "Created",
        description: language === "ar" ? "تم إنشاء المستخدم بنجاح" : "User created successfully",
      });
      setCreateDialogOpen(false);
      setCreateForm({ firstName: "", lastName: "", email: "", password: "", phone: "", role: "user" });
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "support":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "manager":
        return <Settings className="h-4 w-4" />;
      case "support":
        return <Headphones className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const filteredUsers = users?.filter((u) => roleFilter === "all" || u.role === roleFilter) || [];

  const stats = {
    total: users?.length || 0,
    admins: users?.filter((u) => u.role === "admin").length || 0,
    managers: users?.filter((u) => u.role === "manager").length || 0,
    support: users?.filter((u) => u.role === "support").length || 0,
    users: users?.filter((u) => u.role === "user").length || 0,
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="text-admin-roles-title">
            {language === "ar" ? "إدارة الأدوار والمستخدمين" : "Role & User Management"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {language === "ar" ? "إدارة أدوار المستخدمين والصلاحيات" : "Manage user roles and permissions"}
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-user" className="gap-2">
              <Plus className="h-4 w-4" />
              {language === "ar" ? "إنشاء مستخدم" : "Create User"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" data-testid="dialog-create-user">
            <DialogHeader>
              <DialogTitle>
                {language === "ar" ? "إنشاء مستخدم جديد" : "Create New User"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder={language === "ar" ? "الاسم الأول" : "First Name"}
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                  data-testid="input-first-name"
                />
                <Input
                  placeholder={language === "ar" ? "الاسم الأخير" : "Last Name"}
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                  data-testid="input-last-name"
                />
              </div>
              <Input
                type="email"
                placeholder={language === "ar" ? "البريد الإلكتروني" : "Email"}
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                data-testid="input-email"
              />
              <Input
                type="password"
                placeholder={language === "ar" ? "كلمة المرور" : "Password"}
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                data-testid="input-password"
              />
              <Input
                placeholder={language === "ar" ? "رقم الهاتف" : "Phone"}
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                data-testid="input-phone"
              />
              <Select value={createForm.role} onValueChange={(role) => setCreateForm({ ...createForm, role })}>
                <SelectTrigger data-testid="select-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user" data-testid="option-role-user">
                    {language === "ar" ? "مستخدم عادي" : "Regular User"}
                  </SelectItem>
                  <SelectItem value="support" data-testid="option-role-support">
                    {language === "ar" ? "دعم" : "Support"}
                  </SelectItem>
                  <SelectItem value="manager" data-testid="option-role-manager">
                    {language === "ar" ? "مدير" : "Manager"}
                  </SelectItem>
                  <SelectItem value="admin" data-testid="option-role-admin">
                    {language === "ar" ? "مسؤول" : "Admin"}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => createUserMutation.mutate(createForm)}
                disabled={createUserMutation.isPending || !createForm.firstName || !createForm.email || !createForm.password}
                className="w-full"
                data-testid="button-submit-create"
              >
                {createUserMutation.isPending ? (language === "ar" ? "جاري الإنشاء..." : "Creating...") : language === "ar" ? "إنشاء" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card data-testid="stat-total">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "الإجمالي" : "Total"}</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900" data-testid="stat-admins">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "مسؤولون" : "Admins"}</p>
                <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900" data-testid="stat-managers">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "مديرون" : "Managers"}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.managers}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900" data-testid="stat-support">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "دعم" : "Support"}</p>
                <p className="text-2xl font-bold text-green-600">{stats.support}</p>
              </div>
              <Headphones className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-users">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "مستخدمون" : "Users"}</p>
                <p className="text-2xl font-bold text-foreground">{stats.users}</p>
              </div>
              <UserPlus className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List with Filtering */}
      <div className="space-y-4">
        <Tabs value={roleFilter} onValueChange={setRoleFilter}>
          <TabsList className="w-full justify-start" data-testid="tabs-role-filter">
            <TabsTrigger value="all" data-testid="tab-all">
              {language === "ar" ? "الجميع" : "All"} ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="admin" data-testid="tab-admin">
              <Shield className="h-3 w-3 mr-1" />
              {language === "ar" ? "مسؤولون" : "Admins"} ({stats.admins})
            </TabsTrigger>
            <TabsTrigger value="manager" data-testid="tab-manager">
              <Settings className="h-3 w-3 mr-1" />
              {language === "ar" ? "مديرون" : "Managers"} ({stats.managers})
            </TabsTrigger>
            <TabsTrigger value="support" data-testid="tab-support">
              <Headphones className="h-3 w-3 mr-1" />
              {language === "ar" ? "دعم" : "Support"} ({stats.support})
            </TabsTrigger>
            <TabsTrigger value="user" data-testid="tab-user">
              <Users className="h-3 w-3 mr-1" />
              {language === "ar" ? "مستخدمون" : "Users"} ({stats.users})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={roleFilter} className="space-y-3">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Card key={user.id} className="hover-elevate transition-all" data-testid={`card-user-${user.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground" data-testid={`text-user-name-${user.id}`}>
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getRoleBadgeColor(user.role)} data-testid={`badge-role-${user.id}`}>
                          {user.role}
                        </Badge>
                        {selectedUserId === user.id ? (
                          <div className="flex gap-2">
                            <Select
                              defaultValue={user.role}
                              onValueChange={(role) =>
                                updateRoleMutation.mutate({ userId: user.id, role })
                              }
                            >
                              <SelectTrigger className="w-32" data-testid={`select-role-${user.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="support">Support</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUserId(null)}
                              data-testid="button-cancel-role"
                            >
                              {language === "ar" ? "إلغاء" : "Cancel"}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUserId(user.id)}
                            data-testid={`button-edit-role-${user.id}`}
                            className="gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            {language === "ar" ? "تعديل" : "Edit"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
                  <p className="text-muted-foreground">
                    {language === "ar" ? "لا توجد مستخدمون في هذا الدور" : "No users in this role"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
