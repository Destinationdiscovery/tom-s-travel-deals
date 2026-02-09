

## Polish Compare Page: Rebrand, Redesign Categories, Add Affiliate Links

Four changes to the Compare page and one small text fix in the review result.

### 1. Remove "AI" branding

| Current text | New text |
|---|---|
| "Generate AI Verdict" (button, line 210) | "Generate Verdict" |
| "AI Verdict" (heading, line 232) | "ReviewThenGo Verdict" |
| "Generating your AI review..." (AIReviewResult.tsx, line 38) | "Generating your review..." |

### 2. Redesign Category Breakdown

Replace the current flat list layout (lines 254-261) with a responsive grid of individual cards. Each category gets its own rounded card containing:
- Category name as a bold heading
- Winner shown as a colored badge/chip
- Reason as readable body text below

This replaces the cramped single-row layout with something much easier to scan.

### 3. Top verdict section stays as-is

The overall winner card with the trophy icon, verdict text, and recommendation stays -- just with the heading renamed.

### 4. Add Affiliate Links after the verdict

Import the existing `AffiliateLinks` component and render it at the bottom of the verdict section (after the category breakdown cards) so users can jump straight to booking.

### Files to change

| File | What changes |
|---|---|
| `src/pages/Compare.tsx` | (1) Button text: "Generate Verdict". (2) Heading: "ReviewThenGo Verdict". (3) Category breakdown redesigned as card grid. (4) Import and render `AffiliateLinks` after verdict. |
| `src/components/AIReviewResult.tsx` | Line 38: "Generating your AI review..." becomes "Generating your review..." |

