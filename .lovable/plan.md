

## Show Newest Compass Articles First in Carousel

### Overview
Update the homepage Compass carousel to display the most recent articles first, so visitors immediately see your latest content (Trevi Fountain, WestJet, Group Travel) instead of older articles.

---

### Current Behavior
- Carousel displays articles in array order (oldest first)
- Article ID 1 (2026 Travel Trends) appears first
- Newest articles (IDs 7, 8, 9) appear at the end

### New Behavior
- Carousel displays articles sorted by date (newest first)
- Trevi Fountain article (Feb 2, 2026) will appear first
- Older articles still accessible via carousel navigation

---

### Technical Changes

**File: `src/components/CompassSection.tsx`**

Add date sorting before mapping over articles:

```text
Current (line 37):
  {compassArticles.map((article, index) => (

Updated:
  {[...compassArticles]
    .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime())
    .map((article, index) => (
```

This creates a sorted copy of the array (newest dates first) without modifying the original data.

---

### Why This Approach

| Approach | Pros | Cons |
|----------|------|------|
| Sort by date in component | Always shows newest first, no manual reordering needed | Slight processing overhead (negligible for 9 articles) |
| Reverse array | Simple | Would break if articles are ever added out of order |
| Reorder data file | Works | Manual work every time you add an article |

**Recommendation**: Sort by date in the component. This is the most maintainable approach since new articles will automatically appear first based on their `datePublished` field.

---

### Result
When visitors land on your homepage, the carousel will start with the Trevi Fountain article (Feb 2), then WestJet (Jan 29), then Group Travel (Jan 28), and so on. Your latest content gets the spotlight automatically.

