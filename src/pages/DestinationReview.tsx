import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useParams, Link } from "react-router-dom";
import { Star, ArrowLeft, Calendar, MapPin, Heart, Share2, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import santoriniImg from "@/assets/deal-santorini.jpg";
import maldivesImg from "@/assets/deal-maldives.jpg";
import cruiseImg from "@/assets/deal-cruise.jpg";
import alpsImg from "@/assets/deal-alps.jpg";

interface ReviewData {
  slug: string;
  image: string;
  destination: string;
  country: string;
  dateVisited: string;
  duration: string;
  rating: number;
  ratings: {
    accommodations: number;
    food: number;
    activities: number;
    value: number;
  };
  summary: string;
  fullReview: string[];
  tips: string[];
  bestFor: string[];
  videoUrl?: string;
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
};

interface Comment {
  id: number;
  name: string;
  date: string;
  content: string;
}

const DestinationReview = () => {
  const { slug } = useParams<{ slug: string }>();
  const review = slug ? reviews[slug] : null;
  
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      name: "Sarah M.",
      date: "2 weeks ago",
      content: "Great review, Tom! We're planning our trip for next spring and your tips about shoulder season are super helpful. Did you find it easy to get around without a car?",
    },
    {
      id: 2,
      name: "Mike & Lisa",
      date: "1 month ago",
      content: "Just got back from here following your recommendations. The taverna in Imerovigli was amazing! Thanks for the tip about the hike too—highlight of our trip.",
    },
  ]);
  
  const [newComment, setNewComment] = useState({ name: "", content: "" });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.name.trim() || !newComment.content.trim()) {
      toast.error("Please fill in your name and comment");
      return;
    }
    const comment: Comment = {
      id: Date.now(),
      name: newComment.name,
      date: "Just now",
      content: newComment.content,
    };
    setComments([comment, ...comments]);
    setNewComment({ name: "", content: "" });
    toast.success("Thanks for sharing your experience!");
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

              {/* Comments Section */}
              <div className="space-y-8">
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                  <MessageCircle className="h-6 w-6" />
                  Share Your Experience
                </h2>
                
                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
                  <p className="text-muted-foreground">
                    Been to {review.destination}? Share your thoughts and tips with the community!
                  </p>
                  <Input
                    placeholder="Your name"
                    value={newComment.name}
                    onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                    className="bg-background"
                  />
                  <Textarea
                    placeholder="Share your experience, tips, or questions..."
                    value={newComment.content}
                    onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                    className="bg-background min-h-[100px]"
                  />
                  <Button type="submit" className="gap-2">
                    <Send className="h-4 w-4" />
                    Post Comment
                  </Button>
                </form>

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-card rounded-xl p-6 shadow-soft">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-foreground">{comment.name}</span>
                        <span className="text-sm text-muted-foreground">{comment.date}</span>
                      </div>
                      <p className="text-muted-foreground">{comment.content}</p>
                    </div>
                  ))}
                </div>
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
                    onClick={() => window.open("https://tom.travelonly.com", "_blank")}
                  >
                    Ready to Go? Let's Plan
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