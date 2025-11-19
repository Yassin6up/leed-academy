import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Course } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function AdminCourses() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
  });

  const form = useForm({
    defaultValues: {
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      level: "1",
      price: "0",
      isFree: false,
      instructorEn: "",
      instructorAr: "",
      duration: "8",
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/courses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({
        title: language === "ar" ? "تم الإنشاء" : "Created",
        description:
          language === "ar"
            ? "تم إنشاء الدورة بنجاح"
            : "Course created successfully",
      });
      setDialogOpen(false);
      form.reset();
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return await apiRequest("DELETE", `/api/admin/courses/${courseId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({
        title: language === "ar" ? "تم الحذف" : "Deleted",
        description:
          language === "ar"
            ? "تم حذف الدورة بنجاح"
            : "Course deleted successfully",
      });
    },
  });

  const onSubmit = (data: any) => {
    createCourseMutation.mutate({
      ...data,
      level: parseInt(data.level),
      price: parseFloat(data.price),
      duration: parseInt(data.duration),
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-3xl font-heading font-bold text-foreground"
          data-testid="text-admin-courses-title"
        >
          {language === "ar" ? "إدارة الدورات" : "Course Management"}
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-course">
              <Plus className="h-4 w-4 mr-2" />
              {language === "ar" ? "إنشاء دورة" : "Create Course"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {language === "ar" ? "إنشاء دورة جديدة" : "Create New Course"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="titleEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title (English)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-title-en" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="titleAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title (Arabic)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-title-ar" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (English)</FormLabel>
                        <FormControl>
                          <Textarea {...field} data-testid="input-desc-en" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Arabic)</FormLabel>
                        <FormControl>
                          <Textarea {...field} data-testid="input-desc-ar" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-level">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Level 1</SelectItem>
                            <SelectItem value="2">Level 2</SelectItem>
                            <SelectItem value="3">Level 3</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            data-testid="input-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (hours)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            data-testid="input-duration"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="instructorEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructor (English)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-instructor-en" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instructorAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructor (Arabic)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-instructor-ar" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createCourseMutation.isPending}
                  className="w-full"
                  data-testid="button-submit-course"
                >
                  {createCourseMutation.isPending
                    ? language === "ar"
                      ? "جاري الإنشاء..."
                      : "Creating..."
                    : language === "ar"
                      ? "إنشاء"
                      : "Create"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <Card
            key={course.id}
            className="hover-elevate active-elevate-2 transition-all"
            data-testid={`card-course-${course.id}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge>{language === "ar" ? "مستوى" : "Level"} {course.level}</Badge>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid={`button-edit-${course.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCourseMutation.mutate(course.id)}
                    data-testid={`button-delete-${course.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">
                {language === "ar" ? course.titleAr : course.titleEn}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {language === "ar" ? course.descriptionAr : course.descriptionEn}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">
                  ${course.price}
                </span>
                <span className="text-muted-foreground">
                  {course.duration} {language === "ar" ? "ساعات" : "hours"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
