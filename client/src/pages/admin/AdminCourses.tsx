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
import { Plus, Edit, Trash2, Video } from "lucide-react";
import type { Course, Lesson, SubscriptionPlan } from "@shared/schema";
import { insertLessonSchema } from "@shared/schema";
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
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export default function AdminCourses() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
  });

  const { data: lessons } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${selectedCourseId}/lessons`],
    enabled: !!selectedCourseId,
  });

  const { data: plans } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
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
      thumbnailUrl: "",
      requiredPlanId: "none",
    },
  });

  const lessonFormSchema = insertLessonSchema.extend({
    videoUrl: z.string().url("Please enter a valid video URL").min(1, "Video URL is required"),
    titleEn: z.string().min(1, "English title is required"),
    titleAr: z.string().min(1, "Arabic title is required"),
  }).omit({ courseId: true });

  const lessonForm = useForm({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      videoUrl: "",
      duration: 30,
      order: 1,
      requiresPrevious: true,
      isFree: false,
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

  const createLessonMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/lessons", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${selectedCourseId}/lessons`] });
      toast({
        title: language === "ar" ? "تم الإنشاء" : "Created",
        description:
          language === "ar"
            ? "تم إنشاء الدرس بنجاح"
            : "Lesson created successfully",
      });
      setLessonDialogOpen(false);
      lessonForm.reset();
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      return await apiRequest("DELETE", `/api/admin/lessons/${lessonId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${selectedCourseId}/lessons`] });
      toast({
        title: language === "ar" ? "تم الحذف" : "Deleted",
        description:
          language === "ar"
            ? "تم حذف الدرس بنجاح"
            : "Lesson deleted successfully",
      });
    },
  });

  const onSubmit = (data: any) => {
    createCourseMutation.mutate({
      ...data,
      level: parseInt(data.level),
      price: parseFloat(data.price),
      duration: parseInt(data.duration),
      requiredPlanId: data.requiredPlanId === "none" ? null : data.requiredPlanId,
      thumbnailUrl: data.thumbnailUrl || null,
    });
  };

  const onLessonSubmit = (data: any) => {
    if (!selectedCourseId) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "لم يتم تحديد دورة" : "No course selected",
        variant: "destructive",
      });
      return;
    }
    createLessonMutation.mutate({
      ...data,
      courseId: selectedCourseId,
    });
  };

  const openLessonDialog = (courseId: string) => {
    setSelectedCourseId(courseId);
    setLessonDialogOpen(true);
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

                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://example.com/thumbnail.jpg"
                          data-testid="input-thumbnail-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiredPlanId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Subscription Plan (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-required-plan">
                            <SelectValue placeholder="Select a plan or leave empty for free access" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No plan required</SelectItem>
                          {plans?.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {language === "ar" ? plan.nameAr : plan.nameEn} - ${plan.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Free Course</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Make this course completely free for all users
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-is-free"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

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
                    onClick={() => openLessonDialog(course.id)}
                    data-testid={`button-lessons-${course.id}`}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
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

      {/* Lesson Management Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === "ar" ? "إدارة الدروس" : "Manage Lessons"}
            </DialogTitle>
          </DialogHeader>
          
          {/* Existing Lessons List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === "ar" ? "الدروس الحالية" : "Current Lessons"}
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {lessons?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "لا توجد دروس" : "No lessons yet"}
                </p>
              )}
              {lessons?.map((lesson) => (
                <Card key={lesson.id} className="p-3" data-testid={`card-lesson-${lesson.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {language === "ar" ? "ترتيب" : "Order"} {lesson.order}
                        </Badge>
                        {lesson.isFree && (
                          <Badge variant="secondary" className="text-xs">
                            {language === "ar" ? "مجاني" : "Free"}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-sm">
                        {language === "ar" ? lesson.titleAr : lesson.titleEn}
                      </h4>
                      {lesson.videoUrl && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {lesson.videoUrl}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {lesson.duration} {language === "ar" ? "دقيقة" : "min"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteLessonMutation.mutate(lesson.id)}
                      data-testid={`button-delete-lesson-${lesson.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Add New Lesson Form */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">
              {language === "ar" ? "إضافة درس جديد" : "Add New Lesson"}
            </h3>
            <Form {...lessonForm}>
              <form onSubmit={lessonForm.handleSubmit(onLessonSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={lessonForm.control}
                    name="titleEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title (English)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-lesson-title-en" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={lessonForm.control}
                    name="titleAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title (Arabic)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-lesson-title-ar" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={lessonForm.control}
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (English)</FormLabel>
                        <FormControl>
                          <Textarea {...field} data-testid="input-lesson-desc-en" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={lessonForm.control}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Arabic)</FormLabel>
                        <FormControl>
                          <Textarea {...field} data-testid="input-lesson-desc-ar" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={lessonForm.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL (YouTube, Vimeo, etc.)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://www.youtube.com/watch?v=..."
                          data-testid="input-lesson-video-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={lessonForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            data-testid="input-lesson-duration"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={lessonForm.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            data-testid="input-lesson-order"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={lessonForm.control}
                    name="isFree"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 pt-6">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-lesson-free"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">
                          {language === "ar" ? "مجاني" : "Free"}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={lessonForm.control}
                  name="requiresPrevious"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-lesson-requires-previous"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">
                        {language === "ar" ? "يتطلب إكمال الدرس السابق" : "Requires previous lesson completion"}
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={createLessonMutation.isPending || !selectedCourseId}
                  className="w-full"
                  data-testid="button-submit-lesson"
                >
                  {createLessonMutation.isPending
                    ? language === "ar"
                      ? "جاري الإنشاء..."
                      : "Creating..."
                    : language === "ar"
                      ? "إضافة درس"
                      : "Add Lesson"}
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
