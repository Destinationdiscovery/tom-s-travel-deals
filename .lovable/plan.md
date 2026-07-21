
# Social Video Cards Beside Reviews

Add a new content type: social videos (TikTok, Instagram Reels, YouTube Shorts) that you manage from the admin dashboard and appear alongside review cards on the homepage and on individual review pages. Videos play inline; a small icon on each card links out to your profile.

## What you'll see

**Admin (`/gear-admin`)** — new "Social Videos" panel:
- Add a video: platform (TikTok / Instagram / YouTube), video URL, thumbnail image (upload or paste URL), caption, optional review slug to attach it to, sort order, active toggle.
- Edit, reorder, delete.

**Homepage** — new "Watch real trips" row directly under the "Explore real trips" gallery, showing up to 6 active videos as cards.

**Review page (`/review/:slug`)** — a "See it on video" strip near the top showing videos where `review_slug` matches (falls back to hiding the strip if none exist).

**Card behavior** — thumbnail with a play button overlay. Click plays inline (TikTok/Instagram/YouTube embed iframe in a modal). A small platform icon (TikTok/IG/YT) in the corner links directly to your profile in a new tab.

## Technical section

### Database
New table `social_videos`:
- `platform text` (check: tiktok | instagram | youtube)
- `video_url text` (link to the original post)
- `embed_url text` (auto-derived for iframe: TikTok oEmbed, IG reel, YouTube embed)
- `profile_url text` (your profile link for that platform, stored per-video for flexibility)
- `thumbnail_url text`
- `caption text`
- `review_slug text` (nullable — attaches to a specific review page)
- `sort_order int`, `is_active bool`, `created_at`, `updated_at`

Grants + RLS:
- `GRANT SELECT` to anon + authenticated (public read of active rows).
- `GRANT ALL` to service_role.
- RLS: public SELECT where `is_active = true`; INSERT/UPDATE/DELETE only for admin (`has_role(auth.uid(), 'admin')`).

Thumbnails reuse the existing `blog-images` storage bucket (already public).

### Frontend
- `src/components/dashboard/SocialVideosManager.tsx` — CRUD panel mounted in the admin dashboard (add to `DashboardSidebar.tsx` / `GearAdmin.tsx` routing).
- `src/components/social/SocialVideoCard.tsx` — thumbnail + play overlay + platform icon linking to `profile_url`.
- `src/components/social/SocialVideoModal.tsx` — inline iframe player (uses embed URL per platform).
- `src/components/social/SocialVideoRow.tsx` — horizontal scroll row of cards; accepts optional `reviewSlug` filter and a title.
- Mount on `src/pages/Index.tsx` right below `PublicTripsGrid`.
- Mount on `src/pages/AIReview.tsx` (review detail page) near the top, filtered by current slug, hidden when no matches.

### Out of scope
- Auto-pulling videos from TikTok/Instagram/YouTube APIs.
- Analytics on video plays (can be added later using the existing `tool_search_events` pattern).
