

## New Compass Article: Group Travel in 2026

### Overview
Add a new Compass article (ID 7) about the boom in group travel for 2026, covering who uses it, why it's popular, and practical tips for Ontario travelers. The article will follow the same richContent format as recent articles (Japan, Snowbird, Canada Boom, Travel Trends) with 5 images dispersed throughout the content.

---

### Image Assignments

| Uploaded Image | New Filename | Placement | Caption |
|----------------|--------------|-----------|---------|
| Screenshot-2025-02-05-at-5.08.22-PM.png (Large group at water park) | group-travel-hero.png | Hero image | (none - used as main article image) |
| ONB4-LS-MONTASTRAEA-03-2908-scaled-2.jpg (Family at resort) | group-travel-family.jpg | After "Families and Multi-Generational Groups" | Multi-generational trips are surging as families prioritize quality time together |
| open-pavilion-ceremony.webp (Wedding ceremony) | group-travel-wedding.webp | After "Weddings and Celebrations" | Destination weddings create shared occasions for friends and family without the host hassle |
| treasurebay_corporatetb2.jpg (Team on raft activity) | group-travel-team.jpg | In "Why People Choose Group Travel" section | Shared adventures and team activities build deeper connections and lasting memories |
| Raft-Adventure-Napali-Beach-Landing-image-4.webp (Group on beach) | group-travel-beach.webp | Near closing "Travel Agent's Perspective" | Group travel delivers connection, savings, and adventure without the solo hassle |

---

### Article Metadata

| Field | Value |
|-------|-------|
| ID | 7 |
| Slug | `group-travel-2026-who-uses-it-why-booming` |
| Title | "Group Travel in 2026: Who Uses It, Why It's Booming, and How It Fits Canadian Travelers" |
| Category | Guides |
| Category Color | bg-teal-500 |
| Author | Tom Laracy |
| Date Published | January 28, 2026 |
| Read Time | 10 min read |
| Excerpt | "Group travel is making a strong comeback in 2026. From friends reunions to destination weddings, here's who's booking and why it works for Ontario travelers." |

---

### Content Structure (richContent array)

1. **Text** - Opening paragraph about group travel comeback, market growth stats
2. **Text** - Why this surge (shared experiences, easier planning, Ontario context)
3. **Heading** - "Who Uses Group Travel?"
4. **Text** - Friends and Social Groups section
5. **Text** - Families and Multi-Generational Groups section
6. **Image** - Family at resort with caption
7. **Text** - Corporate and Incentive Groups section
8. **Text** - Weddings and Celebrations section
9. **Image** - Wedding ceremony with caption
10. **Text** - Special Interest and Educational Groups section
11. **Heading** - "Why People Choose Group Travel Over Solo or Independent Trips"
12. **Image** - Team raft activity with caption
13. **Text** - Shared Costs and Convenience
14. **Text** - Safety and Support
15. **Text** - Bonding and Meaningful Experiences
16. **Text** - Less Stress, More Fun / Value for Money
17. **Heading** - "The Practical Side of Group Travel - Especially for Larger Groups"
18. **Text** - Complexity with 10+ people, availability challenges
19. **Text** - Working with travel agent benefits, single booking number
20. **Text** - Sunwing perks example (free seating, bags, transfers, free room every 8th)
21. **Text** - Managing communication, payments, changes
22. **Heading** - "A Travel Agent's Perspective"
23. **Image** - Group on beach with caption
24. **Text** - Ontario travel agent perspective, operators like G Adventures
25. **Text** - Closing with call to action for comments

---

### Files to Create/Modify

| File | Action |
|------|--------|
| src/assets/group-travel-hero.png | Copy from user-uploads |
| src/assets/group-travel-family.jpg | Copy from user-uploads |
| src/assets/group-travel-wedding.webp | Copy from user-uploads |
| src/assets/group-travel-team.jpg | Copy from user-uploads |
| src/assets/group-travel-beach.webp | Copy from user-uploads |
| src/data/compassArticles.ts | Add 5 new image imports at top, add article ID 7 with full richContent structure before closing bracket |

---

### Technical Details

The new article will:
- Use the existing `ContentBlock` interface (text, image, heading types)
- Follow the established pattern for richContent articles
- Be added as the 7th article in the compassArticles array
- Reference "Ontario travel agent" for consistency with site style
- Include the comment section via the existing CompassArticle page component

No changes needed to any page components - the existing `CompassArticle.tsx` already handles richContent rendering.

---

### Result
The Compass section will have a comprehensive new article about group travel trends, complete with 5 images showing families, weddings, corporate teams, and beach adventures. The article targets Canadian travelers from Ontario and includes practical booking tips with specific vendor examples.

