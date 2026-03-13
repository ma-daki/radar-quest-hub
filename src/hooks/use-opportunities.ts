import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { opportunities as staticOpportunities } from "@/lib/opportunities";
import { Opportunity } from "@/lib/types";

const CACHE_KEY = "opp-radar-cache";

function getCachedOpportunities(): Opportunity[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    // Accept cache up to 1 hour old
    if (Date.now() - ts > 3600_000) return null;
    return data as Opportunity[];
  } catch {
    return null;
  }
}

function setCachedOpportunities(data: Opportunity[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

/** Fetches opportunities from DB and merges with static seed data (stale-while-revalidate) */
export function useOpportunities() {
  const cached = getCachedOpportunities();

  return useQuery({
    queryKey: ["opportunities"],
    queryFn: async (): Promise<Opportunity[]> => {
      const { data } = await supabase
        .from("opportunities" as any)
        .select("*")
        .gte("deadline", new Date().toISOString().split("T")[0])
        .order("deadline", { ascending: true });

      const dbOpps: Opportunity[] = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        deadline: row.deadline,
        location: row.location,
        description: row.description,
        applyLink: row.apply_link,
        organization: row.organization,
        eligibility: row.eligibility,
        amount: row.amount,
        level: row.level || undefined,
        funding: row.funding || undefined,
      }));

      const seenTitles = new Set<string>();
      const merged: Opportunity[] = [];

      for (const opp of [...staticOpportunities, ...dbOpps]) {
        const key = opp.title.toLowerCase();
        if (!seenTitles.has(key)) {
          seenTitles.add(key);
          merged.push(opp);
        }
      }

      setCachedOpportunities(merged);
      return merged;
    },
    staleTime: 5 * 60 * 1000,
    // Use cached data as placeholder so we paint immediately
    ...(cached ? { placeholderData: cached } : {}),
  });
}
