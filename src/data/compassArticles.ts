import packingImg from "@/assets/curacao-gallery-6.webp";
import guidesImg from "@/assets/deal-santorini.jpg";
import budgetImg from "@/assets/deal-cruise.jpg";
import insuranceImg from "@/assets/deal-alps.jpg";
import timingImg from "@/assets/deal-maldives.jpg";

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
}

export const compassArticles: CompassArticle[] = [
  {
    id: 1,
    slug: "essential-packing-tips-beach-destinations",
    title: "Essential Packing Tips for Beach Destinations",
    category: "Packing",
    categoryColor: "bg-blue-500",
    image: packingImg,
    excerpt: "Master the art of packing light while having everything you need for sun, sand, and adventure.",
    author: "Tom Laracy",
    datePublished: "December 15, 2024",
    readTime: "6 min read",
    content: [
      "After more than a decade of helping travelers prepare for beach getaways, I have seen just about every packing mistake in the book. From overstuffed suitcases that attract extra fees to forgotten essentials that derail the first day of vacation, the difference between a smooth trip and a stressful one often comes down to how you pack.",
      "The first rule I share with every client is this: pack for the trip you are actually taking, not the one you imagine. Most beach destinations have shops, pharmacies, and markets. You do not need to bring enough sunscreen for a small army or pack outfits for scenarios that will never happen.",
      "Start with a carry-on mindset, even if you plan to check a bag. This forces you to prioritize. For a week-long beach trip, I recommend three to four versatile outfits that can mix and match, two swimsuits so one can dry while you wear the other, a light cover-up that works for beach bars and casual dinners, and one slightly nicer outfit for an evening out.",
      "Fabrics matter more than people realize. Cotton wrinkles and holds moisture. Synthetic blends dry quickly and resist wrinkles, making them ideal for tropical climates. Linen looks great but requires ironing, which most travelers would rather skip on vacation.",
      "Your beach bag essentials should include reef-safe sunscreen, a quality pair of sunglasses with UV protection, a wide-brimmed hat that can fold without losing its shape, and a dry bag for your phone and valuables. These items get daily use and are worth investing in before your trip.",
      "Electronics require some planning. Bring a portable charger for long beach days, a waterproof phone case if you plan to snorkel or kayak, and check whether your destination uses different outlets. A universal adapter takes up almost no space and solves potential charging headaches.",
      "Toiletries are where most travelers overpack. Hotels provide basics, and anything you forget can be purchased locally, often at reasonable prices. Decant your must-haves into travel-sized containers and leave full bottles at home.",
      "One tip that has saved my clients countless times: pack a small first aid kit with basics like bandages, pain relievers, antihistamines, and any prescription medications. Pharmacies exist everywhere, but having essentials on hand prevents a minor issue from eating into your beach time.",
      "Finally, leave room in your bag. You will buy things. Souvenirs, local crafts, that perfect beach dress you found at a market. Starting with a bit of empty space means you will not face a packing crisis on your return trip.",
      "The goal is to arrive relaxed and ready to enjoy yourself, not exhausted from wrestling with luggage. Pack smart, pack light, and let the destination be the focus of your trip."
    ]
  },
  {
    id: 2,
    slug: "destination-guides-where-to-go-next",
    title: "Destination Guides: Where to Go Next",
    category: "Guides",
    categoryColor: "bg-emerald-500",
    image: guidesImg,
    excerpt: "Curated recommendations for every type of traveler, from romantic getaways to family adventures.",
    author: "Tom Laracy",
    datePublished: "December 8, 2024",
    readTime: "7 min read",
    content: [
      "Choosing where to travel next is one of the most exciting parts of trip planning, but it can also feel overwhelming. With so many incredible destinations in the world, how do you narrow it down? After years of matching travelers with their perfect trips, I have learned that the best destination depends less on what is trending and more on what you actually want from your vacation.",
      "For couples seeking romance, I consistently recommend Santorini, the Maldives, and the Amalfi Coast. These destinations offer a combination of stunning scenery, intimate dining experiences, and accommodations designed for two. Santorini in particular delivers incredible sunsets, walkable villages, and a pace of life that encourages lingering over meals and conversation.",
      "Families have different needs, and the best family destinations balance activities for all ages with logistics that do not exhaust parents. The Caribbean islands, particularly Aruba and Turks and Caicos, offer calm, shallow waters for young children, resorts with kids clubs, and enough variety to keep teenagers engaged. Cruises also work exceptionally well for families, as they handle the logistics while offering something for everyone.",
      "Adventure seekers should look beyond the obvious. Costa Rica remains a favorite for its combination of wildlife, rainforests, and activities from zip-lining to surfing. New Zealand offers world-class hiking and landscapes that feel otherworldly. For something closer to home, Utah's national parks provide dramatic terrain and outdoor challenges without the long flight.",
      "Budget-conscious travelers often ask me where they can get the most value. Portugal consistently ranks among my top recommendations, offering excellent food, historic cities, and beautiful coastline at prices well below Western European averages. Mexico beyond the resort zones, particularly Oaxaca and Mexico City, delivers incredible culture and cuisine at a fraction of what you would spend in Europe.",
      "Timing your trip matters as much as choosing the destination. Shoulder seasons, the periods just before and after peak tourist months, often provide the best combination of good weather, lower prices, and fewer crowds. September and early October work beautifully for the Mediterranean. April and May are ideal for the Caribbean before hurricane season peaks.",
      "Consider your travel style honestly. Some people want to explore actively every day. Others need true downtime to recharge. There is no right answer, but booking a trip that conflicts with your natural pace leads to frustration. A packed itinerary sounds exciting in planning but can feel exhausting in practice.",
      "Do not overlook the value of returning to places you love. There is something deeply satisfying about revisiting a destination with familiarity, trying that restaurant you missed last time, or exploring a neighborhood you only glimpsed before. Not every trip needs to be somewhere new.",
      "When clients feel stuck, I ask them to describe their ideal day on vacation in detail. What are you eating? Where are you? What does the pace feel like? The answers reveal more about where they should go than any destination guide ever could.",
      "The world has no shortage of remarkable places to visit. The key is matching the destination to who you are and what you need right now. That is where thoughtful travel planning makes all the difference."
    ]
  },
  {
    id: 3,
    slug: "budget-travel-hacks-that-work",
    title: "Budget Travel Hacks That Actually Work",
    category: "Budget",
    categoryColor: "bg-amber-500",
    image: budgetImg,
    excerpt: "Smart strategies to stretch your travel budget without sacrificing comfort or experience.",
    author: "Tom Laracy",
    datePublished: "November 28, 2024",
    readTime: "6 min read",
    content: [
      "Everyone wants to travel more while spending less, and the internet is full of advice on how to do it. The problem is that much of that advice is outdated, impractical, or requires a level of flexibility that most travelers simply do not have. After years of helping clients maximize their travel budgets, I want to share the strategies that actually work.",
      "Timing is the most powerful lever you have. Flying midweek, typically Tuesday through Thursday, almost always costs less than weekend departures. Traveling during shoulder season saves money on flights, accommodations, and activities while often providing a better overall experience with fewer crowds.",
      "Flexibility with dates makes a significant difference. If you can shift your trip by even a few days, fare comparison tools will show you the cheapest options within a date range. Sometimes a Wednesday departure instead of Saturday saves hundreds of dollars per person.",
      "Book flights and hotels separately rather than as a package. This takes more time but usually yields better prices and more options. The exception is all-inclusive resorts, where packages genuinely offer value by bundling food, drinks, and activities.",
      "Loyalty programs are not just for frequent travelers. Sign up for airline and hotel programs even if you only travel once or twice a year. Points accumulate, status can come with perks like free breakfast or room upgrades, and member rates often beat public prices.",
      "Credit card points, when used strategically, can dramatically reduce travel costs. Cards with travel rewards and sign-up bonuses can fund entire trips. The key is paying off balances in full each month. Interest charges would quickly erase any rewards benefit.",
      "Avoid hidden costs by reading the fine print. Resort fees, baggage charges, and foreign transaction fees add up quickly. Budget for these in advance rather than being surprised at checkout. Some destinations also have departure taxes that must be paid in cash at the airport.",
      "Eat like a local. Restaurant meals in tourist areas are typically overpriced and often mediocre. Venture a few blocks away, find where residents eat, and you will save money while having better food. Markets and grocery stores also offer affordable options for breakfasts and picnic lunches.",
      "Do not underestimate the value of a good travel consultant. While we do charge fees or earn commissions, we often have access to rates, upgrades, and amenities that more than offset our costs. We also save you time and catch potential problems before they become expensive mistakes.",
      "The goal is not to travel as cheaply as possible but to get maximum value from what you spend. Sometimes the budget option is the right choice. Other times, spending a bit more on location or quality of accommodation transforms the entire trip. Knowing where to save and where to splurge is the real skill."
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
    author: "Tom Laracy",
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
    slug: "best-times-to-visit-popular-destinations",
    title: "Best Times to Visit Popular Destinations",
    category: "Timing",
    categoryColor: "bg-teal-500",
    image: timingImg,
    excerpt: "Seasonal guides to help you plan the perfect trip with ideal weather and fewer crowds.",
    author: "Tom Laracy",
    datePublished: "November 5, 2024",
    readTime: "6 min read",
    content: [
      "When you travel matters almost as much as where you travel. The same destination can offer completely different experiences depending on the season, and understanding these patterns helps you plan trips that align with what you actually want from your vacation.",
      "The Caribbean draws most visitors from December through April, when weather is warm and dry and much of North America is cold. But this peak season comes with peak prices and crowds. The shoulder months of November and early December offer excellent weather at better rates, while May through early June provides good value before the heart of hurricane season.",
      "European summer is popular for good reason. Long days, warm weather, and outdoor dining create a magical atmosphere. But July and August bring crushing crowds to major cities and tourist sites. June and September deliver similar weather with significantly fewer visitors and lower prices. October remains pleasant in Southern Europe while offering fall colors in the north.",
      "The Maldives follows monsoon patterns. December through April is dry season with calm seas and excellent visibility for diving and snorkeling. The wet season from May to November brings lower prices and fewer tourists, though some resorts close and water activities can be limited. Shoulder months offer a balance of good conditions and reasonable rates.",
      "Hawaii works year-round, but timing affects your experience. Winter brings larger surf to north shores and whale watching season, while summer offers calmer waters for snorkeling. The weeks around Christmas and spring break are the busiest and most expensive. September and October tend to be the quietest months with good weather.",
      "Japan has distinct seasonal draws. Cherry blossom season in late March through early April is magical but extremely crowded and expensive. Fall foliage in November offers similar beauty with somewhat fewer visitors. Summer is hot and humid but brings festivals throughout the country. Winter is ideal for skiing and visiting onsen hot springs.",
      "Australia's seasons are reversed from the Northern Hemisphere. Their summer, December through February, is prime time for beaches but also brings heat and crowds. Shoulder seasons in spring, September through November, and fall, March through May, often provide the best overall conditions for exploring diverse regions.",
      "Cruises have their own timing considerations. Alaska season runs May through September, with late June through August offering the warmest weather. Mediterranean cruises are popular April through October, with shoulder months providing better value. Caribbean cruise prices vary significantly by season, with summer often the most affordable time.",
      "Beyond weather, consider local events and holidays. Traveling during a major festival can be an incredible experience but requires booking far in advance. Traveling during local holidays may mean closed businesses and limited services. Research what will be happening during your travel dates.",
      "The perfect time to visit any destination depends on your priorities. Do you want the best weather regardless of cost and crowds? Or would you prefer lower prices and fewer tourists with the trade-off of less predictable conditions? There are no wrong answers, only different approaches to the same wonderful problem of deciding when to explore the world."
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
