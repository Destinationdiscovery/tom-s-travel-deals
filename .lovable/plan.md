
## Replace "Best Times to Visit" Article with Snowbirds Skipping US Article

### Overview
Replace Compass article ID 5 ("Best Times to Visit Popular Destinations") with the new comprehensive article about why Canadian snowbirds are skipping the US in 2026 and where they're going instead. The article will use the richContent format with images dispersed throughout, following the same pattern used for the Japan article.

---

### Image Assignments

| Image File | Placement | Caption |
|-----------|-----------|---------|
| photo-507525428034.jpeg (beach sunset) | Hero image | (none - used as main article image) |
| pexels-210182.jpeg (city traffic) | After intro, before "Where Canadians Are Heading" | Border crossings and rising costs are pushing Canadians to reconsider their winter travel plans |
| pexels-1483053.jpeg (Caribbean aerial) | In "Where Canadians Are Heading Instead" section | Mexico and Caribbean destinations offer stunning beaches and better value for Canadian travelers |
| pexels-258154.jpeg (resort pool) | After Caribbean discussion | All-inclusive resorts provide exceptional value with everything bundled into one price |
| pexels-417074.jpeg (Banff mountains) | In domestic Canada section | Banff and the Canadian Rockies offer a winter escape without crossing borders |
| pexels-1486222.jpeg (Times Square) | In "Comparing Deals" section | Traditional US destinations like New York are feeling the pinch as Canadians look elsewhere |
| photo-1519046904884.jpeg (beach with palm) | Near end/CTA section | White sand beaches in Mexico and the Caribbean are welcoming Canadian travelers |

---

### Article Updates

**ID**: 5 (unchanged)

**New Slug**: `why-canadians-skipping-us-2026`

**New Title**: "Why Snowbirds and Canadians Are Skipping the US More in 2026 (And Where They're Going Instead)"

**Category**: Change from "Timing" to "Guides"

**Category Color**: Keep "bg-teal-500" or update to match Guides

**Date Published**: "January 27, 2026"

**Read Time**: "8 min read"

**Excerpt**: "Data shows Canadian travel to the US is down sharply. Here's why snowbirds are rethinking their winter escapes and the destinations offering better value."

---

### Content Structure (richContent array)

1. **Text** - Opening paragraph about Statistics Canada data, 23.6% drop
2. **Text** - Factors driving the trend (political tensions, weak dollar, border rules)
3. **Image** - City traffic photo with caption about border hassles
4. **Text** - Not about staying home, redirecting to welcoming spots
5. **Heading** - "Where Canadians Are Heading Instead"
6. **Image** - Caribbean aerial photo
7. **Text** - Mexico and Caribbean leading (Playa del Carmen, Puerto Vallarta, Punta Cana, Costa Rica)
8. **Image** - Resort pool photo with all-inclusive caption
9. **Text** - Domestic Canada booming (BC, Alberta Rockies, Banff)
10. **Image** - Banff mountains photo
11. **Text** - Other spots (Portugal Algarve, Belize)
12. **Heading** - "Comparing Deals: US vs. Mexico/Caribbean/Canada"
13. **Image** - Times Square photo
14. **Text** - US still has appeal but costs add up, insurance doubled
15. **Text** - Mexico/Caribbean packages value breakdown (CAD $1,500-$2,500/week)
16. **Text** - Domestic options win on ease (Banff, Vancouver packages)
17. **Text** - Bottom line on value comparison
18. **Heading** - "A Travel Agent's Perspective"
19. **Image** - Beach with palm tree
20. **Text** - Personal perspective as Ontario travel agent
21. **Text** - Call to action for comments and reaching out

---

### Files to Modify

| File | Action |
|------|--------|
| src/assets/snowbird-beach-sunset.jpg | Copy from user-uploads |
| src/assets/snowbird-traffic.jpg | Copy from user-uploads |
| src/assets/snowbird-caribbean-aerial.jpg | Copy from user-uploads |
| src/assets/snowbird-resort-pool.jpg | Copy from user-uploads |
| src/assets/snowbird-banff.jpg | Copy from user-uploads |
| src/assets/snowbird-times-square.jpg | Copy from user-uploads |
| src/assets/snowbird-palm-beach.jpg | Copy from user-uploads |
| src/data/compassArticles.ts | Add image imports, replace article ID 5 content with richContent structure |

---

### Technical Details

The existing `ContentBlock` type already supports `text`, `image`, and `heading` types, and the `CompassArticle.tsx` page already has the `renderContentBlock` function to handle richContent. No rendering changes are needed.

The article will follow the same pattern as the Japan article (ID 2), using `richContent` array instead of the plain `content` array, with images interspersed between text blocks using appropriate headings to organize sections.

The typo "TOntario" in the original content will be corrected to "Ontario" during implementation.

---

### Result
The Compass section will have a timely, relevant article about Canadian travel trends for 2026, with professional imagery dispersed throughout to create a polished, magazine-style reading experience matching the Japan article.
