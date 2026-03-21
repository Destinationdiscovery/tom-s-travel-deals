import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import AIReviewResult from "@/components/AIReviewResult";
import ComparisonFloatingBadge from "@/components/ComparisonFloatingBadge";
import Footer from "@/components/Footer";
import ReviewEngagement from "@/components/ReviewEngagement";
import type { CachedReview } from "@/hooks/useGenerateReview";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviewHistory } from "@/hooks/useReviewHistory";
import SEOHead from "@/components/SEOHead";

const AIReview = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<CachedReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [affiliateUrl, setAffiliateUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const toTitleCase = (s: string) =>
      s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const fetchReview = async () => {
      setLoading(true);
      setError(null);

      // 1. Try cache first
      const { data, error: dbError } = await supabase
        .from("cached_reviews")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (dbError) {
        setError("Could not load this review.");
        console.error(dbError);
        setLoading(false);
        return;
      }

      let reviewData = data;

      // 2. If not cached, auto-generate from slug
      if (!reviewData) {
        const propertyName = toTitleCase(slug);
        const { data: genData, error: genError } = await supabase.functions.invoke(
          "generate-review",
          { body: { propertyName } }
        );

        if (genError || genData?.error || !genData?.review) {
          setError(genData?.error || "Could not generate this review. Please try again.");
          console.error("Auto-generate failed:", genError || genData?.error);
          setLoading(false);
          return;
        }
        reviewData = genData.review;
      }

      // 3. Set review state
      setReview({
        id: reviewData.id,
        property_name: reviewData.property_name,
        slug: reviewData.slug,
        location: reviewData.location,
        property_type: reviewData.property_type,
        review_data: reviewData.review_data as unknown as CachedReview["review_data"],
        created_at: reviewData.created_at,
      });

      // Look up featured_reviews for affiliate URL
      const { data: featured } = await supabase
        .from("featured_reviews")
        .select("affiliate_url")
        .eq("slug", reviewData.slug)
        .maybeSingle();
      if (featured?.affiliate_url) {
        setAffiliateUrl(featured.affiliate_url);
      }

      setLoading(false);
    };

    fetchReview();
  }, [slug]);

  // Track review history for logged-in users
  useReviewHistory(review?.slug, review?.property_name, review?.location);

  useEffect(() => {
    if (review) {
      document.title = `${review.property_name}${review.location ? `, ${review.location}` : ""} - ReviewThenGo`;
    }
    return () => { document.title = "ReviewThenGo | The All-in-One Travel Planning Tool"; };
  }, [review]);
  const handleNewReview = () => {
    navigate("/");
  };

  const seoFaq = review ? [
    { question: `Is ${review.property_name} worth it?`, answer: (review.review_data as any)?.summary || `Read our aggregated review of ${review.property_name} on ReviewThenGo.` },
    { question: `What do travelers say about ${review.property_name}?`, answer: `Travelers rate ${review.property_name} ${(review.review_data as any)?.overallRating || "N/A"}/5 overall. ${(review.review_data as any)?.summary || ""}` },
    { question: `What is the rating for ${review.property_name}?`, answer: `${review.property_name} receives ${(review.review_data as any)?.overallRating || "N/A"}/5 based on aggregated real traveler reviews.` },
  ] : undefined;

  const seoRating = review ? {
    ratingValue: (review.review_data as any)?.overallRating || 0,
    reviewCount: Object.keys((review.review_data as any)?.ratings || {}).length || 1,
    itemReviewed: { type: "Hotel", name: review.property_name },
  } : undefined;

  return (
    <div className="min-h-screen bg-background">
      {review && (
        <SEOHead
          title={`${review.property_name} Real Reviews 2026`}
          description={(review.review_data as any)?.summary || `Honest aggregated review of ${review.property_name}`}
          url={`/review/${review.slug}`}
          type="article"
          breadcrumbs={[
            { name: "Home", url: "/" },
            { name: "Reviews", url: "/destinations" },
            { name: review.property_name, url: `/review/${review.slug}` },
          ]}
          faq={seoFaq}
          aggregateRating={seoRating}
        />
      )}
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 mt-4">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </button>
        </div>
        {loading ? (
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto space-y-8">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                  <Skeleton className="h-40 w-full rounded-2xl" />
                  <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <AIReviewResult
              review={review}
              isLoading={false}
              error={error}
              onNewReview={handleNewReview}
              affiliateUrl={affiliateUrl ?? undefined}
            />
            {slug && (
              <div className="container mx-auto px-4 py-8 max-w-6xl">
                <ReviewEngagement slug={slug} pageType="ai-review" />
              </div>
            )}
          </>
        )}
      </main>
      <ComparisonFloatingBadge />
      <Footer />
    </div>
  );
};

export default AIReview;
