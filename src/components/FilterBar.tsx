import { OpportunityCategory, ScholarshipLevel, FundingType } from "@/lib/types";

const categories: OpportunityCategory[] = [
  "Scholarship",
  "University Scholarship",
  "Hackathon",
  "Internship",
  "Fellowship",
  "Bootcamp",
  "Competition",
];

const levels: ScholarshipLevel[] = ["Diploma", "Bachelor", "Master", "PhD"];
const fundingTypes: FundingType[] = ["Fully funded", "Partial"];

interface Props {
  selected: Set<OpportunityCategory>;
  onToggle: (category: OpportunityCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLevels: Set<ScholarshipLevel>;
  onToggleLevel: (level: ScholarshipLevel) => void;
  selectedFunding: FundingType | null;
  onFundingChange: (funding: FundingType | null) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  countries: string[];
}

/** Filter bar with category chips, level/funding/country filters, and search input */
export default function FilterBar({
  selected,
  onToggle,
  searchQuery,
  onSearchChange,
  selectedLevels,
  onToggleLevel,
  selectedFunding,
  onFundingChange,
  selectedCountry,
  onCountryChange,
  countries,
}: Props) {
  const showScholarshipFilters =
    selected.has("University Scholarship") || selected.has("Scholarship") || selected.size === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search opportunities..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 w-full rounded-lg border bg-card px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:max-w-xs"
        />

        {/* Country filter */}
        <select
          value={selectedCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          className="h-10 rounded-lg border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = selected.has(cat);
            return (
              <button
                key={cat}
                onClick={() => onToggle(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Level & Funding filters (visible when scholarship categories are active) */}
      {showScholarshipFilters && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Level:</span>
          {levels.map((lvl) => {
            const active = selectedLevels.has(lvl);
            return (
              <button
                key={lvl}
                onClick={() => onToggleLevel(lvl)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${active
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
              >
                {lvl}
              </button>
            );
          })}

          <span className="ml-2 text-xs font-medium text-muted-foreground">Funding:</span>
          {fundingTypes.map((ft) => {
            const active = selectedFunding === ft;
            return (
              <button
                key={ft}
                onClick={() => onFundingChange(active ? null : ft)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${active
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
              >
                {ft}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
