import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PlaceMatch {
  photoRefs: string[];
  matchedName: string;
  types: string[];
}

async function searchPlace(query: string, maxPhotos = 4): Promise<PlaceMatch | null> {
  const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!apiKey) return null;
  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.photos,places.displayName,places.types",
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const place = data.places?.[0];
    if (!place?.photos?.length) return null;
    return {
      photoRefs: place.photos.slice(0, maxPhotos).map((p: { name: string }) => p.name),
      matchedName: place.displayName?.text || "",
      types: place.types || [],
    };
  } catch (e) {
    console.error("Place search failed:", query, e);
    return null;
  }
}

const LODGING_TYPES = new Set(["lodging", "hotel", "resort_hotel", "motel", "bed_and_breakfast", "guest_house"]);

function looksLikeLodging(types: string[]): boolean {
  return types.some((t) => LODGING_TYPES.has(t));
}

function nameOverlap(a: string, b: string): boolean {
  if (!a || !b) return false;
  const stop = new Set(["the", "a", "of", "and", "at", "by", "in", "on", "&"]);
  const tokens = (s: string) => new Set(
    s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !stop.has(w))
  );
  const ta = tokens(a);
  const tb = tokens(b);
  for (const t of ta) if (tb.has(t)) return true;
  return false;
}

const AGENT_BRANDING = {
  name: "Tom Laracy",
  email: "tlaracy@travelonly.com",
  agency: "TravelOnly",
};

