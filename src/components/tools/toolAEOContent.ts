import type { ToolExample, ToolFAQ } from "@/components/tools/ToolAEOContent";

export interface ToolAEOConfig {
  hookQuestion: string;
  intro: string;
  examples: ToolExample[];
  faqs: ToolFAQ[];
}

export const bestTimeAEO: ToolAEOConfig = {
  hookQuestion: "Want to know the best time of year to visit anywhere in the world?",
  intro:
    "ReviewThenGo's Best Time to Visit tool gives you a month-by-month verdict for any country or city, including weather, crowd levels, flight price trends, and local festivals. Type a destination above to get a fresh answer, or browse a few popular ones below.",
  examples: [
    {
      question: "Best time to visit Japan for cherry blossoms?",
      answer:
        "Late March to early April is the sweet spot in Tokyo and Kyoto, with peak bloom usually around April 1. Book flights and hotels at least 4 to 6 months out because prices spike 30 to 50%. For fewer crowds, head north to Hokkaido in early May.",
      ctaQuery: "Japan",
    },
    {
      question: "Cheapest month to fly to Bali?",
      answer:
        "February is the cheapest, with round-trip fares from North America often 25 to 40% lower than peak July. The trade-off is rainy afternoons. For dry weather plus value, target late April or early October shoulder season.",
      ctaQuery: "Bali",
    },
    {
      question: "When is rainy season in Costa Rica?",
      answer:
        "The green season runs May through November, peaking in September and October on the Caribbean side. Mornings are usually dry and rates drop 20 to 35%. Dry season runs December through April and is best for surfing the Pacific coast.",
      ctaQuery: "Costa Rica",
    },
  ],
  faqs: [
    {
      q: "How does ReviewThenGo decide the best time to visit?",
      a: "We blend 30-year weather averages, flight price trends, hotel occupancy data, and local event calendars to surface the months with the best balance of cost, weather, and crowds.",
    },
    {
      q: "Can I trust the flight price estimates?",
      a: "Yes. Estimates use rolling 12-month averages from major fare aggregators. Real-time prices vary by route, but month-over-month direction is reliable.",
    },
    {
      q: "Do you cover small or off-the-radar destinations?",
      a: "Yes, the tool works for any country or city worldwide, including small islands, regional capitals, and lesser-known travel hubs.",
    },
    {
      q: "Is this tool free?",
      a: "Yes, every ReviewThenGo travel tool is free with no signup required.",
    },
  ],
};

export const itineraryAEO: ToolAEOConfig = {
  hookQuestion: "Need a day-by-day travel itinerary built for you in seconds?",
  intro:
    "ReviewThenGo's Itinerary Builder generates a personalized day-by-day plan for any destination and trip length, with activities, restaurant picks, transit tips, and an estimated daily budget. Try it above or get inspired by these popular trips.",
  examples: [
    {
      question: "5-day Tokyo itinerary on a budget?",
      answer:
        "Day 1 Shibuya and Harajuku, day 2 Asakusa and Akihabara, day 3 day trip to Nikko, day 4 teamLab and Odaiba, day 5 Shinjuku and Golden Gai. Daily budget around 80 to 120 USD using a Suica card and 7-Eleven meals.",
      ctaQuery: "5-day Tokyo budget itinerary",
    },
    {
      question: "Romantic weekend in Paris?",
      answer:
        "Friday Eiffel Tower at sunset and dinner in Le Marais, Saturday Louvre morning then Seine cruise, Sunday Montmartre brunch and Sacré-Cœur. Stay in the 6th arrondissement for walkable charm. Budget 350 to 500 EUR per day for two.",
      ctaQuery: "Romantic 3-day Paris itinerary for couples",
    },
    {
      question: "7-day Bali adventure itinerary?",
      answer:
        "Two nights Ubud for jungle and rice terraces, two nights Canggu for surf and beach clubs, three nights Nusa Penida for snorkeling and Kelingking Beach. Rent a scooter for 5 USD a day. Total budget around 70 to 100 USD per day.",
      ctaQuery: "7-day Bali adventure itinerary",
    },
  ],
  faqs: [
    {
      q: "How detailed is the itinerary?",
      a: "Each day includes morning, afternoon, and evening blocks with specific activities, restaurant suggestions, transport tips, and an estimated cost.",
    },
    {
      q: "Can I customize for budget or travel style?",
      a: "Yes, just include words like budget, luxury, family, romantic, or adventure in your query and the AI tailors the plan accordingly.",
    },
    {
      q: "Does it include booking links?",
      a: "Activities and restaurants are listed by name so you can book directly. For hotels and flights, use the Hotel Reviews and Flights tools.",
    },
  ],
};

