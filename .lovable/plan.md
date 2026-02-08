

## Update Review Label to Reflect Real Sources

A small but meaningful copy change to the review header so visitors understand these reviews are sourced from real traveler experiences, not invented by AI.

### What will change

**File: `src/components/AIReviewResult.tsx`**

The current label that reads **"AI-Generated Review"** (line 112) will be replaced with something like:

**"Compiled from Real Traveler Reviews"**

Along with a short subtitle line beneath it explaining the methodology, for example:

*"Curated from verified reviews across multiple travel platforms"*

This gives visitors confidence that the content reflects genuine, current experiences from real people -- while still being transparent that AI is used to compile and summarize them.

### Visual approach

- The sparkle icon stays to keep the visual identity, but the label text changes to emphasize real sources
- A brief muted-text subtitle is added directly below the label to provide more context
- No layout changes -- just updated copy and one extra line of text

### Technical details

- **Line 112**: Change `AI-Generated Review` to `Compiled from Real Traveler Reviews`
- **After line 113**: Add a `<p>` element with classes `text-xs text-muted-foreground` containing the subtitle text, e.g., *"AI-curated summary drawn from hundreds of verified reviews across top travel platforms"*
- No new imports or components needed
