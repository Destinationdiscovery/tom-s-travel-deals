

# Plan: Fix Featured Review Slugs Not Matching Cached Reviews

## Problem
The featured_reviews table has slugs like `riu palace costa rica` and `Riviera Maya 2 Nights Free` which don't match the actual cached_reviews slugs (`hotel-riu-palace-costa-rica`, etc.). When a user clicks "Read Review", the AIReview page queries `cached_reviews` by slug and gets no match.

## Solution

Two changes:

### 1. Update `FeaturedReviewsManager.tsx` — Auto-populate slug from cached_reviews
When the admin uses "Add to Slot" from a searched review, the slug should come from the `CachedReview` object (which has the correct slug from `cached_reviews`). Currently the `addReviewToSlot` function reads from the wrong fields. Fix it to use `review.slug` (the cached review's actual slug) and `review.property_name`.

Also, when manually editing a slot, add a note/helper text reminding the admin that the slug must match an existing cached review.

### 2. Update `AIReview.tsx` — Fallback: generate review if slug not found
When the slug doesn't exist in `cached_reviews`, instead of showing "Review not found", trigger the review generation for the property name. This way even if the slug is slightly off, the user gets a review generated and cached.

**However**, the simpler and more correct fix is: update the 4 existing featured_reviews rows to use the correct cached_reviews slugs via a data fix, and ensure the admin tool auto-fills the correct slug going forward.

### Implementation

**A. Fix `addReviewToSlot` in `FeaturedReviewsManager.tsx`** (lines 156-171):
The `review` object from `useGenerateReview` is a `CachedReview` with fields `property_name`, `slug`, `location`, `review_data`. Currently the code reads `rd.propertyName` and `rd.slug` which may not exist. Fix to read from the correct CachedReview fields and nested review_data.

**B. Fix the 4 existing DB rows** — Run a migration/update to correct the slugs:
- `riu palace costa rica` → `hotel-riu-palace-costa-rica`  
- `Riviera Maya 2 Nights Free` → look up Ocean Maya Royale slug in cached_reviews
- `curacao 2 nights free` → `sunscape-curacao-resort-spa-casino-all-inclusive`
- `Save on Toronto stay` → look up Town Inn slug

**C. Add slug validation** in `FeaturedReviewsManager` save handler — check that the slug exists in `cached_reviews` before saving, and warn if not.

