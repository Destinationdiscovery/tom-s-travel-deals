import gearAdapterMain from "@/assets/gear-adapter-main.jpg";
import gearAdapterAngles from "@/assets/gear-adapter-angles.jpg";
import gearAdapterDevices from "@/assets/gear-adapter-devices.jpg";

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
      portability: 4,
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
    name: "Compression Packing Cubes Set",
    brand: "Peak Design",
    category: "Luggage",
    image: "/placeholder.svg",
    rating: 5,
    ratings: {
      buildQuality: 5,
      portability: 5,
      value: 4,
      easeOfUse: 4,
      durability: 5,
    },
    testedOn: "15+ trips since 2022",
    price: "$$",
    excerpt: "These compression cubes changed how I pack. I can now fit a week's worth of clothes in a carry-on and stay organized throughout the trip.",
    pros: [
      "Compression zippers reduce volume by 30-50%",
      "Mesh panels for visibility and breathability",
      "Durable weatherproof material",
      "Multiple sizes for different clothing types"
    ],
    cons: [
      "Premium price point",
      "Takes practice to maximize compression"
    ],
    fullReview: [
      "I resisted packing cubes for years, thinking they were unnecessary. I was wrong. These compression cubes have transformed my packing routine.",
      "The compression feature is game-changing—I can pack more while keeping everything organized. I use the large cube for shirts and pants, medium for underwear and socks, and small for accessories.",
      "When I arrive at my destination, I just pull out the cubes and put them in drawers. No more rummaging through a messy suitcase.",
      "The weatherproof material has also come in handy during unexpected rain while transferring between terminals."
    ],
    tips: [
      "Roll clothes instead of folding for maximum compression",
      "Use the mesh side facing up so you can see contents at a glance",
      "Dedicate one cube to dirty laundry during your trip",
      "The small cube is perfect for chargers and tech accessories"
    ],
    amazonLink: "https://amazon.com",
    bestFor: ["Frequent travelers", "Carry-on only travelers", "Organization enthusiasts"]
  },
  {
    id: "3",
    slug: "airplane-phone-holder-mount",
    name: "Airplane Phone Holder Mount",
    brand: "Perilogics",
    category: "Tech",
    image: "/placeholder.svg",
    rating: 4,
    ratings: {
      buildQuality: 4,
      portability: 5,
      value: 5,
      easeOfUse: 4,
      durability: 4,
    },
    testedOn: "10+ long-haul flights",
    price: "$",
    excerpt: "Clamps onto the tray table or seat-back for hands-free viewing during flights. A simple solution that makes long flights much more comfortable.",
    pros: [
      "Universal fit for all phone sizes",
      "No installation—just clamp and go",
      "Adjustable viewing angles",
      "Lightweight and portable"
    ],
    cons: [
      "Doesn't work on all seat types",
      "Can feel slightly wobbly during turbulence"
    ],
    fullReview: [
      "On long flights, holding your phone to watch movies gets tiring fast. This simple mount clamps onto the tray table latch or seat-back entertainment screen, giving you a perfect hands-free viewing experience.",
      "I've used it on flights to Mexico, Cuba, and across Europe. It works with any phone case and adjusts to portrait or landscape mode.",
      "The only downside is some newer seat designs have thicker latches that make clamping tricky, but it works on 90% of seats I've encountered.",
      "At this price point, it's an absolute must-have for anyone who watches content on flights."
    ],
    tips: [
      "Test the clamp on the tray table before takeoff to find the best position",
      "Works great with tablets too if the clamp can grip them",
      "Download your content before the flight for the best experience",
      "Keep it in your personal item for easy access during boarding"
    ],
    amazonLink: "https://amazon.com",
    bestFor: ["Long-haul travelers", "Entertainment lovers", "Budget travelers"]
  },
  {
    id: "4",
    slug: "inflatable-pool-float-hammock",
    name: "Inflatable Pool Float Hammock",
    brand: "Aqua",
    category: "Beach & Pool",
    image: "/placeholder.svg",
    rating: 4,
    ratings: {
      buildQuality: 3,
      portability: 5,
      value: 5,
      easeOfUse: 5,
      durability: 3,
    },
    testedOn: "Mexico resort 2024, Multiple beach trips",
    price: "$",
    excerpt: "The perfect resort companion. Lightweight, packable, and comfortable enough to spend hours floating in the pool or ocean.",
    pros: [
      "Packs flat in luggage",
      "Comfortable mesh center keeps you cool",
      "Supports up to 250 lbs",
      "Inflates quickly without a pump"
    ],
    cons: [
      "Not the most durable for rough use",
      "Can drift in ocean currents"
    ],
    fullReview: [
      "I discovered these inflatable hammock floats on my last Mexico trip and now I never travel to a beach destination without one.",
      "Unlike bulky pool floats, these pack completely flat and weigh almost nothing. The mesh center keeps you in the water just enough to stay cool while you relax.",
      "I've used mine at resort pools, calm beaches, and even cenotes. It inflates in about 30 seconds and deflates just as fast.",
      "At this price point, even if it only lasts a few trips, it's worth every penny for the relaxation it provides."
    ],
    tips: [
      "Inflate it fully for pool use, slightly less for ocean floating",
      "The mesh center is great for staying cool but can snag on rough surfaces",
      "Bring a small repair kit for longer trips just in case",
      "Works best in calm water - avoid strong currents"
    ],
    amazonLink: "https://amazon.com",
    bestFor: ["Beach vacations", "Resort travelers", "Pool lovers"]
  }
];

export const gearCategories = ["All", "Tech", "Luggage", "Beach & Pool", "Accessories"] as const;