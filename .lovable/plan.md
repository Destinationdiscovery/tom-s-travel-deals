

## Fix: Undo Unwanted Tabs and Complete the Original Plan

I misunderstood your request and added page tabs you never asked for. Here is what needs to happen:

### Step 1: Undo the tab changes on the Gear page
- Remove the Tabs/TabsList/TabsTrigger/TabsContent wrapper from `src/pages/Gear.tsx`
- Remove the "Our Gear Reviews" tab content
- Restore the page to its previous state (just the AI packing list view)

### Step 2: Re-request the GOOGLE_CSE_ID secret
- Provide the secret input field again so you can paste your ID: `c16d8bcebff364f0c`

### Step 3: Proceed with the original 6 changes from the earlier plan
Once the secret is saved, implement all the changes you originally asked for:
1. Create the `product-image-search` edge function (uses your Google CSE ID to fetch real Amazon product images)
2. Update the `travel-gear-intel` edge function to use that image search
3. UI fix: Remove the em-dash from the Gear page
4. UI fix: Change "AI reviews" to "real Amazon reviews"
5. UI fix: Add a visible Search button next to the search bar
6. Fix missing product images in packing list results

### No new features or tabs will be added -- only what you originally requested.

