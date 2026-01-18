import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Globe, MessageSquare, Send } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
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
                    Looking for Honest Reviews Before You Book?
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
                    href="https://form.jotform.com/260065315910247" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Send a message</p>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Contact Form</p>
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

              {/* Contact Form */}
              <div className="bg-card rounded-3xl p-8 md:p-10 shadow-elevated flex flex-col items-center justify-center text-center">
                <h3 className="font-display text-2xl font-bold text-card-foreground mb-4">
                  Send a Message
                </h3>
                <p className="text-muted-foreground mb-8">
                  Click below to open my contact form and I'll get back to you within 24 hours.
                </p>
                <Button asChild variant="default" size="lg" className="gap-2">
                  <a href="https://form.jotform.com/260065315910247" target="_blank" rel="noopener noreferrer">
                    <Send className="h-5 w-5" />
                    Open Contact Form
                  </a>
                </Button>
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
