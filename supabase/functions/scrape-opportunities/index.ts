import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Curated list of opportunity sources to search
const SEARCH_QUERIES = [
  "scholarship for students 2026 apply deadline",
  "hackathon 2026 registration open",
  "internship program students 2026 remote",
  "fellowship young people 2026 application",
  "coding bootcamp free 2026",
  "tech competition students 2026 prizes",
];

// Keywords for category detection
function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("scholarship") || lower.includes("tuition") || lower.includes("financial aid"))
    return "Scholarship";
  if (lower.includes("hackathon") || lower.includes("hack"))
    return "Hackathon";
  if (lower.includes("internship") || lower.includes("intern"))
    return "Internship";
  if (lower.includes("fellowship") || lower.includes("fellow"))
    return "Fellowship";
  if (lower.includes("bootcamp") || lower.includes("boot camp") || lower.includes("coding program"))
    return "Bootcamp";
  if (lower.includes("competition") || lower.includes("challenge") || lower.includes("contest"))
    return "Competition";
  return "Scholarship"; // default
}

// Validate opportunity data
function isValid(opp: { title: string; deadline: string; apply_link: string }): boolean {
  // Title must contain relevant keywords
  const keywords = ["hackathon", "scholarship", "internship", "fellowship", "bootcamp", "competition", "program", "challenge", "grant"];
  const hasKeyword = keywords.some((kw) => opp.title.toLowerCase().includes(kw));
  if (!hasKeyword) return false;

  // Deadline must be in the future
  const deadline = new Date(opp.deadline);
  if (isNaN(deadline.getTime()) || deadline < new Date()) return false;

  // Must have a link
  if (!opp.apply_link || !opp.apply_link.startsWith("http")) return false;

  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Use Lovable AI to search and extract opportunities
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "AI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allOpportunities: any[] = [];

    // Use AI to generate structured opportunity data from search queries
    for (const query of SEARCH_QUERIES) {
      try {
        const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are an opportunity finder. Given a search query, return a JSON array of 2-3 real, currently active opportunities. Each object must have: title (string), category (one of: Scholarship, Hackathon, Internship, Fellowship, Bootcamp, Competition), deadline (YYYY-MM-DD, must be in 2026 or later), location (string), description (1-2 sentences), apply_link (real URL), organization (string), eligibility (string), amount (string or null). Only return the JSON array, nothing else.`,
              },
              { role: "user", content: query },
            ],
            temperature: 0.3,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          // Extract JSON array from response
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

    // Validate and deduplicate
    const validOpps = allOpportunities
      .filter((opp) => isValid(opp))
      .map((opp) => ({
        title: opp.title,
        category: detectCategory(opp.title + " " + opp.description),
        deadline: opp.deadline,
        location: opp.location || "Remote",
        description: opp.description || "",
        apply_link: opp.apply_link,
        organization: opp.organization || "",
        eligibility: opp.eligibility || "",
        amount: opp.amount || null,
        source: "ai-scraper",
      }));

    // Upsert (ignore duplicates via unique constraint on title+deadline)
    let inserted = 0;
    for (const opp of validOpps) {
      const { error } = await supabase.from("opportunities").upsert(opp, {
        onConflict: "title,deadline",
        ignoreDuplicates: true,
      });
      if (!error) inserted++;
    }

    // After inserting, send email notifications for new opportunities
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
      JSON.stringify({
        success: true,
        found: allOpportunities.length,
        valid: validOpps.length,
        inserted,
      }),
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