function stripExpiryLanguage(md: string): string {
  if (!md) return md;
  const patterns = [
    /^.*\b(quote\s+valid\s+until|valid\s+until|expires?\s+on|expiration\s+date|offer\s+expires?)\b.*$/gim,
    /^.*\bthis\s+(price|quote|offer)\s+(is\s+valid\s+until|expires?)\b.*$/gim,
  ];
  let out = md;
  for (const p of patterns) out = out.replace(p, "");
  return out.replace(/\n{3,}/g, "\n\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, attachmentPaths, clientName, clientEmail, includeThingsToDo = true, advisory } = await req.json();

    const hasAttachments = attachmentPaths?.length > 0;
    if (!prompt?.trim() && !hasAttachments) throw new Error("Provide a prompt or attach documents");

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const attachmentContents: { mimeType: string; base64: string; fileName: string }[] = [];
    if (hasAttachments) {
      for (const path of attachmentPaths) {
        try {
          const { data, error } = await supabaseClient.storage.from("booking-documents").download(path);
          if (error || !data) { console.error("Failed to download attachment:", path, error); continue; }
          const buffer = await data.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = "";
          for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
          const base64 = btoa(binary);
          const mimeType = data.type || "application/octet-stream";
          attachmentContents.push({ mimeType, base64, fileName: path.split("/").pop() || "file" });
        } catch (e) {
          console.error("Attachment download error:", path, e);
        }
      }
    }

    const effectivePrompt = prompt?.trim() || `Build a vacation quote for ${clientName || "the client"} using the attached documents. Extract all pricing, dates, flight details, resort info, and traveller information.`;

    let research = "";
    if (PERPLEXITY_API_KEY) {
      try {
        console.log("Researching with Perplexity...");
        const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${PERPLEXITY_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "sonar",
            messages: [
              { role: "system", content: "You are a travel research assistant. If the trip is a cruise, research the ship, cruise line, itinerary, ports, and shore excursions. If it is a resort, research amenities, room types, dining, and nearby activities. Be explicit about whether this is a cruise or a resort stay." },
              { role: "user", content: `Research this travel package for a client vacation quote. First identify whether this is a cruise (and which ship and cruise line) or a resort stay. Then provide relevant details. Trip details: ${effectivePrompt}` },
            ],
          }),
        });
        if (perplexityRes.ok) {
          const perplexityData = await perplexityRes.json();
          research = perplexityData.choices?.[0]?.message?.content || "";
          console.log("Research complete");
        } else {
          console.error("Perplexity error:", perplexityRes.status);
        }
      } catch (e) {
        console.error("Perplexity request failed:", e);
      }
    }

    const clientNameStr = clientName || "the client";
    const today = new Date().toISOString().split("T")[0];

    const userContent: any[] = [];
    userContent.push({
      type: "text",
      text: `You are ${AGENT_BRANDING.name}, a professional Canadian travel agent at ${AGENT_BRANDING.agency} (${AGENT_BRANDING.email}).

Write a professional, blog-style vacation quote document for your client "${clientNameStr}"${clientEmail ? ` (${clientEmail})` : ""}.

CLIENT REQUEST: ${effectivePrompt}

RESEARCH:
${research || "No research available - use details from the prompt and attachments."}

${attachmentContents.length > 0 ? `\nATTACHED DOCUMENTS: ${attachmentContents.length} file(s) attached. Extract ALL relevant details: pricing, dates, flight info, passenger names, booking numbers, room types, inclusions.` : ""}

INSTRUCTIONS:
Write the quote as a flowing, narrative blog-style document in MARKDOWN. Use headings, bold text, bullet points, tables, and blockquotes.

CRITICAL: Identify the trip type correctly.
- If this is a CRUISE, describe it as a cruise, name the SHIP and CRUISE LINE, list the itinerary or ports of call, and never call it a resort stay.
- If this is a RESORT or HOTEL stay, describe the resort, room, and grounds.
- If this is a tour, describe the itinerary day by day.

Include:
- A warm, personal greeting addressing the client by name
- An engaging overview of the destination and the ship or resort
- Accommodation details (cabin category for cruises, room type for resorts)
- What's included
- Travel dates, duration, and check-in/check-out (or embarkation/disembarkation for cruises)
- Flight information if available
- A clear cost breakdown with itemized pricing
- Total cost prominently displayed
- A "Travel Tips" section with 5 numbered insider tips
${includeThingsToDo ? `- A "Things to Do" section. For cruises list shore excursions per port. For resorts list nearby activities.` : "- Do NOT include a Things to Do section"}
${advisory ? `- A prominent "Travel Advisory" callout near the top using a blockquote with ⚠️ emoji containing: "${advisory}"` : ""}
- Next steps for booking
- A professional sign-off from ${AGENT_BRANDING.name}, ${AGENT_BRANDING.agency} (${AGENT_BRANDING.email})

CRITICAL RULES:
- Default currency is CAD unless specified otherwise.
- Do NOT use em-dashes or en-dashes, use regular hyphens.
- Today's date is ${today}.
- Do NOT include any "quote valid until", "valid until", expiry date, or "this price expires" language. You may state that prices and availability are subject to change until booked, but never give an expiry date.
- Output ONLY the markdown document. No preamble, no JSON, no code fences. Start directly with the greeting or first heading.`,
    });

    for (const att of attachmentContents) {
      if (att.mimeType.startsWith("image/") || att.mimeType === "application/pdf") {
        userContent.push({ type: "image_url", image_url: { url: `data:${att.mimeType};base64,${att.base64}` } });
      }
    }

    console.log("Generating markdown quote with Gemini...");
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are ${AGENT_BRANDING.name}, a professional Canadian travel consultant at ${AGENT_BRANDING.agency}. You write beautiful, engaging vacation quotes that read like premium travel blog articles. Your tone is warm, knowledgeable, and personal. Never use em-dashes or en-dashes. Output plain markdown only, never JSON or code fences. Always identify cruises as cruises (with ship and cruise line) and never confuse them with resorts.` },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!aiRes.ok) {
      const status = aiRes.status;
      const errText = await aiRes.text();
      console.error("AI gateway error:", status, errText);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: `AI generation failed (${status}). Please try again.` }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiRes.json();
    let markdown: string = aiData.choices?.[0]?.message?.content || "";
    if (!markdown.trim()) {
      return new Response(JSON.stringify({ error: "AI returned an empty quote. Please try again." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    markdown = markdown.trim();
    if (markdown.startsWith("```")) {
      markdown = markdown.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
    }
    markdown = stripExpiryLanguage(markdown);

    // Metadata extraction (now includes trip_type, ship_name, cruise_line, destination_query)
    let metadata: any = {
      client_name: clientName || null,
      client_email: clientEmail || null,
      resort_name: null,
      destination: null,
      total_price: null,
      currency: "CAD",
      check_in: null,
      check_out: null,
      num_travellers: null,
      trip_type: "other",
      ship_name: null,
      cruise_line: null,
      destination_query: null,
    };

    try {
      const metaRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: "Extract structured metadata from a vacation quote. Use null for any field you cannot determine confidently. Be precise about whether this is a cruise or resort." },
            { role: "user", content: `Extract metadata from this vacation quote markdown:\n\n${markdown.slice(0, 8000)}` },
          ],
          tools: [{
            type: "function",
            function: {
              name: "save_quote_metadata",
              description: "Save extracted vacation quote metadata.",
              parameters: {
                type: "object",
                properties: {
                  client_name: { type: ["string", "null"] },
                  client_email: { type: ["string", "null"] },
                  resort_name: { type: ["string", "null"], description: "For cruises this is the ship name. For resorts the resort/hotel name." },
                  destination: { type: ["string", "null"], description: "Primary destination, e.g. 'Alaska', 'Cancun, Mexico'." },
                  total_price: { type: ["number", "null"] },
                  currency: { type: ["string", "null"] },
                  check_in: { type: ["string", "null"], description: "YYYY-MM-DD or null" },
                  check_out: { type: ["string", "null"], description: "YYYY-MM-DD or null" },
                  num_travellers: { type: ["integer", "null"] },
                  trip_type: { type: "string", enum: ["cruise", "resort", "tour", "other"], description: "Identify whether this is a cruise, a resort/hotel stay, a tour, or other." },
                  ship_name: { type: ["string", "null"], description: "Cruise ship name if trip_type is cruise, otherwise null." },
                  cruise_line: { type: ["string", "null"], description: "Cruise line if trip_type is cruise, otherwise null." },
                  destination_query: { type: ["string", "null"], description: "A short Google search phrase that would return scenic destination photos, e.g. 'Alaska cruise scenery Glacier Bay' or 'Cancun beach Mexico'." },
                },
                required: ["resort_name", "destination", "currency", "trip_type"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "save_quote_metadata" } },
        }),
      });
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        const toolCall = metaData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.arguments) {
          try {
            const parsed = JSON.parse(toolCall.function.arguments);
            metadata = { ...metadata, ...parsed };
          } catch (e) {
            console.error("Metadata tool args not JSON:", e);
          }
        }
      } else {
        console.error("Metadata extraction failed:", metaRes.status);
      }
    } catch (e) {
      console.error("Metadata extraction error:", e);
    }

    if (!metadata.resort_name) metadata.resort_name = "Vacation Package";
    if (!metadata.currency) metadata.currency = "CAD";
    if (!metadata.client_name) metadata.client_name = clientName || "Client";

    console.log("Quote generated. Trip type:", metadata.trip_type, "| Name:", metadata.resort_name, "| Destination:", metadata.destination);

    // Smart photo selection
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const photoUrls: string[] = [];

      const tripType = metadata.trip_type || "other";
      const destination = metadata.destination || "";
      const destinationQuery = metadata.destination_query || destination;

      if (tripType === "cruise") {
        // Try ship photo first (1 only), validate
        if (metadata.ship_name) {
          const shipQuery = `${metadata.ship_name} cruise ship ${metadata.cruise_line || ""}`.trim();
          const shipMatch = await searchPlace(shipQuery, 1);
          if (shipMatch && !looksLikeLodging(shipMatch.types) && nameOverlap(shipMatch.matchedName, metadata.ship_name)) {
            photoUrls.push(`${supabaseUrl}/functions/v1/place-photos?name=${encodeURIComponent(shipMatch.photoRefs[0])}`);
            console.log("Ship photo accepted:", shipMatch.matchedName);
          } else if (shipMatch) {
            console.log("Ship photo rejected (looked like lodging or name mismatch):", shipMatch.matchedName, shipMatch.types);
          }
        }
        // Destination scenery (3 photos)
        if (destinationQuery) {
          const destMatch = await searchPlace(destinationQuery, 3);
          if (destMatch) {
            for (const ref of destMatch.photoRefs) {
              photoUrls.push(`${supabaseUrl}/functions/v1/place-photos?name=${encodeURIComponent(ref)}`);
            }
            console.log("Destination photos:", destMatch.matchedName, destMatch.photoRefs.length);
          }
        }
      } else if (tripType === "resort") {
        // Resort: search resort + destination, validate it's lodging and name overlaps
        const resortQuery = destination ? `${metadata.resort_name} ${destination}` : metadata.resort_name;
        const resortMatch = await searchPlace(resortQuery, 4);
        if (resortMatch && looksLikeLodging(resortMatch.types) && nameOverlap(resortMatch.matchedName, metadata.resort_name)) {
          for (const ref of resortMatch.photoRefs) {
            photoUrls.push(`${supabaseUrl}/functions/v1/place-photos?name=${encodeURIComponent(ref)}`);
          }
          console.log("Resort photos accepted:", resortMatch.matchedName);
        } else {
          console.log("Resort photo rejected, falling back to destination:", resortMatch?.matchedName, resortMatch?.types);
          if (destinationQuery) {
            const destMatch = await searchPlace(destinationQuery, 4);
            if (destMatch) {
              for (const ref of destMatch.photoRefs) {
                photoUrls.push(`${supabaseUrl}/functions/v1/place-photos?name=${encodeURIComponent(ref)}`);
              }
            }
          }
        }
      } else {
        // tour / other - destination only
        if (destinationQuery) {
          const destMatch = await searchPlace(destinationQuery, 4);
          if (destMatch) {
            for (const ref of destMatch.photoRefs) {
              photoUrls.push(`${supabaseUrl}/functions/v1/place-photos?name=${encodeURIComponent(ref)}`);
            }
          }
        }
      }

      if (photoUrls.length > 0) {
        const lines = markdown.split("\n");
        const insertPoints: number[] = [];
        let h2Count = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith("## ")) {
            h2Count++;
            if (h2Count <= 3) {
              for (let j = i + 2; j < lines.length; j++) {
                if (lines[j].trim() === "") { insertPoints.push(j); break; }
              }
            }
          }
        }
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim() === "" && i > 0) { insertPoints.unshift(i); break; }
        }
        const uniquePoints = [...new Set(insertPoints)].sort((a, b) => b - a);
        const photosToInsert = photoUrls.slice(0, uniquePoints.length);
        const altText = tripType === "cruise" ? (metadata.ship_name || destination || "Trip photo") : metadata.resort_name;
        for (let idx = 0; idx < photosToInsert.length && idx < uniquePoints.length; idx++) {
          const insertAt = uniquePoints[idx];
          lines.splice(insertAt + 1, 0, "", `![${altText}](${photosToInsert[idx]})`, "");
        }
        markdown = lines.join("\n");
        console.log(`Injected ${Math.min(photosToInsert.length, uniquePoints.length)} photos (trip_type=${tripType})`);
      } else {
        console.log("No photos to inject for trip_type:", tripType);
      }
    } catch (e) {
      console.error("Photo injection failed:", e);
    }

    return new Response(JSON.stringify({ markdown, metadata }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-quote error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
