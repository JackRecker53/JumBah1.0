// Supabase Edge Function: verify-qr
// Validates a QR code of the format: quest:<slug>:<secret>
// If valid, upserts user_progress row.
//
// Deploy with:
//   supabase functions deploy verify-qr --no-verify-jwt
// Call from client with the user's access token in Authorization header
// or set to --no-verify-jwt for initial testing (less secure).

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { code, user_id } = await req.json()
    if (!code || typeof code !== 'string') {
      return new Response(JSON.stringify({ ok: false, error: "Missing QR code" }), { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 400 })
    }

    const parts = code.split(":")
    if (parts.length !== 3 || parts[0] !== "quest") {
      return new Response(JSON.stringify({ ok: false, error: "Invalid QR payload" }), { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 400 })
    }
    const slug = parts[1]
    const secret = parts[2]

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, serviceKey)

    // lookup quest by slug
    const { data: quest, error: qe } = await supabase
      .from("quests")
      .select("id, qr_secret")
      .eq("slug", slug)
      .single()

    if (qe || !quest) {
      return new Response(JSON.stringify({ ok: false, error: "Quest not found" }), { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 404 })
    }

    if (!quest.qr_secret || quest.qr_secret !== secret) {
      return new Response(JSON.stringify({ ok: false, error: "Secret mismatch" }), { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 403 })
    }

    if (!user_id) {
      // For guests, you could skip DB and just return ok. For logged-in users, pass auth.uid()
      return new Response(JSON.stringify({ ok: true, mode: "guest" }), { headers: { "Content-Type": "application/json", ...corsHeaders } })
    }

    // mark progress
    const { error: upErr } = await supabase
      .from("user_progress")
      .upsert({ user_id, quest_id: quest.id, status: "completed" }, { onConflict: "user_id,quest_id" })
    if (upErr) {
      return new Response(JSON.stringify({ ok: false, error: upErr.message }), { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 500 })
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", ...corsHeaders } })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || "Unknown error" }), { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 500 })
  }
})
