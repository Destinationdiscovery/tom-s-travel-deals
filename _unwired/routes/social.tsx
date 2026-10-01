import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The Social media content page no longer exists. Old links and bookmarks are sent to the new pages:
 * anything pointing at the promo section goes to Promo Cards, everything else goes to the Gallery.
 */
export const Route = createFileRoute("/social")({
  beforeLoad: ({ location }) => {
    throw redirect({ to: location.hash === "promo" ? "/promo-cards" : "/gallery", replace: true });
  },
});
