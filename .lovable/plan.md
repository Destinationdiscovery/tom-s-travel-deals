# Multi-destination trips with transit between stops

## What you'll get

- When you create a trip, you pick **Single destination** (one place, one set of hotels/itinerary/logistics) or **Multi-destination** (an ordered list of stops).
- A multi-destination trip is broken into **legs**. Each leg has its own name, destination, dates, hotels, itinerary, packing list, gear picks, and logistics (best time, safety, currency, travel intel).
- Between every two consecutive legs, a **transit card** shows driving distance and drive time (Google Maps) with quick links for other modes.
- You can add unlimited legs (day tours, side trips, next city, etc.), reorder them, and delete them.
- The "Add to trip" button in every tool (Best Time, Safety, Currency, Travel Intel, hotel reviews, gear) will let you pick which trip **and which leg** to save the result to.

## New trip shapes

```text
Single destination trip                  Multi-destination trip
------------------------                 -----------------------
Trip header                              Trip header
  Destination, dates, notes                Notes, overall dates (auto from legs)
Hotels                                   Leg 1: Rome (Jul 7-10)
Itinerary                                  Hotels, Itinerary, Packing, Gear, Logistics
Packing                                  ~ Transit: 240 km, 2h 40m driving ~
Gear                                     Leg 2: Sorrento (Jul 10-14)
Logistics                                  Hotels, Itinerary, Packing, Gear, Logistics
                                         ~ Transit: 60 km, 1h 10m driving ~
                                         Leg 3: Monopoli day tour (Jul 15)
                                           Hotels, Itinerary, ...
```

## Data model changes

- `trips.is_multi_destination` boolean, default false.
- New table `trip_legs` (id, trip_id, leg_number, name, destination, start_date, end_date, notes).
- Add nullable `leg_id` foreign key to `trip_hotels`, `trip_itinerary_days`, `trip_packing_items`, `trip_gear_items`, `trip_logistics`. Existing rows keep `leg_id` null and behave as the single-destination trip.
- New table `trip_transit` (trip_id, from_leg_id, to_leg_id, distance_meters, duration_seconds, mode, options jsonb, updated_at). Cached so we don't hit Google on every render.
- RLS: same "owner only" policies as the rest of the trip tables.

## Google Maps integration

- Link the Google Maps Platform connector (uses the gateway; no new API key needed from you).
- New edge function `trip-transit` calls Routes API `computeRoutes` in driving mode using the two leg destinations. Result cached in `trip_transit`.
- Transit card also links out to Google Maps for train, bus, or flight options (mode buttons: Drive / Train / Fly).

## UI changes

- `MyTrips` "Create trip" dialog gets a toggle: **Single destination** or **Multi-destination**.
- `TripWorkspace` renders legs as expandable sections when `is_multi_destination`. Add-leg button at the bottom, reorder + delete on each leg.
- `ToolSaveBar` and `AddToTripButton` dialogs get a second step "Which leg?" when the chosen trip is multi-destination.
- Existing single-destination trips render exactly as they do today.

## Migration approach for your data

Per your note, you'll delete the current Sorrento / Monopoli / Italy Summer 2026 trips and start over. The `cached_reviews`, `travel_intel_cache`, `tool_search_cache` etc. rows are untouched so all your previous searches remain instant. I'll only drop the trip rows.

## Technical notes

- Schema migration includes GRANTs and RLS policies for every new table.
- `trip-transit` edge function: `verify_jwt = false` by default, validates trip ownership by checking `auth.uid()` against `trips.user_id` before returning cached or fresh data.
- Uses `routes.googleapis.com/directions/v2:computeRoutes` via the connector gateway with `travelMode: DRIVE`, `routingPreference: TRAFFIC_UNAWARE`.
- No changes to compass, blog, CRM, or auth systems.

Approve and I'll ship it in one pass: migration, connector link, edge function, then the UI updates.