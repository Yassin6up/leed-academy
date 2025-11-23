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
import { Plus, Edit, Trash2, Video, FileText, Link as LinkIcon, X } from "lucide-react";
import type { Course, Lesson, SubscriptionPlan, CourseResource } from "@shared/schema";
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
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedResourceCourseId, setSelectedResourceCourseId] = useState<string>("");
  const [createThumbnailFile, setCreateThumbnailFile] = useState<File | null>(null);
  const [createThumbnailPreview, setCreateThumbnailPreview] = useState<string | null>(null);
  const [createUploadProgress, setCreateUploadProgress] = useState<number>(0);
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState<string | null>(null);
  const [editUploadProgress, setEditUploadProgress] = useState<number>(0);
  const [lessonVideoFile, setLessonVideoFile] = useState<File | null>(null);
  const [lessonUploadProgress, setLessonUploadProgress] = useState<number>(0);
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resourceUploadProgress, setResourceUploadProgress] = useState<number>(0);
  const [resourceType, setResourceType] = useState<"file" | "link">("file");
  const [resourceLinkUrl, setResourceLinkUrl] = useState<string>("");
  const [resourceTitleEn, setResourceTitleEn] = useState<string>("");
  const [resourceTitleAr, setResourceTitleAr] = useState<string>("");
  const [resourceDescEn, setResourceDescEn] = useState<string>("");
  const [resourceDescAr, setResourceDescAr] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const resourceFileInputRef = useRef<HTMLInputElement>(null);

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
  });

  const filteredCourses = courses?.filter((course) => {
    const matchSearch = !searchFilter || 
      course.titleEn?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      course.titleAr?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      course.instructorEn?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      course.instructorAr?.toLowerCase().includes(searchFilter.toLowerCase());
    const matchLevel = levelFilter === "all" || course.level.toString() === levelFilter;
    return matchSearch && matchLevel;
  }) || [];

  const { data: lessons } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${selectedCourseId}/lessons`],
    enabled: !!selectedCourseId,
  });

  const { data: resources, refetch: refetchResources } = useQuery<CourseResource[]>({
    queryKey: [`/api/courses/${selectedResourceCourseId}/resources`],
    enabled: !!selectedResourceCourseId,
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
      if (createThumbnailFile) {
        formData.append("thumbnail", createThumbnailFile);
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
          setCreateUploadProgress(progress);
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
      setCreateThumbnailFile(null);
      setCreateThumbnailPreview(null);
      setCreateUploadProgress(0);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.response?.data?.message || error.message || "Failed to create course",
        variant: "destructive",
      });
      setCreateUploadProgress(0);
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
      
      if (editThumbnailFile) {
        formData.append("thumbnail", editThumbnailFile);
      }
      
      const response = await axios.patch(`/api/admin/courses/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: any) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setEditUploadProgress(progress);
        },
      });
      
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description:
          language === "ar"
            ? "تم تحديث الدورة بنجاح"
            : "Course updated successfully",
      });
      setEditDialogOpen(false);
      setEditingCourse(null);
      setEditThumbnailFile(null);
      setEditThumbnailPreview(null);
      setEditUploadProgress(0);
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.response?.data?.message || error.message || "Failed to update course",
        variant: "destructive",
      });
      setEditUploadProgress(0);
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

  const handleCreateThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setCreateThumbnailFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCreateThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setEditThumbnailFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditThumbnailPreview(reader.result as string);
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

  const openResourceDialog = (courseId: string) => {
    setSelectedResourceCourseId(courseId);
    setResourceFile(null);
    setResourceLinkUrl("");
    setResourceTitleEn("");
    setResourceTitleAr("");
    setResourceDescEn("");
    setResourceDescAr("");
    setResourceType("file");
    refetchResources();
    setResourceDialogOpen(true);
  };

  const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: language === "ar" ? "خطأ" : "Error", description: language === "ar" ? "فقط PDF والصور والمستندات مدعومة" : "Only PDF, images, and documents are allowed", variant: "destructive" });
        e.target.value = '';
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast({ title: language === "ar" ? "خطأ" : "Error", description: language === "ar" ? "حجم الملف يجب أن يكون أقل من 100 ميجابايت" : "File size must be less than 100MB", variant: "destructive" });
        e.target.value = '';
        return;
      }
      setResourceFile(file);
    }
  };

  const createResourceMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append("titleEn", data.titleEn);
      formData.append("titleAr", data.titleAr);
      formData.append("descriptionEn", data.descriptionEn);
      formData.append("descriptionAr", data.descriptionAr);
      formData.append("resourceType", data.resourceType);
      if (data.resourceType === "link") {
        formData.append("linkUrl", data.linkUrl);
      } else if (resourceFile) {
        formData.append("file", resourceFile);
      }
      const response = await axios.post(`/api/admin/courses/${selectedResourceCourseId}/resources`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent: any) => {
          setResourceUploadProgress(progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0);
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${selectedResourceCourseId}/resources`] });
      toast({ title: language === "ar" ? "تم الإنشاء" : "Created", description: language === "ar" ? "تم إضافة الموارد بنجاح" : "Resource added successfully" });
      setResourceFile(null);
      setResourceLinkUrl("");
      setResourceTitleEn("");
      setResourceTitleAr("");
      setResourceDescEn("");
      setResourceDescAr("");
      setResourceUploadProgress(0);
      refetchResources();
    },
    onError: (error: any) => {
      toast({ title: language === "ar" ? "خطأ" : "Error", description: error.response?.data?.message || "Failed to add resource", variant: "destructive" });
      setResourceUploadProgress(0);
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      return await apiRequest("DELETE", `/api/admin/course-resources/${resourceId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${selectedResourceCourseId}/resources`] });
      toast({ title: language === "ar" ? "تم الحذف" : "Deleted", description: language === "ar" ? "تم حذف الموارد بنجاح" : "Resource deleted successfully" });
      refetchResources();
    },
  });

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setEditThumbnailFile(null);
    setEditUploadProgress(0);
    setEditThumbnailPreview(course.thumbnailUrl || null);
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
      requiredPlanId: course.requiredPlanId || "none",
      language: course.language || "en",
    });
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
        <Dialog 
          open={dialogOpen} 
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setCreateThumbnailFile(null);
              setCreateThumbnailPreview(null);
              setCreateUploadProgress(0);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
              form.reset();
            }
          }}
        >
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
                      onChange={handleCreateThumbnailChange}
                      ref={fileInputRef}
                      data-testid="input-thumbnail-file"
                      className="flex-1"
                    />
                    {createThumbnailFile && (
                      <Badge variant="secondary">
                        {(createThumbnailFile.size / 1024).toFixed(0)} KB
                      </Badge>
                    )}
                  </div>
                  {createThumbnailPreview && (
                    <div className="mt-2">
                      <img
                        src={createThumbnailPreview}
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

                {createUploadProgress > 0 && createUploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "جاري الرفع..." : "Uploading..."}
                      </span>
                      <span className="font-medium">{createUploadProgress}%</span>
                    </div>
                    <Progress value={createUploadProgress} className="h-2" />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={createCourseMutation.isPending || (createUploadProgress > 0 && createUploadProgress < 100)}
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
          if (!open) {
            setEditThumbnailFile(null);
            setEditThumbnailPreview(null);
            setEditUploadProgress(0);
            setEditingCourse(null);
            form.reset();
            if (editFileInputRef.current) {
              editFileInputRef.current.value = '';
            }
          }
          setEditDialogOpen(open);
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
                    onChange={handleEditThumbnailChange}
                    ref={editFileInputRef}
                    data-testid="input-edit-thumbnail-file"
                    className="flex-1"
                  />
                  {editThumbnailFile && (
                    <Badge variant="secondary">
                      {(editThumbnailFile.size / 1024).toFixed(0)} KB
                    </Badge>
                  )}
                </div>
                {editThumbnailPreview && (
                  <div className="mt-2">
                    <img
                      src={editThumbnailPreview}
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

              {editUploadProgress > 0 && editUploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {language === "ar" ? "جاري الرفع..." : "Uploading..."}
                    </span>
                    <span className="font-medium">{editUploadProgress}%</span>
                  </div>
                  <Progress value={editUploadProgress} className="h-2" />
                </div>
              )}

              <Button
                type="submit"
                disabled={updateCourseMutation.isPending || (editUploadProgress > 0 && editUploadProgress < 100)}
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

      {/* Courses Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder={language === "ar" ? "ابحث عن دورة..." : "Search courses..."}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            data-testid="input-search-courses"
          />
          <select 
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background"
            data-testid="select-level-filter"
          >
            <option value="all">{language === "ar" ? "جميع المستويات" : "All Levels"}</option>
            <option value="1">{language === "ar" ? "المستوى 1" : "Level 1"}</option>
            <option value="2">{language === "ar" ? "المستوى 2" : "Level 2"}</option>
            <option value="3">{language === "ar" ? "المستوى 3" : "Level 3"}</option>
          </select>
          {(searchFilter || levelFilter !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchFilter("");
                setLevelFilter("all");
              }}
              data-testid="button-clear-course-filters"
            >
              {language === "ar" ? "مسح" : "Clear"}
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {language === "ar" ? "النتائج: " : "Results: "} {filteredCourses.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses?.map((course) => (
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
                    onClick={() => openResourceDialog(course.id)}
                    data-testid={`button-resources-${course.id}`}
                  >
                    <FileText className="h-4 w-4" />
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

      {/* Resources Management Dialog */}
      <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === "ar" ? "إدارة الموارد" : "Manage Resources"}
            </DialogTitle>
          </DialogHeader>

          {/* Current Resources */}
          {resources && resources.length > 0 && (
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-lg font-semibold mb-4">{language === "ar" ? "الموارد الحالية" : "Current Resources"}</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 bg-muted rounded-lg" data-testid={`card-admin-resource-${resource.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{language === "ar" ? resource.titleAr : resource.titleEn}</p>
                      <p className="text-xs text-muted-foreground">{resource.fileName}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteResourceMutation.mutate(resource.id)} data-testid={`button-delete-resource-${resource.id}`}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Resource Form */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant={resourceType === "file" ? "default" : "outline"} size="sm" onClick={() => setResourceType("file")} data-testid="button-resource-type-file">
                {language === "ar" ? "ملف" : "File"}
              </Button>
              <Button variant={resourceType === "link" ? "default" : "outline"} size="sm" onClick={() => setResourceType("link")} data-testid="button-resource-type-link">
                {language === "ar" ? "رابط" : "Link"}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resource-title-en" className="text-sm">{language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}</Label>
                <Input id="resource-title-en" value={resourceTitleEn} onChange={(e) => setResourceTitleEn(e.target.value)} placeholder="Resource title" data-testid="input-resource-title-en" />
              </div>
              <div>
                <Label htmlFor="resource-title-ar" className="text-sm">{language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}</Label>
                <Input id="resource-title-ar" value={resourceTitleAr} onChange={(e) => setResourceTitleAr(e.target.value)} placeholder="عنوان الموارد" data-testid="input-resource-title-ar" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resource-desc-en" className="text-sm">{language === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}</Label>
                <Textarea value={resourceDescEn} onChange={(e) => setResourceDescEn(e.target.value)} placeholder="Optional description" className="resize-none" rows={2} data-testid="input-resource-desc-en" />
              </div>
              <div>
                <Label htmlFor="resource-desc-ar" className="text-sm">{language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
                <Textarea value={resourceDescAr} onChange={(e) => setResourceDescAr(e.target.value)} placeholder="وصف اختياري" className="resize-none" rows={2} data-testid="input-resource-desc-ar" />
              </div>
            </div>

            {resourceType === "file" ? (
              <div>
                <Label htmlFor="resource-file" className="text-sm">{language === "ar" ? "اختر ملف" : "Select File"}</Label>
                <Input id="resource-file" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleResourceFileChange} ref={resourceFileInputRef} data-testid="input-resource-file" />
                {resourceFile && <p className="text-xs text-muted-foreground mt-1">{resourceFile.name}</p>}
              </div>
            ) : (
              <div>
                <Label htmlFor="resource-link-url" className="text-sm">{language === "ar" ? "رابط URL" : "Link URL"}</Label>
                <Input id="resource-link-url" value={resourceLinkUrl} onChange={(e) => setResourceLinkUrl(e.target.value)} placeholder="https://example.com" data-testid="input-resource-link-url" />
              </div>
            )}

            {resourceUploadProgress > 0 && resourceUploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>{language === "ar" ? "جاري الرفع..." : "Uploading..."}</span><span>{resourceUploadProgress}%</span></div>
                <Progress value={resourceUploadProgress} className="h-2" />
              </div>
            )}

            <Button onClick={() => createResourceMutation.mutate({ titleEn: resourceTitleEn, titleAr: resourceTitleAr, descriptionEn: resourceDescEn, descriptionAr: resourceDescAr, resourceType, linkUrl: resourceLinkUrl })} disabled={createResourceMutation.isPending || !resourceTitleEn || !resourceTitleAr || (resourceType === "file" && !resourceFile) || (resourceType === "link" && !resourceLinkUrl)} className="w-full" data-testid="button-add-resource">
              {createResourceMutation.isPending ? (language === "ar" ? "جاري الإضافة..." : "Adding...") : (language === "ar" ? "إضافة موارد" : "Add Resource")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
