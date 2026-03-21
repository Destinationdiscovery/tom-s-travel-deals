// 2026 Travel Trends article images
import trendsHeroImg from "@/assets/trends-yoga-mountain.jpg";
import trendsCozyRetreatImg from "@/assets/trends-cozy-retreat.webp";
import trendsWellnessVillaImg from "@/assets/trends-wellness-villa.jpg";
import trendsWellnessAestheticImg from "@/assets/trends-wellness-aesthetic.jpg";
import trendsLuxuryRetreatImg from "@/assets/trends-luxury-retreat.jpg";
// Japan article images
import japanHeroImg from "@/assets/japan-tokyo-skyline.jpg";
import japanCherryImg from "@/assets/japan-cherry-blossoms.webp";
import japanShrineImg from "@/assets/japan-fushimi-inari.jpg";
import japanRyokanImg from "@/assets/japan-ryokan.png";
import japanAnimeImg from "@/assets/japan-anime-street.webp";
// Canada Boom article images
import canadaBoomHeroImg from "@/assets/canada-boom-banff-street.jpg";
import canadaBoomWinterImg from "@/assets/canada-boom-banff-winter.jpg";
import canadaBoomLakeLouiseImg from "@/assets/canada-boom-lake-louise.jpg";
import canadaBoomRockiesImg from "@/assets/canada-boom-rockies-winter.jpg";
import insuranceImg from "@/assets/deal-alps.jpg";
import vegasStripImg from "@/assets/vegas-strip-hero.jpg";
// Snowbird article images
import snowbirdHeroImg from "@/assets/snowbird-beach-sunset.jpg";
import snowbirdTrafficImg from "@/assets/snowbird-traffic.jpg";
import snowbirdCaribbeanImg from "@/assets/snowbird-caribbean-aerial.jpg";
import snowbirdResortImg from "@/assets/snowbird-resort-pool.jpg";
import snowbirdBanffImg from "@/assets/snowbird-banff.jpg";
import snowbirdTimesSquareImg from "@/assets/snowbird-times-square.jpg";
import snowbirdPalmBeachImg from "@/assets/snowbird-palm-beach.jpg";
// Group Travel article images
import groupTravelHeroImg from "@/assets/group-travel-hero.png";
import groupTravelFamilyImg from "@/assets/group-travel-family.jpg";
import groupTravelWeddingImg from "@/assets/group-travel-wedding.webp";
import groupTravelTeamImg from "@/assets/group-travel-team.jpg";
import groupTravelBeachImg from "@/assets/group-travel-beach.webp";
// WestJet Seat Squeeze article images
import westjetPlaneHeroImg from "@/assets/westjet-plane-hero.avif";
import westjetEconomyCabinImg from "@/assets/westjet-economy-cabin.jpeg";
import westjetLegroomImg from "@/assets/westjet-legroom.jpg";
import westjetSeatsWindowImg from "@/assets/westjet-seats-window.jpg";
// Trevi Fountain Fee article images
import treviFountainHeroImg from "@/assets/trevi-fountain-hero.avif";
import treviFountainCrowdsImg from "@/assets/trevi-fountain-crowds.jpg";
import treviFountainSculpturesImg from "@/assets/trevi-fountain-sculptures.jpg";
import treviFountainEveningImg from "@/assets/trevi-fountain-evening.jpg";
export interface ContentBlock {
  type: "text" | "image" | "heading";
  value: string;
  caption?: string;
}

export interface CompassArticle {
  id: number;
  slug: string;
  title: string;
  category: string;
  categoryColor: string;
  image: string;
  excerpt: string;
  author: string;
  datePublished: string;
  readTime: string;
  content: string[];
  richContent?: ContentBlock[];
}

