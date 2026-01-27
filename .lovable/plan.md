

## Replace "Essential Packing Tips" Article with 2026 Travel Trends Article

### Overview
Replace Compass article ID 1 ("Essential Packing Tips for Beach Destinations") with the new comprehensive article about 2026 travel trends covering Whycations, Glowcations, and Microvacations. The article will use the richContent format with images dispersed throughout, following the same pattern used for the Japan and Snowbird articles.

---

### Image Assignments

| Image File | New Filename | Placement | Caption |
|-----------|--------------|-----------|---------|
| 20240809_195834-scaled.jpg | trends-yoga-mountain.jpg | Hero image | (none - used as main article image) |
| solo-vacations-colorado-ranch-vista-verde.webp | trends-cozy-retreat.webp | After intro, in "Why now" section | Whycations prioritize meaningful experiences like quiet reflection and reconnection |
| e61b7ffc-d0a7-431e-aafb-c6ff68dcfff3.jpg | trends-wellness-villa.jpg | In "Glowcations" section | Wellness-focused stays combine relaxation with self-care in stunning settings |
| Biophilic-Design-Elements...jpg | trends-wellness-aesthetic.jpg | After Microvacations explanation | The glowcation trend blends beauty rituals with nature-inspired wellness |
| 53maxzyhoglzhgcgpac2.jpg | trends-luxury-retreat.jpg | In "How Canadians Can Book" section | Spa retreats and wellness escapes offer purpose-driven travel experiences |

---

### Article Updates

**ID**: 1 (unchanged)

**New Slug**: `2026-travel-trends-whycations-glowcations-microvacations`

**New Title**: "2026 Travel Trends: Purpose-Driven Whycations, Glowcations & Microvacations - How Canadians Can Jump In"

**Category**: Change from "Packing" to "Guides"

**Category Color**: "bg-teal-500"

**Date Published**: "January 27, 2026"

**Read Time**: "7 min read"

**Excerpt**: "Hilton, Conde Nast, and Expedia highlight the rise of intentional travel. Here's what Whycations, Glowcations, and Microvacations mean for Canadian travelers."

---

### Content Structure (richContent array)

1. **Text** - Opening paragraph about 2026 being year of intentional travel, citing Hilton/Conde Nast/Expedia
2. **Text** - Why now: travelers craving purpose over volume, emotional drivers
3. **Image** - Cozy retreat/fireplace image with caption about meaningful experiences
4. **Heading** - "The Top Trends Explained"
5. **Text** - Whycations: Purpose-driven trips explanation
6. **Image** - Wellness villa image with caption about wellness stays
7. **Text** - Glowcations: Wellness meets beauty explanation
8. **Image** - Wellness aesthetic image with caption about beauty rituals
9. **Text** - Microvacations: Short, far-flung escapes explanation
10. **Heading** - "How Canadians Can Book These Trends"
11. **Image** - Luxury retreat canopy bed image with caption about spa retreats
12. **Text** - Wellness retreats in Canada (Niagara, Banff, Fairmont)
13. **Text** - Microvacations with direct YYZ flights
14. **Text** - Start small suggestion (weekend wellness, Caribbean glowcation)
15. **Heading** - "A Travel Agent's Take"
16. **Text** - Toronto travel agent perspective on meaningful options
17. **Text** - Call to action for comments and reaching out

---

### Files to Modify/Create

| File | Action |
|------|--------|
| src/assets/trends-yoga-mountain.jpg | Copy from user-uploads (hero) |
| src/assets/trends-cozy-retreat.webp | Copy from user-uploads |
| src/assets/trends-wellness-villa.jpg | Copy from user-uploads |
| src/assets/trends-wellness-aesthetic.jpg | Copy from user-uploads |
| src/assets/trends-luxury-retreat.jpg | Copy from user-uploads |
| src/data/compassArticles.ts | Add image imports, replace article ID 1 content with richContent structure |

---

### Technical Details

The existing `ContentBlock` type already supports `text`, `image`, and `heading` types, and the `CompassArticle.tsx` page already has the `renderContentBlock` function to handle richContent. No rendering changes are needed.

The article will follow the same pattern as the Japan and Snowbird articles, using `richContent` array instead of the plain `content` array, with images interspersed between text blocks using appropriate headings to organize sections.

The original article's hero image import (`packingImg`) will be replaced with the new yoga mountain image import.

---

### Result
The Compass section will have a timely article about 2026's biggest travel trends with professional imagery dispersed throughout, matching the magazine-style reading experience of the Japan and Snowbird articles.

