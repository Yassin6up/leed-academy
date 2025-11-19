import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormData) => {
    console.log("Contact form:", data);
    toast({
      title: t("common.success"),
      description:
        language === "ar"
          ? "تم إرسال رسالتك بنجاح!"
          : "Your message has been sent successfully!",
    });
    form.reset();
  };

  const contactInfo = [
    {
      icon: Mail,
      title: language === "ar" ? "البريد الإلكتروني" : "Email",
      value: "info@trademaster.com",
    },
    {
      icon: Phone,
      title: language === "ar" ? "الهاتف" : "Phone",
      value: "+1 (555) 123-4567",
    },
    {
      icon: MapPin,
      title: language === "ar" ? "الموقع" : "Location",
      value: language === "ar" ? "دبي، الإمارات العربية المتحدة" : "Dubai, UAE",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1
                className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6"
                data-testid="text-contact-title"
              >
                {t("contact.title")}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {language === "ar"
                  ? "نحن هنا لمساعدتك. تواصل معنا وسنرد عليك في أقرب وقت ممكن."
                  : "We're here to help. Get in touch and we'll get back to you as soon as possible."}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Info Cards */}
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <Card
                    key={index}
                    className="hover-elevate active-elevate-2 transition-all"
                    data-testid={`card-contact-info-${index}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <info.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {info.title}
                          </h3>
                          <p className="text-muted-foreground">{info.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      {language === "ar" ? "أرسل لنا رسالة" : "Send us a message"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("contact.name")}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  data-testid="input-contact-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("contact.email")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  {...field}
                                  data-testid="input-contact-email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("contact.message")}</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  rows={6}
                                  data-testid="input-contact-message"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full"
                          data-testid="button-contact-send"
                        >
                          {t("contact.send")}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
