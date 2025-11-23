import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Star, X } from "lucide-react";
import type { SubscriptionPlan } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminPricing() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  
  // Form fields
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [price, setPrice] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [isPopular, setIsPopular] = useState(false);
  const [featureEnInput, setFeatureEnInput] = useState("");
  const [featureArInput, setFeatureArInput] = useState("");
  const [featuresEn, setFeaturesEn] = useState<string[]>([]);
  const [featuresAr, setFeaturesAr] = useState<string[]>([]);

  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const createPlanMutation = useMutation({
    mutationFn: async () => {
      if (!nameEn || !nameAr || !price || !durationDays) {
        throw new Error("Please fill in all required fields");
      }
      return await apiRequest("POST", "/api/admin/subscription-plans", {
        nameEn,
        nameAr,
        descriptionEn,
        descriptionAr,
        price: parseFloat(price),
        durationDays: parseInt(durationDays),
        featuresEn,
        featuresAr,
        isPopular,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-plans"] });
      toast({
        title: language === "ar" ? "تم الإنشاء" : "Created",
        description: language === "ar" ? "تم إنشاء خطة الاشتراك بنجاح" : "Plan created successfully",
      });
      resetForm();
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.response?.data?.message || error.message || "Failed to create plan",
        variant: "destructive",
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async () => {
      if (!editingPlan) throw new Error("No plan selected");
      if (!nameEn || !nameAr || !price || !durationDays) {
        throw new Error("Please fill in all required fields");
      }
      return await apiRequest("PATCH", `/api/admin/subscription-plans/${editingPlan.id}`, {
        nameEn,
        nameAr,
        descriptionEn,
        descriptionAr,
        price: parseFloat(price),
        durationDays: parseInt(durationDays),
        featuresEn,
        featuresAr,
        isPopular,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-plans"] });
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description: language === "ar" ? "تم تحديث الخطة بنجاح" : "Plan updated successfully",
      });
      resetForm();
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.response?.data?.message || error.message || "Failed to update plan",
        variant: "destructive",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      return await apiRequest("DELETE", `/api/admin/subscription-plans/${planId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-plans"] });
      toast({
        title: language === "ar" ? "تم الحذف" : "Deleted",
        description: language === "ar" ? "تم حذف الخطة بنجاح" : "Plan deleted successfully",
      });
    },
  });

  const resetForm = () => {
    setNameEn("");
    setNameAr("");
    setDescriptionEn("");
    setDescriptionAr("");
    setPrice("");
    setDurationDays("30");
    setIsPopular(false);
    setFeaturesEn([]);
    setFeaturesAr([]);
    setFeatureEnInput("");
    setFeatureArInput("");
    setEditingPlan(null);
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setNameEn(plan.nameEn);
    setNameAr(plan.nameAr);
    setDescriptionEn(plan.descriptionEn || "");
    setDescriptionAr(plan.descriptionAr || "");
    setPrice(plan.price.toString());
    setDurationDays(plan.durationDays.toString());
    setFeaturesEn(plan.featuresEn || []);
    setFeaturesAr(plan.featuresAr || []);
    setIsPopular(plan.isPopular || false);
    setDialogOpen(true);
  };

  const addFeatureEn = () => {
    if (featureEnInput.trim()) {
      setFeaturesEn([...featuresEn, featureEnInput.trim()]);
      setFeatureEnInput("");
    }
  };

  const addFeatureAr = () => {
    if (featureArInput.trim()) {
      setFeaturesAr([...featuresAr, featureArInput.trim()]);
      setFeatureArInput("");
    }
  };

  const removeFeatureEn = (index: number) => {
    setFeaturesEn(featuresEn.filter((_, i) => i !== index));
  };

  const removeFeatureAr = (index: number) => {
    setFeaturesAr(featuresAr.filter((_, i) => i !== index));
  };

  const closeDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="text-admin-pricing-title">
          {language === "ar" ? "إدارة خطط الاشتراك" : "Manage Subscription Plans"}
        </h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (open) resetForm(); setDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-plan" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {language === "ar" ? "إنشاء خطة" : "Create Plan"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan
                  ? language === "ar"
                    ? "تحرير الخطة"
                    : "Edit Plan"
                  : language === "ar"
                  ? "إنشاء خطة جديدة"
                  : "Create New Plan"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name (English)</label>
                  <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="e.g., Starter" data-testid="input-name-en" />
                </div>
                <div>
                  <label className="text-sm font-medium">Name (Arabic)</label>
                  <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="مثال: أساسي" data-testid="input-name-ar" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price ($)</label>
                  <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} data-testid="input-price" />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (days)</label>
                  <Input type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} data-testid="input-duration" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Description (English)</label>
                  <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} data-testid="input-desc-en" />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Arabic)</label>
                  <Textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} data-testid="input-desc-ar" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">{language === "ar" ? "المميزات (إنجليزي)" : "Features (English)"}</label>
                <div className="flex gap-2">
                  <Input value={featureEnInput} onChange={(e) => setFeatureEnInput(e.target.value)} placeholder="Add a feature" data-testid="input-feature-en" />
                  <Button onClick={addFeatureEn} size="sm" data-testid="button-add-feature-en">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {featuresEn.map((feature, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1" data-testid={`badge-feature-en-${i}`}>
                      {feature}
                      <button onClick={() => removeFeatureEn(i)} className="ml-1 hover:opacity-70">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">{language === "ar" ? "المميزات (عربي)" : "Features (Arabic)"}</label>
                <div className="flex gap-2">
                  <Input value={featureArInput} onChange={(e) => setFeatureArInput(e.target.value)} placeholder="أضف ميزة" data-testid="input-feature-ar" />
                  <Button onClick={addFeatureAr} size="sm" data-testid="button-add-feature-ar">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {featuresAr.map((feature, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1" data-testid={`badge-feature-ar-${i}`}>
                      {feature}
                      <button onClick={() => removeFeatureAr(i)} className="ml-1 hover:opacity-70">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} data-testid="input-is-popular" className="w-4 h-4" />
                <span className="text-sm font-medium">{language === "ar" ? "خطة شهيرة" : "Mark as popular"}</span>
              </label>

              <div className="flex gap-2">
                <Button onClick={() => (editingPlan ? updatePlanMutation.mutate() : createPlanMutation.mutate())} className="flex-1" disabled={createPlanMutation.isPending || updatePlanMutation.isPending} data-testid="button-save-plan">
                  {createPlanMutation.isPending || updatePlanMutation.isPending ? language === "ar" ? "جاري الحفظ..." : "Saving..." : language === "ar" ? "حفظ" : "Save"}
                </Button>
                <Button onClick={closeDialog} variant="outline" data-testid="button-cancel-plan">
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <Card key={plan.id} className="hover-elevate transition-all relative" data-testid={`card-plan-${plan.id}`}>
            {plan.isPopular && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-primary-foreground flex gap-1" data-testid={`badge-popular-${plan.id}`}>
                  <Star className="h-3 w-3" />
                  {language === "ar" ? "شهير" : "Popular"}
                </Badge>
              </div>
            )}
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">{language === "ar" ? plan.nameAr : plan.nameEn}</CardTitle>
              <p className="text-sm text-muted-foreground">{language === "ar" ? plan.descriptionAr : plan.descriptionEn}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-foreground">
                  ${plan.price}
                  <span className="text-sm text-muted-foreground font-normal">
                    {" "}
                    {language === "ar" ? "لمدة" : "for"} {plan.durationDays}{" "}
                    {language === "ar" ? "يوم" : "days"}
                  </span>
                </div>
              </div>

              {(plan.featuresEn?.length || 0) > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{language === "ar" ? "المميزات" : "Features"}</p>
                  <div className="flex flex-wrap gap-1">
                    {(language === "ar" ? plan.featuresAr : plan.featuresEn)?.map((feature, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(plan)} className="flex-1" data-testid={`button-edit-plan-${plan.id}`}>
                  <Edit className="h-4 w-4 mr-1" />
                  {language === "ar" ? "تحرير" : "Edit"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => deletePlanMutation.mutate(plan.id)} className="flex-1" data-testid={`button-delete-plan-${plan.id}`}>
                  <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                  {language === "ar" ? "حذف" : "Delete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans?.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {language === "ar" ? "لا توجد خطط اشتراك" : "No subscription plans yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
