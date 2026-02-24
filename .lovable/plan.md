
# Fix: Remove Required Field Validation on Featured Deals Save

## Problem
Line 106 in `FeaturedDealsManager.tsx` blocks saving if name, affiliate URL, or prices are empty -- causing the "Missing fields" error.

## Fix
**File:** `src/components/dashboard/FeaturedDealsManager.tsx`

Remove the validation guard on line 106-109 so all fields are optional. The form pre-fills from the current card data anyway, so fields will never truly be empty unless you intentionally clear them. This is a 4-line deletion.
