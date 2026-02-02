

## New Compass Article: Rome Trevi Fountain Fee

### Overview
Add a new Compass article (ID 9) about Rome's new 2-euro fee to access the Trevi Fountain, introduced February 2, 2026. The article covers what changed, why the fee was introduced, how it works, and practical tips for Ontario travelers planning Italy trips. It follows the same richContent format as recent articles with 4 images dispersed throughout.

---

### Image Assignments

| Uploaded Image | New Filename | Placement | Caption |
|----------------|--------------|-----------|---------|
| 3PQYHVXQ3FOO7A26N24QKBABRY.avif (Fountain detail shot) | trevi-fountain-hero.avif | Hero image | (none - used as main article image) |
| 191126164247-trevi-fountain-8.jpg (Crowded fountain aerial view) | trevi-fountain-crowds.jpg | After "Why the Fee?" section | The Trevi sees about 30,000 visitors on an average day, spiking to 70,000 on busy weekends |
| e41b5c_5f12abc2ed614742ac47f306df5411ad~mv2.jpg (Fountain sculptures close-up) | trevi-fountain-sculptures.jpg | After "How It Works" section | The 18th-century Baroque masterpiece is one of Rome's most iconic landmarks |
| 1000_F_113705249_1ugwEtg4AOJMK40MPnfl4Wooog0to5Zf.jpg (Evening/twilight shot) | trevi-fountain-evening.jpg | In "Practical Tips" section | After 10 p.m., access opens up for everyone without any charge |

---

### Article Metadata

| Field | Value |
|-------|-------|
| ID | 9 |
| Slug | `rome-trevi-fountain-fee-genius-or-ripoff` |
| Title | "Rome Just Charged 2 Euros to See the Trevi Fountain: Is This Genius or a Total Rip-Off?" |
| Category | News |
| Category Color | bg-amber-500 |
| Author | Tom Laracy |
| Date Published | February 2, 2026 |
| Read Time | 5 min read |
| Excerpt | "Rome rolled out a 2-euro fee for close-up Trevi Fountain access. Here's how it works, why they did it, and tips for your Italy trip from Ontario." |

---

### Content Structure (richContent array)

1. **Text** - Opening hook about tossing a coin, what just changed on February 2, 2026
2. **Text** - Context: surrounding piazza still free, after 10 p.m. open access
3. **Heading** - "Why the Fee?"
4. **Text** - Crowd management: 30,000 daily visitors, 70,000 on weekends, 9-10 million annually
5. **Image** - Crowded fountain with caption about visitor numbers
6. **Text** - Part of broader Rome/Italy overtourism efforts (Pantheon, Venice), funding preservation
7. **Text** - Revenue estimate: 6.5 million euros annually for maintenance
8. **Heading** - "How It Works Now"
9. **Text** - Fee amount: 2 euros (about $3 CAD), payment options
10. **Text** - Hours: 11:30 a.m. to 10 p.m. Mon/Fri; 9 a.m. to 10 p.m. other days
11. **Image** - Fountain sculptures with caption about the Baroque masterpiece
12. **Text** - What you get: timed access to inner area, less chaos, better photos
13. **Text** - Exemptions: Rome residents, disabilities, children under 6
14. **Text** - Free options: upper piazza anytime, close after 10 p.m.
15. **Text** - Booking tip: timed slots online ahead for peak season
16. **Heading** - "Early Feedback"
17. **Text** - Positive notes on easier access, better photos, worth the small cost
18. **Heading** - "Practical Tips for Your Rome Trip"
19. **Image** - Evening shot with caption about free access after 10 p.m.
20. **Text** - Arrive early morning or late afternoon for lighter crowds
21. **Text** - Classic coin toss: over left shoulder with right hand
22. **Text** - Combine with nearby gems: Spanish Steps, gelato stroll
23. **Text** - Consider shoulder seasons (spring or fall)
24. **Text** - Check exemptions or city pass bundles
25. **Heading** - "A Travel Agent's Perspective"
26. **Text** - Ontario travel agent view: planning ahead, flight options, group bookings
27. **Text** - Closing: asking reader feedback on the fee, call to action for comments

---

### Files to Create/Modify

| File | Action |
|------|--------|
| src/assets/trevi-fountain-hero.avif | Copy from user-uploads |
| src/assets/trevi-fountain-crowds.jpg | Copy from user-uploads |
| src/assets/trevi-fountain-sculptures.jpg | Copy from user-uploads |
| src/assets/trevi-fountain-evening.jpg | Copy from user-uploads |
| src/data/compassArticles.ts | Add 4 new image imports at top, add article ID 9 with full richContent structure at end of array |

---

### Technical Details

The new article will:
- Use the existing `ContentBlock` interface (text, image, heading types)
- Follow the established pattern for richContent articles
- Be added as the 9th article in the compassArticles array
- Reference "Ontario travel agent" for consistency with site style
- Include the comment section via the existing CompassArticle page component
- Use "News" category with amber-500 color to match the WestJet article

No changes needed to any page components - the existing `CompassArticle.tsx` already handles richContent rendering.

---

### Result
The Compass section will have a timely news article about Rome's new Trevi Fountain access fee, complete with 4 images showing the fountain from different angles and times of day. The article targets Canadian travelers from Ontario with practical booking tips and invites reader feedback on whether the fee is genius or a rip-off.