export const compassArticles: CompassArticle[] = [
  {
    id: 1,
    slug: "2026-travel-trends-whycations-glowcations-microvacations",
    title: "2026 Travel Trends: Purpose-Driven Whycations, Glowcations & Microvacations - How Canadians Can Jump In",
    category: "Guides",
    categoryColor: "bg-teal-500",
    image: trendsHeroImg,
    excerpt: "Hilton, Conde Nast, and Expedia highlight the rise of intentional travel. Here's what Whycations, Glowcations, and Microvacations mean for Canadian travelers.",
    author: "Tom",
    datePublished: "January 27, 2026",
    readTime: "7 min read",
    content: [],
    richContent: [
      { type: "text", value: "2026 is shaping up to be the year of intentional travel for Canadians. Big reports from Hilton, Condé Nast Traveler, and Expedia highlight a shift toward trips with real meaning. Travelers are moving away from bucket-list checks and toward experiences that recharge, reconnect, or inspire. Hilton calls this the rise of \"Whycations,\" where the \"why\" comes before the \"where.\" Glowcations blend wellness with beauty routines, and microvacations pack big impact into short escapes. These trends fit perfectly with Canadian travelers seeking balance after busy years." },
      { type: "text", value: "Why now? Global reports show travelers craving purpose over volume. Hilton's 2026 Trends Report points to emotional drivers like recharging or family connection. Condé Nast notes a focus on mindful wellness and quieter escapes. Expedia's Unpack '26 emphasizes immersive, personal trips. For Canadians, this means more intentional getaways from Toronto, with easier access to wellness spots and quick flights." },
      { type: "image", value: trendsCozyRetreatImg, caption: "Whycations prioritize meaningful experiences like quiet reflection and reconnection" },
      { type: "heading", value: "The Top Trends Explained" },
      { type: "text", value: "Whycations: Purpose-Driven Trips. These start with a goal, like reconnecting with loved ones, finding inner peace, or personal growth. Think family multi-generational trips or solo retreats for reflection. Hilton highlights how travelers prioritize comfort, control, and connection." },
      { type: "image", value: trendsWellnessVillaImg, caption: "Wellness-focused stays combine relaxation with self-care in stunning settings" },
      { type: "text", value: "Glowcations: Wellness Meets Beauty. Combine spa treatments, skincare rituals, and relaxation. These trips focus on feeling good inside and out, with yoga, facials, and nature immersion. They're popular for \"glow\" results from healthy living and self-care." },
      { type: "image", value: trendsWellnessAestheticImg, caption: "The glowcation trend blends beauty rituals with nature-inspired wellness" },
      { type: "text", value: "Microvacations: Short, Far-Flung Escapes. Quick 3 to 5 day trips deliver big refreshment without long time off. Far-flung spots or nearby hidden gems offer high impact. Expedia notes rising demand for bite-sized adventures that fit busy schedules." },
      { type: "heading", value: "How Canadians Can Book These Trends" },
      { type: "image", value: trendsLuxuryRetreatImg, caption: "Spa retreats and wellness escapes offer purpose-driven travel experiences" },
      { type: "text", value: "Wellness retreats are easy to find in Canada. Niagara-on-the-Lake or Banff offer yoga, spa, and nature experiences. Look at places like Fairmont or local retreats for purpose-driven stays. For glowcations, book spa packages in Toronto or fly to Mexico/Caribbean for all-inclusive wellness." },
      { type: "text", value: "Microvacations work well with direct flights from YYZ. Quick trips to Montreal, Vancouver, or even New York deliver culture and relaxation. Use Air Canada Vacations or Expedia for bundles." },
      { type: "text", value: "Start small: A weekend wellness escape in Ontario or a short Caribbean glowcation. These trends are affordable and flexible, perfect for Ontario travelers." },
      { type: "heading", value: "A Travel Agent's Take" },
      { type: "text", value: "As an Ontario travel agent, I see clients loving these meaningful options. They fit busy lives and deliver real value. If you're ready for a Whycation, glowcation, or microvacation in 2026, now is the time to plan." },
      { type: "text", value: "Which trend excites you most? Drop a comment or reach out for help booking your intentional trip from Ontario. Safe travels!" }
    ]
  },
  {
    id: 2,
    slug: "japan-top-destination-canadians-2026",
    title: "Why Japan Is the #1 Destination Canadians Are Booking for 2026 (And How to Go on a Budget)",
    category: "Destinations",
    categoryColor: "bg-rose-500",
    image: japanHeroImg,
    excerpt: "Japan is exploding as the number one trending international destination for Canadians heading into 2026. Here's why and how to make it affordable.",
    author: "Tom",
    datePublished: "January 26, 2026",
    readTime: "10 min read",
    content: [],
    richContent: [
      { type: "text", value: "Japan is exploding as the number one trending international destination for Canadians heading into 2026, according to fresh Skyscanner data released in January. Searches and bookings from Canada are surging, driven by a combo of cultural immersion, pop culture buzz including anime and K-culture crossover, stunning seasonal events, and crucially a still-favorable yen exchange rate making it feel like a steal compared to traditional spots like the US or Europe." },
      { type: "text", value: "This shift ties into broader trends. With some Canadians eyeing alternatives to US travel due to costs, tensions, or preferences, Japan offers high-value, meaningful trips. Think purpose-driven experiences like wellness, food discovery, or book-inspired journeys. Reports highlight Japan's mix of ancient traditions and modern vibes, from futuristic Tokyo to serene temples, as a big draw, plus easier access via direct flights and strong value for money." },
      { type: "heading", value: "Why Japan Is Surging for Canadians Right Now" },
      { type: "text", value: "Skyscanner's data confirms Japan leads or ranks highly in 2026 search spikes for Canadians, with average round-trip flights to Tokyo around CAD $1,183, often lower on deals, putting it in the top 10 cheapest destinations globally that year. Social media virality around cherry blossoms, Disney comparisons cheaper than Florida, and anime/Ghibli effects are fueling this." },
      { type: "image", value: japanAnimeImg, caption: "Japan's anime culture and modern city vibes are a major draw for Canadian travelers" },
      { type: "text", value: "The weaker yen remains a major advantage. With the rate hovering around 114-115 JPY per CAD as of mid-January 2026, Canadians are getting more bang for their buck on food, stays, and shopping. Konbini meals under CAD $5 and high-quality experiences at lower costs than pre-2022 make the trip feel incredibly accessible." },
      { type: "text", value: "Cultural and pop appeal cannot be overstated. Immersive trends like glowcations, fan voyages for sumo and local sports, and set-jetting to real-life anime locations fit Japan perfectly. Travel advisors note the massive anime and K-culture effect boosting spots like Hiroshima for history plus food and Nagoya for Ghibli Park." },
      { type: "heading", value: "Direct Flights from Toronto" },
      { type: "text", value: "Air Canada operates non-stop flights to Tokyo, both Haneda and Narita airports, with multiple weekly departures. Flight times are around 14 hours direct. Other carriers like ANA, JAL, United, or Cathay offer competitive one-stop options. Current round-trips hover between CAD $957 to $1,318. Check Google Flights, Skyscanner, or Air Canada's site for real-time deals, and shoulder seasons dip even lower." },
      { type: "heading", value: "Cherry Blossom Season Planning for Sakura 2026" },
      { type: "image", value: japanCherryImg, caption: "Peak cherry blossom season transforms Japan into a pink paradise" },
      { type: "text", value: "Peak season runs late March to early April in central areas like Tokyo, Kyoto, and Osaka. Forecasts point to slightly earlier blooms due to warmer trends. Full bloom lasts about one week, so plan 10 to 14 days to catch the front moving north." },
      { type: "text", value: "In Tokyo, bloom starts around March 20 with full bloom around March 27. Ueno Park hosts festivals with lanterns. In Kyoto and Osaka, bloom starts around March 25 with full bloom in early April. Iconic spots include the Philosopher's Path and various castles. Book early because hotels spike, but off-peak shoulder weeks save big. Use apps like Sakura Navi for daily forecasts." },
      { type: "heading", value: "Budget Tips for Canadians: Maximize the Weak Yen" },
      { type: "text", value: "Japan remains affordable in 2026. Expect CAD $200 to $400 per day per person for mid-range travel, or lower on budget. Here is the breakdown:" },
      { type: "text", value: "Flights run CAD $957 to $1,500 round-trip. Hunt deals via Air Canada Vacations packages. For accommodation, hostels and capsule hotels cost CAD $40 to $80 per night, while ryokans or Airbnbs run CAD $100 to $200. Book early for sakura season." },
      { type: "image", value: japanRyokanImg, caption: "Traditional ryokan stays offer authentic Japanese hospitality at reasonable prices" },
      { type: "text", value: "Food is where Japan shines for budget travelers. Konbini meals and onigiri cost CAD $5 to $10 per meal. Ramen and sushi sets run CAD $10 to $20. Skip tourist traps and local izakayas are much cheaper. For transport, consider a JR Pass if visiting multiple cities, or regional passes. IC cards like Suica or Pasmo make metro travel easy. Walking is free and cities are incredibly walkable." },
      { type: "text", value: "Savings hacks include shopping at 100-yen shops for essentials, visiting free parks and shrines, eating convenience store meals, and avoiding peak weekends. Note that tax-free shopping shifts in November 2026 with refunds at airport only. A total 10 to 14 day trip runs CAD $3,000 to $6,000 per person including flights and mid-range everything, cheaper than many European trips now." },
      { type: "heading", value: "Must-Do Cultural Experiences" },
      { type: "image", value: japanShrineImg, caption: "Fushimi Inari Shrine in Kyoto is one of Japan's most iconic cultural sites" },
      { type: "text", value: "Top experiences include a tea ceremony with matcha and sweets often with modern twists, kimono or yukata rental plus a stroll through historic districts, sumo stable visits or tournaments though tickets book fast, and onsen/ryokan stays for ultimate relaxation." },
      { type: "text", value: "For pop culture fans, must-visits include Akihabara, Ghibli Park in Nagoya, and teamLab exhibits. Food immersion through local supermarkets, street eats, and kaiseki dinners is essential. Consider zen meditation or calligraphy workshops. During sakura season, hanami picnics under the cherry blossoms are a quintessential experience." },
      { type: "heading", value: "Visa and Entry for Canadians" },
      { type: "text", value: "No visa is needed for tourism or business up to 90 days. Just bring a valid passport and carry it at all times since a photocopy will not cut it. From late 2026, watch for JESTA, an electronic authorization system with about a CAD $40 fee being phased in. No major changes otherwise. Super straightforward entry for Canadians." },
      { type: "text", value: "Japan in 2026 offers Canadians the perfect combination of cultural depth, modern excitement, seasonal beauty, and genuine value. Whether you are chasing cherry blossoms, exploring anime hotspots, or seeking traditional experiences, now is an exceptional time to book. The yen advantage will not last forever, so planning ahead pays off." }
    ]
  },
  {
    id: 3,
    slug: "domestic-canada-boom-banff-lake-louise-2026",
    title: "Domestic Canada Boom: Banff, Lake Louise, and Why More Canadians Are Staying Home in 2026",
    category: "Guides",
    categoryColor: "bg-teal-500",
    image: canadaBoomHeroImg,
    excerpt: "With shifting attitudes toward U.S. travel and a desire for meaningful escapes, destinations like Banff and Lake Louise are seeing renewed interest across all seasons.",
    author: "Tom",
    datePublished: "January 27, 2026",
    readTime: "8 min read",
    content: [],
    richContent: [
      { type: "text", value: "2026 is shaping up to be a breakout year for domestic travel in Canada. With fewer Canadians heading south and more looking closer to home, destinations like Banff and Lake Louise are seeing renewed interest across all seasons. Between shifting attitudes toward U.S. travel, rising costs abroad, and a desire for meaningful escapes without border hassles, staying in Canada suddenly feels like the smart and satisfying choice." },
      { type: "text", value: "Domestic trips are no longer the backup plan. They're the main event. Scenic landscapes, improved rail and air connections, and strong value for money are pulling Canadians toward iconic mountain towns, cultural cities, and winter-friendly destinations that feel both familiar and fresh." },
      { type: "heading", value: "Why Domestic Travel Is Booming in 2026" },
      { type: "text", value: "Several factors are driving this shift. U.S. travel demand from Canada has softened, influenced by cost concerns, currency differences, and changing snowbird habits. At the same time, Canada's own destinations are topping global \"best places\" lists for scenery and experience. Travelling at home also removes passport stress, currency swings, and surprise fees, which matters more than ever." },
      { type: "text", value: "Reports across the travel industry show Canadians prioritizing ease, flexibility, and value. A trip to Banff or Lake Louise offers jaw-dropping scenery without international logistics, while cities like Vancouver and Quebec City combine culture, food, and walkability with short flight times." },
      { type: "heading", value: "Why Banff and Lake Louise Are Leading the Pack" },
      { type: "image", value: canadaBoomWinterImg, caption: "Banff's charming downtown comes alive in winter with snow-capped peaks as the backdrop" },
      { type: "text", value: "Banff and Lake Louise continue to dominate domestic travel wish lists, especially for winter and shoulder seasons. Snow-covered peaks, frozen lakes, and cozy alpine towns create a dramatic before-and-after contrast that plays perfectly on social media and TikTok. Winter isn't a downside here; it's the draw." },
      { type: "text", value: "Activities go far beyond skiing. Visitors are booking snowshoeing, ice walks, frozen lake skating, sleigh rides, and spa days with mountain views. Winter prices are often more approachable than peak summer, making these destinations surprisingly affordable for Canadians who plan smart." },
      { type: "image", value: canadaBoomLakeLouiseImg, caption: "Lake Louise transforms into a natural skating rink, drawing visitors for unforgettable winter experiences" },
      { type: "text", value: "Train travel is also having a moment. Rail journeys through the Rockies turn the trip itself into part of the experience, appealing to travelers who want slower, scenic travel without driving mountain roads." },
      { type: "heading", value: "Family-Friendly and March Break Alternatives" },
      { type: "text", value: "For families, domestic travel is filling the gap left by pricier U.S. theme park trips. A Banff or Lake Louise winter escape offers snow play, tubing, wildlife viewing, and family-oriented resorts without long lines or extreme crowds." },
      { type: "text", value: "March Break is a sweet spot. While some families still head south, others are choosing winter festivals, ski schools, and indoor-outdoor activity mixes in the Rockies or Quebec. Quebec City, in particular, feels like Europe without the transatlantic flight, especially in winter when the old town shines." },
      { type: "heading", value: "How Canadians Are Booking Smarter" },
      { type: "text", value: "Canadians are leaning into bundled travel. Train-and-hotel packages, flight deals, and off-peak stays are making domestic trips easier to budget. Shorter stays are also popular, with long weekends delivering a full reset without burning vacation days." },
      { type: "text", value: "The mindset has shifted from \"once in a lifetime\" to \"easy to repeat.\" Travelers are happy to return to favorite places in different seasons, getting more value and deeper experiences over time." },
      { type: "heading", value: "The Big Takeaway for 2026" },
      { type: "image", value: canadaBoomRockiesImg, caption: "The Canadian Rockies offer dramatic winter scenery that rivals any international destination" },
      { type: "text", value: "Canada isn't just a fallback option this year. It's where Canadians genuinely want to be. From the drama of Banff and Lake Louise to the culture of Vancouver and Quebec City, staying domestic offers beauty, simplicity, and strong value in a year when those things matter more than ever." },
      { type: "text", value: "As an Ontario travel agent, I'm seeing more clients choose Canadian destinations for winter getaways, March Break trips, and even milestone vacations. If you're thinking about exploring Banff, Lake Louise, or another Canadian gem in 2026, now is the time to plan while availability and pricing are still working in your favour." }
    ]
  },
  {
    id: 4,
    slug: "travel-insurance-what-you-need",
    title: "Travel Insurance: What You Really Need",
    category: "Insurance",
    categoryColor: "bg-purple-500",
    image: insuranceImg,
    excerpt: "Understanding coverage options and why the right policy can save your trip.",
    author: "Tom",
    datePublished: "November 15, 2024",
    readTime: "7 min read",
    content: [
      "Travel insurance is one of those topics that seems boring until you need it. I have seen trips saved by good policies and others derailed by inadequate coverage. Understanding what travel insurance actually does, and what it does not, can make the difference between a minor inconvenience and a financial disaster.",
      "At its core, travel insurance protects your investment in a trip. If you have to cancel for a covered reason, trip cancellation coverage reimburses your nonrefundable expenses. If your trip is interrupted mid-journey, trip interruption coverage helps with additional costs and unused portions of your booking.",
      "Medical coverage is often the most important component, especially for international travel. Your domestic health insurance likely provides limited or no coverage abroad. A medical emergency overseas can result in bills of tens or even hundreds of thousands of dollars. Quality travel insurance covers emergency medical treatment, hospital stays, and medical evacuation if necessary.",
      "Medical evacuation alone justifies the cost for many travelers. If you are injured or become seriously ill in a remote location or a country with limited medical facilities, evacuation to a hospital equipped to treat you can cost fifty thousand dollars or more. Insurance handles this completely.",
      "Trip cancellation coverage has limits that travelers should understand. Standard policies cover cancellation due to illness, injury, death of a traveler or family member, and certain other specified reasons. They do not cover changing your mind, work conflicts, or general anxiety about traveling. Cancel for Any Reason coverage, which costs more, provides greater flexibility but typically reimburses only a percentage of your costs.",
      "Read your policy before you buy, not after something goes wrong. Pay attention to coverage limits, exclusions, and what documentation you need to file a claim. Pre-existing medical condition exclusions are common but can often be waived if you purchase insurance within a specified window after your initial trip deposit.",
      "When should you buy travel insurance? The simple answer is as soon as you have nonrefundable expenses at stake. The earlier you purchase, the longer your coverage period and the more likely you are to qualify for pre-existing condition waivers.",
      "Not every trip requires insurance. A weekend domestic getaway with refundable bookings carries little financial risk. But international travel, expensive trips, cruises, and travel to remote destinations all warrant serious consideration of insurance coverage.",
      "I recommend getting quotes from several providers and comparing coverage, not just price. A cheaper policy with lower limits or more exclusions is not actually a better deal. Look for insurers with strong reputations for paying claims without excessive hassle.",
      "The best travel insurance is coverage you buy and never use. But when things go wrong, having the right policy transforms a potential catastrophe into a manageable situation. For the relatively small cost compared to most trip budgets, it provides peace of mind that allows you to actually enjoy your travels."
    ]
  },
  {
    id: 5,
    slug: "why-canadians-skipping-us-2026",
    title: "Why Snowbirds and Canadians Are Skipping the US More in 2026 (And Where They're Going Instead)",
    category: "Guides",
    categoryColor: "bg-teal-500",
    image: snowbirdHeroImg,
    excerpt: "Data shows Canadian travel to the US is down sharply. Here's why snowbirds are rethinking their winter escapes and the destinations offering better value.",
    author: "Tom",
    datePublished: "January 27, 2026",
    readTime: "8 min read",
    content: [],
    richContent: [
      { type: "text", value: "Canada's snowbirds and winter travelers are making a big shift in 2026. Data from Statistics Canada and industry surveys shows a sharp drop in return trips from the US, with November 2025 numbers down 23.6 percent compared to the previous year. This marks months of steady declines in Canadian visits south of the border. Snowbirds, who traditionally head to Florida, Arizona, and other sunny US states to escape Ontario winters, are rethinking their plans. Allianz Canada's reports highlight this change, noting the US is no longer the top winter destination for Canadians. Shifting insurance needs and travel patterns are reshaping how older travelers plan their escapes." },
      { type: "text", value: "Why now? Several factors are driving this trend. Political tensions, including comments from US leadership about tariffs and relations with Canada, have left many feeling unwelcome or uneasy. A weaker Canadian dollar makes US trips more expensive, with higher costs for everything from accommodations to healthcare. New border rules, like registration requirements for longer stays, add hassle and scrutiny. Economic uncertainty and rising insurance premiums for US trips push people to look elsewhere. Surveys from groups like the Canadian Snowbird Association show declines of 12 to 27 percent in US-bound plans compared to recent years. Many are choosing patriotism, affordability, or simpler travel over tradition." },
      { type: "image", value: snowbirdTrafficImg, caption: "Border crossings and rising costs are pushing Canadians to reconsider their winter travel plans" },
      { type: "text", value: "This is not about staying home entirely. Snowbirds are redirecting to warmer spots that feel more welcoming and budget-friendly. Allianz notes a rise in flexible insurance demand as people explore new risks in these alternatives." },
      { type: "heading", value: "Where Canadians Are Heading Instead" },
      { type: "image", value: snowbirdCaribbeanImg, caption: "Mexico and Caribbean destinations offer stunning beaches and better value for Canadian travelers" },
      { type: "text", value: "Mexico and the Caribbean lead the pack as top alternatives. Places like Playa del Carmen, Puerto Vallarta, and the Riviera Maya in Mexico offer stunning beaches, vibrant expat communities, and a lower cost of living. The Dominican Republic, with spots like Punta Cana, delivers all-inclusive resorts and Caribbean vibes at great value. Costa Rica stands out for nature lovers, with rainforests, beaches, and reliable healthcare. These destinations often have direct flights from Toronto and favorable exchange rates that stretch dollars further." },
      { type: "image", value: snowbirdResortImg, caption: "All-inclusive resorts provide exceptional value with everything bundled into one price" },
      { type: "text", value: "Domestic Canada is booming too. More people opt for stays in British Columbia, Alberta's Rockies like Banff, or even warmer pockets in Ontario and Quebec. Train packages, cozy resorts, and family-friendly winter activities provide escape without crossing borders. This keeps money in Canada and avoids any international hassles." },
      { type: "image", value: snowbirdBanffImg, caption: "Banff and the Canadian Rockies offer a winter escape without crossing borders" },
      { type: "text", value: "Other emerging spots include Portugal's Algarve for mild winters and European charm, or Central American options like Belize for affordability and laid-back living." },
      { type: "heading", value: "Comparing Deals: US vs. Mexico/Caribbean/Canada" },
      { type: "image", value: snowbirdTimesSquareImg, caption: "Traditional US destinations like New York are feeling the pinch as Canadians look elsewhere" },
      { type: "text", value: "US trips still have appeal for some, with familiar spots and direct drives or flights. But costs add up fast. A month in Florida might hit higher with expensive rentals, groceries, and insurance that has nearly doubled for some. Border waits and rules create stress." },
      { type: "text", value: "Mexico and Caribbean packages shine on value. All-inclusive resorts in Punta Cana or Cancun often start under CAD $1,500 to $2,500 per person for a week or more, including flights from YYZ. Sunwing, Air Canada Vacations, and others run clearance sales with family deals to Cuba, the Dominican Republic, and Mexico under $1,000 to $2,000 pp. Direct flights keep it simple." },
      { type: "text", value: "Domestic options win on ease. Banff or Vancouver packages bundle flights, hotels, and activities for less than many US equivalents, especially with no currency exchange pain. Costco Travel, Red Tag, and Expedia offer strong bundles." },
      { type: "text", value: "Bottom line: Many find better bang for the buck outside the US right now. A shorter stay in Costa Rica or extended time in Mexico can cost less than a full Florida winter while delivering sun, relaxation, and peace of mind." },
      { type: "heading", value: "A Travel Agent's Perspective" },
      { type: "image", value: snowbirdPalmBeachImg, caption: "White sand beaches in Mexico and the Caribbean are welcoming Canadian travelers" },
      { type: "text", value: "As an Ontario travel agent, I see this shift firsthand. Clients want warm escapes without the headaches. If you're a snowbird rethinking the US or exploring new spots, now is prime time to book before peak season fills up. Mexico and Caribbean deals are strong, and domestic getaways offer cozy alternatives." },
      { type: "text", value: "What changed for you this year? Drop a comment if you're skipping the US or share your favorite alternative. Reach out if you need help planning your 2026 winter escape from Ontario. Safe travels!" }
    ]
  },
  {
    id: 6,
    slug: "canadian-at-par-deal-las-vegas",
    title: "The Canadian At-Par Deal in Las Vegas: What It Is, Who It's For, and Why I'm Not Sure It Changes Much",
    category: "Deals",
    categoryColor: "bg-rose-500",
    image: vegasStripImg,
    excerpt: "A few downtown Las Vegas casinos are accepting Canadian dollars at par, but is it really worth changing your travel plans for?",
    author: "Tom",
    datePublished: "January 26, 2026",
    readTime: "7 min read",
    content: [
      "Every summer or so, a Vegas deal pops up that gets Canadians talking again. This year, it is the Canadian at-par offer in downtown Las Vegas, where a few casinos are accepting Canadian dollars at face value instead of U.S. dollars.",
      "On the surface, it sounds generous. With the Canadian dollar where it is right now, paying 1:1 instead of eating the exchange feels like a win. But once you dig into the details, I am not convinced this deal actually moves the needle for most Canadians, or that it is meant to.",
      "Through August 31, three downtown Las Vegas casinos are accepting Canadian currency at par for certain expenses. The participating properties are Circa Resort and Casino, The D Las Vegas, and Golden Gate Hotel and Casino.",
      "If you are Canadian and show a valid Canadian passport or government-issued ID, those properties will treat your Canadian dollars as if they were U.S. dollars for hotel room rates, drinks, and select slot play up to $500 on participating machines.",
      "With the exchange rate hovering around $1 USD to roughly $1.37 CAD at the time of writing, the potential savings are real, at least on paper. The offer also extends to BarCanada, a hockey-themed bar in Las Vegas that is owned by the same group.",
      "The push is coming from Derek Stevens, the CEO who owns all three properties. He has been open about having personal ties to Canada, including the fact that his father studied at the University of Toronto, and he has said that connection played a role in launching the promotion.",
      "So this is not a city-wide tourism initiative. It is a targeted offer from one ownership group, aimed squarely at Canadian visitors they already know and value.",
      "This is where my skepticism comes in. First, all three casinos are in downtown Las Vegas, not on the Strip. Downtown has its fans, and I have enjoyed it myself, but it is a very specific Vegas experience. If someone already prefers newer Strip resorts, this deal probably does not factor into their decision at all.",
      "Second, I do not see many Canadians deciding to go to Vegas because of this. If someone was not already planning a Vegas trip, I doubt accepting Canadian dollars at par suddenly tips the scales. At best, it makes an existing plan feel a bit easier to justify.",
      "It feels much more like a retention perk for people who already travel to Vegas than a true incentive to bring in new visitors.",
      "There is also a broader reality here. Canadians, in general, are not travelling to the U.S. the way they once did. Exchange rates, higher costs, and changing travel habits have pushed a lot of people toward other destinations entirely.",
      "Vegas is also a very specific kind of trip. If that style of travel is not already appealing, a currency deal alone probably is not enough to overcome the bigger reasons people are staying away.",
      "In that sense, the at-par promotion feels less like a growth strategy and more like a way to soften the blow for Canadians who were already on the fence.",
      "That said, I do not think the deal is pointless. If you are already planning a Vegas trip this summer, comfortable staying downtown, and planning to spend money on drinks or slots anyway, then being able to pay in Canadian dollars at par is a genuine perk.",
      "It simplifies budgeting and can shave a noticeable amount off your overall spend, especially over several days. It is just not something I would chase or let dictate where I travel.",
      "For me, this falls firmly into the nice if it lines up category. I would not plan a Vegas trip around it, and I would not book downtown just for the currency angle. But if I were already going, already staying at one of these properties, and already planning to spend time on the casino floor, I would take advantage of it without hesitation.",
      "The Canadian at-par deal in Las Vegas is a real offer with real savings, but its impact is narrower than the headlines suggest. It is limited to three downtown casinos, runs only through August 31, and is unlikely to convince Canadians who were not already planning a Vegas trip. For the right traveler, at the right time, it is a solid bonus. For everyone else, it is more of an interesting footnote than a reason to book a flight."
    ]
  },
  {
    id: 7,
    slug: "group-travel-2026-who-uses-it-why-booming",
    title: "Group Travel in 2026: Who Uses It, Why It's Booming, and How It Fits Canadian Travelers",
    category: "Guides",
    categoryColor: "bg-teal-500",
    image: groupTravelHeroImg,
    excerpt: "Group travel is making a strong comeback in 2026. From friends reunions to destination weddings, here's who's booking and why it works for Ontario travelers.",
    author: "Tom",
    datePublished: "January 28, 2026",
    readTime: "10 min read",
    content: [],
    richContent: [
      { type: "text", value: "Group travel is making a strong comeback in 2026, with the global market growing steadily. Reports show the sector valued around USD 168 to 369 billion in recent years, heading toward USD 295 to 689 billion by 2033 with CAGRs of 5.8 to 7.2 percent. This surge comes from people craving shared experiences after years of isolation, plus easier planning through apps and tour operators." },
      { type: "text", value: "For Canadians, especially from Ontario, group trips offer affordable, meaningful escapes amid rising costs and shifting preferences away from solo or fully independent travel. Whether it's a friends reunion, family milestone, or corporate retreat, group travel delivers connection and value." },
      { type: "heading", value: "Who Uses Group Travel?" },
      { type: "text", value: "Group travel appeals to a wide range of people, but key segments stand out in 2026. Friends and Social Groups lead the charge, with many adults, including millennials and Gen X, choosing group trips to reconnect. Surveys show over a third feel stuck in social ruts, and trips with friends rank as more meaningful than family or partner vacations for some. Friend reunions and \"group therapy\" style getaways are hot, often in villas, yachts, or destinations like the Caribbean or Europe." },
      { type: "text", value: "Families and Multi-Generational Groups are surging post-pandemic, with families prioritizing quality time. Multi-gen trips are up significantly, with bookings for groups over five growing fast. Parents seek digital detoxes for kids, while grandparents join for shared memories. These often include all-inclusive resorts, cruises, or domestic spots like Niagara or Banff." },
      { type: "image", value: groupTravelFamilyImg, caption: "Multi-generational trips are surging as families prioritize quality time together" },
      { type: "text", value: "Corporate and Incentive Groups remain a major segment. Businesses invest in team-building, conferences, and rewards. Corporate travel spending nears or exceeds a trillion dollars in related areas, with groups using retreats or incentive trips to boost collaboration and morale. Bleisure extensions blend work and play, making these trips feel more personal." },
      { type: "text", value: "Weddings and Celebrations drive significant demand. Destination weddings and intimate events are popular, with couples customizing trips for parties. Villas in Mykonos or alpine resorts are top picks. These create shared occasions for friends and family without the host hassle of organizing everything at home." },
      { type: "image", value: groupTravelWeddingImg, caption: "Destination weddings create shared occasions for friends and family without the host hassle" },
      { type: "text", value: "Special Interest and Educational Groups round out the mix. Adventure enthusiasts, wellness seekers, religious pilgrims, or study tours form affinity groups. Smaller, interest-based trips focusing on wellness, hobbies, or learning are replacing large standard tours." },
      { type: "heading", value: "Why People Choose Group Travel Over Solo or Independent Trips" },
      { type: "image", value: groupTravelTeamImg, caption: "Shared adventures and team activities build deeper connections and lasting memories" },
      { type: "text", value: "Shared Costs and Convenience make luxury accessible. Splitting expenses across a group lowers per-person rates significantly. Packages include flights, hotels, transport, and activities at bundled prices. Planning is simpler with operators handling logistics, so nobody in the group has to play travel agent." },
      { type: "text", value: "Safety and Support matter, especially for women or first-time travelers. Groups provide security and companionship. You travel \"solo but not alone,\" with built-in friends and guides who know the destination." },
      { type: "text", value: "Bonding and Meaningful Experiences are at the heart of group travel. Traveling together builds connections through shared adventures, laughs, and memories. It's ideal for reconnecting after separations or strengthening relationships that don't get enough attention in daily life." },
      { type: "text", value: "Less Stress, More Fun is a big draw. No compromising on every detail or spending hours researching. Fixed itineraries suit busy people, while some flexibility allows personal time. Wellness, adventure, or cultural immersion feels amplified when experienced together. Value for Money improves too, with group-size deals offering perks like private transfers or exclusive access." },
      { type: "heading", value: "The Practical Side of Group Travel, Especially for Larger Groups" },
      { type: "text", value: "When groups hit 10 people or more, things get more complex. In my experience helping Ontario clients plan these trips, managing availability, room blocks, and details for that many people on your own can be challenging. Individuals booking flights, vacations, or cruises usually handle up to about 6 people per reservation, but larger groups often need special handling. These bigger groups typically must be booked more than 60 days before departure to secure space, and trying to piece it together yourself risks running into no availability for parts of the trip, like the return flight or hotel rooms." },
      { type: "text", value: "Working with a travel agent makes this smoother. Everything goes under one booking number, so availability is checked with suppliers upfront, and the whole group stays together. This avoids surprises and keeps things coordinated." },
      { type: "text", value: "For example, with Sunwing vacations that I book frequently, group rates are usually the same or better than posted prices at the time of quote, and you can lock in that rate from quote to final booking. Perks often include free block seating on the plane, one free checked bag and carry-on per person, free private shuttle transfers for the group, and even a free room value every 8th person (pre-tax). These extras add up and make the trip feel more special without extra cost." },
      { type: "text", value: "Maintaining communication, tracking payments, and handling changes for 10 or more people takes a lot of effort. Having someone experienced manage it takes the burden off the group organizer, whether it's a wedding couple, corporate planner, or family leader. It lets everyone focus on enjoying the time together instead of logistics." },
      { type: "heading", value: "A Travel Agent's Perspective" },
      { type: "image", value: groupTravelBeachImg, caption: "Group travel delivers connection, savings, and adventure without the solo hassle" },
      { type: "text", value: "For Canadians in Ontario, group travel fits well with trends like domestic booms or affordable international packages from YYZ. Operators like G Adventures or Air Canada Vacations offer tailored group options, from Eastern Canada tours to wellness retreats. As an Ontario travel agent, I see how these trips create lasting memories while keeping things practical and affordable." },
      { type: "text", value: "What's your next group trip idea? Drop a comment or reach out for help planning from Ontario. Safe travels!" }
    ]
  },
  {
    id: 8,
    slug: "westjet-seat-squeeze-passengers-said-no",
    title: "WestJet Tried to Squeeze in More Seats for Cheaper Fares... But Passengers Said No Way!",
    category: "News",
    categoryColor: "bg-amber-500",
    image: westjetPlaneHeroImg,
    excerpt: "WestJet's experiment with tighter seats grabbed headlines in early 2026. Here's what happened, why passengers pushed back, and tips for your next booking.",
    author: "Tom",
    datePublished: "January 29, 2026",
    readTime: "6 min read",
    content: [],
    richContent: [
      { type: "text", value: "As an Ontario travel agent, I see how much comfort matters on flights, especially for those longer sun getaways from YYZ. WestJet's recent experiment with tighter seats grabbed headlines in early 2026, and it's a story that hits home for so many Canadian travellers." },
      { type: "heading", value: "What Happened with WestJet's Seats" },
      { type: "text", value: "Late last year, WestJet reconfigured some of their Boeing 737 planes (mostly the MAX 8s and 737-8s) to add an extra row of seats in economy. They reduced the seat pitch (the space between rows) to as low as 28 inches in many spots, down from the usual 30-31 inches. This bumped the total seats from about 174 to 180 on those aircraft. The idea was to pack in more passengers per flight, spread costs around, and help keep base fares lower in a competitive market." },
      { type: "image", value: westjetEconomyCabinImg, caption: "WestJet reduced seat pitch to 28 inches to add more passengers per flight" },
      { type: "text", value: "WestJet's CEO even said it was about trying \"seat pitches popular with many airlines around the globe\" to offer more affordable options. Sounds logical on paper, right? But for real people flying, it felt like the opposite." },
      { type: "heading", value: "The Passenger Pushback" },
      { type: "text", value: "Passengers quickly pushed back. Viral videos and social media posts showed knees jammed against seatbacks, complaints about non-reclinable seats in the denser rows, and just general discomfort. The feedback was loud and fast, with forums, TikTok, and reviews lighting up about the cramped feel." },
      { type: "text", value: "Families, taller travellers, and anyone who likes a bit of room to stretch out were vocal. Cabin crew chimed in too, mentioning it made their jobs harder in tighter spaces." },
      { type: "image", value: westjetLegroomImg, caption: "Extended Comfort seats offer extra legroom for travelers who prioritize space" },
      { type: "heading", value: "WestJet's Reversal" },
      { type: "text", value: "By mid-January 2026, WestJet listened. They announced a full reversal on the densified part: they'd remove that extra row of seats (dropping back to 174), restore the prior standard pitch (at least 30 inches in economy), and get rid of any fixed non-reclinable seats. The change needs safety certification from regulators, but they committed to rolling it out as quickly as possible across the affected planes (around 21-22 aircraft)." },
      { type: "text", value: "CEO Alexis von Hoensbroech called it a response to guest feedback, saying some ideas just \"don't meet expectations.\"" },
      { type: "text", value: "This move probably cost them millions in lost capacity and reconfiguration work, but it shows how fast passenger voices can change airline plans. For Ontario travellers heading to sun spots or domestic routes, it's good news if you're on a WestJet flight soon. more legroom means a happier trip, especially on those 3-5 hour hauls." },
      { type: "heading", value: "Practical Tips for Your Next WestJet Booking" },
      { type: "image", value: westjetSeatsWindowImg, caption: "Checking seat maps early helps you avoid denser configurations during the transition" },
      { type: "text", value: "Check seat maps early when choosing flights. avoid the denser configs if they're still in rotation during the transition." },
      { type: "text", value: "If legroom is a must, look at their \"Extended Comfort\" seats (extra pitch for a fee) or premium options." },
      { type: "text", value: "For families or groups, chat with an agent. we can help lock in better seats or alternatives on Sunwing/Air Canada Vacations where space feels more generous." },
      { type: "text", value: "Keep an eye on reviews and updates. airlines tweak things often, and feedback like this drives changes." },
      { type: "heading", value: "A Travel Agent's Perspective" },
      { type: "text", value: "As an Ontario travel agent, I see comfort complaints pop up all the time, especially on budget carriers. If you're thinking about a winter getaway or family trip, now is a great time to plan." },
      { type: "text", value: "What's your next trip idea? Drop a comment or reach out for help planning from Ontario. Safe travels!" }
    ]
  },
  {
    id: 9,
    slug: "rome-trevi-fountain-fee-genius-or-ripoff",
    title: "Rome Just Charged 2 Euros to See the Trevi Fountain: Is This Genius or a Total Rip-Off?",
    category: "News",
    categoryColor: "bg-amber-500",
    image: treviFountainHeroImg,
    excerpt: "Rome rolled out a 2-euro fee for close-up Trevi Fountain access. Here's how it works, why they did it, and tips for your Italy trip from Ontario.",
    author: "Tom",
    datePublished: "February 2, 2026",
    readTime: "5 min read",
    content: [],
    richContent: [
      { type: "text", value: "Hey everyone, if you've got Italy on your bucket list, especially that classic moment tossing a coin into the Trevi Fountain for good luck and a return trip to Rome, things just changed a bit. As of February 2, 2026, Rome rolled out a small 2-euro fee (around $3 CAD) for tourists and non-residents to get right up close to the fountain's basin and steps during daytime hours." },
      { type: "text", value: "The surrounding piazza still offers free views of this stunning 18th-century Baroque masterpiece, and after 10 p.m., access opens up for everyone without any charge." },
      { type: "heading", value: "Why the Fee?" },
      { type: "text", value: "The city introduced this to help manage the huge crowds. the Trevi sees about 30,000 visitors on an average day, spiking to 70,000 on busy weekends, and over 9-10 million people a year." },
      { type: "image", value: treviFountainCrowdsImg, caption: "The Trevi sees about 30,000 visitors on an average day, spiking to 70,000 on busy weekends" },
      { type: "text", value: "It's part of broader efforts in Rome (and places like the Pantheon and Venice) to handle overtourism, improve flow, and fund upkeep and preservation of these historic sites." },
      { type: "text", value: "Officials estimate the fee could bring in around 6.5 million euros annually, with funds going back into maintenance and better visitor experiences." },
      { type: "heading", value: "How It Works Now" },
      { type: "text", value: "Fee amount: 2 euros per person (paid online in advance, on-site, or via tourist points)." },
      { type: "text", value: "When it applies: From 11:30 a.m. to 10 p.m. on Mondays and Fridays; 9 a.m. to 10 p.m. on other days (last admission around 9 p.m.)." },
      { type: "image", value: treviFountainSculpturesImg, caption: "The 18th-century Baroque masterpiece is one of Rome's most iconic landmarks" },
      { type: "text", value: "What you get: Timed access to the inner area by the water for photos, coin tosses, and that up-close experience (often with less chaos thanks to controlled entry)." },
      { type: "text", value: "Exemptions: Rome residents, people with disabilities (plus one companion), and children under 6 (some sources note under 5) are free." },
      { type: "text", value: "Free options: View from the upper piazza anytime, or get close after 10 p.m. when barriers lift." },
      { type: "text", value: "How to prepare: Book timed slots online ahead if possible (similar to other Rome sites), especially for peak season." },
      { type: "heading", value: "Early Feedback" },
      { type: "text", value: "Early feedback from visitors includes positive notes on easier access and better photo opportunities with fewer crowds pushing in. One tourist mentioned it felt comfortable and worth the small cost for a smoother visit." },
      { type: "heading", value: "Practical Tips for Your Rome Trip" },
      { type: "image", value: treviFountainEveningImg, caption: "After 10 p.m., access opens up for everyone without any charge" },
      { type: "text", value: "Arrive early morning or late afternoon for lighter crowds even with the fee." },
      { type: "text", value: "Stick to the classic coin toss: over your left shoulder with your right hand to ensure you return to Rome." },
      { type: "text", value: "Combine with nearby gems like the Spanish Steps or a gelato stroll." },
      { type: "text", value: "Consider shoulder seasons (spring or fall) when lines are shorter overall." },
      { type: "text", value: "Check if your visit qualifies for any exemptions or bundles with city passes." },
      { type: "heading", value: "A Travel Agent's Perspective" },
      { type: "text", value: "As an Ontario travel agent, I see this firsthand with clients heading to Europe from YYZ. Planning ahead makes a big difference here. we can check flight options on Air Canada or bundle with Sunwing vacation packages, plus help coordinate timed entries and other Rome must-sees. For groups of 10+, we lock in rates and handle details to keep things stress-free." },
      { type: "text", value: "This is one more update in how popular European spots are adapting to record tourism numbers. Have you been to the Trevi Fountain before or after the change? Would you pay the small fee for closer access, or stick to the free view from afar? Share your thoughts below!" }
    ]
  }
];

export const getArticleBySlug = (slug: string): CompassArticle | undefined => {
  return compassArticles.find(article => article.slug === slug);
};

export const getRelatedArticles = (currentSlug: string, count: number = 3): CompassArticle[] => {
  return compassArticles
    .filter(article => article.slug !== currentSlug)
    .slice(0, count);
};
