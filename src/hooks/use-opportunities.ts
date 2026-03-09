import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { opportunities as staticOpportunities } from "@/lib/opportunities";
import { Opportunity } from "@/lib/types";

/** Fetches opportunities from DB and merges with static seed data */
export function useOpportunities() {
  return useQuery({
    queryKey: ["opportunities"],
    queryFn: async (): Promise<Opportunity[]> => {
      // Fetch from database
      const { data, error } = await supabase
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
      }));

      // Merge: static + DB, deduplicate by title
      const seenTitles = new Set<string>();
      const merged: Opportunity[] = [];

      for (const opp of [...staticOpportunities, ...dbOpps]) {
        const key = opp.title.toLowerCase();
        if (!seenTitles.has(key)) {
          seenTitles.add(key);
          merged.push(opp);
        }
      }

      return merged;
    },
    staleTime: 5 * 60 * 1000,
  });
}
