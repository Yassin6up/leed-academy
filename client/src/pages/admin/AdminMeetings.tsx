import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Video, Calendar, Clock } from "lucide-react";
import type { Meeting, Course } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminMeetings() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const { data: meetings, isLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/admin/meetings"],
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
  });

  const form = useForm({
    defaultValues: {
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      scheduledAt: "",
      zoomLink: "",
      duration: 60,
      isPaidOnly: true,
      courseId: "none",
    },
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/meetings", {
        ...data,
        duration: typeof data.duration === 'number' ? data.duration : parseInt(data.duration),
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        courseId: data.courseId === "none" ? null : data.courseId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/meetings"] });
      toast({
        title: language === "ar" ? "تم الإنشاء" : "Created",
        description:
          language === "ar"
            ? "تم إنشاء الاجتماع بنجاح"
            : "Meeting created successfully",
      });
      setDialogOpen(false);
      setEditingMeeting(null);
      form.reset();
    },
  });

  const updateMeetingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/admin/meetings/${id}`, {
        ...data,
        duration: typeof data.duration === 'number' ? data.duration : parseInt(data.duration),
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        courseId: data.courseId === "none" ? null : data.courseId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/meetings"] });
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description:
          language === "ar"
            ? "تم تحديث الاجتماع بنجاح"
            : "Meeting updated successfully",
      });
      setDialogOpen(false);
      setEditingMeeting(null);
      form.reset();
    },
  });

  const deleteMeetingMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      return await apiRequest("DELETE", `/api/admin/meetings/${meetingId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/meetings"] });
      toast({
        title: language === "ar" ? "تم الحذف" : "Deleted",
        description:
          language === "ar"
            ? "تم حذف الاجتماع بنجاح"
            : "Meeting deleted successfully",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (editingMeeting) {
      updateMeetingMutation.mutate({ id: editingMeeting.id, data });
    } else {
      createMeetingMutation.mutate(data);
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    const scheduledDate = new Date(meeting.scheduledAt);
    const localDateTime = new Date(scheduledDate.getTime() - scheduledDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    
    form.reset({
      titleEn: meeting.titleEn,
      titleAr: meeting.titleAr,
      descriptionEn: meeting.descriptionEn || "",
      descriptionAr: meeting.descriptionAr || "",
      scheduledAt: localDateTime,
      zoomLink: meeting.zoomLink,
      duration: meeting.duration,
      isPaidOnly: meeting.isPaidOnly ?? true,
      courseId: meeting.courseId || "none",
    });
    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingMeeting(null);
      form.reset();
    }
  };

  // Sort meetings by date (upcoming first, then past)
  const sortedMeetings = meetings?.sort((a, b) => {
    const dateA = new Date(a.scheduledAt).getTime();
    const dateB = new Date(b.scheduledAt).getTime();
    return dateB - dateA; // Most recent first
  }) || [];

  const now = new Date();
  const upcomingMeetings = sortedMeetings.filter(m => new Date(m.scheduledAt) > now);
  const pastMeetings = sortedMeetings.filter(m => new Date(m.scheduledAt) <= now);

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
          data-testid="text-admin-meetings-title"
        >
          {language === "ar" ? "إدارة اجتماعات Zoom" : "Zoom Meetings Management"}
        </h1>
        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-meeting">
              <Plus className="h-4 w-4 mr-2" />
              {language === "ar" ? "إنشاء اجتماع" : "Create Meeting"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMeeting
                  ? language === "ar"
                    ? "تعديل الاجتماع"
                    : "Edit Meeting"
                  : language === "ar"
                    ? "إنشاء اجتماع جديد"
                    : "Create New Meeting"}
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
                        <FormLabel>
                          {language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Monthly Trading Strategy Session"
                            data-testid="input-title-en"
                          />
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
                        <FormLabel>
                          {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="جلسة استراتيجية التداول الشهرية"
                            data-testid="input-title-ar"
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
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Learn about..."
                            data-testid="input-description-en"
                          />
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
                        <FormLabel>
                          {language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="تعلم عن..."
                            data-testid="input-description-ar"
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
                    name="scheduledAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === "ar" ? "التاريخ والوقت" : "Date & Time"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="datetime-local"
                            data-testid="input-scheduled-at"
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
                        <FormLabel>
                          {language === "ar" ? "المدة (دقائق)" : "Duration (minutes)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="15"
                            step="15"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            data-testid="input-duration"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="zoomLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === "ar" ? "رابط Zoom" : "Zoom Link"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://zoom.us/j/123456789"
                          data-testid="input-zoom-link"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === "ar" ? "ربط بدورة (اختياري)" : "Link to Course (Optional)"}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-course">
                            <SelectValue placeholder={language === "ar" ? "اختر دورة" : "Select a course"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            {language === "ar" ? "بدون ربط" : "No link"}
                          </SelectItem>
                          {courses?.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {language === "ar" ? course.titleAr : course.titleEn}
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
                  name="isPaidOnly"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {language === "ar" ? "للمشتركين فقط" : "Paid Subscribers Only"}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {language === "ar"
                            ? "يتطلب اشتراكاً نشطاً للوصول"
                            : "Requires active subscription to access"}
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-paid-only"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogChange(false)}
                    data-testid="button-cancel"
                  >
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMeetingMutation.isPending || updateMeetingMutation.isPending}
                    data-testid="button-submit"
                  >
                    {editingMeeting
                      ? language === "ar"
                        ? "تحديث"
                        : "Update"
                      : language === "ar"
                        ? "إنشاء"
                        : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Meetings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {language === "ar" ? "الاجتماعات القادمة" : "Upcoming Meetings"}
            <Badge variant="secondary">{upcomingMeetings.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingMeetings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {language === "ar"
                ? "لا توجد اجتماعات قادمة"
                : "No upcoming meetings"}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "ar" ? "العنوان" : "Title"}</TableHead>
                  <TableHead>{language === "ar" ? "التاريخ والوقت" : "Date & Time"}</TableHead>
                  <TableHead>{language === "ar" ? "المدة" : "Duration"}</TableHead>
                  <TableHead>{language === "ar" ? "الوصول" : "Access"}</TableHead>
                  <TableHead>{language === "ar" ? "رابط Zoom" : "Zoom Link"}</TableHead>
                  <TableHead>{language === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingMeetings.map((meeting) => (
                  <TableRow key={meeting.id} data-testid={`row-meeting-${meeting.id}`}>
                    <TableCell className="font-medium">
                      {language === "ar" ? meeting.titleAr : meeting.titleEn}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(meeting.scheduledAt).toLocaleString(
                          language === "ar" ? "ar-SA" : "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {meeting.duration} {language === "ar" ? "دقيقة" : "min"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={meeting.isPaidOnly ? "default" : "secondary"}>
                        {meeting.isPaidOnly
                          ? language === "ar"
                            ? "مدفوع"
                            : "Paid"
                          : language === "ar"
                            ? "مجاني"
                            : "Free"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <a
                        href={meeting.zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <Video className="h-4 w-4" />
                        {language === "ar" ? "فتح" : "Open"}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(meeting)}
                          data-testid={`button-edit-${meeting.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMeetingMutation.mutate(meeting.id)}
                          data-testid={`button-delete-${meeting.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Past Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {language === "ar" ? "الاجتماعات السابقة" : "Past Meetings"}
            <Badge variant="outline">{pastMeetings.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastMeetings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {language === "ar"
                ? "لا توجد اجتماعات سابقة"
                : "No past meetings"}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "ar" ? "العنوان" : "Title"}</TableHead>
                  <TableHead>{language === "ar" ? "التاريخ والوقت" : "Date & Time"}</TableHead>
                  <TableHead>{language === "ar" ? "المدة" : "Duration"}</TableHead>
                  <TableHead>{language === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastMeetings.slice(0, 10).map((meeting) => (
                  <TableRow key={meeting.id} className="opacity-60">
                    <TableCell className="font-medium">
                      {language === "ar" ? meeting.titleAr : meeting.titleEn}
                    </TableCell>
                    <TableCell>
                      {new Date(meeting.scheduledAt).toLocaleString(
                        language === "ar" ? "ar-SA" : "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </TableCell>
                    <TableCell>
                      {meeting.duration} {language === "ar" ? "دقيقة" : "min"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMeetingMutation.mutate(meeting.id)}
                        data-testid={`button-delete-${meeting.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
