

## Update Gear Amazon Affiliate Links

### Overview
Replace all seven Amazon affiliate links in the gear reviews with new Geni.us short links for better tracking and management.

---

### Link Changes

| Product | Current Link | New Link |
|---------|-------------|----------|
| Travel Adapter | amzn.to/4qLP5K8 | geni.us/hFIL |
| Packing Cubes | amzn.to/49NivBR | geni.us/YTJJyS |
| Phone Holder | amzn.to/4szOXix | geni.us/TCcAi |
| Inflatable Hammock | amzn.to/4jAiR2a | geni.us/vKZqeB |
| Thermacell Mosquito | amzn.to/4jHDXf7 | geni.us/PF6Rl |
| Shoe Organizer | amzn.to/3NopEQt | geni.us/nUWzay |
| Liquid IV | amzn.to/4sR3lTB | geni.us/Ai1BQg0 |

---

### File to Modify

| File | Action |
|------|--------|
| `src/data/gearReviews.ts` | Update the `amazonLink` field for all 7 gear review objects |

---

### Where Links Appear

The `amazonLink` field is used in the following places:
- **Gear review page** - Main Amazon CTA card after "My Experience" section
- **Gear review page** - Sidebar "Buy on Amazon" button
- Both locations include the affiliate disclaimer

---

### Result
All gear review Amazon buttons will redirect through the new Geni.us tracking links, providing better analytics and link management while maintaining the same user experience.

