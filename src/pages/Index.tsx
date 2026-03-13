import { useState, useMemo, useEffect } from "react";
import { OpportunityCategory, ScholarshipLevel, FundingType } from "@/lib/types";
import { useOpportunities } from "@/hooks/use-opportunities";
import OpportunityCard from "@/components/OpportunityCard";
import OpportunityCardSkeleton from "@/components/OpportunityCardSkeleton";
import FilterBar from "@/components/FilterBar";
import EmailSubscribe from "@/components/EmailSubscribe";
import { Radar, GraduationCap } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const PAGE_SIZE = 15;

const HERO_IMAGES = [
  "/hero-images/student1.jpg",
  "/hero-images/student2.jpg",
  "/hero-images/student3.jpg",
  "/hero-images/student4.jpg",
];

/** Home/Feed page — discover opportunities */
export default function Index() {
  const [selectedCategories, setSelectedCategories] = useState<Set<OpportunityCategory>>(new Set());
  const [selectedLevels, setSelectedLevels] = useState<Set<ScholarshipLevel>>(new Set());
  const [selectedFunding, setSelectedFunding] = useState<FundingType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const { data: opportunities = [], isLoading } = useOpportunities();

  // Preload hero images
  useEffect(() => {
    HERO_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Rotate every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImg((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Unique sorted country list from dataset
  const countries = useMemo(() => {
    const set = new Set<string>();
    opportunities.forEach((o) => { if (o.country) set.add(o.country); });
    return Array.from(set).sort();
  }, [opportunities]);

  const handleToggle = (category: OpportunityCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
    setCurrentPage(1);
  };

  const handleToggleLevel = (level: ScholarshipLevel) => {
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
    setCurrentPage(1);
  };

  const handleFundingChange = (funding: FundingType | null) => {
    setSelectedFunding(funding);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
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
        const matchesLevel =
          selectedLevels.size === 0 || (opp.level && selectedLevels.has(opp.level));
        const matchesFunding =
          !selectedFunding || opp.funding === selectedFunding;
        const matchesCountry =
          !selectedCountry || opp.country === selectedCountry;
        return matchesCategory && matchesSearch && matchesLevel && matchesFunding && matchesCountry;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [selectedCategories, selectedLevels, selectedFunding, searchQuery, selectedCountry, opportunities]);

  // Study Abroad highlights
  const studyAbroadOpps = useMemo(() => {
    return opportunities
      .filter((o) => o.category === "University Scholarship" && o.funding === "Fully funded")
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 4);
  }, [opportunities]);

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
      <section className="relative overflow-hidden px-4 py-16 text-center sm:py-24">
        {HERO_IMAGES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
            style={{
              opacity: i === activeImg ? 1 : 0,
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              animation: i === activeImg ? "kenburns 7s ease-in-out forwards" : "none",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-black/60" />

        <div className="container relative z-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <Radar className="h-4 w-4" />
            Discover your next opportunity
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Opportunity Radar
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Scholarships, hackathons, internships, fellowships, and more — curated for young people ages 13–30.
          </p>

          <div className="mx-auto mt-8 max-w-md">
            <EmailSubscribe />
          </div>
        </div>
      </section>

      {/* Study Abroad Highlights */}
      {studyAbroadOpps.length > 0 && (
        <section className="container py-8">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5 text-accent" />
            <h2 className="font-display text-xl font-bold">Study Abroad Opportunities</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Top fully funded university scholarships from around the world
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {studyAbroadOpps.map((opp, i) => (
              <OpportunityCard key={opp.id} opportunity={opp} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Feed section */}
      <section className="container py-8">
        <FilterBar
          selected={selectedCategories}
          onToggle={handleToggle}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedLevels={selectedLevels}
          onToggleLevel={handleToggleLevel}
          selectedFunding={selectedFunding}
          onFundingChange={handleFundingChange}
          selectedCountry={selectedCountry}
          onCountryChange={handleCountryChange}
          countries={countries}
        />

        <p className="mt-6 mb-4 text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "opportunity" : "opportunities"} found`}
        </p>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <OpportunityCardSkeleton key={i} />
            ))}
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
