import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Build effective prompt
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
            content: "You are a travel research assistant. Provide detailed resort/hotel information including amenities, room types, location details, highlights, and what's included. Focus on practical booking details.",
          },
          {
            role: "user",
            content: `Research this resort/hotel for a client quote: ${effectivePrompt}. Include details about amenities, room categories, what's included, location highlights, and any current pricing or package information.`,
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

    // Step 3: Build Gemini messages with attachments as vision content
    const clientNameStr = clientName ? `\nCLIENT NAME: ${clientName}` : "";
    const clientEmailStr = clientEmail ? `\nCLIENT EMAIL: ${clientEmail}` : "";

    const userContent: any[] = [];
    userContent.push({
      type: "text",
      text: `Generate a professional travel quote based on this request and research.
${clientNameStr}${clientEmailStr}

CLIENT REQUEST: ${effectivePrompt}

RESORT RESEARCH:
${research || "No research available, use details from the prompt and attachments."}

${attachmentContents.length > 0 ? `\nATTACHED DOCUMENTS: ${attachmentContents.length} file(s) attached below. Extract ALL relevant details: pricing, dates, flight info, passenger names, booking numbers, room types, inclusions, etc.` : ""}

IMPORTANT RULES:
- Default currency is CAD unless specified otherwise
- valid_until should be 14 days from today (${new Date().toISOString().split("T")[0]})
- Extract as many details as possible from the prompt and any attachments
- For line items, categorize each as: Hotel, Transfer, Excursion, Insurance, Flights, Car Rental, Spa, or Other
- If per-person pricing is given, calculate total based on number of travellers
- Include relevant resort amenities and features in the inclusions array
- The client_name MUST be "${clientName || "the client"}"
- Write a professional 2-3 sentence summary paragraph addressed to the client, thanking them and highlighting the trip (like a cover letter for the quote)
- Do NOT use em-dashes or en-dashes in any output, use regular hyphens instead`,
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

    console.log("Generating quote with Gemini...");
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
            content: `You are ${AGENT_BRANDING.name}, a professional Canadian travel agent at ${AGENT_BRANDING.agency} (${AGENT_BRANDING.email}). Build client quotes by extracting every detail from the prompt and attached documents. Be thorough and accurate with pricing, dates, and traveller details. Never use em-dashes or en-dashes.`,
          },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "build_quote",
              description: "Build a complete client vacation quote with all details",
              parameters: {
                type: "object",
                properties: {
                  client_name: { type: "string", description: "Client's full name" },
                  client_email: { type: "string", description: "Client email if found" },
                  summary: { type: "string", description: "A professional 2-3 sentence introduction paragraph addressed to the client, thanking them for choosing the agency and highlighting the trip destination and key features. Written in first person as the agent." },
                  resort_name: { type: "string", description: "Full resort/hotel name" },
                  destination: { type: "string", description: "Destination city/region/country" },
                  check_in: { type: "string", description: "Check-in date YYYY-MM-DD" },
                  check_out: { type: "string", description: "Check-out date YYYY-MM-DD" },
                  num_travellers: { type: "number", description: "Number of travellers" },
                  room_type: { type: "string", description: "Room or suite type" },
                  inclusions: {
                    type: "array",
                    items: { type: "string" },
                    description: "What's included: All-Inclusive, Airport Transfers, Travel Insurance, etc.",
                  },
                  line_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", enum: ["Hotel", "Transfer", "Excursion", "Insurance", "Flights", "Car Rental", "Spa", "Other"] },
                        description: { type: "string" },
                        amount: { type: "number" },
                      },
                      required: ["description", "amount"],
                      additionalProperties: false,
                    },
                    description: "Itemized pricing breakdown",
                  },
                  flights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        airline: { type: "string" },
                        flightNumber: { type: "string" },
                        departureAirport: { type: "string" },
                        arrivalAirport: { type: "string" },
                        departureTime: { type: "string" },
                        arrivalTime: { type: "string" },
                      },
                      additionalProperties: false,
                    },
                    description: "Flight details if available",
                  },
                  notes: { type: "string", description: "Additional notes, highlights, or special requests" },
                  currency: { type: "string", enum: ["CAD", "USD", "EUR", "GBP"], description: "Currency code" },
                  valid_until: { type: "string", description: "Quote valid until date YYYY-MM-DD" },
                },
                required: ["client_name", "resort_name", "line_items", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "build_quote" } },
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
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured output");
    }

    const quoteData = JSON.parse(toolCall.function.arguments);
    console.log("Quote generated for:", quoteData.resort_name);

    return new Response(JSON.stringify(quoteData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-quote error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
