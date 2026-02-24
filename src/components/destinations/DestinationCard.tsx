import { Star, ArrowRight, Play, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { Destination } from "@/pages/Destinations";
import { useMemo } from "react";
import { buildDeepLinks, detectCountry } from "@/components/AffiliateLinks";
import { trackAffiliateClick } from "@/lib/analytics";

interface DestinationCardProps {
  destination: Destination;
  index: number;
}

const DestinationCard = ({ destination: dest, index }: DestinationCardProps) => {
  const expediaLink = useMemo(() => {
    const country = detectCountry();
    return buildDeepLinks(country, dest.destination).expedia;
  }, [dest.destination]);

  return (
  <Link to={`/review/${dest.slug}`} className="group block">
    <article
      className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 animate-fade-up h-full flex flex-col"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={dest.image}
          alt={dest.destination}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        {dest.hasVideo && (
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Play className="h-3 w-3 fill-current" />
            Video
          </div>
        )}
        <div className="absolute bottom-4 left-4">
          <p className="text-primary-foreground/80 text-sm">{dest.country}</p>
          <h3 className="font-display text-2xl font-bold text-primary-foreground">{dest.destination}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(dest.rating) ? "text-accent fill-accent" : "text-muted-foreground"}`}
              />
            ))}
            <span className="text-sm font-medium text-foreground ml-1">{dest.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">{dest.dateVisited}</span>
        </div>

        <p className="text-muted-foreground text-sm flex-1">{dest.teaser}</p>

        <div className="flex flex-wrap gap-2">
          {dest.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
            Read Review <ArrowRight className="h-4 w-4 ml-1" />
          </div>
          <a
            href={expediaLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { e.stopPropagation(); trackAffiliateClick("Expedia", "/destinations", "destination_card"); }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Book on Expedia
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  </Link>
  );
};

export default DestinationCard;
