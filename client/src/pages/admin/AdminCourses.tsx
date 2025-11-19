import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

export default function AdminCourses() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [createThumbnailFile, setCreateThumbnailFile] = useState<File | null>(null);
  const [createThumbnailPreview, setCreateThumbnailPreview] = useState<string | null>(null);
  const [createUploadProgress, setCreateUploadProgress] = useState<number>(0);
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState<string | null>(null);
  const [editUploadProgress, setEditUploadProgress] = useState<number>(0);
  const [lessonVideoFile, setLessonVideoFile] = useState<File | null>(null);
  const [lessonUploadProgress, setLessonUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
      language: "en",
    },
  });

  const lessonFormSchema = insertLessonSchema.extend({
    titleEn: z.string().min(1, "English title is required"),
    titleAr: z.string().min(1, "Arabic title is required"),
  }).omit({ courseId: true, videoUrl: true, videoFilePath: true });

  const lessonForm = useForm({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      duration: 30,
      order: 1,
      requiresPrevious: true,
      isFree: false,
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      
      // Append all form fields
      Object.keys(data).forEach((key) => {
        if (key !== "thumbnail" && data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key].toString());
        }
      });
      
      // Append thumbnail file if selected
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }
      
      // Use axios for upload progress tracking
      const response = await axios.post("/api/admin/courses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: any) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });
      
      return response.data;
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
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setUploadProgress(0);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.response?.data?.message || error.message || "Failed to create course",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const formData = new FormData();
      
      Object.keys(data).forEach((key) => {
        if (key !== "thumbnail" && data[key] !== null && data[key] !== undefined && data[key] !== "") {
          formData.append(key, data[key].toString());
        }
      });
      
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }
      
      const response = await axios.patch(`/api/admin/courses/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: any) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description:
          language === "ar"
            ? "تم تحديث الدورة بنجاح"
            : "Course updated successfully",
      });
      setEditDialogOpen(false);
      setEditingCourse(null);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.response?.data?.message || error.message || "Failed to update course",
        variant: "destructive",
      });
      setUploadProgress(0);
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
      const formData = new FormData();
      
      // Append all form fields
      Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key].toString());
        }
      });
      
      // Append video file if selected
      if (lessonVideoFile) {
        formData.append("video", lessonVideoFile);
      }
      
      // Use axios for upload progress tracking
      const response = await axios.post("/api/admin/lessons", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: any) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setLessonUploadProgress(progress);
        },
      });
      
      return response.data;
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
      setLessonVideoFile(null);
      setLessonUploadProgress(0);
      lessonForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.response?.data?.message || error.message || "Failed to create lesson",
        variant: "destructive",
      });
      setLessonUploadProgress(0);
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

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (images only)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description: language === "ar" ? "يرجى تحميل صورة (JPEG، PNG، أو WebP)" : "Please upload an image (JPEG, PNG, or WebP)",
          variant: "destructive",
        });
        e.target.value = ''; // Reset input
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description: language === "ar" ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" : "Image size must be less than 5MB",
          variant: "destructive",
        });
        e.target.value = ''; // Reset input
        return;
      }
      
      setThumbnailFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: any) => {
    createCourseMutation.mutate({
      ...data,
      level: data.level,
      price: data.price,
      duration: data.duration,
      requiredPlanId: data.requiredPlanId === "none" ? null : data.requiredPlanId,
    });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (videos only)
      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description: language === "ar" ? "يرجى تحميل ملف فيديو (MP4، WebM، أو MOV)" : "Please upload a video file (MP4, WebM, or MOV)",
          variant: "destructive",
        });
        e.target.value = ''; // Reset input
        return;
      }
      
      // Validate file size (2GB max)
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (file.size > maxSize) {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description: language === "ar" ? "حجم الفيديو يجب أن يكون أقل من 2 جيجابايت" : "Video size must be less than 2GB",
          variant: "destructive",
        });
        e.target.value = ''; // Reset input
        return;
      }
      
      setLessonVideoFile(file);
    }
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

    if (!lessonVideoFile) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "يرجى تحميل ملف فيديو" : "Please upload a video file",
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

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setThumbnailFile(null);
    setUploadProgress(0);
    form.reset({
      titleEn: course.titleEn,
      titleAr: course.titleAr,
      descriptionEn: course.descriptionEn || "",
      descriptionAr: course.descriptionAr || "",
      level: course.level.toString(),
      price: course.price || "0",
      isFree: course.isFree || false,
      instructorEn: course.instructorEn || "",
      instructorAr: course.instructorAr || "",
      duration: course.duration?.toString() || "8",
      thumbnailUrl: course.thumbnailUrl || "",
      requiredPlanId: course.requiredPlanId || "none",
      language: course.language || "en",
    });
    setThumbnailPreview(course.thumbnailUrl || null);
    setEditDialogOpen(true);
  };

  const onEditSubmit = (data: any) => {
    if (!editingCourse) return;
    
    updateCourseMutation.mutate({
      id: editingCourse.id,
      data: {
        ...data,
        level: data.level,
        price: data.price,
        duration: data.duration,
        requiredPlanId: data.requiredPlanId === "none" ? null : data.requiredPlanId,
      },
    });
  };

  // Update default order when lessons change
  useEffect(() => {
    if (lessons && lessonDialogOpen) {
      const nextOrder = (lessons.length || 0) + 1;
      lessonForm.setValue("order", nextOrder);
    }
  }, [lessons, lessonDialogOpen, lessonForm]);

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

                <div className="grid grid-cols-4 gap-4">
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
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Language</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-language">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ar">Arabic</SelectItem>
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

                <div className="space-y-2">
                  <Label htmlFor="thumbnail-upload">
                    {language === "ar" ? "صورة الدورة المصغرة" : "Course Thumbnail"}
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="thumbnail-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      ref={fileInputRef}
                      data-testid="input-thumbnail-file"
                      className="flex-1"
                    />
                    {thumbnailFile && (
                      <Badge variant="secondary">
                        {(thumbnailFile.size / 1024).toFixed(0)} KB
                      </Badge>
                    )}
                  </div>
                  {thumbnailPreview && (
                    <div className="mt-2">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {language === "ar"
                      ? "PNG، JPEG، أو WebP (حجم أقصى 5 ميجابايت)"
                      : "PNG, JPEG, or WebP (max 5MB)"}
                  </p>
                </div>

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

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "جاري الرفع..." : "Uploading..."}
                      </span>
                      <span className="font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={createCourseMutation.isPending || (uploadProgress > 0 && uploadProgress < 100)}
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

      {/* Edit Course Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setThumbnailFile(null);
            setThumbnailPreview(null);
            setUploadProgress(0);
            setEditingCourse(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === "ar" ? "تعديل الدورة" : "Edit Course"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="titleEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (English)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-title-en" />
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
                        <Input {...field} data-testid="input-edit-title-ar" />
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
                        <Textarea {...field} data-testid="input-edit-desc-en" />
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
                        <Textarea {...field} data-testid="input-edit-desc-ar" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-level">
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
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
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
                          data-testid="input-edit-price"
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
                          data-testid="input-edit-duration"
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
                        <Input {...field} data-testid="input-edit-instructor-en" />
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
                        <Input {...field} data-testid="input-edit-instructor-ar" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-thumbnail-upload">
                  {language === "ar" ? "صورة الدورة المصغرة" : "Course Thumbnail"}
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="edit-thumbnail-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    data-testid="input-edit-thumbnail-file"
                    className="flex-1"
                  />
                  {thumbnailFile && (
                    <Badge variant="secondary">
                      {(thumbnailFile.size / 1024).toFixed(0)} KB
                    </Badge>
                  )}
                </div>
                {thumbnailPreview && (
                  <div className="mt-2">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {language === "ar"
                    ? "PNG، JPEG، أو WebP (حجم أقصى 5 ميجابايت)"
                    : "PNG, JPEG, or WebP (max 5MB)"}
                </p>
              </div>

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
                        <SelectTrigger data-testid="select-edit-required-plan">
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
                        data-testid="switch-edit-is-free"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {language === "ar" ? "جاري الرفع..." : "Uploading..."}
                    </span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <Button
                type="submit"
                disabled={updateCourseMutation.isPending || (uploadProgress > 0 && uploadProgress < 100)}
                className="w-full"
                data-testid="button-submit-edit-course"
              >
                {updateCourseMutation.isPending
                  ? language === "ar"
                    ? "جاري التحديث..."
                    : "Updating..."
                  : language === "ar"
                    ? "تحديث"
                    : "Update"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
                    onClick={() => openEditDialog(course)}
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

                <div className="space-y-2">
                  <Label htmlFor="lesson-video-upload">
                    {language === "ar" ? "ملف الفيديو" : "Lesson Video"}
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="lesson-video-upload"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      ref={videoInputRef}
                      data-testid="input-lesson-video-file"
                      className="flex-1"
                    />
                    {lessonVideoFile && (
                      <Badge variant="secondary">
                        {(lessonVideoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </Badge>
                    )}
                  </div>
                  {lessonVideoFile && (
                    <p className="text-xs text-muted-foreground">
                      {lessonVideoFile.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {language === "ar"
                      ? "MP4، WebM، أو MOV (حجم أقصى 2 جيجابايت)"
                      : "MP4, WebM, or MOV (max 2GB)"}
                  </p>
                </div>

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
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                            value={field.value}
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
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            value={field.value}
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

                {lessonUploadProgress > 0 && lessonUploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "جاري رفع الفيديو..." : "Uploading video..."}
                      </span>
                      <span className="font-medium">{lessonUploadProgress}%</span>
                    </div>
                    <Progress value={lessonUploadProgress} className="h-2" />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={createLessonMutation.isPending || !selectedCourseId || (lessonUploadProgress > 0 && lessonUploadProgress < 100)}
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
