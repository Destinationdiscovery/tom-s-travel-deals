import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy"
        description="How ReviewThenGo collects, uses, and protects the information of visitors and subscribers."
        url="/privacy-policy"
      />
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-4">Last updated: February 2026</p>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as your name and email address when you subscribe to our newsletter or contact us. We also automatically collect certain information when you visit our site, including your IP address, browser type, and pages viewed.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to operate and improve our website, send you newsletters and travel deal updates (if you opt in), respond to your inquiries, and analyze site usage to improve the user experience.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-3">3. Cookies & Tracking</h2>
            <p>We use cookies and similar tracking technologies to track activity on our website and hold certain information. These include affiliate tracking cookies from our partners (Expedia, Hotels.com, VRBO, Amazon) that help us earn commissions when you make purchases through our links.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-3">4. Third-Party Services</h2>
            <p>Our website contains links to third-party websites and services, including travel booking platforms. These third parties have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of these external sites.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-3">5. Data Security</h2>
            <p>We implement reasonable security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-3">6. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal information at any time by contacting us. If you have subscribed to our newsletter, you can unsubscribe at any time using the link provided in each email.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mt-8 mb-3">7. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us through our <a href="/contact" className="text-primary underline hover:text-secondary transition-colors">Contact page</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
