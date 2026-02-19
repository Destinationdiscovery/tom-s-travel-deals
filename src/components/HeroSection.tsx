import heroBackground from "@/assets/hero-beach.jpg";
import expediaLogo from "@/assets/expedia-logo.png";

const HeroSection = () => {
  return (
    <section className="relative h-[240px] md:h-[280px] flex items-center justify-center">
      <img
        src={heroBackground}
        alt="Overwater villa at sunset"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

      <div className="relative z-10 text-center px-4">
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight">
          <span className="text-sky-300">REVIEW</span>{" "}
          <span className="text-amber-400">THEN</span>{" "}
          <span className="text-emerald-400 font-black">GO</span>
        </h1>
        <p className="text-white/80 text-sm md:text-base font-light mb-3">
          Honest Reviews by Travellers, for Travellers
        </p>
        <a
          href="https://www.expedia.ca/?affcid=ca.network.pz.affiliate.1100l5DpWA"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-white/50 text-xs font-light">Powered by:</span>
          <img src={expediaLogo} alt="Expedia" className="h-5 md:h-6" />
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
