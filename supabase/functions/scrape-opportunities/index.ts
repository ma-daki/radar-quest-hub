import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

// --- Zod-like validation (no import needed) ---
function validateOpportunity(opp: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (typeof opp.title !== "string" || opp.title.trim().length < 3) errors.push("title must be at least 3 chars");
  if (typeof opp.title === "string" && opp.title.length > 300) errors.push("title too long");
  if (typeof opp.deadline !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(opp.deadline)) errors.push("deadline must be YYYY-MM-DD");
  if (opp.deadline && new Date(opp.deadline) < new Date()) errors.push("deadline must be in the future");
  if (typeof opp.apply_link !== "string" || !opp.apply_link.startsWith("https://")) errors.push("apply_link must be a valid https URL");
  if (typeof opp.description === "string" && opp.description.length > 2000) errors.push("description too long");
  return { valid: errors.length === 0, errors };
}

function stripHtml(str: string): string {
  return typeof str === "string" ? str.replace(/<[^>]*>/g, "").trim() : "";
}

function sanitizeOpp(opp: any) {
  return {
    ...opp,
    title: stripHtml(opp.title || ""),
    description: stripHtml(opp.description || ""),
    organization: stripHtml(opp.organization || ""),
    eligibility: stripHtml(opp.eligibility || ""),
  };
}

// --- Search queries ---
const SEARCH_QUERIES = [
  "scholarship for students 2026 apply deadline",
  "hackathon 2026 registration open",
  "internship program students 2026 remote",
  "fellowship young people 2026 application",
  "coding bootcamp free 2026",
  "tech competition students 2026 prizes",
  "DAAD scholarship 2026 application deadline",
  "Chevening scholarship 2026 apply",
  "Erasmus Mundus joint master 2026 scholarship",
  "Fulbright scholarship 2026 graduate",
  "Commonwealth scholarship 2026 developing countries",
  "fully funded PhD scholarship 2026 international students",
  "fully funded master scholarship Europe 2026",
  "university scholarship bachelor 2026 international",
  "government scholarship study abroad 2026",
];

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (
    (lower.includes("university") || lower.includes("master") || lower.includes("phd") ||
     lower.includes("bachelor") || lower.includes("diploma") || lower.includes("postgraduate") ||
     lower.includes("undergraduate") || lower.includes("tuition") || lower.includes("study abroad")) &&
    (lower.includes("scholarship") || lower.includes("funded") || lower.includes("grant") || lower.includes("bursary"))
  ) return "University Scholarship";
  if (lower.includes("scholarship") || lower.includes("financial aid")) return "Scholarship";
  if (lower.includes("hackathon") || lower.includes("hack")) return "Hackathon";
  if (lower.includes("internship") || lower.includes("intern")) return "Internship";
  if (lower.includes("fellowship") || lower.includes("fellow")) return "Fellowship";
  if (lower.includes("bootcamp") || lower.includes("boot camp") || lower.includes("coding program")) return "Bootcamp";
  if (lower.includes("competition") || lower.includes("challenge") || lower.includes("contest")) return "Competition";
  return "Scholarship";
}

function detectLevel(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("phd") || lower.includes("doctorate")) return "PhD";
  if (lower.includes("master") || lower.includes("postgraduate") || lower.includes("msc") || lower.includes("mba")) return "Master";
  if (lower.includes("bachelor") || lower.includes("undergraduate") || lower.includes("bsc")) return "Bachelor";
  if (lower.includes("diploma") || lower.includes("certificate program")) return "Diploma";
  return null;
}

function detectFunding(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("fully funded") || lower.includes("full scholarship") || lower.includes("full tuition")) return "Fully funded";
  if (lower.includes("partial") || lower.includes("merit-based") || lower.includes("need-based")) return "Partial";
  return null;
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
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "AI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allOpportunities: any[] = [];

    for (const query of SEARCH_QUERIES) {
      try {
        const isUniQuery = query.includes("scholarship") && (
          query.includes("DAAD") || query.includes("Chevening") || query.includes("Erasmus") ||
          query.includes("Fulbright") || query.includes("Commonwealth") || query.includes("PhD") ||
          query.includes("master") || query.includes("bachelor") || query.includes("university") ||
          query.includes("study abroad") || query.includes("government scholarship")
        );

        const systemPrompt = isUniQuery
          ? `You are a university scholarship finder. Given a search query, return a JSON array of 2-3 real, currently active university scholarships. Each object must have: title (string), category ("University Scholarship"), deadline (YYYY-MM-DD, must be in 2026 or later), location (country name), description (1-2 sentences), apply_link (real official URL), organization (university or sponsoring body name), eligibility (string), amount (string or null), level (one of: "Diploma", "Bachelor", "Master", "PhD"), funding (one of: "Fully funded", "Partial"). Only return the JSON array, nothing else.`
          : `You are an opportunity finder. Given a search query, return a JSON array of 2-3 real, currently active opportunities. Each object must have: title (string), category (one of: Scholarship, Hackathon, Internship, Fellowship, Bootcamp, Competition), deadline (YYYY-MM-DD, must be in 2026 or later), location (string), description (1-2 sentences), apply_link (real URL), organization (string), eligibility (string), amount (string or null). Only return the JSON array, nothing else.`;

        const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: query },
            ],
            temperature: 0.3,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            allOpportunities.push(...parsed);
          }
        }
      } catch (e) {
        console.error(`Error processing query "${query}":`, e);
      }
    }

    // Sanitize, validate, and deduplicate
    const validOpps = allOpportunities
      .map(sanitizeOpp)
      .filter((opp) => {
        const { valid, errors } = validateOpportunity(opp);
        if (!valid) console.warn("Invalid opportunity skipped:", opp.title, errors);
        return valid;
      })
      .map((opp) => {
        const combinedText = `${opp.title} ${opp.description} ${opp.eligibility || ""}`;
        const category = opp.category === "University Scholarship" ? "University Scholarship" : detectCategory(combinedText);
        return {
          title: opp.title,
          category,
          deadline: opp.deadline,
          location: opp.location || "Remote",
          description: opp.description || "",
          apply_link: opp.apply_link,
          organization: opp.organization || "",
          eligibility: opp.eligibility || "",
          amount: opp.amount || null,
          source: "ai-scraper",
          level: opp.level || detectLevel(combinedText),
          funding: opp.funding || detectFunding(combinedText),
        };
      });

    let inserted = 0;
    for (const opp of validOpps) {
      const { error } = await supabase.from("opportunities").upsert(opp, {
        onConflict: "title,deadline",
        ignoreDuplicates: true,
      });
      if (!error) inserted++;
    }

    // Trigger email alerts
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-opportunity-alerts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count: inserted }),
      });
    } catch (e) {
      console.error("Failed to trigger email alerts:", e);
    }

    return new Response(
      JSON.stringify({ success: true, found: allOpportunities.length, valid: validOpps.length, inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scraper error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
