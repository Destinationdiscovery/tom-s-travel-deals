import PromoDemoWalkthrough from "@/components/PromoDemoWalkthrough";

interface PromoSlideshowProps {
  onComplete: () => void;
  loop?: boolean;
  showSkip?: boolean;
}

const PromoSlideshow = ({ onComplete, loop = false, showSkip = true }: PromoSlideshowProps) => {
  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="relative">
      <PromoDemoWalkthrough onComplete={onComplete} loop={loop} />

      {/* Skip button */}
      {showSkip && (
        <button
          onClick={handleSkip}
          className="fixed bottom-8 right-8 z-[60] text-white/60 hover:text-white text-sm font-medium px-4 py-2 rounded-full border border-white/20 hover:border-white/40 backdrop-blur-sm transition-all"
        >
          Skip →
        </button>
      )}
    </div>
  );
};

export default PromoSlideshow;
