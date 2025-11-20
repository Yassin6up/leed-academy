import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Phone, ExternalLink } from "lucide-react";
import type { Setting } from "@shared/schema";

export default function JoinGroup() {
  const { language } = useLanguage();

  const { data: settingsData, isLoading } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  const telegramLink = settingsData?.find(s => s.key === "telegram_group_link")?.value;
  const whatsappLink = settingsData?.find(s => s.key === "whatsapp_group_link")?.value;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="text-join-group-title">
          {language === "ar" ? "انضم لمجموعاتنا" : "Join Our Groups"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === "ar"
            ? "تواصل مع زملائك الطلاب واحصل على الدعم والمساعدة"
            : "Connect with fellow students and get support and assistance"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Telegram Card */}
        <Card className="hover-elevate active-elevate-2 transition-all" data-testid="card-telegram">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle>Telegram</CardTitle>
                <CardDescription>
                  {language === "ar" ? "مجموعة الطلاب" : "Student Group"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {language === "ar"
                ? "انضم إلى مجموعتنا على Telegram للحصول على التحديثات الفورية والتواصل مع المدربين والطلاب الآخرين"
                : "Join our Telegram group for instant updates and to connect with instructors and other students"}
            </p>
            {telegramLink ? (
              <Button
                asChild
                className="w-full"
                data-testid="button-join-telegram"
              >
                <a href={telegramLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {language === "ar" ? "انضم الآن" : "Join Now"}
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            ) : (
              <div className="text-center text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                {language === "ar" ? "الرابط غير متوفر حالياً" : "Link not available yet"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Card */}
        <Card className="hover-elevate active-elevate-2 transition-all" data-testid="card-whatsapp">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Phone className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle>WhatsApp</CardTitle>
                <CardDescription>
                  {language === "ar" ? "مجموعة الطلاب" : "Student Group"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {language === "ar"
                ? "انضم إلى مجموعتنا على WhatsApp للمناقشات والأسئلة والتواصل السريع مع المجتمع"
                : "Join our WhatsApp group for discussions, questions, and quick communication with the community"}
            </p>
            {whatsappLink ? (
              <Button
                asChild
                className="w-full bg-green-600 hover:bg-green-700"
                data-testid="button-join-whatsapp"
              >
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Phone className="h-4 w-4 mr-2" />
                  {language === "ar" ? "انضم الآن" : "Join Now"}
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            ) : (
              <div className="text-center text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                {language === "ar" ? "الرابط غير متوفر حالياً" : "Link not available yet"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-2">
            {language === "ar" ? "إرشادات المجموعة" : "Group Guidelines"}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span>•</span>
              <span>
                {language === "ar"
                  ? "كن محترماً ومهذباً مع جميع الأعضاء"
                  : "Be respectful and polite to all members"}
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                {language === "ar"
                  ? "لا تشارك معلومات شخصية أو حساسة"
                  : "Don't share personal or sensitive information"}
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                {language === "ar"
                  ? "استخدم المجموعة للأسئلة والمناقشات المتعلقة بالدورات"
                  : "Use the group for course-related questions and discussions"}
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                {language === "ar"
                  ? "لا ترسل رسائل غير مرغوب فيها أو إعلانات"
                  : "No spam or promotional content"}
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
