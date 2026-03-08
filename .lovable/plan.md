

# Commission Tracking

## Changes

### 1. DB Migration
Add `commission` (numeric, default 0) to `booking_details`.

### 2. BookingReport — Commission Field
Add an editable commission input below the report hero section. Shows current value with a pencil/edit toggle. Saves to `booking_details.commission` on blur or enter. Styled as a small inline card with a dollar icon matching the dark aesthetic.

### 3. Dashboard — Commission Stat Card
In `DashboardOverview.tsx`:
- Query `SUM(commission)` from `booking_details` in `fetchRevenue`
- Add a new stat card "Commission" with a `Wallet`/`Banknote` icon and a distinct accent color (e.g. `border-l-orange-500`)
- Place it alongside the existing Total Quoted / Booked Revenue cards

### 4. Revenue Chart
Optionally add commission as a third bar in `RevenueChart.tsx` so it's visible month-over-month alongside quoted/booked.

## Files

| File | Action |
|------|--------|
| DB migration | Add `commission numeric DEFAULT 0` to `booking_details` |
| `BookingReport.tsx` | Add editable commission input |
| `DashboardOverview.tsx` | Add commission total to revenue state + new stat card |
| `RevenueChart.tsx` | Add commission bar to chart |

## Order
1. Migration → 2. BookingReport commission field → 3. Dashboard stat + chart

