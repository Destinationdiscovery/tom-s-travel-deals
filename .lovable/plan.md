

# Add All Six Featured Deals

Populating the Featured Deals grid with all six deals provided.

## Deals

| # | Name | Location | Affiliate URL | Asset filename |
|---|------|----------|---------------|----------------|
| 1 | Temptation Cancun Resort All Inclusive - Adults Only | Cancun, Mexico | https://expedia.com/affiliate/sCSkKSm | `deal-temptation-cancun.png` |
| 2 | Hotel Riu Plaza Toronto | Toronto, Canada | https://expedia.com/affiliate/4XUFIIR | `deal-riu-plaza-toronto.png` |
| 3 | OUTRIGGER Honua Kai Resort & Spa | Lahaina, Hawaii | https://expedia.com/affiliate/N2Bmgth | `deal-outrigger-honua-kai.png` |
| 4 | Save on Eligible Flights to Top Destinations | Flights | https://expedia.com/affiliate/bPJ1N3S | `deal-flights.png` |
| 5 | Garza Blanca Resort & Spa Cancun | Punta Sam, Mexico | https://www.hotels.com/affiliate/gUxIS8k | `deal-garza-blanca-cancun.png` |
| 6 | Phuket Moonlit Bay Seaview Resort & Spa | Ratsada, Thailand | https://expedia.com/affiliate/av1oUFB | `deal-phuket-moonlit-bay.png` |

## Changes

1. **Copy six images** from user uploads into `src/assets/`
2. **Update `src/components/TravelDealsSection.tsx`**:
   - Import all six images
   - Populate the `featuredDeals` array with the six entries above

The grid will show two full rows of 3 cards on desktop, wrapping naturally on smaller screens.

