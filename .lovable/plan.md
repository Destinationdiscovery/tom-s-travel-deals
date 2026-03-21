

# Update Site Description and Remove "Honest Reviews from Toronto Agent" Messaging

## What Changes

### 1. Update `index.html` static meta tags
- **Title**: "ReviewThenGo.com | Your Travel Aggregator for Every Question"
- **Description**: "ReviewThenGo is a travel aggregator that answers any question travelers have. Reviews, packing lists, best times to visit, currency, flights, safety, and more."
- **OG tags**: Match the new title and description

### 2. Update `src/pages/Index.tsx` SEOHead
- **Title**: "Your Travel Aggregator That Answers Every Question"
- **Description**: "ReviewThenGo is a travel aggregator that answers any question travelers have. Destination reviews, packing lists, best times to visit, itineraries, currency, flights, and safety scores, all in one place."
- **Keywords**: Add "travel aggregator", "travel questions answered", remove "honest reviews"

### 3. Update `src/components/HeroSection.tsx`
- Keep H1 "Answers Every Travel Question Before You Book" (already good)
- Update subtitle: "Your travel aggregator for reviews, packing lists, best times to visit, and more, all in one place."

### 4. Update `src/pages/Contact.tsx` SEOHead
- Change description from "Toronto-based travel consultant" to "Get in touch with Tom, a travel consultant with over a decade of experience."

### 5. Update `src/pages/About.tsx` SEOHead
- Remove "honest hotel reviews" from keywords
- Update description to include "travel aggregator" language

### 6. Update `src/pages/ClientFile.tsx` fallback title
- Change from "Honest Reviews, Tested Gear & Travel Insights" to "Your Travel Aggregator"

### 7. Update `src/components/TravelStoriesSection.tsx`
- Change "Honest reviews from my travels" to "Real reviews from my travels"

## Files

| File | Action |
|------|--------|
| `index.html` | Update title, description, OG tags |
| `src/pages/Index.tsx` | Update SEOHead title, description, keywords |
| `src/components/HeroSection.tsx` | Update subtitle |
| `src/pages/Contact.tsx` | Remove "Toronto-based" from description |
| `src/pages/About.tsx` | Update description and keywords |
| `src/pages/ClientFile.tsx` | Update fallback document title |
| `src/components/TravelStoriesSection.tsx` | Update heading text |

