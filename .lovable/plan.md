

# Fix: Dashboard Search Not Showing Results

## Root Cause

Perplexity's `sonar-pro` model includes `citations` and `search_results` in **every SSE chunk**, not just the last one. The current hook code (line 78-81) does `if (parsed.citations) { continue; }` — which skips extracting `choices[0].delta.content` from every chunk that has citations. Since all chunks have citations, **no content is ever displayed**.

The screenshot confirms this: citations show up (they're captured before the `continue`), but no text appears.

## Fix

**`src/hooks/useDashboardSearch.ts`** — Remove the `continue` on line 81. Instead, capture citations AND fall through to also extract content from the same chunk:

```
if (parsed.citations) {
  citations = parsed.citations;
}
const content = parsed.choices?.[0]?.delta?.content;
if (content) {
  assistantSoFar += content;
}
if (parsed.citations || content) {
  upsert();
}
```

That's the only change needed. One file, ~5 lines.

## Files

| File | Change |
|------|--------|
| `src/hooks/useDashboardSearch.ts` | Fix citation/content parsing to not skip content |

