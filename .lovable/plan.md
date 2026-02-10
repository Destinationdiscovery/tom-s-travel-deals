

## Add Yeti Insulated Tumbler to Beach / All-Inclusive Category

A one-line addition to the vacation type category lists in the edge function.

When the category lists get added to `supabase/functions/travel-gear-intel/index.ts` as part of the gear redesign, the **Beach / All-Inclusive** list will include 21 items instead of 20:

**Item #21: "Yeti insulated tumbler"**

This will be appended to the existing beach list after "Reusable water bottle", giving the full list:

1. Carry-on suitcase
2. Packing cubes
3. Beach tote bag
4. Reef-safe sunscreen
5. Polarized sunglasses
6. Wide-brim sun hat
7. Quick-dry swim trunks/swimsuit
8. Waterproof phone pouch
9. Travel-size toiletry bottles
10. Portable Bluetooth speaker
11. Mosquito repellent
12. After-sun aloe vera gel
13. Neck pillow for flights
14. Noise-cancelling earbuds
15. Water shoes
16. Dry bag
17. Portable fan/misting fan
18. Luggage scale
19. Travel adapter/charger
20. Reusable water bottle
21. Yeti insulated tumbler

### Technical Detail

This change will be made in `supabase/functions/travel-gear-intel/index.ts` when the vacation category map constant is created. The beach array will simply have one extra entry.

| Action | File |
|--------|------|
| Modify | `supabase/functions/travel-gear-intel/index.ts` -- add "Yeti insulated tumbler" to beach list |

