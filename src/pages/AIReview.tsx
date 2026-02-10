import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import AIReviewResult from "@/components/AIReviewResult";
import ComparisonFloatingBadge from "@/components/ComparisonFloatingBadge";
import Footer from "@/components/Footer";
import type { CachedReview } from "@/hooks/useGenerateReview";
import { Skeleton } from "@/components/ui/skeleton";

const AIReview = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<CachedReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchReview = async () => {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .from("cached_reviews")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (dbError) {
        setError("Could not load this review.");
        console.error(dbError);
      } else if (!data) {
        setError("Review not found.");
      } else {
        setReview({
          id: data.id,
          property_name: data.property_name,
          slug: data.slug,
          location: data.location,
          property_type: data.property_type,
          review_data: data.review_data as unknown as CachedReview["review_data"],
          created_at: data.created_at,
        });
      }
      setLoading(false);
    };

    fetchReview();
  }, [slug]);

  useEffect(() => {
    if (review) {
      document.title = `${review.property_name}${review.location ? `, ${review.location}` : ""} - ReviewThenGo`;
    }
    return () => { document.title = "ReviewThenGo.com | Honest Reviews, Tested Gear & Travel Insights"; };
  }, [review]);
  const handleNewReview = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
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
          <AIReviewResult
            review={review}
            isLoading={false}
            error={error}
            onNewReview={handleNewReview}
          />
        )}
      </main>
      <ComparisonFloatingBadge />
      <Footer />
    </div>
  );
};

export default AIReview;
