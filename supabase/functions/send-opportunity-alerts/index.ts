import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  ...securityHeaders,
};

// --- Rate Limiting (in-memory, per-isolate) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count++;
  return { allowed: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit check
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || "unknown";
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ success: false, error: "Too many requests" }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: subscribers, error: subError } = await supabase
      .from("email_subscribers")
      .select("email");

    if (subError || !subscribers?.length) {
      return new Response(
        JSON.stringify({ success: true, message: "No subscribers to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { data: urgentOpps } = await supabase
      .from("opportunities")
      .select("*")
      .gte("deadline", now.toISOString().split("T")[0])
      .lte("deadline", sevenDaysFromNow.toISOString().split("T")[0])
      .order("deadline", { ascending: true })
      .limit(10);

    const { data: newOpps } = await supabase
      .from("opportunities")
      .select("*")
      .gte("created_at", oneDayAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(10);

    const allOpps = [...(newOpps || []), ...(urgentOpps || [])];
    const uniqueOpps = Array.from(new Map(allOpps.map((o) => [o.id, o])).values());

    if (uniqueOpps.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No opportunities to notify about" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const opportunityList = uniqueOpps
      .map(
        (opp) =>
          `📌 ${opp.title}\n   Category: ${opp.category}\n   Deadline: ${opp.deadline}\n   Organization: ${opp.organization}\n   Apply: ${opp.apply_link}\n`
      )
      .join("\n");

    const emailSubject = `🚀 Opportunity Radar Alert — ${uniqueOpps.length} opportunities for you!`;
    const emailBody = `Hi there!\n\nHere are the latest opportunities on your radar:\n\n${opportunityList}\n\nDon't miss out — apply before the deadlines!\n\n— Opportunity Radar`;

    console.log(`Alert prepared for ${subscribers.length} subscribers:`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Opportunities: ${uniqueOpps.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        subscribers: subscribers.length,
        opportunities: uniqueOpps.length,
        subject: emailSubject,
        preview: emailBody.slice(0, 200) + "...",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Alert error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
