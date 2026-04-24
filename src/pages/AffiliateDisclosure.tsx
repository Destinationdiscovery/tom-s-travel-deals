import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const AffiliateDisclosure = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Affiliate Disclosure"
        description="How ReviewThenGo earns commissions through affiliate links and our policy on impartial reviews."
        url="/affiliate-disclosure"
      />
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">Affiliate Disclosure</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground/90">
          <p className="text-lg">
            <strong>ReviewThenGo</strong> is a participant in several affiliate advertising programs designed to provide a means for us to earn commissions by linking to products and services we recommend.
          </p>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-3">How It Works</h2>
            <p>When you click on certain links on our website and make a purchase or booking, we may receive a small commission at <strong>no extra cost to you</strong>. This helps us keep the site running, fund our travel research, and continue providing real, in-depth reviews.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-3">Our Affiliate Partners</h2>
            <p>We currently have affiliate relationships with the following companies:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Expedia</strong>. Hotels, flights, vacation packages, and car rentals</li>
              <li><strong>Hotels.com</strong>. Hotel and accommodation bookings</li>
              <li><strong>VRBO</strong>. Vacation rental properties</li>
              <li><strong>Amazon</strong>. Travel gear, accessories, and products</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-3">Our Commitment to Transparency</h2>
            <p>Our reviews and recommendations are based on real personal travel experiences and thorough research. Affiliate partnerships <strong>never influence</strong> our ratings, reviews, or recommendations. We only recommend products and services we genuinely believe will benefit our readers.</p>
            <p>If we feature a product or destination, it's because we think it's worth your time and money, not because of a commission.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-3">Questions?</h2>
            <p>If you have any questions about our affiliate relationships, please don't hesitate to reach out through our <a href="/contact" className="text-primary underline hover:text-secondary transition-colors">Contact page</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AffiliateDisclosure;
