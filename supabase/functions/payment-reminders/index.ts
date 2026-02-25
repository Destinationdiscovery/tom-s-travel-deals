import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "tlaracy@travelonly.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const today = new Date();
    const fourDaysOut = new Date(today);
    fourDaysOut.setDate(today.getDate() + 4);

    const fmt = (d: Date) => d.toISOString().split("T")[0];
    const todayStr = fmt(today);
    const fourDaysStr = fmt(fourDaysOut);

    const { data: reminders, error } = await supabase
      .from("bookings")
      .select("*")
      .in("event_type", ["deposit_due", "final_payment"])
      .or(`event_date.eq.${todayStr},event_date.eq.${fourDaysStr}`)
      .eq("is_completed", false);

    if (error) throw error;

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ message: "No reminders to send" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = reminders.map((r) => {
      const eventDate = new Date(r.event_date);
      const diffDays = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const urgency = diffDays <= 0 ? "🔴 DUE TODAY" : `⏳ Due in ${diffDays} days`;
      const typeLabel = r.event_type === "deposit_due" ? "Deposit Due" : "Final Payment";

      return `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;">${r.client_name}</td>
          <td style="padding:12px;border-bottom:1px solid #eee;">${r.booking_number || "—"}</td>
          <td style="padding:12px;border-bottom:1px solid #eee;">${r.supplier || "—"}</td>
          <td style="padding:12px;border-bottom:1px solid #eee;font-weight:600;">${typeLabel}</td>
          <td style="padding:12px;border-bottom:1px solid #eee;">${r.event_date}</td>
          <td style="padding:12px;border-bottom:1px solid #eee;font-weight:700;">${urgency}</td>
        </tr>`;
    }).join("");

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:700px;margin:0 auto;padding:30px 20px;">
        <h1 style="color:#1a1a2e;font-size:22px;margin-bottom:4px;">💰 Payment Reminder Digest</h1>
        <p style="color:#888;font-size:14px;margin-bottom:20px;">${todayStr}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#f8f9fa;">
              <th style="padding:10px 12px;text-align:left;">Client</th>
              <th style="padding:10px 12px;text-align:left;">Booking #</th>
              <th style="padding:10px 12px;text-align:left;">Supplier</th>
              <th style="padding:10px 12px;text-align:left;">Type</th>
              <th style="padding:10px 12px;text-align:left;">Due Date</th>
              <th style="padding:10px 12px;text-align:left;">Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="color:#aaa;font-size:12px;margin-top:24px;">Sent automatically by ReviewThenGo CRM</p>
      </div>`;

    const dueCount = reminders.filter((r) => r.event_date === todayStr).length;
    const upcomingCount = reminders.length - dueCount;
    const subject = `Payment Reminders: ${dueCount ? `${dueCount} due today` : ""}${dueCount && upcomingCount ? ", " : ""}${upcomingCount ? `${upcomingCount} upcoming` : ""}`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [ADMIN_EMAIL],
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", data);
      throw new Error(data.message || "Failed to send reminder email");
    }

    return new Response(JSON.stringify({ success: true, reminders_sent: reminders.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Payment reminders error:", err);
    return new Response(JSON.stringify({ error: err.message || "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
