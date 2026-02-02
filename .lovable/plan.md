

## New Compass Article: WestJet Seat Squeeze Story

### Overview
Add a new Compass article (ID 8) about WestJet's failed experiment with tighter economy seats in early 2026. The article covers what happened, passenger backlash, WestJet's reversal, and practical tips for Ontario travelers. It will follow the same richContent format as recent articles with 4 images dispersed throughout.

---

### Image Assignments

| Uploaded Image | New Filename | Placement | Caption |
|----------------|--------------|-----------|---------|
| 071123_airlines_westjet-022-1.avif (WestJet plane exterior) | westjet-plane-hero.avif | Hero image | (none - used as main article image) |
| 12-artist-rendering...-300x169.jpeg (Economy cabin rows) | westjet-economy-cabin.jpeg | After "What Happened" section | WestJet reduced seat pitch to 28 inches to add more passengers per flight |
| 1_xRL0MZwO7_Lzw1vQau7XlA.jpg (WestJet interior with seats) | westjet-legroom.jpg | After "Passenger Pushback" section | Extended Comfort seats offer extra legroom for travelers who prioritize space |
| plane-6511877_1920.jpg (Airplane seatbacks with screens) | westjet-seats-window.jpg | In "Practical Tips" section | Checking seat maps early helps you avoid denser configurations during the transition |

---

### Article Metadata

| Field | Value |
|-------|-------|
| ID | 8 |
| Slug | `westjet-seat-squeeze-passengers-said-no` |
| Title | "WestJet Tried to Squeeze in More Seats for Cheaper Fares... But Passengers Said No Way!" |
| Category | News |
| Category Color | bg-amber-500 |
| Author | Tom Laracy |
| Date Published | January 29, 2026 |
| Read Time | 6 min read |
| Excerpt | "WestJet's experiment with tighter seats grabbed headlines in early 2026. Here's what happened, why passengers pushed back, and tips for your next booking." |

---

### Content Structure (richContent array)

1. **Text** - Opening from Ontario travel agent perspective, comfort on flights
2. **Heading** - "What Happened with WestJet's Seats"
3. **Text** - Reconfiguration of Boeing 737s (MAX 8s, 737-8s), reduced pitch to 28 inches
4. **Image** - Economy cabin rows with caption
5. **Text** - CEO quote about trying global seat pitches, affordable options
6. **Heading** - "The Passenger Pushback"
7. **Text** - Viral videos, social media, knees jammed, non-reclinable seats
8. **Text** - Families, taller travelers, cabin crew complaints
9. **Image** - WestJet interior with legroom caption
10. **Heading** - "WestJet's Reversal"
11. **Text** - Mid-January 2026 announcement, removing extra row, restoring 30-inch pitch
12. **Text** - CEO quote about guest feedback, "don't meet expectations"
13. **Text** - Impact on Ontario travelers heading to sun spots
14. **Heading** - "Practical Tips for Your Next WestJet Booking"
15. **Image** - Airplane seatbacks with caption
16. **Text** - Check seat maps early, avoid denser configs during transition
17. **Text** - Extended Comfort seats, premium options for legroom
18. **Text** - Families/groups chat with agent, alternatives on Sunwing/Air Canada
19. **Text** - Keep eye on reviews, feedback drives changes
20. **Heading** - "A Travel Agent's Perspective"
21. **Text** - Ontario travel agent view on comfort complaints, planning help
22. **Text** - Closing with call to action for comments

---

### Files to Create/Modify

| File | Action |
|------|--------|
| src/assets/westjet-plane-hero.avif | Copy from user-uploads |
| src/assets/westjet-economy-cabin.jpeg | Copy from user-uploads |
| src/assets/westjet-legroom.jpg | Copy from user-uploads |
| src/assets/westjet-seats-window.jpg | Copy from user-uploads |
| src/data/compassArticles.ts | Add 4 new image imports at top, add article ID 8 with full richContent structure at end of array |

---

### Technical Details

The new article will:
- Use the existing `ContentBlock` interface (text, image, heading types)
- Follow the established pattern for richContent articles
- Be added as the 8th article in the compassArticles array
- Reference "Ontario travel agent" for consistency with site style
- Include the comment section via the existing CompassArticle page component
- Use "News" category with amber-500 color to differentiate from Guides

No changes needed to any page components - the existing `CompassArticle.tsx` already handles richContent rendering.

---

### Result
The Compass section will have a timely news article about WestJet's seat controversy, complete with 4 images showing the airline and cabin details. The article targets Canadian travelers from Ontario with practical booking tips and emphasizes the power of passenger feedback in shaping airline decisions.

