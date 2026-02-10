

## Full Registration System + Email Automation + Dark Mode

This plan covers three things: building a free user registration system with enhanced features, adding automated review-focused email campaigns with affiliate links, removing the "Get Exclusive Travel Deals" email capture box, and adding a dark mode toggle.

---

### 1. Remove "Get Exclusive Travel Deals" Email Capture

The email capture box shown in your screenshot will be removed from review pages. The `EmailCapture` component and its import in `AIReviewResult.tsx` will be deleted. The `subscribers` table and `subscribe` edge function stay in place (they'll be repurposed for the newsletter opt-in within user registration).

**Files affected:**
- Delete `src/components/review/EmailCapture.tsx`
- Edit `src/components/AIReviewResult.tsx` — remove EmailCapture import and usage (lines 9, 205-208)

---

### 2. Dark Mode Toggle

The app already has full dark mode CSS variables defined in `src/index.css`. We just need a toggle button. We'll use `next-themes` (already installed) to manage the theme.

**Changes:**
- Wrap `App` with `ThemeProvider` from `next-themes`
- Add a sun/moon toggle button to `Header.tsx` (desktop nav + mobile menu)
- New component: `src/components/ThemeToggle.tsx`

---

### 3. Database Schema (New Tables + Migration)

Create 3 new tables with RLS and an auto-profile trigger:

**`profiles`**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | References auth.users |
| display_name | text | Nullable |
| newsletter_opt_in | boolean | Default true |
| created_at | timestamptz | Default now() |

**`user_saved_reviews`**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID | Not null |
| slug | text | Not null |
| property_name | text | |
| location | text | Nullable |
| overall_rating | numeric | |
| ratings | jsonb | |
| summary | text | |
| best_for | text[] | |
| trip_name | text | Nullable (null = unsorted) |
| created_at | timestamptz | Default now() |
| Unique | (user_id, slug) | |

**`user_review_history`**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID | Not null |
| slug | text | Not null |
| property_name | text | |
| location | text | Nullable |
| viewed_at | timestamptz | Default now() |
| Unique | (user_id, slug) | |

**RLS policies** on all 3 tables: users can only SELECT/INSERT/UPDATE/DELETE their own rows.

**Trigger:** Auto-create a `profiles` row when a new user signs up.

---

### 4. Authentication UI

**New file: `src/components/auth/AuthModal.tsx`**
- Dialog with email input field
- Sends magic link (OTP) using existing `sendMagicLink` from AuthProvider
- Shows success message after sending
- Can be triggered from Header or from gated feature prompts (e.g., "Sign in to save unlimited")

**Modified: `src/components/Header.tsx`**
- When logged out: "Sign In" button in nav bar
- When logged in: user avatar/icon dropdown with "My Reviews", "My Trips", "Sign Out"
- Dark mode toggle added next to nav items

---

### 5. Feature Implementation

**a) Persistent Saved Reviews — `src/hooks/useSavedReviews.ts` upgrade**
- Detect auth state
- Logged out: current localStorage behavior (5-review cap)
- Logged in: read/write from `user_saved_reviews` via React Query (unlimited saves)
- On sign-up: auto-migrate localStorage saves to database

**b) Review History — new `src/hooks/useReviewHistory.ts`**
- When logged-in user views a review (`AIReview.tsx`), upsert into `user_review_history`
- Anonymous: no tracking

**c) Trip Lists — new `src/pages/MyTrips.tsx`**
- Group saved reviews by `trip_name`
- Create/rename/delete trip groups
- Each trip card shows review count, average rating, and affiliate "Book" links

**d) My Reviews page — new `src/pages/MyReviews.tsx`**
- Tab 1: Saved reviews (with trip grouping)
- Tab 2: Recently viewed history
- Each card includes "Check rates" affiliate links

**e) `src/components/SaveReviewButton.tsx` update**
- When anonymous user hits 5-review limit: show "Sign in to save unlimited" prompt that opens AuthModal

---

### 6. Automated Email Campaigns

We'll use Resend for email delivery. You'll need a Resend API key (free tier covers ~3,000 emails/month).

**a) Welcome Email — `supabase/functions/send-welcome-email/index.ts`**
- Triggered by the auto-profile trigger (via database webhook or called from client after sign-up)
- Sends a branded welcome email with:
  - "Welcome to ReviewThenGo"
  - Their first saved review (if any) with affiliate booking links
  - Links to popular reviews on the site

**b) Weekly Digest — `supabase/functions/send-weekly-digest/index.ts`**
- Scheduled via a cron trigger (weekly)
- For each user with `newsletter_opt_in = true`:
  - Fetches newest `cached_reviews` added that week
  - Personalizes based on user's viewed locations (from `user_review_history`)
  - Includes affiliate links for each featured review
  - "Unsubscribe" link that sets `newsletter_opt_in = false`

**c) Trip Reminder — `supabase/functions/send-trip-reminder/index.ts`**
- Scheduled via cron (e.g., every 3 days)
- For users with saved trip lists who haven't visited in 7+ days
- "Still planning your [Trip Name]? Check the latest rates" with affiliate links

---

### 7. Route Updates — `src/App.tsx`

Add new routes:
- `/my-reviews` — MyReviews page
- `/my-trips` — MyTrips page

---

### Summary of All Files

| Action | File |
|--------|------|
| Delete | `src/components/review/EmailCapture.tsx` |
| Create | `src/components/ThemeToggle.tsx` |
| Create | `src/components/auth/AuthModal.tsx` |
| Create | `src/pages/MyReviews.tsx` |
| Create | `src/pages/MyTrips.tsx` |
| Create | `src/hooks/useReviewHistory.ts` |
| Create | `supabase/functions/send-welcome-email/index.ts` |
| Create | `supabase/functions/send-weekly-digest/index.ts` |
| Create | `supabase/functions/send-trip-reminder/index.ts` |
| Modify | `src/App.tsx` — add ThemeProvider wrapper + new routes |
| Modify | `src/components/Header.tsx` — auth UI + dark mode toggle |
| Modify | `src/components/AIReviewResult.tsx` — remove EmailCapture |
| Modify | `src/hooks/useSavedReviews.ts` — dual-mode (localStorage / DB) |
| Modify | `src/pages/AIReview.tsx` — track review history |
| Modify | `src/components/SaveReviewButton.tsx` — "sign in" upsell prompt |
| Migration | New tables: profiles, user_saved_reviews, user_review_history + RLS + trigger |

### Pre-requisite

Before building the email features, you'll need a **Resend API key**. I'll prompt you for it during implementation. The registration system and dark mode can be built immediately without any external keys.