export const flightsAEO: ToolAEOConfig = {
  hookQuestion: "Looking for the cheapest flights and best route deals?",
  intro:
    "ReviewThenGo's Flight Deals tool finds the cheapest months to fly any route, surfaces current sale fares, and links you to Expedia for booking. Search a route above or check these popular ones.",
  examples: [
    {
      question: "Cheap flights from NYC to London?",
      answer:
        "Cheapest months are January, February, and early November, with round-trip fares often 380 to 520 USD. Avoid June through August when prices double. Tuesday and Wednesday departures save another 10 to 15%.",
      ctaQuery: "NYC to London",
    },
    {
      question: "Toronto to Cancun flight deals?",
      answer:
        "September and early December are the cheapest, with round trips from 280 CAD on Sunwing and Air Transat. December 20 through January 5 spikes to 700+ CAD. Book Tuesday for Saturday departures.",
      ctaQuery: "Toronto to Cancun",
    },
    {
      question: "When are flights to Hawaii cheapest?",
      answer:
        "Late April to mid-May and September to early October are best, with West Coast round trips from 280 USD. Holiday weeks and summer hit 700 to 900 USD. Hawaiian and Southwest run frequent fare sales.",
      ctaQuery: "Hawaii flight deals",
    },
  ],
  faqs: [
    {
      q: "Do you sell flights directly?",
      a: "No. We surface current deals and link you to Expedia, which has the broadest inventory and price-match. We earn a small commission at no extra cost to you.",
    },
    {
      q: "How fresh are the prices?",
      a: "Cheapest-month data is based on rolling 12-month averages. Live sale fares are pulled in real time when you click through to Expedia.",
    },
    {
      q: "Can I find one-way deals?",
      a: "Yes, just include 'one way' in your query along with origin and destination.",
    },
  ],
};

export const gearAEO: ToolAEOConfig = {
  hookQuestion: "Need a packing list tailored to your destination, weather, and trip style?",
  intro:
    "ReviewThenGo's Trip Packing Toolkit generates a complete packing list for any destination based on the season, activities, and trip length, with product recommendations and Amazon links. Try it above or browse common trips.",
  examples: [
    {
      question: "What to pack for a Cancun beach trip?",
      answer:
        "Reef-safe SPF 50, two swimsuits, lightweight cover-ups, water shoes for rocky cenotes, a dry bag, and a portable fan. Skip the heavy clothes. Pack a light rain jacket if traveling June through October.",
      ctaQuery: "Cancun beach trip in March",
    },
    {
      question: "Japan winter packing list?",
      answer:
        "Heat-tech base layers, a warm waterproof coat, slip-on shoes for temple visits, hand warmers, and a small umbrella. Tokyo runs 0 to 10 C, Hokkaido drops to -10 C. A pocket Wi-Fi is essential.",
      ctaQuery: "Japan in January 7 days",
    },
    {
      question: "Europe backpacking essentials?",
      answer:
        "A 40 to 45 L carry-on backpack, packing cubes, quick-dry clothing for 7 days, a TSA padlock, universal adapter, and a microfiber towel. Hostel-friendly flip-flops and a silk sleep liner are game changers.",
      ctaQuery: "Europe backpacking 3 weeks summer",
    },
  ],
  faqs: [
    {
      q: "Are the product recommendations sponsored?",
      a: "We link to Amazon as an affiliate so we earn a small commission, but recommendations are based on real reviews and trip-tested gear.",
    },
    {
      q: "Does the list adapt to season?",
      a: "Yes. Include the month or season in your query and the list adjusts for weather, daylight hours, and seasonal activities.",
    },
    {
      q: "Can I get carry-on only lists?",
      a: "Yes, just add 'carry-on only' to your query and the toolkit prioritizes versatile, lightweight items.",
    },
  ],
};

