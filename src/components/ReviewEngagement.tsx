import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface ReviewEngagementProps {
  slug: string;
  pageType: "destination" | "ai-review";
}

const SESSION_KEY = "rtg-session-id";

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

const ReviewEngagement = ({ slug, pageType }: ReviewEngagementProps) => {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sessionId = getSessionId();

  // Track view + fetch counts
  useEffect(() => {
    if (!slug) return;

    // Track view (fire & forget)
    supabase.functions.invoke("track-review-view", { body: { slug } }).catch(() => {});

    // Fetch view count
    supabase
      .from("review_views")
      .select("view_count")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setViewCount(data.view_count);
      });

    // Fetch reactions summary
    supabase
      .from("review_reactions")
      .select("reaction")
      .eq("slug", slug)
      .then(({ data }) => {
        if (data) {
          setHelpfulCount(data.filter((r: any) => r.reaction === "helpful").length);
        }
      });

    // Check if user already reacted
    supabase
      .from("review_reactions")
      .select("reaction")
      .eq("slug", slug)
      .eq("session_id", sessionId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setUserReaction(data.reaction);
      });
  }, [slug, sessionId]);

  const handleReaction = async (reaction: "helpful" | "not_helpful") => {
    if (submitting || userReaction) return;
    setSubmitting(true);

    // Use edge function to insert (no public write policy)
    const { error } = await supabase.functions.invoke("track-review-view", {
      body: { slug, reaction, session_id: sessionId, action: "react" },
    });

    if (!error) {
      setUserReaction(reaction);
      if (reaction === "helpful") setHelpfulCount((c) => c + 1);
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
      {/* View count */}
      {viewCount !== null && viewCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span>{viewCount.toLocaleString()} travelers viewed this review</span>
        </div>
      )}

      {/* Helpful widget */}
      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium text-foreground mb-3">Was this review helpful?</p>
        <div className="flex items-center gap-3">
          <Button
            variant={userReaction === "helpful" ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => handleReaction("helpful")}
            disabled={!!userReaction || submitting}
          >
            <ThumbsUp className="h-4 w-4" />
            Helpful
          </Button>
          <Button
            variant={userReaction === "not_helpful" ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => handleReaction("not_helpful")}
            disabled={!!userReaction || submitting}
          >
            <ThumbsDown className="h-4 w-4" />
            Not Helpful
          </Button>
          {helpfulCount > 0 && (
            <span className="text-xs text-muted-foreground ml-2">
              {helpfulCount} {helpfulCount === 1 ? "traveler" : "travelers"} found this helpful
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewEngagement;
