import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AffiliateDisclosureBanner from "@/components/AffiliateDisclosureBanner";
import { Phone, Mail, Globe, MessageSquare, Award, MapPin, Heart, Star } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import heroBeach from "@/assets/hero-beach.jpg";

const Contact = () => {

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Contact"
        description="Get in touch with Tom, a Toronto-based travel consultant with over a decade of experience."
        url="/contact"
      />
      <Header />
      <main className="pt-20">
        <section className="py-24 bg-muted">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    Get in Touch
                  </span>
                  <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
                    Looking for Real Reviews Before You Book?
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    As a travel consultant with over a decade of experience, I share real insights 
                    from destinations I've personally visited. Have questions? Let's chat.
                  </p>
                </div>

                <div className="space-y-6">
                  <a 
                    href="tel:1-519-771-2534" 
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Call me</p>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">1-519-771-2534</p>
                    </div>
                  </a>

                  <a 
                    href="mailto:tlaracy@travelonly.com?subject=Inquiry from ReviewThenGo" 
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Send a message</p>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">tlaracy@travelonly.com</p>
                    </div>
                  </a>

                  <a 
                    href="https://tom.travelonly.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Visit my website</p>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">tom.travelonly.com</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Response time</p>
                      <p className="font-semibold text-foreground">Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Book With Tom Section */}
              <div className="relative rounded-3xl overflow-hidden shadow-elevated h-full min-h-[400px]">
                {/* Background Image */}
                <img 
                  src={heroBeach} 
                  alt="Beautiful tropical beach destination" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
                
                {/* Content */}
                <div className="relative h-full p-8 md:p-10 flex flex-col justify-end text-white">
                  <h3 className="font-display text-2xl md:text-3xl font-bold mb-6">
                    Why Book With Tom?
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>10+ years of travel consulting experience</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Personally visited every destination I recommend</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Real reviews with no hidden agendas</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Personalized itineraries tailored to you</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
