import { useState, useMemo } from "react";
import { OpportunityCategory } from "@/lib/types";
import { useOpportunities } from "@/hooks/use-opportunities";
import OpportunityCard from "@/components/OpportunityCard";
import FilterBar from "@/components/FilterBar";
import EmailSubscribe from "@/components/EmailSubscribe";
import { Radar, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const PAGE_SIZE = 12;

/** Home/Feed page — discover opportunities */
export default function Index() {
  const [selectedCategories, setSelectedCategories] = useState<Set<OpportunityCategory>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data: opportunities = [], isLoading } = useOpportunities();

  const handleToggle = (category: OpportunityCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

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
          onSearchChange={handleSearchChange}
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
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedItems.map((opp, i) => (
                <OpportunityCard key={opp.id} opportunity={opp} index={(currentPage - 1) * PAGE_SIZE + i} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, idx) =>
                    page === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </section>
    </div>
  );
}
