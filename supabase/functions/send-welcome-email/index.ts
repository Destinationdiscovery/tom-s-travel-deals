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
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not set");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1a1a2e; font-size: 28px; margin-bottom: 8px;">
          Welcome to <span style="color: #0ea5e9;">Review</span><span style="color: #f59e0b;">Then</span><span style="color: #22c55e;">Go</span>! 🌍
        </h1>
        <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Thanks for subscribing! Every week, you'll get:
        </p>
        <ul style="color: #555; font-size: 15px; line-height: 1.8; padding-left: 20px; margin-bottom: 24px;">
          <li>🏖️ Honest destination reviews from real trips</li>
          <li>💰 Exclusive travel deals we've personally vetted</li>
          <li>🎒 Tested gear recommendations</li>
          <li>📝 Tips and insights from a working travel consultant</li>
        </ul>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
          In the meantime, check out our latest reviews at <a href="https://reviewthengo.lovable.app/destinations" style="color: #0ea5e9;">reviewthengo.com/destinations</a>.
        </p>
        <p style="color: #888; font-size: 13px;">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Welcome to ReviewThenGo! 🌍",
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Welcome email error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
