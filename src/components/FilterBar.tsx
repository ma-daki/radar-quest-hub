import { OpportunityCategory } from "@/lib/types";

const categories: OpportunityCategory[] = [
  "Scholarship",
  "Hackathon",
  "Internship",
  "Fellowship",
  "Bootcamp",
  "Competition",
];

interface Props {
  selected: Set<OpportunityCategory>;
  onToggle: (category: OpportunityCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/** Filter bar with category chips and search input */
export default function FilterBar({ selected, onToggle, searchQuery, onSearchChange }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
      {/* Search */}
      <input
        type="text"
        placeholder="Search opportunities..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-10 w-full rounded-lg border bg-card px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:max-w-xs"
      />

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const active = selected.has(cat);
          return (
            <button
              key={cat}
              onClick={() => onToggle(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                active
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
  );
}
