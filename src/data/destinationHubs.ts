// City hub metadata for /destinations/city/:city pages.
// Curated list of 25 high-intent travel destinations.

export interface DestinationHub {
  slug: string;
  name: string;
  country: string;
  region: string;
  summary: string;
  bestMonths: string[];
  highlights: string[];
  faqs: { q: string; a: string }[];
  topProperties?: { name: string; reviewSlug: string }[];
}

export const DESTINATION_HUBS: DestinationHub[] = [
  {
    slug: "cancun",
    name: "Cancun",
    country: "Mexico",
    region: "Caribbean",
    summary: "Cancun is the Caribbean coast's biggest all-inclusive hub, with white-sand beaches, dozens of large resorts, easy direct flights from Canada and the US, and a wide range of day-trip options including Tulum and Chichen Itza.",
    bestMonths: ["December", "January", "February", "March", "April"],
    highlights: ["Hotel Zone beaches", "Adults-only all-inclusives", "Tulum & Mayan ruins day trips", "Direct flights from most major North American airports"],
    faqs: [
      { q: "When is the best time to visit Cancun?", a: "December through April for dry weather, calm seas, and fewer storms. Peak crowds and prices are mid-December through early January and Spring Break (March)." },
      { q: "Is Cancun safe for tourists?", a: "The Hotel Zone and main resorts are generally safe with heavy police presence. Stay in tourist areas at night, use hotel transfers, and avoid downtown nightlife districts late at night." },
      { q: "Do Canadians need a visa for Cancun?", a: "No. Canadian and US citizens can enter Mexico for tourism without a visa for stays up to 180 days. A valid passport is required." },
    ],
  },
  {
    slug: "bali",
    name: "Bali",
    country: "Indonesia",
    region: "Southeast Asia",
    summary: "Bali blends beach resorts, rice terraces, surf villages, yoga retreats, and Hindu temples in a single compact island. Best for travelers wanting culture plus relaxation at a low daily cost.",
    bestMonths: ["May", "June", "July", "August", "September"],
    highlights: ["Ubud rice terraces", "Uluwatu cliff temples", "Seminyak beach clubs", "Affordable luxury villas"],
    faqs: [
      { q: "When is the best time to visit Bali?", a: "May through September is the dry season with lower humidity and less rain. July and August are peak crowds; June and September are the sweet spot." },
      { q: "Is Bali expensive?", a: "No. Mid-range travelers spend $50 to $100 per day including a private villa, scooter, food, and activities. Luxury travelers can find five-star villas under $300 per night." },
    ],
  },
  {
    slug: "tokyo",
    name: "Tokyo",
    country: "Japan",
    region: "East Asia",
    summary: "Tokyo is the world's largest metro area, blending neon-lit nightlife districts, Michelin dining, anime culture, and 400-year-old temples. Public transit is world-class and the city is famously safe.",
    bestMonths: ["March", "April", "May", "October", "November"],
    highlights: ["Cherry blossoms (late March to early April)", "Shibuya Crossing", "Tsukiji Outer Market", "Day trips to Mount Fuji and Hakone"],
    faqs: [
      { q: "Is Tokyo expensive?", a: "Less than you'd think. Excellent meals at convenience stores or ramen shops cost $5 to $10. Mid-range hotels start around $100 per night. Public transit is cheap and reliable." },
      { q: "Do you need to speak Japanese to visit Tokyo?", a: "No. Major signs and metro stations have English. Translation apps handle the rest. The Shinkansen, JR lines, and most attractions are tourist-friendly." },
    ],
  },
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    region: "Europe",
    summary: "Paris combines world-class museums, walkable historic neighborhoods, and famously good food. Best for first-time European travelers and repeat visitors looking for niche districts and day trips.",
    bestMonths: ["April", "May", "June", "September", "October"],
    highlights: ["Louvre and Musée d'Orsay", "Le Marais and Saint-Germain neighborhoods", "Day trips to Versailles and Champagne", "Seine river dinner cruises"],
    faqs: [
      { q: "How many days do you need in Paris?", a: "4 to 5 days for first-timers covers major museums, Eiffel Tower, Notre-Dame area, and one day trip to Versailles." },
      { q: "Is Paris safe for tourists?", a: "Generally yes. Pickpockets work crowded metro lines, the Eiffel Tower area, and around Sacré-Cœur. Use a money belt or front pocket and stay alert." },
    ],
  },
  {
    slug: "london",
    name: "London",
    country: "United Kingdom",
    region: "Europe",
    summary: "London packs world-class museums (most free), historic palaces, theatre, and 30-plus distinct neighborhoods into a transit-friendly city. English-speaking and well-suited for first-time international travelers.",
    bestMonths: ["May", "June", "July", "August", "September"],
    highlights: ["British Museum (free)", "West End theatre", "Borough Market", "Day trips to Bath, Oxford, Windsor"],
    faqs: [
      { q: "Is London expensive?", a: "Yes, especially for hotels. Budget $250+ per night for a decent central hotel. Save by eating at pubs ($15 to $20 mains) and using the Tube instead of taxis." },
      { q: "Do Canadians need a visa for the UK?", a: "No, Canadians can visit the UK for up to 6 months as tourists. Starting 2025, an Electronic Travel Authorization (ETA) is required before arrival." },
    ],
  },
  {
    slug: "new-york",
    name: "New York City",
    country: "USA",
    region: "North America",
    summary: "NYC offers unmatched density: Broadway, Michelin dining, world-class museums, and five distinct boroughs in one walkable transit network. Best for repeat international travelers and culture-focused trips.",
    bestMonths: ["April", "May", "September", "October", "November"],
    highlights: ["Central Park", "Broadway shows", "Brooklyn neighborhoods", "Statue of Liberty and Ellis Island"],
    faqs: [
      { q: "How many days do you need in NYC?", a: "4 to 5 days minimum. Plan 2 days for Manhattan icons, 1 day for Brooklyn, 1 day for museums, and a flex day for shopping or a Broadway show." },
      { q: "What's the cheapest time to visit New York?", a: "January, February, and early March (avoiding holidays). Hotels drop 30 to 40 percent versus October and December." },
    ],
  },
  {
    slug: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    region: "Southeast Asia",
    summary: "Bangkok is Southeast Asia's gateway city: cheap five-star hotels, world-renowned street food, royal palaces, and a thriving rooftop bar scene. Most travelers combine it with beach time in Phuket or Krabi.",
    bestMonths: ["November", "December", "January", "February"],
    highlights: ["Grand Palace and Wat Pho", "Chatuchak Weekend Market", "Rooftop bars", "Day trips to Ayutthaya"],
    faqs: [
      { q: "Is Bangkok safe for first-time travelers?", a: "Yes. Tourist areas are well-policed. Watch for tuk-tuk and gem-shop scams; use Grab (rideshare) instead of street taxis where possible." },
      { q: "How long should I stay in Bangkok?", a: "3 to 4 days covers temples, markets, food tours, and a day trip. Combine with 5+ days at a Thai beach for a full trip." },
    ],
  },
  {
    slug: "rome",
    name: "Rome",
    country: "Italy",
    region: "Europe",
    summary: "Rome is an open-air museum: 2,000-year-old ruins, Renaissance art, and famously good food in walkable historic neighborhoods. Best paired with a few days in Florence or the Amalfi Coast.",
    bestMonths: ["April", "May", "September", "October"],
    highlights: ["Colosseum and Roman Forum", "Vatican Museums", "Trastevere neighborhood", "Day trips to Florence and Pompeii"],
    faqs: [
      { q: "How many days do you need in Rome?", a: "3 full days minimum to cover the Colosseum/Forum, Vatican, and the historic center (Pantheon, Trevi, Spanish Steps). Add a 4th for day trips." },
      { q: "Should I book the Vatican and Colosseum in advance?", a: "Yes, always. Skip-the-line tickets sell out 2 to 4 weeks ahead in peak season. Same-day lines can exceed 3 hours." },
    ],
  },
  {
    slug: "punta-cana",
    name: "Punta Cana",
    country: "Dominican Republic",
    region: "Caribbean",
    summary: "Punta Cana is the Caribbean's largest all-inclusive resort strip: 30+ km of palm-lined beach, dozens of large family and adults-only resorts, and direct flights from across North America.",
    bestMonths: ["December", "January", "February", "March", "April"],
    highlights: ["Bavaro Beach", "Saona Island day trips", "Adults-only all-inclusives (Excellence, Hyatt Zilara)", "Cap Cana golf"],
    faqs: [
      { q: "Is Punta Cana safe?", a: "Resort grounds and main tourist zones are very safe with private security. Stay on resort property at night and use only resort-arranged transfers and excursions." },
      { q: "When is hurricane season in Punta Cana?", a: "June through November, with peak risk August through October. December to April is the safest weather window." },
    ],
  },
  {
    slug: "miami",
    name: "Miami",
    country: "USA",
    region: "North America",
    summary: "Miami delivers warm winters, Latin American food, art deco beaches, and easy cruise port access. South Beach, Wynwood, and Brickell each offer a distinct vibe.",
    bestMonths: ["December", "January", "February", "March", "April"],
    highlights: ["South Beach Art Deco district", "Wynwood Walls street art", "Cuban food in Little Havana", "Cruise departures from PortMiami"],
    faqs: [
      { q: "Is Miami safe for tourists?", a: "South Beach, Brickell, Coconut Grove, and Coral Gables are generally safe. Avoid driving through Liberty City and Overtown at night." },
      { q: "What's the cheapest time to visit Miami?", a: "May through early June and late September through early November. Hotels drop 30 to 50 percent versus winter peak." },
    ],
  },
  {
    slug: "las-vegas",
    name: "Las Vegas",
    country: "USA",
    region: "North America",
    summary: "Las Vegas packs world-class hotels, headline shows, celebrity-chef dining, and big casino floors into a four-mile Strip. Excellent for short getaways, group trips, and bachelor/bachelorette weekends.",
    bestMonths: ["March", "April", "May", "October", "November"],
    highlights: ["Bellagio fountains", "Strip resort hopping", "Cirque du Soleil shows", "Day trips to the Grand Canyon and Hoover Dam"],
    faqs: [
      { q: "How many days do you need in Las Vegas?", a: "3 to 4 nights is the sweet spot. Long enough for two shows, dinners, pool time, and a day trip; short enough to avoid burnout." },
      { q: "What's the best time of year for cheap Vegas hotels?", a: "Mid-January, early February (excluding Super Bowl), and mid-week stays in summer can drop Strip resort rates by 50 percent." },
    ],
  },
  {
    slug: "barcelona",
    name: "Barcelona",
    country: "Spain",
    region: "Europe",
    summary: "Barcelona combines Mediterranean beaches, Gaudi architecture, world-class tapas, and walkable Gothic-era neighborhoods. One of Europe's best summer city breaks.",
    bestMonths: ["May", "June", "September", "October"],
    highlights: ["Sagrada Familia", "Park Güell", "Gothic Quarter tapas tours", "Beach + city in one trip"],
    faqs: [
      { q: "How many days do you need in Barcelona?", a: "3 to 4 days covers the major Gaudi sites, the Gothic Quarter, beach time, and one tapas crawl." },
      { q: "Should I book Sagrada Familia tickets in advance?", a: "Yes, always. Tickets sell out days to weeks ahead. Book the tower-access option for the best views." },
    ],
  },
  {
    slug: "amsterdam",
    name: "Amsterdam",
    country: "Netherlands",
    region: "Europe",
    summary: "Amsterdam is one of Europe's most walkable and bike-friendly capitals: canals, world-class museums, brown cafes, and easy day trips to Bruges, The Hague, and Belgium.",
    bestMonths: ["April", "May", "June", "September"],
    highlights: ["Canal cruises", "Van Gogh Museum and Rijksmuseum", "Tulip season (mid-April)", "Bike tours of the city"],
    faqs: [
      { q: "Is Amsterdam expensive?", a: "Comparable to Paris and London. Mid-range hotels run $200 to $300 per night. Eat at a local cafe ($15 to $25 mains) instead of tourist-zone restaurants to save." },
      { q: "How many days do you need in Amsterdam?", a: "2 to 3 days for the city itself; add a day for Keukenhof tulip gardens (April) or a day trip to Bruges." },
    ],
  },
  {
    slug: "maldives",
    name: "Maldives",
    country: "Maldives",
    region: "Indian Ocean",
    summary: "The Maldives is the world's gold standard for overwater bungalows, crystal-clear lagoons, and one-resort-per-island luxury. Best for honeymoons, anniversaries, and bucket-list beach trips.",
    bestMonths: ["November", "December", "January", "February", "March", "April"],
    highlights: ["Overwater villas", "Snorkeling and diving", "Private-island resorts", "Seaplane transfers"],
    faqs: [
      { q: "How much does the Maldives cost?", a: "Budget $700 to $1,500+ per night for a quality overwater villa, plus $300 to $700 per person for the seaplane transfer. Cheaper local-island guesthouses start around $100 per night." },
      { q: "When is the best time to visit the Maldives?", a: "November through April for dry weather and calm seas. May through October is rainy season with lower prices but higher storm risk." },
    ],
  },
  {
    slug: "santorini",
    name: "Santorini",
    country: "Greece",
    region: "Europe",
    summary: "Santorini's whitewashed cliffside villages, dramatic caldera sunsets, and Mediterranean dining make it the most-photographed Greek island. Best paired with Mykonos, Crete, or Athens.",
    bestMonths: ["May", "June", "September", "October"],
    highlights: ["Oia sunsets", "Caldera cruises", "Wine tasting (Assyrtiko grapes)", "Black-sand beaches"],
    faqs: [
      { q: "How many days do you need in Santorini?", a: "3 to 4 nights. Long enough for two sunsets in Oia, a caldera boat day, a winery, and beach time." },
      { q: "When does Santorini get too crowded?", a: "Mid-July through August. Cruise crowds also fill Oia 4pm to 9pm. Visit in May, June, late September, or early October for the best balance." },
    ],
  },
  {
    slug: "costa-rica",
    name: "Costa Rica",
    country: "Costa Rica",
    region: "Central America",
    summary: "Costa Rica blends rainforest adventure, volcano hikes, surf-town beaches, and abundant wildlife (sloths, monkeys, toucans) in a small, easy-to-navigate country. Best for nature-focused families and active travelers.",
    bestMonths: ["December", "January", "February", "March", "April"],
    highlights: ["Arenal Volcano and hot springs", "Manuel Antonio National Park", "Monteverde cloud forest", "Pacific surf towns (Tamarindo, Santa Teresa)"],
    faqs: [
      { q: "Is Costa Rica safe?", a: "Yes, one of the safest in Central America. Standard precautions: don't leave valuables in rental cars, stick to well-known beaches at night." },
      { q: "How long do you need in Costa Rica?", a: "10 days minimum to combine Arenal, Monteverde, and one Pacific beach. 7 days works if you focus on just two regions." },
    ],
  },
  {
    slug: "hawaii",
    name: "Hawaii",
    country: "USA",
    region: "Pacific",
    summary: "Hawaii's six visitable islands each offer something different: Maui for honeymoons, Oahu for first-timers and surfing, Kauai for hiking, Big Island for volcanoes. Year-round warm weather.",
    bestMonths: ["April", "May", "September", "October"],
    highlights: ["Road to Hana (Maui)", "Pearl Harbor (Oahu)", "Volcanoes National Park (Big Island)", "Na Pali Coast (Kauai)"],
    faqs: [
      { q: "Which Hawaiian island is best for first-timers?", a: "Maui for couples and beach-focused trips. Oahu for value, Pearl Harbor, and a more urban feel (Honolulu/Waikiki)." },
      { q: "What's the cheapest time to fly to Hawaii?", a: "Late April through May and September through early December (excluding Thanksgiving). Avoid mid-December through early January and June through August." },
    ],
  },
  {
    slug: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    region: "Europe",
    summary: "Lisbon offers Old World charm, hilltop viewpoints, and excellent value for Western Europe. Pair with day trips to Sintra, Cascais, and Porto for a full week.",
    bestMonths: ["April", "May", "June", "September", "October"],
    highlights: ["Alfama old town", "Belem (pasteis de nata)", "Day trip to Sintra", "Lookout points (miradouros)"],
    faqs: [
      { q: "Is Lisbon affordable?", a: "Yes, one of Western Europe's best values. Mid-range hotels run $120 to $180 per night, full sit-down dinners $25 to $40 per person with wine." },
      { q: "How many days do you need in Lisbon?", a: "3 days for the city, plus 1 day for Sintra. Add Porto (3-hour train) for a full Portugal week." },
    ],
  },
  {
    slug: "prague",
    name: "Prague",
    country: "Czech Republic",
    region: "Europe",
    summary: "Prague's medieval old town, Gothic cathedrals, and famously cheap beer make it Central Europe's most popular weekend break. Walkable, scenic, and easy to combine with Vienna or Budapest.",
    bestMonths: ["April", "May", "September", "October", "December"],
    highlights: ["Charles Bridge at sunrise", "Old Town Square", "Prague Castle", "Christmas markets (December)"],
    faqs: [
      { q: "How many days do you need in Prague?", a: "2 to 3 days covers the major sights. Add a 4th for a day trip to Cesky Krumlov or Kutna Hora." },
      { q: "Is Prague cheap?", a: "Yes, by Western European standards. A pint of beer is often $2 to $3, mid-range hotels $80 to $130 per night, dinner with drinks $20 to $30." },
    ],
  },
  {
    slug: "dubai",
    name: "Dubai",
    country: "UAE",
    region: "Middle East",
    summary: "Dubai delivers ultra-modern skyscrapers, luxury beach resorts, world-class shopping, and desert excursions. A common stopover hub between Europe/North America and Asia or Africa.",
    bestMonths: ["November", "December", "January", "February", "March"],
    highlights: ["Burj Khalifa observation deck", "Desert safari", "Dubai Mall and Souks", "JBR Beach and Palm Jumeirah resorts"],
    faqs: [
      { q: "When should I avoid Dubai?", a: "May through September. Daily highs exceed 40°C / 104°F, and outdoor activities become impractical." },
      { q: "Is alcohol available in Dubai?", a: "Yes, in licensed hotel restaurants and bars. Public drinking and being intoxicated in public is illegal." },
    ],
  },
  {
    slug: "jamaica",
    name: "Jamaica",
    country: "Jamaica",
    region: "Caribbean",
    summary: "Jamaica's all-inclusive scene (Sandals, Beaches, Couples, Iberostar) is one of the Caribbean's strongest, with mountains, waterfalls, and reggae culture beyond the resorts.",
    bestMonths: ["December", "January", "February", "March", "April"],
    highlights: ["Negril Seven Mile Beach", "Dunn's River Falls", "Bob Marley Museum (Kingston)", "Adults-only and family all-inclusives"],
    faqs: [
      { q: "Is Jamaica safe for tourists?", a: "Resort areas and main tourist towns (Negril, Montego Bay, Ocho Rios) are safe with standard precautions. Use only resort transfers; avoid wandering outside tourist zones at night." },
      { q: "What's the best part of Jamaica for first-timers?", a: "Negril for laid-back beach + cliffside dining; Ocho Rios for adventure (waterfalls, river tubing); Montego Bay for resort variety and proximity to the airport." },
    ],
  },
  {
    slug: "mexico-city",
    name: "Mexico City",
    country: "Mexico",
    region: "North America",
    summary: "Mexico City has emerged as one of the world's most exciting food and culture capitals: world-class museums, Roma Norte cocktail bars, ancient pyramids, and excellent value.",
    bestMonths: ["October", "November", "March", "April", "May"],
    highlights: ["Teotihuacan pyramids day trip", "Frida Kahlo Museum (Coyoacan)", "Roma Norte and Condesa neighborhoods", "Tacos al pastor"],
    faqs: [
      { q: "Is Mexico City safe?", a: "Tourist neighborhoods (Roma Norte, Condesa, Polanco, Coyoacan, Centro Historico) are generally safe. Use Uber instead of street taxis. Avoid sketchy zones (Tepito, Iztapalapa)." },
      { q: "Do I need to worry about altitude in Mexico City?", a: "The city sits at 2,240m / 7,350ft. Some travelers feel mild altitude effects on day 1. Hydrate, take it easy, and avoid heavy alcohol the first day." },
    ],
  },
  {
    slug: "vancouver",
    name: "Vancouver",
    country: "Canada",
    region: "North America",
    summary: "Vancouver pairs glass-tower urban density with mountains, ocean, and rainforest at the edge of downtown. The closest major Canadian city to Asia and a launching point for Whistler.",
    bestMonths: ["June", "July", "August", "September"],
    highlights: ["Stanley Park seawall", "Granville Island Public Market", "Capilano Suspension Bridge", "Day trip to Whistler"],
    faqs: [
      { q: "When does it rain in Vancouver?", a: "October through April are wet and grey. June through September are typically warm and dry — peak visitor season." },
      { q: "How long do you need in Vancouver?", a: "3 to 4 days for the city + Stanley Park + Granville Island. Add 2 days for Whistler or Vancouver Island." },
    ],
  },
  {
    slug: "montreal",
    name: "Montreal",
    country: "Canada",
    region: "North America",
    summary: "Montreal is North America's most European city: French-speaking, walkable, with a strong food scene, Old Montreal cobblestones, and a vibrant summer festival circuit.",
    bestMonths: ["May", "June", "July", "August", "September"],
    highlights: ["Old Montreal", "Mount Royal lookout", "Jean-Talon Market", "Jazz Festival (late June/early July)"],
    faqs: [
      { q: "Do I need to speak French in Montreal?", a: "No. Most of downtown and tourist areas are bilingual. Learning a few French phrases is appreciated." },
      { q: "When is the best time to visit Montreal?", a: "June through August for festivals and patio season. Late September to early October for fall colours. Winter is brutally cold." },
    ],
  },
  {
    slug: "banff",
    name: "Banff",
    country: "Canada",
    region: "North America",
    summary: "Banff and Lake Louise offer some of the world's most photographed mountain scenery: turquoise glacial lakes, charming alpine towns, and year-round outdoor activities.",
    bestMonths: ["June", "July", "August", "September", "January", "February"],
    highlights: ["Lake Louise canoeing", "Moraine Lake", "Banff Gondola (Sulphur Mountain)", "Skiing at Lake Louise / Sunshine"],
    faqs: [
      { q: "When is the best time to visit Banff?", a: "Late June through early September for hiking and lake colours; January through March for skiing. Lakes freeze October through May." },
      { q: "Do I need a car in Banff?", a: "Strongly recommended. Public transit is limited, and the best lakes (Moraine, Peyto, Bow) require driving. Roam Transit covers Banff townsite." },
    ],
  },
];

export const HUB_SLUGS = DESTINATION_HUBS.map((h) => h.slug);
