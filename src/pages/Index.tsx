import { useState, useMemo } from "react";
import { OpportunityCategory } from "@/lib/types";
import { useOpportunities } from "@/hooks/use-opportunities";
import OpportunityCard from "@/components/OpportunityCard";
import FilterBar from "@/components/FilterBar";
import EmailSubscribe from "@/components/EmailSubscribe";
import { Radar, Loader2 } from "lucide-react";

/** Home/Feed page — discover opportunities */
export default function Index() {
  const [selectedCategories, setSelectedCategories] = useState<Set<OpportunityCategory>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const { data: opportunities = [], isLoading } = useOpportunities();

  const handleToggle = (category: OpportunityCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return opportunities
      .filter((opp) => {
        const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(opp.category);
        const matchesSearch =
          searchQuery === "" ||
          opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opp.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [selectedCategories, searchQuery, opportunities]);

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="hero-gradient px-4 py-16 text-center sm:py-24">
        <div className="container max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Radar className="h-4 w-4" />
            Discover your next opportunity
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            Opportunity Radar
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/70">
            Scholarships, hackathons, internships, fellowships, and more — curated for young people ages 13–30.
          </p>

          {/* Email subscription */}
          <div className="mx-auto mt-8 max-w-md">
            <EmailSubscribe />
          </div>
        </div>
      </section>

      {/* Feed section */}
      <section className="container py-8">
        <FilterBar
          selected={selectedCategories}
          onToggle={handleToggle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <p className="mt-6 mb-4 text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "opportunity" : "opportunities"} found`}
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card py-16">
            <p className="text-muted-foreground">No opportunities match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((opp, i) => (
              <OpportunityCard key={opp.id} opportunity={opp} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
