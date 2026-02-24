
# Redesign Featured Deals Manager: Inline Card Editing

## Overview
Replace the current "separate form + slot picker" layout with a visual grid of all 6 deal cards. Each card shows its current state (from the database or the hardcoded default) and has an inline Edit button that expands an edit form right on that card.

## How It Works

1. **Always show all 6 cards** -- merge the hardcoded defaults from `TravelDealsSection.tsx` with any database overrides, so you always see the full grid regardless of how many slots have been customized.

2. **Click "Edit" on any card** -- the card expands to reveal inline form fields (name, location, affiliate URL, prices, rating, expiry date, and image upload). No more slot number dropdown.

3. **"Image Only" quick swap** -- if you just want to change the photo, upload a new image and hit Save without touching other fields.

4. **"Revert to Default"** -- deletes the database row for that slot, reverting it back to the hardcoded deal.

5. **Save** -- upserts the deal to the `featured_deals` table for that slot number.

## Technical Details

**File:** `src/components/dashboard/FeaturedDealsManager.tsx` (full rewrite)

- Import the same hardcoded `featuredDeals` defaults used on the homepage (extract them to a shared constant, or duplicate the 6-item array inline for simplicity).
- On load, fetch all DB deals and merge them into a 6-slot array (DB overrides hardcoded defaults by `slot_number`).
- Render a 3-column grid of cards. Each card shows the image, name, location, prices, and two buttons: **Edit** and **Revert** (if customized).
- Clicking Edit sets `editingSlot` state to that slot number, which renders the form fields below the card image.
- The form pre-fills with the current card data (whether default or DB).
- On Save, upsert to the `featured_deals` table. On Revert, delete the DB row.
- No changes needed to the database schema or `TravelDealsSection.tsx`.