export const currencyAEO: ToolAEOConfig = {
  hookQuestion: "Need live exchange rates and money-saving tips for your next trip?",
  intro:
    "ReviewThenGo's Currency tool gives you live exchange rates, quick conversion tables, and travel money tips for any destination. Convert any amount above or check these common questions.",
  examples: [
    {
      question: "USD to Mexican Peso rate today?",
      answer:
        "1 USD typically buys 17 to 20 MXN depending on the week. Use ATMs from Banorte or Santander for the best rates. Avoid airport currency exchanges, which mark up 8 to 12%.",
      ctaQuery: "USD to MXN",
    },
    {
      question: "How much is 100 euros in yen?",
      answer:
        "100 EUR is roughly 16,000 to 17,000 JPY. Japan is largely a cash society outside major cities. Withdraw at 7-Eleven ATMs, which accept foreign cards 24/7 with low fees.",
      ctaQuery: "EUR to JPY",
    },
    {
      question: "Best way to exchange money in Thailand?",
      answer:
        "Use SuperRich exchange booths in Bangkok and Phuket for the best THB rates, often 2 to 4% better than banks. Skip airport counters. Bring crisp, undamaged USD or EUR notes for the top rate.",
      ctaQuery: "USD to THB",
    },
  ],
  faqs: [
    {
      q: "How current are the exchange rates?",
      a: "Rates update multiple times per day from a live currency API. Banks and credit cards typically apply a 1 to 3% spread on top.",
    },
    {
      q: "Should I exchange money before I travel?",
      a: "Usually no. ATMs at your destination almost always beat home-country exchange counters. Carry a small amount of local cash for arrival expenses.",
    },
    {
      q: "What about credit card foreign transaction fees?",
      a: "Use a card with 0% foreign transaction fees like Wise, Capital One Venture, or Chase Sapphire Preferred to save 3% on every purchase abroad.",
    },
  ],
};

export const safetyAEO: ToolAEOConfig = {
  hookQuestion: "Wondering if your destination is safe and what scams to watch out for?",
  intro:
    "ReviewThenGo's Safety Scores tool gives a 0 to 5 safety rating for any destination, plus common scams, health tips, emergency contacts, and the safest neighborhoods to stay in. Search above or check a few popular destinations.",
  examples: [
    {
      question: "Is Mexico City safe for tourists?",
      answer:
        "Mexico City rates 3.5/5 for tourists. Roma Norte, Condesa, and Polanco are very safe day and night. Avoid Tepito and Iztapalapa. Use Uber instead of street taxis. Petty theft on the metro is the main risk.",
      ctaQuery: "Mexico City",
    },
    {
      question: "Common scams in Paris?",
      answer:
        "Watch for the friendship bracelet scam at Sacré-Cœur, the gold ring 'find', petition scammers near the Louvre, and metro pickpockets on line 1. Keep your phone in a zipped pocket and skip restaurants without posted menus.",
      ctaQuery: "Paris",
    },
    {
      question: "Bali health tips for travelers?",
      answer:
        "Drink bottled water only and skip ice in rural areas. Bring loperamide and oral rehydration salts. Hepatitis A and typhoid vaccines are recommended. Watch for dengue in rainy season and rabies risk from street dogs.",
      ctaQuery: "Bali",
    },
  ],
  faqs: [
    {
      q: "Where do safety scores come from?",
      a: "We blend government travel advisories from the US, Canada, UK, and Australia with current crime statistics, recent incidents, and traveler reports.",
    },
    {
      q: "How often is safety data updated?",
      a: "The tool pulls live data on every search, so you always see current advisories and recent incidents.",
    },
    {
      q: "Should I still buy travel insurance?",
      a: "Yes. Even safe destinations carry health and trip-cancellation risks. We recommend SafetyWing or World Nomads for budget-friendly coverage.",
    },
  ],
};

