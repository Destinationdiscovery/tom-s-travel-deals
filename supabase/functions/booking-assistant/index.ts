import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ── Shared field schemas ── */

const flightDetailsSchema = {
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
};

const pricingSchema = {
  type: "object",
  description: "Pricing breakdown",
  properties: {
    total: { type: "number", description: "Total cost" },
    deposit: { type: "number", description: "Deposit amount" },
    taxes: { type: "number", description: "Taxes and fees" },
    per_person: { type: "number", description: "Per-person cost" },
    currency: { type: "string", description: "Currency code (e.g. CAD, USD)" },
  },
};

const extrasSchema = {
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
};

const itinerarySchema = {
  type: "array",
  description: "Port-by-port cruise itinerary or day-by-day trip schedule",
  items: {
    type: "object",
    properties: {
      date: { type: "string", description: "Date string e.g. 'Sat, Aug 15, 2026'" },
      port: { type: "string", description: "Port name or 'AT SEA'" },
      arrival: { type: "string", description: "Arrival time or null/empty for embarkation/sea days" },
      departure: { type: "string", description: "Departure time or null/empty for disembarkation/sea days" },
    },
    required: ["date", "port"],
  },
};

const passengersSchema = {
  type: "array",
  description: "Traveller / passenger details",
  items: {
    type: "object",
    properties: {
      name: { type: "string", description: "Full name with title e.g. 'Mr Patrick Francis Mastrogiacomo'" },
      dob: { type: "string", description: "Date of birth e.g. 'December 20, 1972'" },
      age: { type: "number", description: "Current age" },
      gender: { type: "string", description: "M or F" },
      traveller_type: { type: "string", description: "Adult, Senior, Child, Infant" },
      citizenship: { type: "string", description: "Country code e.g. CA, US" },
      passport_number: { type: "string", description: "Passport number" },
      passport_country: { type: "string", description: "Passport issuing country code" },
      passport_expiry: { type: "string", description: "Passport expiry date" },
      options: {
        type: "array",
        description: "Special options or requests",
        items: { type: "string" },
      },
    },
    required: ["name"],
  },
};

const paymentHistorySchema = {
  type: "array",
  description: "Payment history records",
  items: {
    type: "object",
    properties: {
      date: { type: "string", description: "Payment date e.g. '01/19/2026 02:33 PM'" },
      type: { type: "string", description: "Payment type e.g. 'Deposit', 'Balance'" },
      amount: { type: "string", description: "Amount with currency e.g. 'CA$350.00 CAD'" },
      method: { type: "string", description: "Payment method e.g. 'Credit Card *4003'" },
      status: { type: "string", description: "Status e.g. 'Processed', 'Pending'" },
    },
    required: ["date", "amount"],
  },
};

const cruiseFields = {
  agency: { type: "string", description: "Agency name" },
  booking_agent: { type: "string", description: "Booking agent name" },
  cabin_number: { type: "string", description: "Cabin number or GUAR" },
  cabin_category: { type: "string", description: "Cabin category e.g. 'Interior (IE)'" },
  deck: { type: "string", description: "Deck assignment" },
  bed_configuration: { type: "string", description: "Bed config e.g. QUEEN, TWIN" },
  rate_code: { type: "string", description: "Rate code description" },
  ship_name: { type: "string", description: "Ship name e.g. 'Sun Princess'" },
  cruise_line_booking_number: { type: "string", description: "Cruise line's own booking reference" },
  balance_due: { type: "number", description: "Outstanding balance amount" },
  balance_due_date: { type: "string", description: "Balance due date" },
  duration_nights: { type: "number", description: "Trip duration in nights" },
  booking_status: { type: "string", description: "Booking status e.g. Confirmed, Pending" },
};

/* ── Tool definitions ── */

