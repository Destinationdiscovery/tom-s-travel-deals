import heroBackground from "@/assets/hero-beach.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[200px] md:h-[240px] flex items-center justify-center">
      <img
        src={heroBackground}
        alt="Overwater villa at sunset"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

      <div className="relative z-10 text-center px-4">
        <a
          href="https://www.expedia.ca/?affcid=ca.network.pz.affiliate.1100l5DpWA"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mb-2 text-amber-400 font-bold text-lg md:text-xl tracking-widest hover:text-amber-300 transition-colors"
        >
          expedia
        </a>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight">
          <span className="text-sky-300">REVIEW</span>{" "}
          <span className="text-amber-400">THEN</span>{" "}
          <span className="text-emerald-400 font-black">GO</span>
        </h1>
        <p className="text-white/80 text-sm md:text-base font-light">
          Honest Reviews by Travellers, for Travellers
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
