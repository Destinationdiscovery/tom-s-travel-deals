import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require a shared secret header so this privileged endpoint cannot be
  // invoked by anonymous callers. Set SETUP_SECRET in project secrets.
  const expectedSecret = Deno.env.get("SETUP_SECRET");
  const providedSecret = req.headers.get("x-setup-secret");
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");

    if (!adminEmail || !adminPassword) {
      return new Response(
        JSON.stringify({ error: "ADMIN_EMAIL and ADMIN_PASSWORD secrets must be set" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const targetUserId = "6991cf75-b1d3-4cf0-873a-bca64f7bfaaa";

    // Try updating the existing user's password and email
    const { data: updated, error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });

    if (updateError) {
      // User might not exist, create fresh
      const { data: created, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
        });

      if (createError) {
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Grant admin role
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: created.user.id, role: "admin" },
        { onConflict: "user_id,role" }
      );

      return new Response(
        JSON.stringify({ ok: true, action: "created", userId: created.user.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, action: "updated", userId: targetUserId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
