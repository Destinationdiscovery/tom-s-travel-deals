

## Fix: travel-gear-intel Edge Function Boot Crash

The `travel-gear-intel` function fails to start because `const supabaseUrl` is declared twice in the file (once near the top for the Supabase client, and again later for the product image search call).

### Change

**File: `supabase/functions/travel-gear-intel/index.ts`**

Remove the second `const supabaseUrl` declaration (around line 195-196 in the image search section). The variable already exists from the earlier declaration, so the second one just needs to be deleted. Same for `supabaseAnonKey` if it's also redeclared.

After the fix, the function will be redeployed automatically.

### Technical Detail

The duplicate declarations look like:
```typescript
// FIRST (keep this one - near top of serve handler)
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

// SECOND (delete this one - in the image search section)
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
```

Only the second occurrence needs to be removed. The `fetchProductImage` function will use the already-declared variable from the outer scope.
