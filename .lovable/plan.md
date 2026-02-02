

## Two Changes: New Hero Image + Comment Counts on Preview Cards

---

### Part 1: Replace Hero Image

**What**: Swap the current hero image with the new one you uploaded (with the darker navy blue font)

**How**: Copy the uploaded image to `src/assets/` and update the import in `HeroSection.tsx`. The current `<img>` implementation with `w-full h-auto` will display it exactly the same way - full width, no cropping.

**Files Changed**:
- Copy `user-uploads://image_1.jpg` to `src/assets/hero-tripreviews.jpg` (replacing existing)
- No code changes needed - same import path

---

### Part 2: Add Comment Counts to Preview Cards

**What**: Display a comment bubble icon with the count on each destination, gear, and compass preview card on the homepage. Static count fetched once on page load (no live updates).

**How**:

1. **Create a shared hook** (`src/hooks/useCommentCounts.ts`) that:
   - Fetches all visible comment counts grouped by `page_slug` and `page_type`
   - Returns a lookup map for instant access: `{ "cuba-vila-gale": 12, "vegas-bellagio": 45 }`
   - Uses React Query with a single database call

2. **Update each section** to display the count:
   - `TravelStoriesSection.tsx` - destinations (page_type: "destination")
   - `GearReviewsSection.tsx` - gear reviews (page_type: "gear")  
   - `CompassSection.tsx` - compass articles (page_type: "compass")

3. **UI Design**: Small badge with `MessageCircle` icon + count number, positioned on the card (likely bottom corner or near the "Read More" link)

---

### Technical Details

**New Hook: `src/hooks/useCommentCounts.ts`**

```tsx
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

type PageType = "destination" | "gear" | "compass";

export function useCommentCounts(pageType: PageType, slugs: string[]) {
  return useQuery({
    queryKey: ["comment-counts", pageType, slugs],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("page_slug")
        .eq("page_type", pageType)
        .eq("is_hidden", false)
        .in("page_slug", slugs);

      if (error) throw error;

      // Count occurrences per slug
      const counts: Record<string, number> = {};
      slugs.forEach(slug => counts[slug] = 0);
      data?.forEach(row => {
        counts[row.page_slug] = (counts[row.page_slug] || 0) + 1;
      });
      return counts;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
```

**Card UI Update Example** (same pattern for all three sections):

```tsx
import { MessageCircle } from "lucide-react";

// Inside the card, near rating or date:
<div className="flex items-center gap-1 text-muted-foreground text-xs">
  <MessageCircle className="h-3.5 w-3.5" />
  <span>{commentCounts[dest.slug] || 0}</span>
</div>
```

---

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/assets/hero-tripreviews.jpg` | Replace with new image |
| `src/hooks/useCommentCounts.ts` | Create new shared hook |
| `src/components/TravelStoriesSection.tsx` | Add comment count display |
| `src/components/GearReviewsSection.tsx` | Add comment count display |
| `src/components/CompassSection.tsx` | Add comment count display |

---

### Result

- **Hero**: New image with darker navy fonts displays exactly as current (full width, no cropping)
- **Cards**: Each preview card shows a chat bubble + number (e.g., "💬 12") so visitors see engagement at a glance
- **Performance**: Single database query per section, cached for 5 minutes, no live updates

