import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Plane } from "lucide-react";

interface DealCardProps {
  image: string;
  destination: string;
  description: string;
  price: string;
  originalPrice?: string;
  duration: string;
  type: "last-minute" | "group" | "popular";
  groupSize?: string;
}

const DealCard = ({
  image,
  destination,
  description,
  price,
  originalPrice,
  duration,
  type,
  groupSize,
}: DealCardProps) => {
  const badgeConfig = {
    "last-minute": { label: "Last Minute", className: "bg-destructive text-destructive-foreground" },
    group: { label: "Group Deal", className: "bg-secondary text-secondary-foreground" },
    popular: { label: "Most Popular", className: "bg-accent text-accent-foreground" },
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-2">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={destination}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <Badge className={`absolute top-4 left-4 ${badgeConfig[type].className}`}>
          {badgeConfig[type].label}
        </Badge>
        {originalPrice && (
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
            Save {Math.round((1 - parseInt(price.replace(/[^0-9]/g, "")) / parseInt(originalPrice.replace(/[^0-9]/g, ""))) * 100)}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-card-foreground mb-2">
            {destination}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          {groupSize && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{groupSize}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Plane className="h-4 w-4" />
            <span>Flights included</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through mr-2">
                {originalPrice}
              </span>
            )}
            <span className="text-2xl font-bold text-primary">{price}</span>
            <span className="text-sm text-muted-foreground">/person</span>
          </div>
          <Button variant="default" size="sm">
            View Deal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DealCard;
