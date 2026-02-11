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
          className="fixed top-8 right-8 z-[60] text-white hover:text-white text-base font-semibold px-5 py-2.5 rounded-full border border-white/40 hover:border-white/60 bg-white/15 backdrop-blur-md shadow-lg transition-all animate-fade-in"
        >
          Skip →
        </button>
      )}
    </div>
  );
};

export default PromoSlideshow;
