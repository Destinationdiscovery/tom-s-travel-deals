

## Fix Edge Function Crash + Search Suggestions

### Problem

Two bugs in the `generate-review` edge function:

1. **Crash on cache hit (line 51)**: The code calls `supabase.rpc("increment_search_count_fn", ...).catch(...)` but the Supabase JS client returns a "thenable" (not a full Promise), so `.catch()` does not exist on it -- causing a `TypeError` that crashes the entire request. Additionally, the `increment_search_count_fn` database function was never created.

2. **Search suggestions never saved (line 192)**: The upsert uses `onConflict: "name"` but the actual unique index in the database is on `lower(name)`, so Postgres can't match the conflict target and the insert silently fails. That's why autocomplete returns no results.

### Fixes

**1. Edge function fix** (`supabase/functions/generate-review/index.ts`)

Replace the broken `.rpc().catch()` call on line 51 with a simple direct update wrapped in try/catch:

```typescript
// Instead of:
await supabase.rpc("increment_search_count_fn", { search_name: trimmedName }).catch(() => {});

// Do:
try {
  await supabase
    .from("search_suggestions")
    .update({ search_count: supabase.rpc("...") }) // won't work either
} catch {}
```

Actually, since we can't easily do an atomic increment without an RPC, the simplest reliable approach is:

- On cache hit: read the current `search_count`, then update with `count + 1`
- Wrap in try/catch so failures don't crash the response

For the upsert on new reviews (line 184-194): fix the conflict target. Since the unique index is a functional index on `lower(name)`, we need to handle this differently -- first try to find an existing row, then insert or update accordingly.

**2. Database migration**

Create the `increment_search_count_fn` as a simple SQL function, OR (simpler) just remove the RPC call entirely and use direct queries as described above.

### Changes

| File | Change |
|------|--------|
| `supabase/functions/generate-review/index.ts` | Fix cache-hit path: replace `.rpc().catch()` with a direct select+update wrapped in try/catch. Fix upsert logic for search suggestions to work with the `lower(name)` unique index. |

No database migration needed -- we will work with the existing schema and handle the case-insensitive uniqueness in application code.

### Technical Detail

The cache-hit increment becomes:
```typescript
try {
  const { data: existing } = await supabase
    .from("search_suggestions")
    .select("id, search_count")
    .ilike("name", trimmedName)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("search_suggestions")
      .update({ search_count: (existing.search_count || 0) + 1 })
      .eq("id", existing.id);
  }
} catch (e) {
  console.error("Failed to increment search count:", e);
}
```

The new-review suggestion save becomes:
```typescript
const existingSuggestion = await supabase
  .from("search_suggestions")
  .select("id, search_count")
  .ilike("name", reviewData.propertyName || trimmedName)
  .maybeSingle();

if (existingSuggestion.data) {
  await supabase
    .from("search_suggestions")
    .update({ search_count: (existingSuggestion.data.search_count || 0) + 1 })
    .eq("id", existingSuggestion.data.id);
} else {
  await supabase
    .from("search_suggestions")
    .insert({
      name: reviewData.propertyName || trimmedName,
      property_type: reviewData.propertyType,
      search_count: 1,
    });
}
```

This approach avoids the broken RPC call entirely and works correctly with the case-insensitive unique index.
