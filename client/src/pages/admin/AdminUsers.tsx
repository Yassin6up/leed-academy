import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, UserCheck, UserX, XCircle, Trash2 } from "lucide-react";
import type { User } from "@shared/schema";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminUsers() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: "deactivate" | "activate" | "delete" | "cancel-subscription" | null;
    user: User | null;
  }>({
    open: false,
    type: null,
    user: null,
  });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const filteredUsers = users?.filter((user) => {
    const matchSearch = !searchFilter || 
      user.email?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchFilter.toLowerCase());
    const matchRole = roleFilter === "all" || user.role === roleFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? user.isActive : !user.isActive);
    return matchSearch && matchRole && matchStatus;
  }) || [];

  const deactivateMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/deactivate`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: language === "ar" ? "تم التعطيل" : "User Deactivated",
        description: language === "ar" 
          ? "تم تعطيل المستخدم بنجاح" 
          : "User has been deactivated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || "Failed to deactivate user",
        variant: "destructive",
      });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/activate`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: language === "ar" ? "تم التفعيل" : "User Activated",
        description: language === "ar" 
          ? "تم تفعيل المستخدم بنجاح" 
          : "User has been activated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || "Failed to activate user",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/admin/users/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: language === "ar" ? "تم الحذف" : "User Deleted",
        description: language === "ar" 
          ? "تم حذف المستخدم بنجاح" 
          : "User has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/cancel-subscription`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: language === "ar" ? "تم الإلغاء" : "Subscription Cancelled",
        description: language === "ar" 
          ? "تم إلغاء الاشتراك بنجاح" 
          : "Subscription has been cancelled successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const handleAction = () => {
    if (!actionDialog.user) return;

    switch (actionDialog.type) {
      case "deactivate":
        deactivateMutation.mutate(actionDialog.user.id);
        break;
      case "activate":
        activateMutation.mutate(actionDialog.user.id);
        break;
      case "delete":
        deleteMutation.mutate(actionDialog.user.id);
        break;
      case "cancel-subscription":
        cancelSubscriptionMutation.mutate(actionDialog.user.id);
        break;
    }

    setActionDialog({ open: false, type: null, user: null });
  };

  const openActionDialog = (type: typeof actionDialog.type, user: User) => {
    setActionDialog({ open: true, type, user });
  };

  const isCurrentUser = (userId: string) => currentUser?.id === userId;

  if (isLoading) {
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
        data-testid="text-admin-users-title"
      >
        {language === "ar" ? "إدارة المستخدمين" : "User Management"}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>
            {language === "ar" ? "جميع المستخدمين" : "All Users"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder={language === "ar" ? "ابحث بالبريد أو الاسم..." : "Search by email or name..."}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              data-testid="input-search-users"
            />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
              data-testid="select-role-filter"
            >
              <option value="all">{language === "ar" ? "جميع الأدوار" : "All Roles"}</option>
              <option value="user">{language === "ar" ? "مستخدم" : "User"}</option>
              <option value="admin">{language === "ar" ? "مسؤول" : "Admin"}</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
              data-testid="select-status-filter"
            >
              <option value="all">{language === "ar" ? "جميع الحالات" : "All Status"}</option>
              <option value="active">{language === "ar" ? "نشط" : "Active"}</option>
              <option value="inactive">{language === "ar" ? "معطل" : "Inactive"}</option>
            </select>
            {(searchFilter || roleFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchFilter("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
                data-testid="button-clear-user-filters"
              >
                {language === "ar" ? "مسح" : "Clear"}
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {language === "ar" ? "النتائج: " : "Results: "} {filteredUsers.length}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "ar" ? "المستخدم" : "User"}</TableHead>
                <TableHead>{language === "ar" ? "البريد الإلكتروني" : "Email"}</TableHead>
                <TableHead>{language === "ar" ? "الدور" : "Role"}</TableHead>
                <TableHead>{language === "ar" ? "الحالة" : "Status"}</TableHead>
                <TableHead>{language === "ar" ? "الاشتراك" : "Subscription"}</TableHead>
                <TableHead>{language === "ar" ? "التاريخ" : "Joined"}</TableHead>
                <TableHead className="text-right">{language === "ar" ? "الإجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl || ""} />
                        <AvatarFallback>
                          {user.firstName?.[0] || user.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? "default" : "secondary"}
                      data-testid={`badge-status-${user.id}`}
                    >
                      {user.isActive 
                        ? (language === "ar" ? "نشط" : "Active")
                        : (language === "ar" ? "معطل" : "Inactive")
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.subscriptionStatus === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {user.subscriptionStatus || "none"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          data-testid={`button-actions-${user.id}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                          {language === "ar" ? "الإجراءات" : "Actions"}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {!isCurrentUser(user.id) && user.isActive && (
                          <DropdownMenuItem
                            onClick={() => openActionDialog("deactivate", user)}
                            data-testid={`action-deactivate-${user.id}`}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            {language === "ar" ? "تعطيل الحساب" : "Deactivate Account"}
                          </DropdownMenuItem>
                        )}
                        
                        {!user.isActive && (
                          <DropdownMenuItem
                            onClick={() => openActionDialog("activate", user)}
                            data-testid={`action-activate-${user.id}`}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            {language === "ar" ? "تفعيل الحساب" : "Activate Account"}
                          </DropdownMenuItem>
                        )}

                        {user.subscriptionStatus && user.subscriptionStatus !== "none" && user.subscriptionStatus !== "cancelled" && (
                          <DropdownMenuItem
                            onClick={() => openActionDialog("cancel-subscription", user)}
                            data-testid={`action-cancel-subscription-${user.id}`}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {language === "ar" ? "إلغاء الاشتراك" : "Cancel Subscription"}
                          </DropdownMenuItem>
                        )}

                        {!isCurrentUser(user.id) && (
                          <>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => openActionDialog("delete", user)}
                              className="text-destructive focus:text-destructive"
                              data-testid={`action-delete-${user.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {language === "ar" ? "حذف المستخدم" : "Delete User"}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null, user: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.type === "deactivate" && (language === "ar" ? "تعطيل الحساب" : "Deactivate Account")}
              {actionDialog.type === "activate" && (language === "ar" ? "تفعيل الحساب" : "Activate Account")}
              {actionDialog.type === "delete" && (language === "ar" ? "حذف المستخدم" : "Delete User")}
              {actionDialog.type === "cancel-subscription" && (language === "ar" ? "إلغاء الاشتراك" : "Cancel Subscription")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.type === "deactivate" && (
                language === "ar" 
                  ? "هل أنت متأكد من تعطيل هذا الحساب؟ لن يتمكن المستخدم من تسجيل الدخول."
                  : "Are you sure you want to deactivate this account? The user will not be able to log in."
              )}
              {actionDialog.type === "activate" && (
                language === "ar"
                  ? "هل أنت متأكد من تفعيل هذا الحساب؟"
                  : "Are you sure you want to activate this account?"
              )}
              {actionDialog.type === "delete" && (
                language === "ar"
                  ? "هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا رجعة فيه وسيتم حذف جميع البيانات المرتبطة."
                  : "Are you sure you want to delete this user? This action cannot be undone and will delete all associated data."
              )}
              {actionDialog.type === "cancel-subscription" && (
                language === "ar"
                  ? "هل أنت متأكد من إلغاء اشتراك هذا المستخدم؟"
                  : "Are you sure you want to cancel this user's subscription?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-action">
              {language === "ar" ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAction}
              data-testid="button-confirm-action"
              className={actionDialog.type === "delete" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {language === "ar" ? "تأكيد" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
