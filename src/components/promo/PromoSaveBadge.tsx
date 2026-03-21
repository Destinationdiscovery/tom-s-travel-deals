import { Heart } from "lucide-react";

interface PromoSaveBadgeProps {
  visible: boolean;
  pulsing: boolean;
}

const PromoSaveBadge = ({ visible, pulsing }: PromoSaveBadgeProps) => {
  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-3 shadow-lg font-medium text-sm animate-fade-in ${
        pulsing ? "animate-pulse" : ""
      }`}
    >
      <BarChart3 className="h-4 w-4" />
      <span>2/5 saved</span>
      <span className="ml-1 border-l border-primary-foreground/30 pl-2">Compare Now</span>
    </div>
  );
};

export default PromoSaveBadge;
