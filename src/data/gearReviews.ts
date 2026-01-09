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
    testedOn: "Cuba 2024, European trips",
    price: "$$",
    excerpt: "The only adapter you'll ever need for Cuba's unique outlets and European travel. I've tested this across multiple countries and it's never let me down.",
    pros: [
      "Works in Cuba's Type A/B and European Type C/E/F outlets",
      "Built-in USB-A and USB-C ports for charging multiple devices",
      "Compact design fits easily in carry-on",
      "Surge protection keeps devices safe"
    ],
    cons: [
      "Slightly bulky for minimalist packers",
      "No built-in voltage converter (most modern devices don't need one)"
    ],
    fullReview: [
      "After years of traveling with multiple adapters, I finally found one that handles everything. This universal adapter has been my go-to for Cuba trips (which have their own unique outlet requirements) and all my European adventures.",
      "The build quality is solid, and having USB ports built-in means fewer things to pack. I've charged my phone, laptop, and camera simultaneously without issues. The surge protection gives me peace of mind when plugging into older outlets in places like Havana.",
      "For Cuba specifically, this is essential. The country uses a mix of outlet types, and many hotels have outlets that don't match standard North American plugs. This adapter handles all of them without any issues.",
      "Essential for any international traveler, and at this price point, it's a no-brainer investment for your travel kit."
    ],
    tips: [
      "Always check that your devices are dual-voltage (110-240V) before plugging in abroad",
      "The USB-C port delivers fast charging - use it for your phone",
      "Keep it in your carry-on so you can charge devices during layovers",
      "The built-in surge protection is especially valuable in older hotels"
    ],
    amazonLink: "https://amzn.to/4pubjPC",
    bestFor: ["Cuba travelers", "European trips", "International travelers"],
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