import { useEffect } from "react";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const tiktokVideos = [
  { id: "7564083821415517447", type: "video" },
  { id: "7595305019180682503", type: "photo" },
  { id: "7596446111728979207", type: "video" },
  { id: "7560346349162581256", type: "video" },
  { id: "7563471529711783175", type: "video" },
];

const TikTokSection = () => {
  useEffect(() => {
    // Load TikTok embed script
    const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
    
    if (existingScript) {
      // Remove existing script to force reload
      existingScript.remove();
    }
    
    // Add fresh script - TikTok will process all blockquotes on load
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Cleanup on unmount
      const scriptToRemove = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
            <Video className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Travel Clips</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Follow My Adventures
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Quick glimpses into my travels — from hidden gems to travel tips. Follow along on TikTok for more!
          </p>
        </div>

        {/* TikTok Carousel */}
        <div className="relative px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {tiktokVideos.map((video) => (
                <CarouselItem
                  key={video.id}
                  className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <div className="flex justify-center">
                    <blockquote
                      className="tiktok-embed"
                      cite={`https://www.tiktok.com/@ultimatetravelwithtom/${video.type}/${video.id}`}
                      data-video-id={video.id}
                      style={{ maxWidth: "325px", minWidth: "300px" }}
                    >
                      <section>
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://www.tiktok.com/@ultimatetravelwithtom/${video.type}/${video.id}`}
                        >
                          Loading TikTok...
                        </a>
                      </section>
                    </blockquote>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4" />
            <CarouselNext className="hidden md:flex -right-4" />
          </Carousel>
        </div>

        {/* Follow Button */}
        <div className="text-center mt-10">
          <Button asChild size="lg" className="gap-2">
            <a
              href="https://www.tiktok.com/@ultimatetravelwithtom"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Video className="h-5 w-5" />
              Follow on TikTok
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};


export default TikTokSection;
