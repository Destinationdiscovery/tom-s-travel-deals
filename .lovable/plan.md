

# Dashboard Travel Search — Perplexity Chat Interface

## What We're Building

A ChatGPT-style conversational search bar on the dashboard, powered by Perplexity (already connected). You type queries like "top 5 all-inclusives in Punta Cana" or "4 people May budget friendly", and results stream back as a rich markdown conversation — not rigid cards. You can ask follow-ups, refine, and keep the conversation going.

## Architecture

### 1. New Edge Function: `dashboard-search`
A streaming Perplexity-powered function tailored for travel agent research. Unlike the existing `travel-search` (which returns structured JSON for the public site), this one:
- Uses `sonar-pro` model for better quality
- Streams SSE responses (token-by-token, like the real estate chat)
- Accepts full conversation history for follow-up questions
- System prompt focuses on travel agent research: resorts, pricing, availability guidance, package comparisons
- Returns citations from Perplexity in a final SSE event

### 2. New Hook: `useDashboardSearch`
Manages conversation state, SSE streaming, and message history. Pattern mirrors the real estate project's `useChat.ts`:
- Messages array with user/assistant roles
- AbortController for cancellation
- Line-by-line SSE parsing with buffer handling
- Auto-scroll on streaming updates

### 3. New Component: `DashboardSearchChat`
A self-contained chat panel rendered on the dashboard:
- Input bar at bottom with send button
- Scrollable message area above
- User messages styled as right-aligned bubbles
- Assistant messages rendered with `ReactMarkdown` + `remark-gfm` (tables, lists, bold)
- Citations displayed as clickable links after each response
- Loading indicator (typing dots) while streaming
- "Clear" button to reset conversation

### 4. Dashboard Integration
Add the search chat card to `DashboardOverview.tsx` — positioned prominently below the stat cards and quick actions, above the Quick Intel Lookup (which remains for requirements/advisories/news).

## Files

| File | Action |
|------|--------|
| `supabase/functions/dashboard-search/index.ts` | New — streaming Perplexity edge function |
| `src/hooks/useDashboardSearch.ts` | New — SSE streaming hook |
| `src/components/dashboard/DashboardSearchChat.tsx` | New — chat UI component |
| `src/components/dashboard/DashboardOverview.tsx` | Add the search chat card |

## Implementation Order
1. Edge function (streaming Perplexity with travel agent system prompt)
2. Streaming hook
3. Chat UI component
4. Wire into dashboard

