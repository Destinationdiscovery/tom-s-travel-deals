# The Compass — Newsletter System

A full biweekly newsletter pipeline inside Agent HQ. One click runs an 11‑step generation flow, stores the edition in the database, and gives you a side‑by‑side editor before publish. Five capture points across the site grow the list.

## Decisions locked in
- Creative writing steps (1, 2, 5, 9, 10) use **Lovable AI Gateway with `google/gemini-2.5-pro`**. No Anthropic key needed.
- Research steps (3, 4, 6, 7, 8) use **Perplexity Sonar** via the existing `PERPLEXITY_API_KEY`.
- Subscribers live in the **existing `subscribers` table**, extended with new columns. No second list.
- The 3 existing capture points (exit popup, homepage newsletter section, footer) get **rewritten with Compass copy**. 2 new placements added (post‑tool modal, blog inline). Per your style rule, all copy uses periods/commas/hyphens, no em‑dashes, and avoids banned words (stunning, breathtaking, amazing, incredible, world‑class, nestled, vibrant, picturesque, charming, quaint).
- Send button stays disabled with a tooltip until an email provider is connected (Part 7 is a placeholder UI only, as you spec'd).

## What gets built

### 1. Database (one migration)
- New tables: `compass_editions`, `compass_destinations_log`.
- Extend `subscribers`: add `first_name`, `status` (active/unsubscribed/bounced), `unsubscribed_at`, `country`, `tags`. Existing rows default to `status='active'`. `source_slug` keeps working as the source field.
- RLS: admin‑only read/write on `compass_editions`, `compass_destinations_log`, and `subscribers` admin policies. Public INSERT on `subscribers` stays through the existing `subscribe` edge function (service role).
- GRANTs on every new table per project rules.

### 2. Generation edge function: `generate-compass-edition`
Single function, kicks off all 11 steps. Uses an in-memory progress channel via Supabase Realtime broadcast so the UI can render live step status.

Flow:
- Steps 1‑8 run with parallelization where the data allows: Step 1 first, then Steps 2‑8 fan out in parallel (Steps 2, 5 depend only on destination; 3, 4, 6, 7, 8 are independent Perplexity calls).
- Step 9 (write copy) waits for all data, then Step 10 (HTML render) runs.
- Step 11 inserts the edition with `status='draft'`, `subject_line_options[]`, `perplexity_citations`, `generation_metadata`.
- Per‑step try/catch: a failed step stores a fallback object and marks `generation_metadata.step_X_status = 'failed'` so the UI can show a warning without crashing the run.
- Tone rules and banned‑word list are injected into every Gemini prompt. Output JSON enforced via AI SDK structured output (`Output.object` with Zod schemas), so no fragile JSON-string parsing.
- Single section regeneration: same function accepts `{ edition_id, only_step: 3 }` to rerun one step in place.

### 3. Agent HQ dashboard: new "Compass" sidebar tab
New `CompassDashboard` component with three sub‑tabs: **Editions**, **Subscribers**, **Settings**.

**Editions tab**
- Header with title, subscriber count badge, big "Create Next Edition" button.
- 4 stats cards: active subscribers, last edition open rate (placeholder "—"), total published, next due (last `sent_at` + 14 days).
- Editions table: number, date, destination, status badge, subscriber count, row actions (View, Edit, Send disabled, Duplicate).
- Clicking Create opens a full‑screen modal showing the 11 steps, each ticking from ⏳ to ✅ or ⚠️ via the Realtime channel.
- Success state shows the 3 subject‑line options as selectable cards, plus Preview / Edit / Send (disabled) buttons.

**Edition editor** (`/gear-admin` route, opens when Edit clicked)
- Two‑panel layout. Left: subject line input + 4 section textareas (Trip / Flights / Hotel / Intel), each with a "🔄 Regenerate this section" button that calls the edge function with `only_step`.
- Right: live HTML preview in an iframe. Desktop (600px) / Mobile (375px) toggle.
- Bottom bar: Save Draft, Mark as Ready, Discard.

**Subscribers tab**
- Big active count, weekly growth line chart, source breakdown donut (Recharts, already in deps).
- Subscriber table: email, source, date, country, status. Filters (source / status / date range), email search, manual add, CSV export.

**Settings tab**
- 3 placeholder provider cards (Mailchimp, Kit, Brevo) with disabled "Connect" buttons and an explainer that connecting is a future step.

### 4. Capture placements on the public site
- **Post‑tool modal** (new): `CompassToolModal` triggered after any of the 6 tool pages render results. Uses `sessionStorage` so it shows once per session. Source: `tool-modal`.
- **Blog inline** (new): `CompassInlineCTA` injected after the 3rd block on `CompassArticle.tsx`. Source: `blog-inline`.
- **Homepage** (rewrite): `NewsletterCTASection.tsx` reworked with Compass headline, body, 4 bullet points. Source: `homepage`.
- **Exit popup** (rewrite): `EmailCapturePopup.tsx` copy updated. Source: `exit-popup`.
- **Footer** (rewrite): `Footer.tsx` newsletter row updated. Source: `footer`.
- All 5 hit the existing `subscribe` edge function (which already upserts into `subscribers` with `source_slug`).

### 5. Memory
Add `mem://features/compass/newsletter-system` documenting: Gemini 2.5 Pro for editorial, Perplexity Sonar for research, 11‑step pipeline, subscribers table is shared, banned words list.

## Verification at the end
- Run a full Create Next Edition end-to-end, confirm row in `compass_editions` with all 8 data JSON fields populated, citations array non-empty, 3 subject options, valid HTML.
- Confirm regenerating one section updates only its field.
- Visit each of the 5 capture points, submit a test email, confirm a new row in `subscribers` with the right `source_slug`.
- Render the HTML email in the preview iframe at 600px and 375px.

## Technical section

**Stack pieces touched**
- Migration: 1 file (3 schema changes + RLS + GRANTs).
- New edge functions: `generate-compass-edition/index.ts` (with `verify_jwt = false` and admin check inside).
- New React: `src/components/dashboard/compass/{CompassDashboard,EditionsTable,GenerationProgressModal,EditionEditor,SubscribersPanel,SettingsPanel}.tsx`, plus `src/components/compass/{CompassToolModal,CompassInlineCTA}.tsx`.
- Modified: `DashboardSidebar.tsx` (add Compass tab), `GearAdmin.tsx` (route the tab), `NewsletterCTASection.tsx`, `EmailCapturePopup.tsx`, `Footer.tsx`, `CompassArticle.tsx` (inject inline CTA), and the 6 tool result pages (mount the modal once).
- `lib/compass/prompts.ts`: all 11 prompts as templated strings with the tone/banned-word block.
- `lib/compass/schemas.ts`: Zod schemas matching each step's JSON contract for structured output.

**APIs**
- Gemini via `https://ai.gateway.lovable.dev/v1/chat/completions` with `Lovable-API-Key` header (already provisioned).
- Perplexity via `https://api.perplexity.ai/chat/completions`, model `sonar`, `search_recency_filter` per step.
- Realtime progress: a Supabase broadcast channel `compass:gen:{run_id}` the modal subscribes to.

**Error handling pattern (every step)**
```
try { return { ok: true, data: parsed } }
catch (err) {
  broadcast({ step: N, status: 'failed', error: err.message });
  return { ok: false, fallback: defaultForStep(N) };
}
```
The orchestrator always continues. `generation_metadata.step_X_status` records 'ok' or 'failed'.

**Realtime channel events**
```
{ step: 1..11, status: 'running'|'ok'|'failed', label: 'Selecting destination...' }
```
