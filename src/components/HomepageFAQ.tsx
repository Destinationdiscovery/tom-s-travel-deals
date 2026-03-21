import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const homepageFaqData = [
  {
    question: "How does ReviewThenGo aggregate reviews?",
    answer:
      "We pull unbiased data from 10+ trusted sources including Google, TripAdvisor, Booking.com, and Reddit. Recent verified stays are weighted 2× higher so you always see the most relevant insights.",
  },
  {
    question: "Is ReviewThenGo free to use?",
    answer:
      "Yes — ReviewThenGo is completely free to use. The site is supported by ads and clearly disclosed affiliate links. We never accept payment from properties in exchange for positive reviews.",
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
      "Absolutely. We cover properties in 190+ countries — from Paris boutique hotels to Bali beach resorts, NYC Airbnbs to Dubai golf clubs. If travelers have reviewed it, we aggregate it.",
  },
  {
    question: "How is ReviewThenGo different from TripAdvisor?",
    answer:
      "Instead of showing you thousands of individual reviews to scroll through, we aggregate scores from multiple platforms and distill them into a clear verdict with pros, cons, and a \"worth it?\" recommendation — saving you hours of research.",
  },
];

const HomepageFAQ = () => (
  <section className="py-16 md:py-20 bg-background" aria-labelledby="faq-heading">
    <div className="container mx-auto px-4 max-w-3xl">
      <div className="text-center mb-10">
        <h2 id="faq-heading" className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground text-lg">
          Everything you need to know about ReviewThenGo.
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