export const travelIntelAEO: ToolAEOConfig = {
  hookQuestion: "Need to know visa requirements, entry rules, or current advisories before you travel?",
  intro:
    "ReviewThenGo's Know Before You Go tool checks visa and entry requirements for your citizenship, current government travel advisories, and the latest destination news. Try it above or check these common questions.",
  examples: [
    {
      question: "Do Canadians need a visa for Cuba?",
      answer:
        "Canadians do not need a visa but must have a Cuba Tourist Card, often included with flight bookings. Stays up to 90 days are allowed. Bring proof of medical insurance, which is mandatory on arrival.",
      ctaQuery: "Cuba",
    },
    {
      question: "Thailand travel advisory 2026?",
      answer:
        "Thailand is generally rated 'Exercise Normal Precautions' with elevated caution near the southern border provinces. Visa-free entry for 60 days is now standard for most Western passports. Carry copies of your passport at all times.",
      ctaQuery: "Thailand",
    },
    {
      question: "Japan entry rules for tourists?",
      answer:
        "Most Western passports get 90-day visa-free entry. No COVID restrictions remain. The Visit Japan Web app speeds up customs. A return ticket and proof of accommodation may be requested at immigration.",
      ctaQuery: "Japan",
    },
  ],
  faqs: [
    {
      q: "Is the visa info accurate for my passport?",
      a: "Yes. Just enter your citizenship and destination and the tool checks the latest entry rules from official government sources.",
    },
    {
      q: "How current are the travel advisories?",
      a: "Advisories pull from the US State Department, Global Affairs Canada, UK FCDO, and Australian Smartraveller in real time on every search.",
    },
    {
      q: "Do you cover health entry requirements?",
      a: "Yes, including required vaccinations, yellow fever certificates, and any current health screening rules.",
    },
  ],
};

export const destinationsAEO: ToolAEOConfig = {
  hookQuestion: "Want a real verdict on a hotel or resort before you book?",
  intro:
    "ReviewThenGo aggregates reviews from Google, TripAdvisor, Booking.com, Reddit, and 6+ other sources to give you a single clear verdict with pros, cons, and a star rating. Search any property above or jump straight into a popular query.",
  examples: [
    {
      question: "Best all-inclusive resorts in Cancun?",
      answer:
        "Top picks for 2026 are Hyatt Ziva (family), Le Blanc Spa Resort (luxury adults-only), and Moon Palace Cancun (value family). All score 4.5+ across aggregated sources. Rooms run 350 to 800 USD per night.",
      ctaQuery: "Best all-inclusive resorts in Cancun",
    },
    {
      question: "Is Atlantis The Royal worth the price?",
      answer:
        "Atlantis The Royal in Dubai earns 4.4/5 across sources. Standout dining, Nobu and Estiatorio Milos, and the Royal Beach are highlights. Service inconsistency at peak times is the main complaint. Best value during May or September shoulder months.",
      ctaQuery: "Atlantis The Royal Dubai",
    },
    {
      question: "Family-friendly hotels in Orlando?",
      answer:
        "Top family picks are Disney's Polynesian Resort, Universal's Cabana Bay, and the Four Seasons Orlando. All score 4.5+ for kids' amenities, pools, and proximity to parks. Expect 250 to 700 USD per night depending on season.",
      ctaQuery: "Family-friendly hotels in Orlando",
    },
  ],
  faqs: [
    {
      q: "How does ReviewThenGo aggregate hotel reviews?",
      a: "We pull reviews from 10+ sources including Google, TripAdvisor, Booking.com, and Reddit, then summarize them into a single verdict with pros, cons, and a star rating.",
    },
    {
      q: "Are the reviews unbiased?",
      a: "Yes. We don't accept payment from hotels for placement. Reviews are aggregated from public sources and synthesized by AI for clarity.",
    },
    {
      q: "Can I review any hotel worldwide?",
      a: "Yes. Search any hotel, resort, Airbnb, or all-inclusive in the world and we'll generate a fresh review on demand.",
    },
  ],
};
