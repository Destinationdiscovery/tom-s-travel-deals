

## Replace "Budget Travel Hacks" Article with Domestic Canada Boom Article

### Overview
Replace Compass article ID 3 ("Budget Travel Hacks That Actually Work") with the new comprehensive article about the Domestic Canada Boom, focusing on Banff, Lake Louise, and why Canadians are staying home in 2026. The article will use the richContent format with 4 images dispersed throughout, following the same pattern used for the Japan, Snowbird, and Travel Trends articles.

---

### Image Assignments

| Image File | New Filename | Placement | Caption |
|-----------|--------------|-----------|---------|
| Xv-2KdmQ...jpeg (Banff street, mountain view) | canada-boom-banff-street.jpg | Hero image | (none - used as main article image) |
| zi6A5AMP...jpeg (Winter downtown Banff) | canada-boom-banff-winter.jpg | In "Why Banff and Lake Louise" section | Banff's charming downtown comes alive in winter with snow-capped peaks as the backdrop |
| t-g7Wa1c...jpeg (Frozen Lake Louise skating) | canada-boom-lake-louise.jpg | After winter activities text | Lake Louise transforms into a natural skating rink, drawing visitors for unforgettable winter experiences |
| eRGVVZBS...jpeg (Snowy Rockies landscape) | canada-boom-rockies-winter.jpg | In "The Big Takeaway" section | The Canadian Rockies offer dramatic winter scenery that rivals any international destination |

---

### Article Updates

**ID**: 3 (unchanged)

**New Slug**: `domestic-canada-boom-banff-lake-louise-2026`

**New Title**: "Domestic Canada Boom: Banff, Lake Louise, and Why More Canadians Are Staying Home in 2026"

**Category**: Change from "Budget" to "Guides"

**Category Color**: "bg-teal-500"

**Date Published**: "January 27, 2026"

**Read Time**: "8 min read"

**Excerpt**: "With shifting attitudes toward U.S. travel and a desire for meaningful escapes, destinations like Banff and Lake Louise are seeing renewed interest across all seasons."

---

### Content Structure (richContent array)

1. **Text** - Opening paragraph about 2026 being breakout year for domestic travel
2. **Text** - Domestic trips as main event, scenic landscapes pulling Canadians home
3. **Heading** - "Why Domestic Travel Is Booming in 2026"
4. **Text** - Factors driving shift (U.S. softened, Canada topping lists, removes hassles)
5. **Text** - Industry reports on ease, flexibility, value
6. **Heading** - "Why Banff and Lake Louise Are Leading the Pack"
7. **Image** - Winter downtown Banff with caption
8. **Text** - Dominating wish lists, winter as the draw, social media appeal
9. **Text** - Activities beyond skiing (snowshoeing, ice walks, skating, sleigh rides)
10. **Image** - Frozen Lake Louise skating with caption
11. **Text** - Train travel having a moment, Rockies rail journeys
12. **Heading** - "Family-Friendly and March Break Alternatives"
13. **Text** - Families choosing domestic over U.S. theme parks
14. **Text** - March Break sweet spot, Quebec City comparison
15. **Heading** - "How Canadians Are Booking Smarter"
16. **Text** - Bundled travel, train-and-hotel packages, off-peak stays
17. **Text** - Mindset shift from "once in a lifetime" to "easy to repeat"
18. **Heading** - "The Big Takeaway for 2026"
19. **Image** - Snowy Rockies landscape with caption
20. **Text** - Canada as genuine destination choice, not fallback
21. **Text** - Ontario travel agent perspective, call to action

---

### Files to Create/Modify

| File | Action |
|------|--------|
| src/assets/canada-boom-banff-street.jpg | Copy from user-uploads (hero) |
| src/assets/canada-boom-banff-winter.jpg | Copy from user-uploads |
| src/assets/canada-boom-lake-louise.jpg | Copy from user-uploads |
| src/assets/canada-boom-rockies-winter.jpg | Copy from user-uploads |
| src/data/compassArticles.ts | Add image imports, replace article ID 3 content with richContent structure |

---

### Technical Details

The existing `ContentBlock` type already supports `text`, `image`, and `heading` types, and the `CompassArticle.tsx` page already has the `renderContentBlock` function to handle richContent. No rendering changes are needed.

The article will follow the same pattern as previous articles (Japan, Snowbird, Travel Trends), using richContent array instead of the plain content array, with images interspersed between text blocks using appropriate headings to organize sections.

The `budgetImg` import will be replaced with the new hero image import. The category will change from "Budget" to "Guides" to match the article's nature as a comprehensive guide to domestic Canadian travel.

---

### Result
The Compass section will have a timely article about the domestic Canada travel boom with 4 professional images of Banff and Lake Louise dispersed throughout, creating a polished magazine-style reading experience that matches the other richContent articles.

