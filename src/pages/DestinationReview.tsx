import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useParams, Link } from "react-router-dom";
import { Star, ArrowLeft, Calendar, MapPin, Heart, Share2, MessageCircle, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import santoriniImg from "@/assets/deal-santorini.jpg";
import maldivesImg from "@/assets/deal-maldives.jpg";
import cruiseImg from "@/assets/deal-cruise.jpg";
import alpsImg from "@/assets/deal-alps.jpg";
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
  };
  summary: string;
  fullReview: string[];
  tips: string[];
  bestFor: string[];
  videoUrl?: string;
  gallery?: string[];
}

const reviews: Record<string, ReviewData> = {
  "santorini-greece": {
    slug: "santorini-greece",
    image: santoriniImg,
    destination: "Santorini",
    country: "Greece",
    dateVisited: "October 2024",
    duration: "7 nights",
    rating: 4.8,
    ratings: {
      accommodations: 5,
      food: 4.5,
      activities: 4.5,
      value: 4,
    },
    summary: "Santorini exceeded every expectation. The iconic white-washed buildings cascading down volcanic cliffs, the sunsets that paint the sky in impossible colors, and the warm Greek hospitality made this trip unforgettable.",
    fullReview: [
      "I've seen countless photos of Santorini, but nothing prepares you for seeing Oia at sunset in person. The way the light transforms the white buildings into a canvas of gold, pink, and purple is genuinely magical. I stayed in a cave hotel carved into the caldera—waking up to that view every morning never got old.",
      "The food scene here is exceptional. Fresh seafood, local wines from volcanic soil, and those famous Greek salads. My favorite meal was at a small family taverna in Imerovigli—grilled octopus that melted in your mouth, paired with Assyrtiko wine from a local vineyard.",
      "Beyond the postcard views, I loved exploring the quieter side of the island. The hike from Fira to Oia along the caldera rim offers incredible views and takes you through smaller villages where you can escape the crowds. The black sand beaches at Perissa are perfect for a more relaxed afternoon.",
    ],
    tips: [
      "Visit in shoulder season (May or October) for fewer crowds and better prices",
      "Book your sunset dinner spot at least a week in advance",
      "Rent an ATV to explore the island—it's the best way to get around",
      "Stay in Imerovigli for the views without the Oia crowds",
      "Take a boat tour to the volcanic islands and hot springs",
    ],
    bestFor: ["Couples", "Photographers", "Wine lovers", "Romance seekers"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  "maldives-overwater": {
    slug: "maldives-overwater",
    image: maldivesImg,
    destination: "Maldives",
    country: "Indian Ocean",
    dateVisited: "March 2024",
    duration: "5 nights",
    rating: 4.9,
    ratings: {
      accommodations: 5,
      food: 5,
      activities: 4.5,
      value: 3.5,
    },
    summary: "The Maldives is every bit as stunning as the photos suggest—crystal clear water, vibrant marine life, and overwater bungalows that feel like a dream. Yes, it's pricey, but for a bucket-list experience, it delivers.",
    fullReview: [
      "Stepping off the seaplane onto the resort's jetty, I immediately understood the hype. The water is impossibly clear, shifting from turquoise to deep blue, with fish visible from 20 feet up. My overwater villa had a glass floor panel—I spotted a reef shark swimming beneath while having morning coffee.",
      "Snorkeling here is world-class. The house reef was steps from my villa, teeming with colorful fish, sea turtles, and even manta rays. The resort arranged a night snorkeling trip where we swam with bioluminescent plankton—genuinely surreal.",
      "Food was exceptional but expensive (a warning for budget-conscious travelers). The seafood is incredibly fresh, and the resort had multiple restaurants ranging from casual beach grills to fine dining. The floating breakfast in my villa pool was Instagram-worthy and delicious.",
    ],
    tips: [
      "Go all-inclusive if possible—à la carte adds up quickly",
      "Bring reef-safe sunscreen and lots of it",
      "Pack a good underwater camera for snorkeling",
      "Book excursions through the resort for the best experiences",
      "The dry season (December-April) offers the best weather",
    ],
    bestFor: ["Honeymooners", "Snorkeling enthusiasts", "Luxury seekers", "Beach lovers"],
  },
  "caribbean-cruise": {
    slug: "caribbean-cruise",
    image: cruiseImg,
    destination: "Caribbean Cruise",
    country: "Various Islands",
    dateVisited: "January 2024",
    duration: "7 nights",
    rating: 4.5,
    ratings: {
      accommodations: 4,
      food: 4.5,
      activities: 5,
      value: 4.5,
    },
    summary: "A week island-hopping with friends was the perfect mix of adventure and relaxation. Each port offered something different, from beach days to historic tours, and the ship itself was a floating resort with endless entertainment.",
    fullReview: [
      "We departed from Miami and hit four islands: Cozumel, Grand Cayman, Jamaica, and Haiti's private beach. Each stop was different—snorkeling in crystal-clear Mexican waters, swimming with stingrays in Cayman, exploring Dunn's River Falls in Jamaica.",
      "The group dynamic made this trip special. Cruises are perfect for groups because there's something for everyone. Some of us hit the pool deck while others explored the spa. We'd meet up for dinner and shows, then split off again. The flexibility is unmatched.",
      "Pro tip: book excursions in advance, especially for popular activities. We almost missed out on the stingray experience because we waited until we boarded. Also, balcony cabins are worth the upgrade—watching islands appear on the horizon from your private space is magical.",
    ],
    tips: [
      "Book excursions before boarding for the best selection",
      "Balcony cabins are worth the upgrade for the views",
      "Bring a lanyard for your cruise card—you use it constantly",
      "Don't skip the port days for the ship—the islands are the highlight",
      "Drink packages can save money if you plan to imbibe",
    ],
    bestFor: ["Groups", "First-time cruisers", "Beach lovers", "Those who want variety"],
  },
  "swiss-alps": {
    slug: "swiss-alps",
    image: alpsImg,
    destination: "Swiss Alps",
    country: "Switzerland",
    dateVisited: "August 2023",
    duration: "6 nights",
    rating: 4.7,
    ratings: {
      accommodations: 4.5,
      food: 4,
      activities: 5,
      value: 3.5,
    },
    summary: "The Swiss Alps deliver on every postcard promise—dramatic peaks, charming villages, and outdoor adventures around every corner. Switzerland is expensive, but the natural beauty is worth every franc.",
    fullReview: [
      "Based in Interlaken, I had access to two stunning lakes and countless mountain adventures. The Jungfraujoch—Top of Europe—was the highlight: riding a train through the Eiger to emerge at 11,000 feet with glaciers stretching in every direction.",
      "Hiking here is world-class. The trails are well-marked and maintained, with mountain huts offering refreshments along the way. I tackled the Schynige Platte to First trail, a challenging but rewarding day that offered views of the Eiger, Mönch, and Jungfrau.",
      "The charming villages are straight out of a storybook. Lauterbrunnen's waterfall-lined valley, Grindelwald's mountain backdrop, and Mürren's car-free streets made every evening stroll magical. The fondue didn't hurt either.",
    ],
    tips: [
      "Get a Swiss Travel Pass—it covers most trains and saves money",
      "Book mountain railways in advance during peak season",
      "Weather changes quickly—pack layers even in summer",
      "Stay in smaller villages for better value than resort towns",
      "Grocery stores and picnic lunches save money on expensive dining",
    ],
    bestFor: ["Adventure seekers", "Hikers", "Nature photographers", "Train enthusiasts"],
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
};

interface Comment {
  id: number;
  author: string;
  date: string;
  content: string;
}

const DestinationReview = () => {
  const { slug } = useParams<{ slug: string }>();
  const review = slug ? reviews[slug] : null;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      author: authorName.trim() || "Anonymous",
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      content: newComment.trim(),
    };

    setComments([...comments, comment]);
    setNewComment("");
    setAuthorName("");
    toast.success("Your comment has been posted!");
  };


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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        {/* Hero Image */}
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

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Summary */}
              <div className="bg-card rounded-2xl p-8 shadow-soft">
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
                    <Button variant="outline" size="sm" className="gap-2">
                      <Heart className="h-4 w-4" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
                <p className="text-lg text-foreground leading-relaxed">
                  {review.summary}
                </p>
              </div>

              {/* Full Review */}
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-foreground">My Experience</h2>
                {review.fullReview.map((paragraph, index) => (
                  <p key={index} className="text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

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
              <div className="bg-secondary/10 rounded-2xl p-8">
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

              {/* Gallery */}
              {review.gallery && review.gallery.length > 0 && (
                <div className="space-y-6">
                  <h2 className="font-display text-2xl font-bold text-foreground">Photo Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {review.gallery.map((image, index) => (
                      <div 
                        key={index} 
                        className="aspect-[4/3] rounded-xl overflow-hidden"
                      >
                        <img 
                          src={image} 
                          alt={`${review.destination} gallery image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions & Comments Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  <h2 className="font-display text-2xl font-bold text-foreground">Questions & Comments</h2>
                </div>
                <p className="text-muted-foreground">
                  Have a question about this destination or want to share your own experience? I'd love to hear from you!
                </p>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-foreground mb-2">
                      Your Name (optional)
                    </label>
                    <input
                      type="text"
                      id="author"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Anonymous"
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-foreground mb-2">
                      Your Question or Comment
                    </label>
                    <Textarea
                      id="comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ask a question or share your thoughts..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <Button type="submit" className="gap-2">
                    <Send className="h-4 w-4" />
                    Post Comment
                  </Button>
                </form>

                {/* Display Comments */}
                {comments.length > 0 && (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-card rounded-xl p-5 shadow-soft">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {comment.author.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{comment.author}</p>
                            <p className="text-xs text-muted-foreground">{comment.date}</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Ratings Breakdown */}
              <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-28">
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Rating Breakdown</h3>
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

                <div className="mt-8">
                  <Button 
                    className="w-full"
                    asChild
                  >
                    <a href="mailto:tlaracy@travelonly.com?subject=Let's Plan My Trip">
                      Ready to Go? Let's Plan
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    No pressure—just here to help when you're ready
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DestinationReview;