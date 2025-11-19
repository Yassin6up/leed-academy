import { useLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
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
import type { User } from "@shared/schema";

export default function AdminUsers() {
  const { language } = useLanguage();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "ar" ? "المستخدم" : "User"}</TableHead>
                <TableHead>{language === "ar" ? "البريد الإلكتروني" : "Email"}</TableHead>
                <TableHead>{language === "ar" ? "الدور" : "Role"}</TableHead>
                <TableHead>{language === "ar" ? "الاشتراك" : "Subscription"}</TableHead>
                <TableHead>{language === "ar" ? "التاريخ" : "Joined"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
