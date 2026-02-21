
# Fix Balance Due Aggregation and Flight Upload Clarification

## Problem 1: Balance Due Not Aggregated

The "Balance Due" currently reads from the top-level `bookingDetails.balance_due` field (which only reflects Room 1's balance of $2,149.68) instead of computing the total balance across all rooms. With a total of $7,499.04 and deposit of $700, the actual balance due should be $6,799.04.

## Fix

Update the `balanceDue` calculation on line 825 to use the aggregated totals instead of the top-level `balance_due` field:

```
Before:  balanceDue = bookingDetails?.balance_due || (pricingTotal - pricingDeposit)
After:   balanceDue = pricingTotal - pricingDeposit  (always use aggregated values)
```

The aggregated deposit will also need to sum `balance_due` from each room if available, or simply fall back to `total - deposit` which is the correct calculation regardless.

## Problem 2: Flight Info -- Already Supported

Flight information is already extracted by the AI when you upload booking confirmation documents through the chat panel at the bottom of the booking page. If the document contains flight details (airline, flight numbers, departure/arrival airports and times), the AI will automatically extract and display them in the "Flight Itinerary" card.

No additional "Add Flight" button is needed -- just upload the flight confirmation via the existing chat/document upload area and the AI will pick it up.

## Technical Details

### File Modified

- `src/pages/BookingReport.tsx` (line 825)

### Change

Replace the balance due calculation to always use aggregated pricing math rather than the stale top-level `balance_due` field:

```typescript
// Before
const balanceDue = bookingDetails?.balance_due 
  ? Number(bookingDetails.balance_due) 
  : (pricingTotal - pricingDeposit > 0 ? pricingTotal - pricingDeposit : 0);

// After
const balanceDue = pricingTotal - pricingDeposit > 0 
  ? pricingTotal - pricingDeposit 
  : 0;
```

This ensures the balance due reflects the sum of all rooms' totals minus the sum of all rooms' deposits.
