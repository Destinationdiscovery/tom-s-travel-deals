import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchPlacePhotos(placeName: string, maxPhotos = 4): Promise<string[]> {
  const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!apiKey) {
    console.log("No Google Places API key configured, skipping photos");
    return [];
  }
  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.photos",
      },
      body: JSON.stringify({ textQuery: placeName, maxResultCount: 1 }),
    });
    if (!response.ok) {
      console.error("Google Places search error:", response.status);
      return [];
    }
    const data = await response.json();
    const place = data.places?.[0];
    if (!place?.photos?.length) return [];
    return place.photos.slice(0, maxPhotos).map((p: { name: string }) => p.name);
  } catch (e) {
    console.error("Failed to fetch place photos:", e);
    return [];
  }
}

const AGENT_BRANDING = {
  name: "Tom Laracy",
  email: "tlaracy@travelonly.com",
  agency: "TravelOnly",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, attachmentPaths, clientName, clientEmail } = await req.json();

    const hasAttachments = attachmentPaths?.length > 0;
    if (!prompt?.trim() && !hasAttachments) throw new Error("Provide a prompt or attach documents");

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY is not configured");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 1: Download attachments and convert to base64 for vision
    const attachmentContents: { mimeType: string; base64: string; fileName: string }[] = [];
    if (hasAttachments) {
      for (const path of attachmentPaths) {
        try {
          const { data, error } = await supabaseClient.storage
            .from("booking-documents")
            .download(path);
          if (error || !data) {
            console.error("Failed to download attachment:", path, error);
            continue;
          }
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

    // Step 2: Research resort with Perplexity
    console.log("Researching resort with Perplexity...");
    const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You are a travel research assistant. Provide detailed resort/hotel information including amenities, room types, location details, highlights, dining options, nearby attractions, and what's included. Focus on practical details that would help sell the trip to a client.",
          },
          {
            role: "user",
            content: `Research this resort/hotel for a client vacation quote: ${effectivePrompt}. Include: amenities, room categories, what's included, location highlights, dining, nearby activities, and any current pricing or package info.`,
          },
        ],
      }),
    });

    let research = "";
    if (perplexityRes.ok) {
      const perplexityData = await perplexityRes.json();
      research = perplexityData.choices?.[0]?.message?.content || "";
      console.log("Research complete");
    } else {
      console.error("Perplexity error:", perplexityRes.status);
    }

    // Step 3: Build vision content for Gemini
    const clientNameStr = clientName || "the client";
    const today = new Date().toISOString().split("T")[0];
    const validUntilDate = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];

    const userContent: any[] = [];
    userContent.push({
      type: "text",
      text: `You are ${AGENT_BRANDING.name}, a professional Canadian travel agent at ${AGENT_BRANDING.agency} (${AGENT_BRANDING.email}).

Write a professional, blog-style vacation quote document for your client "${clientNameStr}"${clientEmail ? ` (${clientEmail})` : ""}.

CLIENT REQUEST: ${effectivePrompt}

RESORT RESEARCH:
${research || "No research available - use details from the prompt and attachments."}

${attachmentContents.length > 0 ? `\nATTACHED DOCUMENTS: ${attachmentContents.length} file(s) attached below. Extract ALL relevant details: pricing, dates, flight info, passenger names, booking numbers, room types, inclusions, etc.` : ""}

INSTRUCTIONS:
Write the quote as a flowing, narrative blog-style document in MARKDOWN format. Think of it like writing a travel article that also serves as a quote. You have FULL creative freedom over the layout - use headings, bold text, bullet points, tables, blockquotes, whatever makes the document beautiful and informative.

The document should feel personal and professional, like a travel consultant wrote it specifically for the client. Include:
- A warm, personal greeting addressing the client by name
- An engaging overview of the destination and resort (use the research to paint a picture)
- Accommodation details and room description
- What's included (all-inclusive features, amenities, etc.)
- Travel dates, duration, and check-in/check-out details
- Flight information if available (airline, flight numbers, times)
- A clear cost breakdown section with itemized pricing
- Total cost prominently displayed
- Any special notes, tips, or recommendations
- Next steps for booking
- A professional sign-off from ${AGENT_BRANDING.name}, ${AGENT_BRANDING.agency}

IMPORTANT RULES:
- Default currency is CAD unless specified otherwise
- Do NOT use em-dashes or en-dashes anywhere, use regular hyphens instead
- Make the document feel like a premium travel consultation, not a boring form
- Include the agent's email (${AGENT_BRANDING.email}) in the sign-off
- Be thorough with pricing - if per-person pricing is given, show both per-person and total
- Today's date is ${today}, quote valid until ${validUntilDate}

After writing the markdown, also return a small metadata object for database storage.

Return your response as a JSON object with exactly two fields:
{
  "markdown": "the full markdown document...",
  "metadata": {
    "client_name": "...",
    "client_email": "..." or null,
    "resort_name": "...",
    "destination": "...",
    "total_price": number or null,
    "currency": "CAD",
    "valid_until": "${validUntilDate}",
    "check_in": "YYYY-MM-DD" or null,
    "check_out": "YYYY-MM-DD" or null,
    "num_travellers": number or null
  }
}

Return ONLY valid JSON. No markdown fencing around the JSON itself.`,
    });

    // Add attachment images for vision
    for (const att of attachmentContents) {
      if (att.mimeType.startsWith("image/") || att.mimeType === "application/pdf") {
        userContent.push({
          type: "image_url",
          image_url: {
            url: `data:${att.mimeType};base64,${att.base64}`,
          },
        });
      }
    }

    console.log("Generating blog-style quote with Gemini...");
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are ${AGENT_BRANDING.name}, a professional Canadian travel consultant at ${AGENT_BRANDING.agency}. You write beautiful, engaging vacation quotes that read like premium travel blog articles. Your tone is warm, knowledgeable, and personal. Never use em-dashes or en-dashes. Always return valid JSON.`,
          },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!aiRes.ok) {
      const status = aiRes.status;
      const errText = await aiRes.text();
      console.error("AI gateway error:", status, errText);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI generation failed: ${status}`);
    }

    const aiData = await aiRes.json();
    const rawContent = aiData.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error("AI did not return content");

    // Parse JSON - handle potential markdown fencing
    let cleaned = rawContent.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const result = JSON.parse(cleaned);
    if (!result.markdown || !result.metadata) {
      throw new Error("AI response missing markdown or metadata");
    }

    console.log("Blog-style quote generated for:", result.metadata.resort_name);

    // Fetch real resort photos from Google Places
    const resortName = result.metadata.resort_name || "";
    if (resortName) {
      console.log("Fetching resort photos for:", resortName);
      const photoRefs = await fetchPlacePhotos(resortName, 4);
      if (photoRefs.length > 0) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const photoUrls = photoRefs.map(
          (ref) => `${supabaseUrl}/functions/v1/place-photos?name=${encodeURIComponent(ref)}`
        );

        // Inject photos at natural breakpoints in the markdown
        const lines = result.markdown.split("\n");
        const insertPoints: number[] = [];
        let h2Count = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith("## ")) {
            h2Count++;
            // Insert after the first paragraph following the 1st, 2nd, and 3rd h2
            if (h2Count <= 3) {
              // Find the next blank line after this heading (end of first paragraph)
              for (let j = i + 2; j < lines.length; j++) {
                if (lines[j].trim() === "") {
                  insertPoints.push(j);
                  break;
                }
              }
            }
          }
        }

        // Also add one photo at the very top (after first blank line)
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim() === "" && i > 0) {
            insertPoints.unshift(i);
            break;
          }
        }

        // Dedupe and sort descending so inserts don't shift indices
        const uniquePoints = [...new Set(insertPoints)].sort((a, b) => b - a);
        const photosToInsert = photoUrls.slice(0, uniquePoints.length);

        for (let idx = 0; idx < photosToInsert.length && idx < uniquePoints.length; idx++) {
          const insertAt = uniquePoints[idx];
          lines.splice(insertAt + 1, 0, "", `![${resortName}](${photosToInsert[idx]})`, "");
        }

        result.markdown = lines.join("\n");
        console.log(`Injected ${Math.min(photosToInsert.length, uniquePoints.length)} resort photos`);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-quote error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
