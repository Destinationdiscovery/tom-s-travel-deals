import gearAdapterMain from "@/assets/gear-adapter-main.jpg";
import gearAdapterAngles from "@/assets/gear-adapter-angles.jpg";
import gearAdapterDevices from "@/assets/gear-adapter-devices.jpg";
import gearPackingCubesMain from "@/assets/gear-packing-cubes-main.jpg";
import gearPackingCubesSet from "@/assets/gear-packing-cubes-set.jpg";
import gearPackingCubesFeatures from "@/assets/gear-packing-cubes-features.jpg";
import gearPhoneHolderMain from "@/assets/gear-phone-holder-main.jpg";
import gearPhoneHolderAngles from "@/assets/gear-phone-holder-angles.jpg";
import gearPhoneHolderUses from "@/assets/gear-phone-holder-uses.jpg";
import gearWaterHammockMain from "@/assets/gear-water-hammock-main.jpg";
import gearWaterHammockFeatures from "@/assets/gear-water-hammock-features.jpg";
import gearWaterHammockDimensions from "@/assets/gear-water-hammock-dimensions.jpg";
import gearWaterHammockPacking from "@/assets/gear-water-hammock-packing.jpg";
import gearThermacellMain from "@/assets/gear-thermacell-main.jpg";
import gearThermacellProduct from "@/assets/gear-thermacell-product.jpg";
import gearThermacellZone from "@/assets/gear-thermacell-zone.jpg";

export interface GearReview {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: "Tech" | "Luggage" | "Beach & Pool" | "Accessories";
  image: string;
  rating: number;
  ratings: {
    buildQuality: number;
    portability: number;
    value: number;
    easeOfUse: number;
    durability: number;
  };
  testedOn: string;
  price: "$" | "$$" | "$$$";
  excerpt: string;
  pros: string[];
  cons: string[];
  fullReview: string[];
  tips: string[];
  amazonLink: string;
  bestFor: string[];
  gallery?: string[];
}

