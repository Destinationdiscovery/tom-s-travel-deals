import { CheckCircle, Award, Heart, Globe } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Certified Expert",
    description: "Travelonly certified agent with years of experience crafting perfect vacations.",
  },
  {
    icon: Heart,
    title: "Personal Service",
    description: "Dedicated one-on-one attention to understand your travel dreams and preferences.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Exclusive deals and partnerships with top resorts and airlines worldwide.",
  },
];

const benefits = [
  "Best price guarantee on all bookings",
  "24/7 travel support during your trip",
  "Exclusive group travel discounts",
  "Custom itinerary planning included",
  "Last-minute deal alerts",
  "Flexible booking options",
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
                About Your Agent
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
                Hi, I'm <span className="text-gradient">Tom Laracy</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                As your dedicated Travelonly agent, I specialize in creating unforgettable 
                travel experiences tailored just for you. Whether you're dreaming of a 
                romantic getaway, an adventure with friends, or a family vacation, 
                I'm here to make it happen.
              </p>
            </div>

            <div className="grid gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Card */}
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-elevated">
            <h3 className="font-display text-2xl font-bold text-card-foreground mb-8">
              Why Book With Me?
            </h3>
            <div className="grid gap-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
