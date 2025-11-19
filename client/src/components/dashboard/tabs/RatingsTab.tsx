import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Star, Send } from "lucide-react";
import type { Testimonial } from "@shared/schema";

export default function Ratings() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");

  const { data: myReviews } = useQuery<Testimonial[]>({
    queryKey: ["/api/user/reviews"],
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; content: string }) => {
      return await apiRequest("POST", "/api/user/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      setReview("");
      setRating(5);
      toast({
        title: language === "ar" ? "شكراً لك!" : "Thank you!",
        description: language === "ar" ? "تم إرسال تقييمك بنجاح" : "Your review has been submitted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || (language === "ar" ? "فشل في إرسال التقييم" : "Failed to submit review"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!review.trim()) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "الرجاء كتابة تقييمك" : "Please write your review",
        variant: "destructive",
      });
      return;
    }

    submitReviewMutation.mutate({ rating, content: review });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="text-ratings-title">
          {language === "ar" ? "التقييمات" : "Ratings & Reviews"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === "ar"
            ? "شاركنا رأيك في تجربتك التعليمية"
            : "Share your experience with your learning journey"}
        </p>
      </div>

      {/* Submit Review Card */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "ar" ? "اكتب تقييمك" : "Write a Review"}</CardTitle>
          <CardDescription>
            {language === "ar"
              ? "مرحباً بك في ترك رأيك من أجل مساعدة أخرين في اتخاذ القرار."
              : "Help others by sharing your experience with our platform"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {language === "ar" ? "التقييم" : "Rating"}
              </label>
              <div className="flex gap-1" data-testid="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110 active:scale-95"
                    data-testid={`star-${star}`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {rating === 5 && (language === "ar" ? "ممتاز!" : "Excellent!")}
                {rating === 4 && (language === "ar" ? "جيد جداً" : "Very Good")}
                {rating === 3 && (language === "ar" ? "جيد" : "Good")}
                {rating === 2 && (language === "ar" ? "متوسط" : "Fair")}
                {rating === 1 && (language === "ar" ? "ضعيف" : "Poor")}
              </p>
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <label htmlFor="review" className="text-sm font-medium text-foreground">
                {language === "ar" ? "تقييمك" : "Your Review"}
              </label>
              <Textarea
                id="review"
                placeholder={
                  language === "ar"
                    ? "اكتب تجربتك مع المنصة والدورات..."
                    : "Share your experience with the platform and courses..."
                }
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={5}
                data-testid="textarea-review"
              />
              <p className="text-xs text-muted-foreground">
                {language === "ar"
                  ? "سيتم مراجعة تقييمك قبل نشره"
                  : "Your review will be reviewed before being published"}
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitReviewMutation.isPending}
              className="w-full md:w-auto"
              data-testid="button-submit-review"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitReviewMutation.isPending
                ? (language === "ar" ? "جاري الإرسال..." : "Submitting...")
                : (language === "ar" ? "إرسال التقييم" : "Submit Review")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Reviews */}
      {myReviews && myReviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-foreground">
            {language === "ar" ? "تقييماتي" : "My Reviews"}
          </h2>
          {myReviews.map((review) => (
            <Card key={review.id} data-testid={`review-${review.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground">
                  {language === "ar" ? review.contentAr : review.contentEn}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <span>{new Date(review.createdAt!).toLocaleDateString()}</span>
                  {review.isActive ? (
                    <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                      {language === "ar" ? "منشور" : "Published"}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
                      {language === "ar" ? "قيد المراجعة" : "Under Review"}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
