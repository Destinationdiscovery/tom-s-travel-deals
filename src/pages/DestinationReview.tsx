import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AffiliateDisclosureBanner from "@/components/AffiliateDisclosureBanner";
import ReadingProgress from "@/components/ReadingProgress";
import { useParams, Link } from "react-router-dom";
import { Star, ArrowLeft, Calendar, MapPin, Heart, Share2, Twitter, Facebook, Copy, Check, Package, Plug, Waves, ChevronUp, ArrowRight, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import RelatedReviews from "@/components/RelatedReviews";
import AuthorBio from "@/components/AuthorBio";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import CommentsSection from "@/components/comments/CommentsSection";
import AffiliateLinks, { detectCountry, EXPEDIA_LINKS } from "@/components/AffiliateLinks";
import InlineAffiliateCTA from "@/components/InlineAffiliateCTA";
import { trackAffiliateClick } from "@/lib/analytics";
import ReviewEngagement from "@/components/ReviewEngagement";

import { Button } from "@/components/ui/button";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import cubaImg from "@/assets/deal-cuba.jpg";
import cubaGallery1 from "@/assets/cuba-gallery-1.jpg";
import cubaGallery2 from "@/assets/cuba-gallery-2.jpg";
import cubaGallery3 from "@/assets/cuba-gallery-3.jpg";
import cubaGallery4 from "@/assets/cuba-gallery-4.jpg";
import cubaGallery5 from "@/assets/cuba-gallery-5.jpg";
import cubaGallery6 from "@/assets/cuba-gallery-6.jpg";
import cubaGallery7 from "@/assets/cuba-gallery-7.jpg";
import cubaGallery8 from "@/assets/cuba-gallery-8.jpg";
import cubaGallery9 from "@/assets/cuba-gallery-9.jpg";
import cubaGallery10 from "@/assets/cuba-gallery-10.jpg";
import cubaGallery11 from "@/assets/cuba-gallery-11.jpg";
import cubaGallery12 from "@/assets/cuba-gallery-12.jpg";
import cubaGallery13 from "@/assets/cuba-gallery-13.jpg";
import cubaGallery14 from "@/assets/cuba-gallery-14.jpg";
import curacaoImg from "@/assets/curacao-hero.avif";
import curacaoGallery1 from "@/assets/curacao-gallery-1.avif";
import curacaoGallery2 from "@/assets/curacao-gallery-2.avif";
import curacaoGallery3 from "@/assets/curacao-gallery-3.webp";
import curacaoGallery4 from "@/assets/curacao-gallery-4.avif";
import curacaoGallery5 from "@/assets/curacao-gallery-5.webp";
import curacaoGallery6 from "@/assets/curacao-gallery-6.webp";
import curacaoGallery7 from "@/assets/curacao-gallery-7.jpg";
import curacaoGallery8 from "@/assets/curacao-gallery-8.jpg";
import curacaoGallery9 from "@/assets/curacao-gallery-9.webp";
import curacaoGallery10 from "@/assets/curacao-gallery-10.webp";
import curacaoGallery11 from "@/assets/curacao-gallery-11.webp";
import curacaoGallery12 from "@/assets/curacao-gallery-12.jpeg";
import curacaoGallery13 from "@/assets/curacao-gallery-13.webp";
import mexicoImg from "@/assets/mexico-hero.webp";
import mexicoGallery1 from "@/assets/mexico-gallery-1.webp";
import mexicoGallery2 from "@/assets/mexico-gallery-2.jpg";
import mexicoGallery3 from "@/assets/mexico-gallery-3.jpg";
import mexicoGallery4 from "@/assets/mexico-gallery-4.jpg";
import mexicoGallery5 from "@/assets/mexico-gallery-5.jpg";
import mexicoGallery6 from "@/assets/mexico-gallery-6.jpeg";
import mexicoGallery7 from "@/assets/mexico-gallery-7.jpg";
import mexicoGallery8 from "@/assets/mexico-gallery-8.jpeg";
import mexicoGallery9 from "@/assets/mexico-gallery-9.jpg";
import mexicoGallery10 from "@/assets/mexico-gallery-10.jpg";
import mexicoGallery11 from "@/assets/mexico-gallery-11.jpg";
import mexicoGallery12 from "@/assets/mexico-gallery-12.jpg";
import mexicoGallery13 from "@/assets/mexico-gallery-13.jpg";
import mexicoGallery14 from "@/assets/mexico-gallery-14.jpg";
import mexicoGallery15 from "@/assets/mexico-gallery-15.jpg";
import mexicoGallery16 from "@/assets/mexico-gallery-16.jpg";
import mexicoGallery17 from "@/assets/mexico-gallery-17.jpg";
import mexicoGallery18 from "@/assets/mexico-gallery-18.jpg";
import mexicoGallery19 from "@/assets/mexico-gallery-19.jpg";
import mexicoGallery20 from "@/assets/mexico-gallery-20.jpg";
import mexicoGallery21 from "@/assets/mexico-gallery-21.jpg";
import mexicoGallery22 from "@/assets/mexico-gallery-22.jpg";
import vegasImg from "@/assets/vegas-gallery-1.jpg";
import vegasGallery1 from "@/assets/vegas-gallery-1.jpg";
import vegasGallery2 from "@/assets/vegas-gallery-2.jpg";
import vegasGallery3 from "@/assets/vegas-gallery-3.webp";
import vegasGallery4 from "@/assets/vegas-gallery-4.webp";
import cruiseHeroImg from "@/assets/cruise-hero.jpg";
import cruiseGallery1 from "@/assets/cruise-gallery-1.jpg";
import cruiseGallery2 from "@/assets/cruise-gallery-2.jpg";
import cruiseGallery3 from "@/assets/cruise-gallery-3.webp";
import cruiseGallery4 from "@/assets/cruise-gallery-4.jpg";

interface ReviewData {
  slug: string;
  image: string;
  destination: string;
  country: string;
  dateVisited: string;
  duration: string;
  rating: number;
  ratings: {
    accommodations?: number;
    food?: number;
    activities?: number;
    value?: number;
    rooms?: number;
    beach?: number;
    service?: number;
    pools?: number;
    cabins?: number;
    dining?: number;
    entertainment?: number;
    ease?: number;
    excursions?: number;
  };
  summary: string;
  fullReview: string[];
  tips: string[];
  bestFor: string[];
  videoUrl?: string;
  gallery?: string[];
}

const reviews: Record<string, ReviewData> = {
  "mexico-barcelo-riviera": {
    slug: "mexico-barcelo-riviera",
    image: mexicoImg,
    destination: "Barceló Maya Riviera Adults Only",
    country: "Riviera Maya, Mexico",
    dateVisited: "September 2025",
    duration: "7 nights",
    rating: 4.9,
    ratings: {
      rooms: 4.8,
      food: 4.8,
      beach: 4.9,
      pools: 5,
      service: 4.7,
      value: 4.9,
    },
    summary: "A grand, modern adults-only resort that delivers a luxury feel, incredible pools, excellent dining, and outstanding value for the Riviera Maya.",
    fullReview: [
      "I stayed at Barceló Maya Riviera Adults Only in September as part of my work reviewing resorts for clients, and it made a strong impression right from arrival. Opened in 2019, the resort still feels very new, modern, and polished. It's located about 40 minutes south of Playa del Carmen within the larger gated Barceló resort complex, which immediately gives the area a safe and well-organized feel.",
      "The scale of this resort is impressive. With roughly 850 rooms housed in one expansive, ocean-facing building, it's undeniably large, yet because everything is contained within a single structure, it never felt overwhelming. The design leans grand and luxurious, with wide, massive hallways and open spaces that reinforce the upscale atmosphere rather than making it feel crowded. There's also a large convention center on site, which adds to the sense that this is a substantial, high-end property.",
      "The main lobby and lounge area really sets the tone. It's modern, open, and social, with a massive TV screen that becomes a central gathering spot, especially in the evenings or during sporting events. It feels lively without being chaotic and very much geared toward an adults-only crowd.",
      "The rooms are modern, spacious, air-conditioned, and very comfortable. Every room includes a private terrace with a hot tub, and many have excellent ocean views. For guests looking to upgrade, there are also swim-up rooms with private pool access. From a travel consultant perspective, the room product here is strong and well designed for couples who want something upscale without stepping into ultra-luxury pricing. Guests who opt for the VIP upgrade gain access to additional amenities like a private lounge and 24-hour room service, which noticeably elevates the experience.",
      "The outdoor spaces are a major highlight. The resort features what is often referred to as the largest infinity pool in Mexico, and it truly lives up to that reputation. The pool is enormous, with built-in lounge beds, multiple sections, and two swim-up bars. Even when the resort is busy, it never felt crowded. There is also a music bar with a live DJ that adds energy during the day without overwhelming the rest of the resort.",
      "The beach is equally impressive. The resort sits in a bay, which keeps the water calm and ideal for swimming. During my September stay, there was little to no seaweed, and the water was clear and inviting. Palm trees line the beach, creating a classic Caribbean feel, and there were plenty of loungers available. There is no dedicated beach service, which is worth noting, but the quality of the beach itself more than makes up for it.",
      "Dining was another standout. Guests have access to a strong buffet for breakfast, lunch, and dinner, along with four specialty à la carte restaurants offering Italian, Japanese, French, and Mexican cuisine. Both the buffets and à la cartes were consistently excellent, with the à la carte restaurants in particular exceeding expectations for a large all-inclusive resort. Reservations are important, but well worth the effort.",
      "One of the biggest advantages of staying at Barceló Maya Riviera is access to the neighboring Barceló resorts within the gated complex. This gives guests additional restaurants, entertainment, and amenities to explore, significantly increasing the overall value of the stay.",
      "Overall, Barceló Maya Riviera Adults Only delivers a grand, modern, and luxurious experience at a price point that remains accessible. From a professional standpoint, it's one of the strongest adults-only options in the Playa del Carmen area for travelers who want upscale amenities, excellent food, and a lively yet refined atmosphere without paying true ultra-luxury rates.",
    ],
    tips: [
      "Staying at the adults-only Riviera gives you access to the neighboring Barceló resorts, which adds a lot of dining and entertainment variety.",
      "The infinity pool is one of the largest in Mexico and never feels crowded, even during busier periods.",
      "Consider the VIP upgrade if you value extras like a private lounge and 24-hour room service.",
      "The beach sits in a protected bay, making it ideal for swimming with generally calm water.",
      "Make à la carte restaurant reservations early to get your preferred dining times.",
    ],
    bestFor: [
      "Couples looking for a modern adults-only resort",
      "Travelers who want a luxury feel without ultra-luxury pricing",
      "Guests who enjoy large, lively pool areas",
      "Those who want access to multiple resorts without changing hotels",
      "Adults who want upscale amenities, good food, and a polished atmosphere",
    ],
    gallery: [mexicoImg, mexicoGallery1, mexicoGallery2, mexicoGallery3, mexicoGallery4, mexicoGallery5, mexicoGallery6, mexicoGallery7, mexicoGallery8, mexicoGallery9, mexicoGallery10, mexicoGallery11, mexicoGallery12, mexicoGallery13, mexicoGallery14, mexicoGallery15, mexicoGallery16, mexicoGallery17, mexicoGallery18, mexicoGallery19, mexicoGallery20, mexicoGallery21, mexicoGallery22],
  },
  "cuba-vila-gale": {
    slug: "cuba-vila-gale",
    image: cubaImg,
    destination: "Vila Galé Paredón",
    country: "Cayo Coco, Cuba",
    dateVisited: "December 2024 - January 2025",
    duration: "7 nights",
    rating: 4,
    ratings: {
      food: 3.5,
      rooms: 3.5,
      beach: 4,
      service: 3.5,
      value: 4.5,
    },
    summary: "Better than expected for Cuba, delivering strong value at a fraction of typical Caribbean prices. Rated in the context of Cuban resorts, not compared to the broader Caribbean.",
    fullReview: [
      "I travel frequently both personally and professionally as a travel consultant, so I arrived at Vila Galé Paredón with realistic expectations for Cuba. My first impression was very positive. The resort felt clean, updated, and well maintained from the moment we arrived. The lobby was bright and welcoming, check-in was easy, and the grounds throughout the property were immaculate. Right away, it felt better than I had expected for Cuba.",
      "The resort is spread across five to six separate buildings, each with three floors. There are no elevators, so if you have mobility concerns, requesting a ground-floor room would be important. Our room was fine but fairly standard. It had two beds, a desk, a small table and chair, a double closet with about seven or eight hangers, a safe, and a small bar fridge that was usually unstocked. The beds were comfortable, though each bed only had one pillow, and the pillows were more on the flat side than fluffy.",
      "The bathroom layout was well designed. The toilet was in a separate water closet, and the shower was large with both a rain head and a handheld wand. Hot water was always available. The room did have shampoo, conditioner, and body lotion, although I brought my own and did not use them.",
      "One thing worth noting is the electrical setup. The rooms use 220-volt outlets, but standard North American plugs fit the sockets and worked fine for charging phones, as most devices convert voltage automatically. The in-room hairdryer also worked without issue. However, if you plan to bring your own hairdryer or straightener, you will need a proper voltage converter. One of our nieces did not have one and ended up melting her hairdryer.",
      "Food was one of the stronger parts of the stay overall, with some clear highs and lows. Based on my experience as a travel consultant who has stayed at many Caribbean and Cuban all-inclusive resorts, the food here was better than I typically expect in Cuba. The main buffet was fully indoors, which I appreciated, as there were no birds in the food area. There was always a wide selection including a pasta bar, made-to-order fish, chicken, beef, and mussels, along with rice dishes, hot chicken options, meats, cheeses, olives, salads, and ice cream. Interestingly, I did not see French fries once all week, but there were plenty of plantain chips available. We were traveling with a group of 18, and everyone was always able to find something they liked. I would rate the buffet a 4.5 out of 5.",
      "The resort has four à la carte restaurants, although only two are open on any given night. We tried the Cuban and the Mediterranean. The Cuban restaurant was disappointing for me and I would rate it a 1 out of 5, while the Mediterranean was excellent and easily a 4 out of 5.",
      "Every day at noon, there is a pizza bar set up by the kids pool. The pizza itself was very good, but they only make 100 personal-sized pizzas per day. In reality, you need to be there at least 10 minutes early to place an order. Guests arriving even shortly after noon were consistently told the pizzas were already gone.",
      "There is also a 24-hour snack bar serving simple items like grilled cheese, hamburgers, and hot dogs, along with a barbecue grill by the main pool that is open for a couple of hours each day.",
      "Drinks required a bit of planning. Friends who arrived two days before us warned that there was absolutely no vodka anywhere in the resort, so we brought bottles from duty free. There was no shortage of beer, rum, tequila, or red and white wine, so as long as you are flexible, you will be fine.",
      "The beach is what Cuba is known for, and this one mostly delivered. The sand was soft and white, and the water was warm even in late December with a beautiful aqua-blue color. There were plenty of loungers, good shade from palapas, and a beach bar close by. Non-motorized water activities were included at no extra cost, such as small catamarans, paddle boats, and kayaks, but they do need to be reserved in advance. One unexpected downside was the jellyfish. Some days there were only a few, while other days there were hundreds. I still went in the water, as did most of our group. A few people were stung and said it was not much worse than a bee sting, but it did limit how long I personally stayed in the water. Under normal conditions, this would be a 5 out of 5 beach, but because of the jellyfish I would rate it a 4 out of 5.",
      "The resort has three pools, each with a very different atmosphere. The main pool is the party pool and has a swim-up bar, louder music, and daily activities. There were lots of chairs and shaded areas available. Another pool is more family-oriented and has a gradual entry, making it better for kids. The standout for me was the infinity pool. It is set away from the main areas, which meant it was rarely busy. It is large, overlooks the ocean, and has its own bar, day beds, and loungers. It was easily one of the best spots at the resort.",
      "Service was the most inconsistent part of the stay. This mirrors what I often see when evaluating Cuban resorts professionally. There is no room service, and rooms only come with two white bath towels. No hand towels or face cloths were provided. Towel replacement was not always timely, and we were told that missing bath towels would also be charged, although the exact cost was unclear. Bottled water in the room fridge was inconsistent, and the mini bar itself was never stocked. Each room also receives two beach towels, which can be exchanged daily at the pool, but we were told that losing one would result in an $80 USD replacement fee, which felt excessive.",
      "That said, the bartenders and waitstaff were excellent. They were friendly, helpful, and genuinely pleasant throughout the week, and they made a noticeable difference in the overall experience. On the other hand, our Sunwing Nexus representative provided inaccurate information about an excursion, which resulted in some members of our group ending up on a different experience than expected. The same representative was also not very helpful when it came to coordinating pickup times after our flight was delayed.",
    ],
    tips: [
      "Bring duty-free vodka if that matters to you - there was none available at the resort during our stay",
      "Be at the pizza bar at least 10 minutes before noon - they only make 100 pizzas per day and they go fast",
      "Request a ground-floor room if you have mobility concerns, as there are no elevators",
      "Keep track of both bath towels and beach towels - we were told missing bath towels would be charged, and missing beach towels cost $80 USD each",
      "Bring a voltage converter if you plan to use your own hair tools - the rooms are 220V",
      "Reserve non-motorized water activities in advance if you want to use them",
    ],
    bestFor: ["Budget travelers", "Groups", "Adults who like both quiet and lively pool options", "Beach lovers who are flexible", "First-time visitors to Cuba"],
    gallery: [cubaGallery1, cubaGallery2, cubaGallery3, cubaGallery4, cubaGallery5, cubaGallery6, cubaGallery7, cubaGallery8, cubaGallery9, cubaGallery10, cubaGallery11, cubaGallery12, cubaGallery13, cubaGallery14],
  },
  "curacao-blue-bay": {
    slug: "curacao-blue-bay",
    image: curacaoImg,
    destination: "Villa in Blue Bay Resort",
    country: "Curaçao",
    dateVisited: "November 23 to 30, 2024",
    duration: "7 nights",
    rating: 5,
    ratings: {
      accommodations: 5,
      beach: 4.8,
      food: 4.9,
      value: 5,
    },
    summary: "A luxury private villa with an infinity pool that offered space, privacy, and easy access to some of Curaçao's best beaches.",
    fullReview: [
      "As a travel consultant, I've stayed in and evaluated a wide range of villas and upscale accommodations, and this stay at Blue Bay Resort truly stood out. We traveled as three couples, and from the moment we arrived, it was clear this villa was an excellent choice for both comfort and flexibility.",
      "The villa itself was modern, spacious, and beautifully designed over two levels. There are three bedrooms in total, two with king beds and one with two twin beds, which worked perfectly for our group. Each bedroom has its own en-suite bathroom with a walk-in shower, and there is also an additional half bathroom, which was especially convenient when spending time in the shared living spaces. Towels and hair dryers were provided, and everything felt well thought out for a group stay.",
      "The upper level became our main gathering space. The open-concept living room and fully equipped kitchen made it feel more like a high-end home than a vacation rental. The kitchen included a large island, American-style fridge, dishwasher, wine fridge, combination microwave and oven, Nespresso machine, and all the essentials you would need for cooking. Large sliding doors opened directly onto the terrace, seamlessly blending indoor and outdoor living.",
      "The outdoor area was easily one of the highlights of the trip. The private infinity pool overlooked both the ocean and the golf course and was the perfect place to relax at the end of the day. The terrace was furnished with an eight-person dining table, sun loungers, a lounge seating area, and an electric BBQ. Evenings were often spent here, enjoying drinks and watching the Caribbean sunsets. A small but thoughtful touch was the outdoor sink at the back of the villa, which made rinsing snorkel or dive gear quick and easy.",
      "Downstairs, the remaining two bedrooms opened directly to the outside through patio doors, giving those rooms a very private feel. All bedrooms were air-conditioned, had smart TVs, and plenty of closet space. The villa felt quiet, secure, and extremely well maintained throughout our stay.",
      "The villa is located within the gated Blue Bay Golf and Beach Resort, which is beautifully landscaped and very well secured. One of the biggest perks was how close everything felt, including the beach, which was only about a one-minute walk away.",
      "Beaches were a major focus of this trip, and we visited four in total. One important thing to know before arriving in Curaçao is that sand shoes are essential. Many beaches have coral fragments at the shoreline, and walking into the water barefoot can be uncomfortable.",
      "Blue Bay Beach was the most convenient and the one we used most often. Located within the gated resort and just a short walk from the villa, it sits in a protected bay with calm, warm, aqua-blue water. The sand is soft once you are past the waterline, and there is plenty of shade from palapas. What really sets this beach apart is the convenience. There are two restaurants, an ice cream shop, and a pizza spot right on-site, making it easy to spend an entire day there without leaving.",
      "Grote Knip, about a 45-minute drive from the villa, is one of Curaçao's most iconic beaches. The water is stunning and the scenery feels more rugged and natural. Amenities are limited, though. When we visited, the washrooms were locked, and while there were a few food trucks nearby, this is not a beach with much infrastructure. Loungers are available for a fee. It's absolutely worth visiting, but it's best enjoyed if you come prepared.",
      "Cas Abao Beach, roughly 30 minutes from the villa, offered a nice balance of beauty and comfort. The beach sits in a small bay with clear, calm water. There is an entrance fee and you pay for loungers, but the facilities were noticeably better, including clean washrooms. This was one of the easier beaches to settle into for several hours.",
      "Mambo Beach was a completely different experience. This is Curaçao's most commercial beach area and feels more like a beachfront strip than a traditional beach. It's lined with beach clubs, restaurants, bars, and shops, and has a lively, social atmosphere. The water is calm due to breakwaters, but the focus here is more on dining, shopping, and nightlife than quiet beach time.",
      "Food was easy to manage during our stay. One of the advantages of this villa is its location, with a full grocery store just a three-minute drive away. Prices were very similar to Ontario, which made budgeting straightforward. We typically bought groceries for breakfasts, lunches, snacks, and drinks.",
      "In the evenings, we mostly ate out and explored restaurants around the island. Restaurant pricing across Curaçao was also comparable to Ontario, whether casual or more upscale. From a travel consultant perspective, this makes Curaçao an easy destination to plan for, as there are very few surprises when it comes to food costs.",
      "We pre-booked a rental car before arriving, and it was one of the best decisions of the trip. The rental company picked our group up at the airport and drove us directly to the villa, where the car was already waiting for us. It was smooth, efficient, and stress-free.",
      "Driving in Curaçao felt very similar to driving in Ontario. Roads were in good condition, signage was clear, and we felt comfortable driving everywhere we went. Having a rental car made it easy to explore beaches, restaurants, and the colorful streets of Willemstad at our own pace. From a professional standpoint, I would strongly recommend renting a car when staying in a villa on the island.",
    ],
    tips: [
      "Pack sand shoes - most beaches have coral at the shoreline",
      "Rent a car - Curaçao is easy to drive and much better explored independently",
      "Take advantage of the nearby grocery store for breakfasts, lunches, and snacks",
      "Plan to eat out at night - restaurant prices are comparable to Ontario",
      "A villa stay is ideal for couples or small groups who value space and privacy",
    ],
    bestFor: ["Couples traveling together", "Travelers who want space and privacy", "Independent travelers who enjoy exploring", "Beach hoppers", "Those who prefer flexibility over an all-inclusive experience"],
    gallery: [curacaoImg, curacaoGallery1, curacaoGallery2, curacaoGallery3, curacaoGallery4, curacaoGallery5, curacaoGallery6, curacaoGallery7, curacaoGallery8, curacaoGallery9, curacaoGallery10, curacaoGallery11, curacaoGallery12, curacaoGallery13],
  },
  "vegas-bellagio": {
    slug: "vegas-bellagio",
    image: vegasImg,
    destination: "Bellagio",
    country: "Las Vegas, USA",
    dateVisited: "February 2025",
    duration: "Multiple trips (30+)",
    rating: 4.5,
    ratings: {
      accommodations: 4.3,
      food: 3.5,
      activities: 5,
      value: 4,
    },
    summary: "After more than 30 trips to Vegas and stays all over the Strip, Bellagio is still the resort I come back to the most. It's upscale without feeling stuffy, perfectly located, and consistently delivers the full Vegas experience.",
    fullReview: [
      "I've been to Vegas around 30 times, and I've stayed at a lot of different resorts over the years, including Wynn, Aria, Treasure Island, and Harrah's. Bellagio is the one we keep choosing again and again.",
      "It's one of the more upscale resorts on the Strip, and it feels that way the moment you walk in. Everything is grand and polished, from the lobby to the massive casino floor. The gambling area is big, lively, and classic Vegas without feeling chaotic.",
      "The rooms are a big reason we like it so much. They're spacious, well laid out, and clearly a step above a standard hotel room. On this trip, we had a fountain-view room, which was worth it for us. Being able to watch the fountain show from the room never really gets old, and despite being right in the middle of the Strip, the rooms are very well insulated. Once the door is closed, it's quiet enough to actually relax and sleep.",
      "Location-wise, I don't think it gets better. Bellagio sits right in the middle of the Strip, which makes a huge difference when you're walking a lot. You can head north or south without committing to a massive trek every time you leave the hotel. After this many trips, that convenience matters more than flashy extras.",
      "Food in Vegas has become very expensive, and as Canadians, the exchange rate makes it sting even more. We try to balance things out by mixing lower-cost options like Raising Cane's and pizza with mid-range restaurants. We don't really do high-end dining here, mostly because it just doesn't fit our budget, and honestly, Vegas still offers plenty of solid food without going ultra-luxury.",
      "One thing Bellagio really shines at is comps and rewards, especially if you gamble. It's part of MGM Resorts International, and that matters. Your players card works across six or seven MGM resorts, which adds up quickly. My wife and I are slot players, and we both use cards tied to one account so our play stacks together. After a single trip, that's often enough to start getting offers like four free nights, food credits, and free play. Over time, it really pays off.",
      "Overall, Vegas still delivers exactly what we go there for, and Bellagio remains our favorite base to experience it. It's not cheap, but for us, the location, comfort, and rewards system make it worth it."
    ],
    tips: [
      "If you gamble at MGM resorts, always get a players card. It works across multiple properties and adds up fast.",
      "Charge food to your room at MGM properties. It counts toward your overall resort spend and helps with comps.",
      "Fountain-view rooms are worth it if you plan to spend time in your room and enjoy quieter nights.",
      "Balance food costs. Mix fast-casual spots with mid-range restaurants to keep spending under control.",
      "Bellagio's central location saves your legs. Over a few days, those shorter walks really add up."
    ],
    bestFor: ["Slot players and casino gamblers", "Couples looking for upscale comfort", "Repeat Vegas visitors who value location", "Those who want MGM rewards and comps", "Travelers who appreciate classic Vegas elegance"],
    gallery: [vegasGallery1, vegasGallery2, vegasGallery3, vegasGallery4],
  },
  "cruise-experience": {
    slug: "cruise-experience",
    image: cruiseHeroImg,
    destination: "Cruising as a Travel Experience",
    country: "Caribbean & Alaska",
    dateVisited: "15+ years of cruising",
    duration: "Multiple cruises",
    rating: 4.0,
    ratings: {
      cabins: 3.5,
      dining: 4.0,
      entertainment: 4.5,
      value: 4.0,
      ease: 3.8,
      excursions: 4.6,
    },
    summary: "After more than 15 years of cruising in the Caribbean and Alaska, cruising still stands out as one of the easiest ways to travel if you plan it properly and know what to expect.",
    fullReview: [
      "I've been cruising for over 15 years across western and eastern Caribbean itineraries as well as Alaska, and it's become a travel style I'm very comfortable with. It's not perfect, but when you understand how cruising works and plan around its limitations, it offers a strong balance of value, convenience, and variety.",
      "Cabins are usually the biggest adjustment, especially for first-time cruisers. We typically book standard balcony or oceanview rooms. They're comfortable and efficiently laid out, but they are small compared to hotel rooms. Storage is limited, which you really notice after a few days. One thing that helps a lot is bringing your own storage solutions. We always use an over-the-door hanging shoe rack or cubby that hangs on the closet door. It keeps small items organized and makes the room feel far more livable. Having a balcony is worth it for us, especially in Alaska, where the scenery becomes part of the experience.",
      "Food has consistently been solid across our cruises. All meals are included in the base fare except for some specialty restaurants, which makes budgeting easier day to day. The quality is dependable rather than exceptional. One important thing to note is that alcohol and pop are not included. If you enjoy having a few drinks, it's usually worth looking for sales where drink packages, Wi-Fi, and gratuities are prepaid. These are almost always cheaper when purchased ahead of time rather than onboard.",
      "Activities and entertainment are one of cruising's strongest points. There is always something going on, from shows and live music to trivia, pools, and onboard events. One of the things we like most about cruising is that you can be as active as you want or as relaxed as you want. Some days are packed, and others are completely laid back. There's genuinely something for everyone.",
      "Value for money is generally strong if you book smart. When you consider accommodations, food, entertainment, and transportation between destinations, cruises still compare well to land-based trips. Prices have gone up over the years, but good value is still there if you take advantage of promotions and bundled extras.",
      "Ease and convenience is a mixed experience. Once you're onboard, everything is simple and contained in one place. The challenging parts are embarkation, disembarkation, and port days, which involve lines, schedules, and waiting. To reduce stress, we almost always fly in the day before departure. It avoids issues with flight delays or cancellations and gives us a chance to enjoy the departure city and start the vacation early.",
      "Destinations and excursions are a major highlight, especially if you do your research ahead of time. Cruises give you a snapshot of multiple destinations, but time in port is limited. We always recommend booking excursions through the ship. If a ship-sponsored excursion runs late, the ship has to wait for you. If you book independently and something goes wrong, the ship can leave without you. Alaska really stands out for scenery and unique experiences, while Caribbean cruises shine for variety and ease.",
      "Safety is also worth mentioning. Even though ships feel safe and controlled, it's still important to use common sense. We avoid wandering back to the cabin alone late at night and stay aware of our surroundings, just as we would anywhere else.",
      "Overall, cruising continues to work well for us. It's structured without feeling rigid, social without being overwhelming, and flexible enough to suit different moods and travel styles.",
    ],
    tips: [
      "Book ship-sponsored excursions to avoid the risk of being left behind.",
      "Bring extra storage like over-the-door shoe racks or cubbies for small cabins.",
      "Look for prepaid bundles that include drinks, Wi-Fi, or gratuities.",
      "Fly in the day before departure to reduce stress.",
      "If you drink alcohol or pop, pre-buy drink packages as they're usually cheaper before boarding.",
    ],
    bestFor: [
      "Travelers who want structure with flexibility",
      "Couples and repeat travelers",
      "People who like built-in entertainment",
      "Those who enjoy visiting multiple destinations easily",
      "Travelers who value convenience and predictable costs",
      "Scenic-focused trips like Alaska",
      "People who want to be as active or as relaxed as they choose",
    ],
    gallery: [cruiseHeroImg, cruiseGallery1, cruiseGallery2, cruiseGallery3, cruiseGallery4],
  },
};

const SAVED_KEY = "rtg-saved-destinations";

const gearRecommendations = [
  { icon: Package, label: "Packing Cubes", desc: "Stay organized on the go" },
  { icon: Plug, label: "Universal Adapter", desc: "Power up anywhere" },
  { icon: Waves, label: "Water Hammock", desc: "Ultimate pool lounging" },
];

const DestinationReview = () => {
  const { slug } = useParams<{ slug: string }>();
  const review = slug ? reviews[slug] : null;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { toast } = useToast();

  // Saved state from localStorage
  useEffect(() => {
    if (!slug) return;
    const saved: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    setIsSaved(saved.includes(slug));
  }, [slug]);

  const toggleSave = useCallback(() => {
    if (!slug) return;
    const saved: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    if (saved.includes(slug)) {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved.filter((s) => s !== slug)));
      setIsSaved(false);
      toast({ title: "Removed from saved" });
    } else {
      localStorage.setItem(SAVED_KEY, JSON.stringify([...saved, slug]));
      setIsSaved(true);
      toast({ title: "Saved!" });
    }
  }, [slug, toast]);

  // Share helpers
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = review ? `${review.destination}. ReviewThenGo` : "";

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: shareTitle, url: shareUrl }); } catch {}
      return;
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    toast({ title: "Link copied!" });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Scroll-to-top
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Related reviews
  const relatedReviews = slug
    ? Object.values(reviews).filter((r) => r.slug !== slug).slice(0, 3)
    : [];

  useEffect(() => {
    if (review) {
      document.title = `${review.destination}, ${review.country} - ReviewThenGo`;
    }
    return () => { document.title = "ReviewThenGo: All-in-One Travel Planner"; };
  }, [review]);

  // JSON-LD structured data for SEO
  useEffect(() => {
    if (!review || !slug) return;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Review",
      "itemReviewed": {
        "@type": "Hotel",
        "name": review.destination,
        "address": { "@type": "PostalAddress", "addressLocality": review.country }
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5
      },
      "author": { "@type": "Person", "name": "Tom" },
      "datePublished": review.dateVisited,
      "description": review.summary,
      "publisher": { "@type": "Organization", "name": "ReviewThenGo" }
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [review, slug]);

  if (!review) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 container mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">
            Destination not found
          </h1>
          <p className="text-muted-foreground mb-8">
            This review doesn't exist yet. Check out our other destinations!
          </p>
          <Link to="/destinations">
            <Button>View All Destinations</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const tocSections = [
    { id: "summary", label: "Summary" },
    { id: "experience", label: "My Experience" },
    { id: "tips", label: "Tips" },
    ...(review.gallery?.length ? [{ id: "gallery", label: "Gallery" }] : []),
    { id: "related", label: "Related" },
    { id: "comments", label: "Comments" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${review.destination} Review`}
        description={review.summary}
        image={review.image}
        url={`/review/${slug}`}
        type="article"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Destinations", url: "/destinations" },
          { name: review.destination, url: `/destinations/${slug}` },
        ]}
        faq={[
          { question: `Is ${review.destination} worth visiting?`, answer: review.summary },
          { question: `What is the rating for ${review.destination}?`, answer: `${review.destination} receives ${review.rating}/5 based on our detailed review covering ${Object.keys(review.ratings).join(", ")}.` },
          { question: `What are the best things about ${review.destination}?`, answer: review.bestFor.join(". ") + "." },
        ]}
        aggregateRating={{
          ratingValue: review.rating,
          reviewCount: Object.keys(review.ratings).length,
          itemReviewed: { type: "Hotel", name: review.destination },
        }}
      />
      <Header />
      <ReadingProgress />
      <AffiliateDisclosureBanner />
      <main className="pt-24">
        <div className="relative h-[50vh] md:h-[60vh]">
          <img
            src={review.image}
            alt={review.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <Link 
                to="/destinations"
                className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Destinations
              </Link>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-2">
                {review.destination}
              </h1>
              <p className="text-primary-foreground/80 text-lg flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {review.country}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {review.dateVisited}
                </span>
                <span>{review.duration}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 pt-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/destinations">Destinations</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{review.destination}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Table of Contents */}
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
                  <List className="h-4 w-4" />
                  <span>Jump to section</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <nav className="flex flex-wrap gap-2">
                    {tocSections.map((s) => (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {s.label}
                      </a>
                    ))}
                  </nav>
                </CollapsibleContent>
              </Collapsible>

              {/* Summary */}
              <div id="summary" className="bg-card rounded-2xl p-8 shadow-soft">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < Math.floor(review.rating) ? 'text-accent fill-accent' : 'text-muted-foreground'}`} 
                      />
                    ))}
                    <span className="text-lg font-bold text-foreground ml-2">{review.rating}</span>
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <Button variant={isSaved ? "default" : "outline"} size="sm" className="gap-2" onClick={toggleSave}>
                      <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                    {navigator.share ? (
                      <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Share2 className="h-4 w-4" />
                            Share
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="gap-2">
                              <Twitter className="h-4 w-4" /> Twitter / X
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="gap-2">
                              <Facebook className="h-4 w-4" /> Facebook
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={copyLink} className="gap-2">
                            {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {linkCopied ? "Copied!" : "Copy Link"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <p className="text-lg text-foreground leading-relaxed">
                  {review.summary}
                </p>
              </div>

              {/* Full Review */}
              <div id="experience" className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-foreground">My Experience</h2>
                {review.fullReview.map((paragraph, index) => (
                  <p key={index} className="text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Inline affiliate after My Experience */}
              <InlineAffiliateCTA propertyName={review.destination} variant="banner" />

              {/* Video */}
              {review.videoUrl && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-bold text-foreground">Video Review</h2>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-muted">
                    <iframe
                      src={review.videoUrl}
                      title={`${review.destination} Video Review`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Tips */}
              <div id="tips" className="bg-secondary/10 rounded-2xl p-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">Tom's Tips</h2>
                <ul className="space-y-4">
                  {review.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-sm flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="text-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inline affiliate after Tips */}
              <InlineAffiliateCTA propertyName={review.destination} variant="banner" />

              {/* Gallery */}
              {review.gallery && review.gallery.length > 0 && (
                <div id="gallery" className="space-y-6">
                  <h2 className="font-display text-2xl font-bold text-foreground">Photo Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {review.gallery.map((image, index) => (
                      <button 
                        key={index} 
                        onClick={() => {
                          setLightboxIndex(index);
                          setLightboxOpen(true);
                        }}
                        className="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
                      >
                        <img 
                          src={image} 
                          alt={`${review.destination} gallery image ${index + 1}`}
                          loading="lazy"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </button>
                    ))}
                  </div>
                  <ImageLightbox 
                    images={review.gallery}
                    initialIndex={lightboxIndex}
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                  />
                </div>
              )}

              {/* Related Reviews */}
              {relatedReviews.length > 0 && (
                <div id="related" className="space-y-6">
                  <h2 className="font-display text-2xl font-bold text-foreground">You Might Also Like</h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {relatedReviews.map((r) => (
                      <Link key={r.slug} to={`/review/${r.slug}`} className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-md transition-shadow">
                        <div className="aspect-[4/3] overflow-hidden">
                          <img src={r.image} alt={r.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground text-sm mb-1">{r.destination}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 text-accent fill-accent" />
                            <span>{r.rating}/5</span>
                            <span className="mx-1">·</span>
                            <span>{r.country}</span>
                          </div>
                          <span className="text-xs text-secondary font-medium mt-2 inline-flex items-center gap-1">
                            Read Review <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Engagement Widget */}
              {slug && <ReviewEngagement slug={slug} pageType="destination" />}

              <div id="comments">
                {slug && <CommentsSection pageType="destination" pageSlug={slug} />}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Ratings Breakdown */}
              <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-28">
                <h3 className="font-display text-2xl font-bold text-foreground mb-6">Rating Breakdown</h3>
                <div className="space-y-4">
                  {Object.entries(review.ratings).map(([category, rating]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize text-muted-foreground">{category}</span>
                        <span className="font-medium text-foreground">{rating}/5</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(rating / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-3">Best For</h4>
                  <div className="flex flex-wrap gap-2">
                    {review.bestFor.map((item) => (
                      <span 
                        key={item}
                        className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <AffiliateLinks />

                {/* Recommended Gear */}
                <div className="mt-8 bg-secondary/10 rounded-xl p-5">
                  <h4 className="font-display font-semibold text-foreground mb-3">Recommended Gear</h4>
                  <div className="space-y-3">
                    {gearRecommendations.map((g) => (
                      <Link key={g.label} to="/gear" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                        <g.icon className="h-4 w-4 text-secondary" />
                        <div>
                          <span className="font-medium text-foreground group-hover:text-secondary transition-colors">{g.label}</span>
                          <span className="block text-xs">{g.desc}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link to="/gear" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-secondary hover:text-secondary/80 transition-colors">
                    Browse all gear <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <RelatedReviews currentSlug={slug || ""} currentLocation={review?.destination} />
      <div className="container mx-auto px-4 pb-12 max-w-6xl">
        <AuthorBio />
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card border-t border-border p-3 flex items-center gap-3 no-print">
        <a
          href={EXPEDIA_LINKS[detectCountry()]}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
          onClick={() => trackAffiliateClick("Expedia", window.location.pathname, "mobile_sticky_cta")}
        >
          <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold">
            Book on Expedia
          </Button>
        </a>
        <Button
          variant="outline"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="px-3"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      </div>

      {/* Scroll to top - desktop only */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors hidden md:block no-print"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      <Footer />
    </div>
  );
};

export default DestinationReview;