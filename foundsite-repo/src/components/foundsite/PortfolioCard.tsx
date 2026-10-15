import { useState } from "react";
import { CATEGORY_COLOR, type PortfolioItem } from "@/lib/portfolio";

export function PortfolioCard({ item }: { item: PortfolioItem }) {
  const [src, setSrc] = useState(item.image);
  const [failed, setFailed] = useState(false);
  const color = CATEGORY_COLOR[item.category];

  const handleError = () => {
    if (item.fallbackImage && src !== item.fallbackImage) setSrc(item.fallbackImage);
    else setFailed(true);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101512]">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#161c19] px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-2 flex-1 truncate rounded bg-black/40 px-2 py-1 text-[11px] text-white/50">
          {item.domain}
        </div>
      </div>

      {failed ? (
        <div className="flex h-[200px] items-center justify-center bg-[#0a0c0b] text-sm text-white/40">
          {item.domain}
        </div>
      ) : (
        <img
          src={src}
          alt={`${item.name} website preview`}
          loading="lazy"
          onError={handleError}
          className="h-[200px] w-full bg-[#0a0c0b] object-cover object-top"
        />
      )}

      <div className="space-y-3 p-4">
        <div className="text-[15px] font-bold text-white">{item.name}</div>
        <p className="text-[13px] leading-relaxed text-white/55">{item.description}</p>
        <div className="flex items-center justify-between gap-3">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: `${color}22`, color }}
          >
            {item.category}
          </span>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
          >
            Visit site →
          </a>
        </div>
        <div className="text-right text-[10px]" style={{ color: "var(--brand-accent)" }}>
          Built by Foundsite
        </div>
      </div>
    </div>
  );
}