const tools = [
  {
    type: "function",
    function: {
      name: "create_booking",
      description:
        "Create a new booking from extracted document data. Extract EVERY detail you can find including cruise itinerary, passenger details with passport info, payment history, cabin/deck info, agency details, and rate codes. IMPORTANT: Use this tool whenever the document contains a booking number that does NOT match any existing booking — even if the trip, ship, dates, or client are the same. Different booking numbers = different cabins/rooms.",
      parameters: {
        type: "object",
        properties: {
          client_name: { type: "string", description: "Full name of the client / traveller" },
          client_email: { type: "string", description: "Client email if found" },
          booking_number: { type: "string", description: "Booking confirmation / reference number" },
          trip_group_id: { type: "string", description: "Set this to link multiple cabins/rooms under one trip. Use the booking number of the FIRST cabin in the group. If this is a new cabin for the same trip (same ship, dates, client), set this to the existing cabin's booking number." },
          supplier: { type: "string", description: "Travel supplier or tour operator (e.g. Sunwing, Princess Cruises)" },
          resort_or_trip: { type: "string", description: "Resort name, hotel name, or trip description" },
          destination: { type: "string", description: "Destination city, region, or country" },
          room_type: { type: "string", description: "Room or cabin type" },
          num_travellers: { type: "number", description: "Number of travellers / guests" },
          flight_details: flightDetailsSchema,
          pricing: pricingSchema,
          extras: extrasSchema,
          itinerary: itinerarySchema,
          passengers: passengersSchema,
          payment_history: paymentHistorySchema,
          ...cruiseFields,
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
          trip_group_id: { type: "string", description: "Trip group ID to link cabins/rooms together" },
          client_name: { type: "string", description: "Client name for folder organization" },
          notes: { type: "string", description: "Any additional details extracted from the documents" },
          destination: { type: "string", description: "Destination if newly found" },
          room_type: { type: "string", description: "Room type if newly found" },
          num_travellers: { type: "number", description: "Number of travellers if newly found" },
          flight_details: flightDetailsSchema,
          pricing: pricingSchema,
          extras: extrasSchema,
          itinerary: itinerarySchema,
          passengers: passengersSchema,
          payment_history: paymentHistorySchema,
          ...cruiseFields,
        },
        required: ["booking_number", "client_name"],
        additionalProperties: false,
      },
    },
  },
];

/* ── System prompt ── */

const systemPrompt = `You are a travel agent's booking assistant. You analyze uploaded booking confirmation documents (screenshots, PDFs, photos) and extract structured booking data.

When the user asks to create a new booking, use the create_booking tool with ALL the details you can extract from the documents.
When the user asks to add files to an existing booking, use the add_to_booking tool with the matching booking number AND any new details found.

CRITICAL MULTI-CABIN / MULTI-ROOM RULE:
- The BOOKING NUMBER is the unique identifier. If the document contains a booking number that does NOT match any existing booking in the context, you MUST use create_booking — even if the trip name, ship, dates, destination, or client are identical.
- Different booking numbers = different cabins or rooms. NEVER merge data from one booking number into a different booking number's record.
- When creating a new cabin/room for the same trip, set trip_group_id to the booking number of the FIRST existing cabin in that group. This links them visually as one trip with multiple cabins.
- If this is the very first booking for a trip, you may leave trip_group_id empty.
- Only use add_to_booking when the document's booking number EXACTLY matches an existing booking number.

EXTRACT EVERYTHING YOU CAN FIND:
- Client name and email
- Booking/confirmation number
- Supplier / tour operator / cruise line
- Resort or hotel name, or cruise trip description (e.g. "7 Night Mediterranean")
- Destination (city, region, country)
- Room type or cabin category
- Number of travellers
- Flight itinerary: airline, flight numbers, departure/arrival airports and times (for both outbound and return)
- Pricing: total cost, deposit amount, taxes/fees, per-person cost, currency
- Extras: meal plan, transfers, insurance, special requests, excursions, upgrade details, loyalty program info
- All relevant dates: booking date, deposit due, final payment, trip start, trip end

CRUISE & DETAILED BOOKING FIELDS (extract when present):
- Agency name and booking agent name
- Ship name (e.g. "Sun Princess")
- Cabin number, cabin category (e.g. "Interior (IE)"), deck, bed configuration
- Rate code description
- Cruise line booking number (secondary reference)
- Booking status (e.g. "Confirmed")
- Duration in nights
- Balance due amount and due date
- Port-by-port itinerary with dates, port names, arrival/departure times (use "AT SEA" for sea days)
- Passenger details: full name with title, date of birth, age, gender, traveller type (Adult/Senior/Child), citizenship, passport number/country/expiry, and any special options/requests
- Payment history: date, type (Deposit/Balance), amount, payment method, status (Processed/Pending)

If the user mentions a client name, use that. If not, try to find it in the documents.
If you can match to an existing booking by number, prefer add_to_booking. But ONLY if the booking numbers match exactly.`;

/* ── Handler ── */

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
      const actions = choice.message.tool_calls.map((tc: any) => ({
        action: tc.function.name,
        data: JSON.parse(tc.function.arguments),
      }));

      // Return all tool calls as an actions array, plus backward-compat single action/data
      const first = actions[0];
      return new Response(
        JSON.stringify({
          action: first.action,
          data: first.data,
          actions,
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
