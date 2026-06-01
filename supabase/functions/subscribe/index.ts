import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, source_slug, interests } = await req.json();

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const normalizedEmail = email.trim().toLowerCase();

    const { error } = await supabase.from("subscribers").upsert(
      {
        email: normalizedEmail,
        source_slug: source_slug || null,
        interests: interests && Array.isArray(interests) ? interests : [],
      },
      { onConflict: "email" }
    );

    if (error) throw error;

    // Sync to MailerLite (fire-and-forget)
    const ML_TOKEN = Deno.env.get("MAILERLITE_API_TOKEN");
    const ML_GROUP = Deno.env.get("MAILERLITE_GROUP_ID");
    if (ML_TOKEN && ML_GROUP) {
      fetch("https://connect.mailerlite.com/api/subscribers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ML_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          groups: [ML_GROUP],
          status: "active",
          fields: {
            source: source_slug || "Homepage",
          },
        }),
      }).catch((e) => console.error("MailerLite sync failed:", e));
    }

    // Notify admin of new subscriber (fire-and-forget)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const interestsList = interests && Array.isArray(interests) && interests.length
        ? interests.join(", ")
        : "None selected";
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: ["tlaracy@travelonly.com"],
          subject: `📬 New Subscriber: ${normalizedEmail}`,
          html: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:500px;margin:0 auto;padding:30px 20px;">
              <h2 style="color:#1a1a2e;margin-bottom:16px;">New Newsletter Signup 🎉</h2>
              <p><strong>Email:</strong> ${normalizedEmail}</p>
              <p><strong>Interests:</strong> ${interestsList}</p>
              <p><strong>Source:</strong> ${source_slug || "Homepage"}</p>
              <p style="color:#aaa;font-size:12px;margin-top:20px;">Sent by ReviewThenGo</p>
            </div>`,
        }),
      }).catch(() => {});
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
