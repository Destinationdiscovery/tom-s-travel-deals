export type SocialPlatform = "tiktok" | "instagram" | "youtube";

/** Derive an embeddable iframe URL from a public video URL. */
export function deriveEmbedUrl(platform: SocialPlatform, url: string): string {
  try {
    const u = new URL(url);
    if (platform === "youtube") {
      // youtu.be/<id> or youtube.com/watch?v=<id> or /shorts/<id>
      let id = u.searchParams.get("v");
      if (!id) {
        const parts = u.pathname.split("/").filter(Boolean);
        const shortsIdx = parts.indexOf("shorts");
        if (shortsIdx >= 0 && parts[shortsIdx + 1]) id = parts[shortsIdx + 1] ?? null;
        else if (u.hostname.includes("youtu.be")) id = parts[0] ?? null;
        else if (parts[0] === "embed") id = parts[1] ?? null;
      }
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url;
    }
    if (platform === "tiktok") {
      // https://www.tiktok.com/@user/video/<id>
      const parts = u.pathname.split("/").filter(Boolean);
      const vIdx = parts.indexOf("video");
      const id = (vIdx >= 0 ? parts[vIdx + 1] : parts[parts.length - 1]) ?? null;
      return id ? `https://www.tiktok.com/player/v1/${id}?music_info=1&description=1` : url;
    }
    if (platform === "instagram") {
      // https://www.instagram.com/reel/<id>/  or /p/<id>/
      const parts = u.pathname.split("/").filter(Boolean);
      const kind = parts[0]; // reel | p | tv
      const id = parts[1] ?? null;
      return id ? `https://www.instagram.com/${kind}/${id}/embed` : url;
    }
  } catch {
    // fall through
  }
  return url;
}
