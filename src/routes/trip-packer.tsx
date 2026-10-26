import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

const TARGET =
  "https://muse.ai/s/trip-packer-2-xzr6xgxsxmxxx01xxxv/cIFe0SIdwtb5oEb5p25i852jX6vvLsWoYLEZnGTNUz8";

export const Route = createFileRoute("/trip-packer")({
  head: () =>
    pageHead({
      title: "Trip Packer, free packing list tool",
      description:
        "Build a packing list by destination, month and trip type, with seasonal averages, destination specific items, and uncommon items that are easy to forget.",
      path: "/trip-packer",
      modified: "2026-10-26",
    }),
  component: TripPackerRedirect,
});

function TripPackerRedirect() {
  useEffect(() => {
    window.location.replace(TARGET);
  }, []);
  return (
    <main>
      <div className="wrap toolhead">
        <p className="eyebrow">TravelOnly With Tom</p>
        <h1>Trip Packer</h1>
        <p>
          Opening the Trip Packer. If it does not open,{" "}
          <a href={TARGET}>continue to the Trip Packer</a>.
        </p>
      </div>
    </main>
  );
}
