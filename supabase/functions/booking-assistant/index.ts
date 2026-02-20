import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const tools = [
  {
    type: "function",
    function: {
      name: "create_booking",
      description:
        "Create a new booking from extracted document data. Extract EVERY detail you can find: client info, booking numbers, resort/hotel, room types, flight itineraries, pricing breakdowns, meal plans, transfers, insurance, and any other trip information.",
      parameters: {
        type: "object",
        properties: {
          client_name: { type: "string", description: "Full name of the client / traveller" },
          client_email: { type: "string", description: "Client email if found" },
          booking_number: { type: "string", description: "Booking confirmation / reference number" },
          supplier: { type: "string", description: "Travel supplier or tour operator (e.g. Sunwing, Sandals, Air Canada)" },
          resort_or_trip: { type: "string", description: "Resort name, hotel name, or trip description" },
          destination: { type: "string", description: "Destination city, region, or country (e.g. Cancun, Mexico)" },
          room_type: { type: "string", description: "Room or cabin type (e.g. Ocean View Junior Suite, Balcony Cabin)" },
          num_travellers: { type: "number", description: "Number of travellers / guests" },
          flight_details: {
            type: "object",
            description: "Flight itinerary details",
            properties: {
              outbound: {
                type: "object",
                properties: {
                  airline: { type: "string" },
                  flight_number: { type: "string" },
                  departure_airport: { type: "string" },
                  departure_time: { type: "string" },
                  arrival_airport: { type: "string" },
                  arrival_time: { type: "string" },
                },
              },
              return: {
                type: "object",
                properties: {
                  airline: { type: "string" },
                  flight_number: { type: "string" },
                  departure_airport: { type: "string" },
                  departure_time: { type: "string" },
                  arrival_airport: { type: "string" },
                  arrival_time: { type: "string" },
                },
              },
            },
          },
          pricing: {
            type: "object",
            description: "Pricing breakdown",
            properties: {
              total: { type: "number", description: "Total cost" },
              deposit: { type: "number", description: "Deposit amount" },
              taxes: { type: "number", description: "Taxes and fees" },
              per_person: { type: "number", description: "Per-person cost" },
              currency: { type: "string", description: "Currency code (e.g. CAD, USD)" },
            },
          },
          extras: {
            type: "array",
            description: "Any other details found: meal plan, transfers, insurance, special requests, etc.",
            items: {
              type: "object",
              properties: {
                label: { type: "string", description: "Category name (e.g. Meal Plan, Transfers, Insurance)" },
                value: { type: "string", description: "The detail value" },
              },
              required: ["label", "value"],
            },
          },
          date_booked: { type: "string", description: "Date the booking was made (YYYY-MM-DD)" },
          deposit_due: { type: "string", description: "Deposit due date if found (YYYY-MM-DD)" },
          final_payment_due: { type: "string", description: "Final payment due date if found (YYYY-MM-DD)" },
          trip_start: { type: "string", description: "Trip start / check-in / departure date (YYYY-MM-DD)" },
          trip_end: { type: "string", description: "Trip end / check-out / return date (YYYY-MM-DD)" },
        },
        required: ["client_name", "booking_number", "resort_or_trip"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_to_booking",
      description:
        "Add files or update details on an existing booking. Also extract any new details from the documents to merge into the booking profile.",
      parameters: {
        type: "object",
        properties: {
          booking_number: { type: "string", description: "The booking number to add files to" },
          client_name: { type: "string", description: "Client name for folder organization" },
          notes: { type: "string", description: "Any additional details extracted from the documents" },
          destination: { type: "string", description: "Destination if newly found" },
          room_type: { type: "string", description: "Room type if newly found" },
          num_travellers: { type: "number", description: "Number of travellers if newly found" },
          flight_details: {
            type: "object",
            description: "Updated or new flight details",
            properties: {
              outbound: {
                type: "object",
                properties: {
                  airline: { type: "string" },
                  flight_number: { type: "string" },
                  departure_airport: { type: "string" },
                  departure_time: { type: "string" },
                  arrival_airport: { type: "string" },
                  arrival_time: { type: "string" },
                },
              },
              return: {
                type: "object",
                properties: {
                  airline: { type: "string" },
                  flight_number: { type: "string" },
                  departure_airport: { type: "string" },
                  departure_time: { type: "string" },
                  arrival_airport: { type: "string" },
                  arrival_time: { type: "string" },
                },
              },
            },
          },
          pricing: {
            type: "object",
            description: "Updated or new pricing details",
            properties: {
              total: { type: "number" },
              deposit: { type: "number" },
              taxes: { type: "number" },
              per_person: { type: "number" },
              currency: { type: "string" },
            },
          },
          extras: {
            type: "array",
            description: "Any new extras found",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "string" },
              },
              required: ["label", "value"],
            },
          },
        },
        required: ["booking_number", "client_name"],
        additionalProperties: false,
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, files, existing_bookings, existing_clients } =
      await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const content: any[] = [];

    if (message) {
      content.push({ type: "text", text: message });
    }

    const contextParts: string[] = [];
    if (existing_bookings?.length) {
      contextParts.push(
        `Existing bookings:\n${existing_bookings
          .map(
            (b: any) =>
              `- ${b.bookingNumber}: ${b.clientName} — ${b.title}`
          )
          .join("\n")}`
      );
    }
    if (existing_clients?.length) {
      contextParts.push(
        `Existing clients: ${existing_clients.map((c: any) => c.name).join(", ")}`
      );
    }
    if (contextParts.length) {
      content.push({
        type: "text",
        text: `Context:\n${contextParts.join("\n\n")}`,
      });
    }

    if (files?.length) {
      for (const file of files) {
        if (file.base64 && file.mimeType) {
          content.push({
            type: "image_url",
            image_url: {
              url: `data:${file.mimeType};base64,${file.base64}`,
            },
          });
        }
      }
    }

    const systemPrompt = `You are a travel agent's booking assistant. You analyze uploaded booking confirmation documents (screenshots, PDFs, photos) and extract structured booking data.

When the user asks to create a new booking, use the create_booking tool with ALL the details you can extract from the documents.
When the user asks to add files to an existing booking, use the add_to_booking tool with the matching booking number AND any new details found.

EXTRACT EVERYTHING YOU CAN FIND:
- Client name and email
- Booking/confirmation number
- Supplier / tour operator
- Resort or hotel name
- Destination (city, region, country)
- Room type or cabin category
- Number of travellers
- Flight itinerary: airline, flight numbers, departure/arrival airports and times (for both outbound and return)
- Pricing: total cost, deposit amount, taxes/fees, per-person cost, currency
- Extras: meal plan, transfers, insurance, special requests, excursions, upgrade details, loyalty program info, or anything else noteworthy
- All relevant dates: booking date, deposit due, final payment, trip start, trip end

If the user mentions a client name, use that. If not, try to find it in the documents.
If you can match to an existing booking by number or client name, prefer add_to_booking.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content },
          ],
          tools,
          tool_choice: "auto",
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      const body = await response.text();
      console.error("AI gateway error:", status, body);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    if (choice?.message?.tool_calls?.length) {
      const toolCall = choice.message.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);

      return new Response(
        JSON.stringify({
          action: toolCall.function.name,
          data: args,
          message: choice.message.content || null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        action: null,
        data: null,
        message:
          choice?.message?.content ||
          "I couldn't extract booking details from the provided documents. Please try again with clearer images.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("booking-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
