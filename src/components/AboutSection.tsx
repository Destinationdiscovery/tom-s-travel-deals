import { Globe, Heart, MapPin, Camera } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "20+ Countries Explored",
    description: "From Caribbean beaches to European cities, I've experienced destinations firsthand to share real insights.",
  },
  {
    icon: Heart,
    title: "Passionate Travel Advocate",
    description: "Travel has transformed my life, and I love helping others discover that same magic.",
  },
  {
    icon: Camera,
    title: "Real Experiences Shared",
    description: "No stock photos here—my reviews feature my own photos, videos, and honest opinions.",
  },
];

const travelPhilosophy = [
  "Travel is about connection, not just destinations",
  "The best trips blend adventure with relaxation",
  "Every destination has a hidden gem worth finding",
  "Group travel creates memories that last forever",
  "Sometimes the unplanned moments are the best",
  "Sharing experiences helps others travel smarter",
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
                Meet Your Travel Guide
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
                Hi, I'm <span className="text-gradient">Tom Laracy</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                I'm not just a travel agent—I'm a fellow traveler who believes the best recommendations 
                come from real experiences. Every destination I share, I've walked those beaches, 
                tasted that food, and captured those sunsets myself.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Through this community, I want to inspire you to explore, share honest insights 
                that help you travel smarter, and connect with others who share the wanderlust. 
                When you're ready to book, I'm here to help make it happen.
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

          {/* Travel Philosophy Card */}
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-elevated">
            <h3 className="font-display text-2xl font-bold text-card-foreground mb-8">
              My Travel Philosophy
            </h3>
            <div className="grid gap-4">
              {travelPhilosophy.map((belief) => (
                <div key={belief} className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">{belief}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground italic">
                "The world is a book, and those who do not travel read only one page." — Saint Augustine
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;