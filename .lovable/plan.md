

# Update Quick Facts and Pricing to Aggregate Across All Rooms

## Problem

The "Travellers" count in Quick Facts shows the static `num_travellers` field (currently 2) instead of the actual total passengers across all rooms. The Pricing card shows only the top-level `pricing` object (Room 1's pricing) instead of the combined total across all 3 rooms.

## Changes

### 1. Travellers Count -- Sum passengers from all rooms

Replace the static `num_travellers` display with a computed total that counts all passengers across all rooms in the `rooms` array. If rooms exist, sum `room.passengers.length` for each room. Fall back to `num_travellers` if no rooms data.

### 2. Pricing -- Aggregate totals from all rooms

Update the pricing helpers to sum `total`, `deposit`, and `taxes` across all room-level pricing objects. The logic:

- Loop through `rooms` and sum each room's `pricing.total`, `pricing.deposit`, `pricing.taxes`
- If rooms have no pricing, fall back to the top-level `pricing` field
- Balance due = aggregated total minus aggregated deposit (or use top-level `balance_due` if set)
- Per-person = aggregated total / total passenger count

## Technical Details

### File Modified

- `src/pages/BookingReport.tsx`

### Pricing Helpers Update (around line 810)

Replace the current single-source pricing helpers with aggregation logic:

```typescript
// Aggregate pricing across all rooms
const aggregatedPricing = rooms.length > 0
  ? rooms.reduce((acc, room) => {
      const p = room.pricing || {};
      acc.total += Number(p.total) || 0;
      acc.deposit += Number(p.deposit) || 0;
      acc.taxes += Number(p.taxes) || 0;
      return acc;
    }, { total: 0, deposit: 0, taxes: 0 })
  : null;

const pricingTotal = aggregatedPricing?.total || (hasPricing ? Number(bookingDetails!.pricing.total) || 0 : 0);
const pricingDeposit = aggregatedPricing?.deposit || (hasPricing ? Number(bookingDetails!.pricing.deposit) || 0 : 0);
// ... etc
```

### Travellers Count Update (around line 1146)

Replace `bookingDetails.num_travellers` with a computed value:

```typescript
const totalPassengers = rooms.length > 0
  ? rooms.reduce((sum, room) => sum + (room.passengers?.length || 0), 0)
  : bookingDetails?.num_travellers || 0;
```

Display `totalPassengers` in both the Quick Facts "Travellers" row and use it for per-person calculation.

