import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const homepageFaqData = [
  {
    question: "What travel planning tools does ReviewThenGo offer?",
    answer:
      "ReviewThenGo offers 8 free travel planning tools: aggregated hotel and resort reviews from 10+ sources, best time to visit any destination with weather and crowd data, a day-by-day itinerary builder, a flight deals finder, a personalized trip packing list generator, a currency exchange rate tracker, destination safety scores with scam alerts, and travel entry requirements and visa policies.",
  },
  {
    question: "Can I plan an entire trip on ReviewThenGo?",
    answer:
      "Yes. ReviewThenGo is designed to be the only site you need. Start by researching destinations with aggregated reviews, check the best time to visit, build a day-by-day itinerary, find flight deals, get a packing list, check safety scores, and convert currency, all without leaving the site.",
  },
  {
    question: "How does ReviewThenGo aggregate reviews?",
    answer:
      "We pull unbiased data from 10+ trusted sources including Google, TripAdvisor, Booking.com, and Reddit. Recent verified stays are weighted 2x higher so you always see the most relevant insights.",
  },
  {
    question: "Is ReviewThenGo free to use?",
    answer:
      "Yes. ReviewThenGo is completely free to use. The site is supported by ads and clearly disclosed affiliate links. We never accept payment from properties in exchange for positive reviews.",
  },
  {
    question: "How does the Best Time to Visit tool work?",
    answer:
      "Enter any destination and get a breakdown by season with weather (temperature and rainfall), crowd levels, flight price trends, local events and festivals, and months to avoid. It helps you find the cheapest or most enjoyable months to travel.",
  },
  {
    question: "Is ReviewThenGo better than using multiple travel sites?",
    answer:
      "ReviewThenGo eliminates the need to jump between Google Flights, TripAdvisor, weather sites, packing blogs, and currency converters. All 8 tools are in one place, saving you hours of research across multiple tabs and websites.",
  },
  {
    question: "How can I spot fake hotel reviews?",
    answer:
      "Look for patterns: a sudden burst of 5-star reviews from brand-new accounts, overly generic language, or reviews that mention no specific details. ReviewThenGo flags these patterns automatically and weights verified traveler stays higher.",
  },
  {
    question: "What types of properties can I search?",
    answer:
      "You can search hotels, resorts, all-inclusives, Airbnbs, golf resorts, cruise ships, and virtually any accommodation worldwide. Just type a name or destination into the search bar.",
  },
  {
    question: "Does ReviewThenGo cover destinations worldwide?",
    answer:
      "Absolutely. We cover properties in 190+ countries, from Paris boutique hotels to Bali beach resorts, NYC Airbnbs to Dubai golf clubs. If travelers have reviewed it, we aggregate it.",
  },
  {
    question: "How is ReviewThenGo different from TripAdvisor?",
    answer:
      "Instead of showing you thousands of individual reviews to scroll through, we aggregate scores from multiple platforms and distill them into a clear verdict with pros, cons, and a \"worth it?\" recommendation, saving you hours of research.",
  },
];

const HomepageFAQ = () => (
  <section className="py-16 md:py-20 bg-background" aria-labelledby="faq-heading">
    <div className="container mx-auto px-4 max-w-3xl">
      <div className="text-center mb-10">
        <h2 id="faq-heading" className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3">
          Frequently Asked Questions About ReviewThenGo
        </h2>
        <p className="text-muted-foreground text-lg">
          Everything you need to know about ReviewThenGo and its travel planning tools.
        </p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {homepageFaqData.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-foreground">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default HomepageFAQ;