export const gearReviews: GearReview[] = [
  {
    id: "1",
    slug: "travel-converter-cuba-europe",
    name: "Universal Travel Adapter",
    brand: "Fortuna Mille",
    category: "Tech",
    image: gearAdapterMain,
    rating: 5,
    ratings: {
      buildQuality: 5,
      portability: 5,
      value: 5,
      easeOfUse: 5,
      durability: 5,
    },
    testedOn: "Cuba (2025), Curaçao (2025), Italy (2023)",
    price: "$",
    excerpt: "A low-cost, portable adapter that's durable, easy to pack, and one of those items I don't want to get caught without when traveling internationally.",
    pros: [
      "Compact size that takes up very little space in my bag",
      "Affordable price point, making it easy to own multiple adapters",
      "Inexpensive enough to buy for all family members",
      "Very durable - I've used these for over three years across multiple trips and they still work like new"
    ],
    cons: [
      "This is a plug adapter, not a voltage converter - it does not change the voltage from the outlet",
      "If you plan to use items like hair dryers or straighteners, you'll need a proper voltage converter, not just a travel adapter"
    ],
    fullReview: [
      "In today's world, electronics like cell phones, Bluetooth speakers, headphones, and tablets have become necessities when I travel. Whether I'm traveling for leisure or work, I always have multiple devices with me, and keeping them charged is often just as important as remembering my passport. Having this travel adapter ensures I can always keep my devices charged and ready to use, no matter where I am.",
      "What I appreciate most is the compact size that takes up very little space in my bag, and the affordable price point makes it easy to own multiple adapters - even for all family members. I've used these for over three years across multiple trips and they still work like new.",
      "One important thing to know: this is a plug adapter, not a voltage converter. It doesn't change the voltage coming from the outlet. Most modern electronics like cell phones, tablets, headphones, and Bluetooth speakers are dual-voltage (220V compatible), and this adapter simply allows you to plug them into foreign outlets so they can charge properly.",
      "I don't leave home without it when traveling internationally. I pack it in my luggage and typically use it on the nightstand or anywhere I'm charging my phone or other devices."
    ],
    tips: [
      "Always keep one in your carry-on so you can charge your phone immediately on arrival, especially in case your checked luggage is delayed or lost",
      "Most modern electronics (phones, tablets, Bluetooth speakers) are dual-voltage, so this adapter is all you need",
      "For hair dryers or straighteners, you'll need a voltage converter - this adapter alone won't work"
    ],
    amazonLink: "https://amzn.to/4qLP5K8",
    bestFor: ["North American travelers", "International travelers", "Budget-conscious travelers"],
    gallery: [gearAdapterMain, gearAdapterAngles, gearAdapterDevices]
  },
  {
    id: "2",
    slug: "packing-cubes",
    name: "Packing Cubes",
    brand: "BAGAIL",
    category: "Luggage",
    image: gearPackingCubesMain,
    rating: 4.5,
    ratings: {
      buildQuality: 4.5,
      portability: 5,
      value: 4,
      easeOfUse: 5,
      durability: 4,
    },
    testedOn: "Cuba, Curaçao, Italy (17 days), Nashville, Las Vegas",
    price: "$$",
    excerpt: "Packing cubes let me fit more into my luggage, keep everything organized, and easily move clothes from suitcase to dresser without unpacking, which makes travel and longer stays much easier.",
    pros: [
      "Helps me pack more into my suitcase while staying organized",
      "Makes it easy to separate clothing by type",
      "Great for both long trips and short weekend getaways",
      "Durable and holds up well across frequent travel",
      "Makes carry-on-only travel much more manageable"
    ],
    cons: [
      "Zippers can be stressed if you try to overstuff the cubes",
      "The included laundry bag could be larger, especially for longer trips",
      "Cubes are on the larger side - smaller cubes may be better for frequent carry-on only travelers"
    ],
    fullReview: [
      "I pack similar items into each cube, such as shorts and swimsuits, t-shirts, underwear and socks, and longer-sleeve items, which keeps everything easy to find. On longer trips, they make it much easier to pack more while staying organized, and I'll often use one cube for dirty clothes as the trip goes on.",
      "For shorter weekend trips, packing cubes help me fit everything into a carry-on, which makes traveling lighter and simpler. What I appreciate most is how they help me pack more into my suitcase while staying organized, and they're great for separating clothing by type.",
      "These cubes are durable and hold up well across frequent travel. I've tested them on week-long trips to Cuba and Curaçao, a 17-day trip to Italy, a weekend trip to Nashville, and a 5-day trip to Las Vegas.",
      "If I'm moving between hotels, I usually leave the cubes in my suitcase. If I'm staying in one place for a week or longer, I'll pull them out and place them directly into a closet or dresser, which makes settling in much easier."
    ],
    tips: [
      "Pack similar items into each cube - shorts and swimsuits, t-shirts, underwear and socks, longer-sleeve items",
      "Use one cube for dirty laundry as your trip goes on",
      "For shorter trips, packing cubes help you fit everything into a carry-on",
      "Pull cubes out and place them directly into a closet or dresser for longer stays"
    ],
    amazonLink: "https://amzn.to/49NivBR",
    bestFor: ["Travelers who like to stay organized", "Trips of one week or longer", "Carry-on travelers"],
    gallery: [gearPackingCubesMain, gearPackingCubesSet, gearPackingCubesFeatures]
  },
  {
    id: "3",
    slug: "airplane-phone-holder-mount",
    name: "Airplane Phone Holder Mount",
    brand: "NOZEWOWA",
    category: "Tech",
    image: gearPhoneHolderMain,
    rating: 4.8,
    ratings: {
      buildQuality: 4.5,
      portability: 5,
      value: 5,
      easeOfUse: 4.9,
      durability: 4.8,
    },
    testedOn: "Flights during my trip to Cuba",
    price: "$",
    excerpt: "This airplane phone holder has been a game changer for me, especially on flights that no longer have seatback screens. It clips securely onto the seat in front of you and keeps your phone at eye level for hands-free viewing.",
    pros: [
      "Clips securely onto the seat in front of you",
      "Keeps phone at eye level for comfortable hands-free viewing",
      "Also clips onto luggage handles for airport use",
      "Very affordable - picked up two for around $20",
      "Compact and easy to pack in carry-on"
    ],
    cons: [
      "Hinge is very tight when brand new and can feel like it might break if opened too forcefully",
      "Limited long-term durability data so far"
    ],
    fullReview: [
      "This airplane phone holder has been a game changer for me, especially on flights that no longer have seatback screens. I picked up two for around $20, which makes it very affordable, and it immediately solved the problem I always had with holding my phone or trying to balance it on the tray table.",
      "It clips securely onto the seat in front of you and keeps your phone at eye level, making it far more comfortable to watch videos hands-free during a flight. I also really like that it clips onto my luggage handle, which allows me to watch content or use my phone hands-free while waiting in airports.",
      "The only thing worth noting is the hinge. When it's brand new, it's very tight and can feel like it might break if you open it too forcefully, so I was careful at first until it loosened slightly.",
      "After using it on my trip to Cuba, it's already earned a permanent spot in my carry-on."
    ],
    tips: [
      "Be careful opening the hinge when brand new - it's very tight at first",
      "Also works great clipped onto your luggage handle at airports",
      "Keep it in your carry-on for easy access during flights",
      "The tight hinge will loosen slightly after a few uses"
    ],
    amazonLink: "https://amzn.to/4szOXix",
    bestFor: ["Long-haul travelers", "Flights without seatback screens", "Budget travelers"],
    gallery: [gearPhoneHolderMain, gearPhoneHolderAngles, gearPhoneHolderUses]
  },
  {
    id: "4",
    slug: "inflatable-water-hammock",
    name: "Inflatable Water Hammock",
    brand: "Aqua",
    category: "Beach & Pool",
    image: gearWaterHammockMain,
    rating: 4.8,
    ratings: {
      buildQuality: 4.5,
      portability: 5,
      value: 5,
      easeOfUse: 4.8,
      durability: 4.7,
    },
    testedOn: "Ocean use in Cuba and Curaçao",
    price: "$",
    excerpt: "These inflatable water hammocks have been a great addition to my travel gear, especially given the price point. They take up virtually no space in my luggage and make it comfortable to relax in the water without constantly swimming.",
    pros: [
      "Very affordable - picked up two for under $20",
      "Takes up virtually no space in luggage",
      "Easy to inflate and just as easy to deflate",
      "Comfortable for long stretches of floating in the water",
      "Good durability so far across multiple ocean trips"
    ],
    cons: [
      "Limited long-term durability data so far",
      "May not hold up as well in rougher water conditions"
    ],
    fullReview: [
      "These inflatable water hammocks have been a great addition to my travel gear, especially given the price point. I picked up two for under $20, which makes them very affordable, and they take up virtually no space in my luggage.",
      "They're easy to inflate and just as easy to deflate, which makes packing and unpacking simple. I've used them in the ocean on my last two trips to Cuba and Curaçao, and durability has been good so far.",
      "My wife and I love them because we enjoy spending long stretches of time floating in the water, and these make it comfortable to relax without constantly swimming.",
      "Given how little space they take up, they're an easy item to bring along on beach-focused trips."
    ],
    tips: [
      "Pick up two so you and a travel partner can both relax in the water",
      "Easy to inflate and deflate - no pump needed",
      "Great for ocean use in calm conditions",
      "Takes up virtually no space - easy to bring on any beach trip"
    ],
    amazonLink: "https://amzn.to/4jAiR2a",
    bestFor: ["Beach vacations", "Couples who enjoy floating", "Travelers who want to pack light"],
    gallery: [gearWaterHammockMain, gearWaterHammockFeatures, gearWaterHammockDimensions, gearWaterHammockPacking]
  },
  {
    id: "5",
    slug: "thermacell-patio-shield-mosquito-repellent",
    name: "Thermacell Patio Shield Mosquito Repellent",
    brand: "Thermacell",
    category: "Accessories",
    image: gearThermacellMain,
    rating: 4.9,
    ratings: {
      buildQuality: 5,
      portability: 4.8,
      value: 4.8,
      easeOfUse: 5,
      durability: 5,
    },
    testedOn: "Cuba and Curaçao (2025)",
    price: "$$",
    excerpt: "I was skeptical at first, but after using this on two tropical trips, the Thermacell Patio Shield has become something I won't travel without.",
    pros: [
      "Creates roughly a 20-foot mosquito-free radius",
      "DEET-free - no chemicals on your skin",
      "Rechargeable battery lasts a long time",
      "Just turn it on and let it work",
      "Extremely effective in high-mosquito environments"
    ],
    cons: [
      "Not tiny - takes up some luggage space and weight",
      "Mid-range price point"
    ],
    fullReview: [
      "I've used the Thermacell Patio Shield on two trips so far, one to Cuba in 2025 and another to Curaçao in 2025. Cuba was easily the worst in terms of mosquitoes, especially in the evenings. I spent a lot of time sitting in an open-air lobby bar, and the difference between having this on versus off was honestly unbelievable.",
      "When it wasn't running, the mosquitoes were everywhere. The moment I turned it on, they basically disappeared. It created roughly a 20-foot radius where you could actually sit and relax without constantly swatting at your legs and arms. I had doubts before using it, but after seeing how well it worked night after night, those doubts disappeared quickly.",
      "One of the biggest reasons I like this unit is that it's DEET-free and doesn't require spraying chemicals on your skin. You just turn it on and let it do its thing. The rechargeable battery lasts a long time as well. I used it every evening and never once worried about it dying on me.",
      "It's not tiny, and it does take up some luggage space and a bit of weight, but for trips where you're spending time outdoors in tropical destinations, it's absolutely worth it. The price sits in the mid range, but considering how effective it is, I think it's money well spent.",
      "If you're going anywhere warm, humid, or tropical and plan on being outside in the evenings, this is one of those items that quickly feels essential once you've used it."
    ],
    tips: [
      "Place it on the floor near where you're sitting for better coverage, especially around your legs and ankles",
      "It's ideal for patios, balconies, beach bars, and resort common areas",
      "Worth packing even if space is tight if you're traveling somewhere tropical",
      "Recharge it fully before heading out for the evening so it runs worry-free"
    ],
    amazonLink: "https://amzn.to/4jHDXf7",
    bestFor: ["Tropical destinations", "Evening outdoor dining", "Resort patios and balconies", "Mosquito-heavy areas"],
    gallery: [gearThermacellMain, gearThermacellProduct, gearThermacellZone]
  }
];

export const gearCategories = ["All", "Tech", "Luggage", "Beach & Pool", "Accessories"] as const;