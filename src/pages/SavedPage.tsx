import { useOpportunities } from "@/hooks/use-opportunities";
import { useSaved } from "@/hooks/use-saved";
import OpportunityCard from "@/components/OpportunityCard";
import { Bookmark, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

/** Saved Opportunities page */
export default function SavedPage() {
  const { savedIds } = useSaved();
  const { data: opportunities = [], isLoading } = useOpportunities();
  const saved = opportunities.filter((o) => savedIds.has(o.id));

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
          <Bookmark className="h-7 w-7 text-primary" />
          Saved Opportunities
        </h1>
        <p className="mt-2 text-muted-foreground">
          {saved.length} {saved.length === 1 ? "opportunity" : "opportunities"} saved
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card py-20 text-center">
          <Bookmark className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">No saved opportunities yet</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Browse opportunities and click the bookmark icon to save them.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Discover Opportunities
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((opp, i) => (
            <OpportunityCard key={opp.id} opportunity={opp} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
