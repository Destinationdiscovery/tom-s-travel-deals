import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, Send } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Get in Touch
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
                Let's Plan Your Perfect Trip
              </h2>
              <p className="text-muted-foreground text-lg">
                Ready to turn your travel dreams into reality? Reach out and let's start 
                planning your next adventure together.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Call me</p>
                  <p className="font-semibold text-foreground">Contact for phone</p>
                </div>
              </div>

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
  );
};

export default ContactSection;
