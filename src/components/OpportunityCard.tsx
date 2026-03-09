import { Opportunity, OpportunityCategory } from "@/lib/types";
import { Bookmark, BookmarkCheck, CalendarPlus, MapPin, ArrowRight, GraduationCap } from "lucide-react";
import { useSaved } from "@/hooks/use-saved";
import { generateICSFile } from "@/lib/calendar";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import UrgencyBadge from "./UrgencyBadge";

/** Category color mapping using design tokens */
const categoryStyles: Record<OpportunityCategory, string> = {
  Scholarship: "bg-primary/10 text-primary",
  "University Scholarship": "bg-accent/10 text-accent",
  Hackathon: "bg-accent/10 text-accent",
  Internship: "bg-success/10 text-success",
  Fellowship: "bg-warning/10 text-warning",
  Bootcamp: "bg-destructive/10 text-destructive",
  Competition: "bg-ring/10 text-ring",
};

interface Props {
  opportunity: Opportunity;
  index?: number;
}

/** Individual opportunity card with save and calendar actions */
export default function OpportunityCard({ opportunity, index = 0 }: Props) {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved(opportunity.id);

  const daysLeft = Math.ceil(
    (new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleSave(opportunity.id);
    toast(saved ? "Removed from saved" : "Saved!", {
      description: opportunity.title,
    });
  };

  const handleCalendar = (e: React.MouseEvent) => {
    e.preventDefault();
    generateICSFile(opportunity.title, opportunity.deadline);
    toast("Calendar event downloaded!", {
      description: `Reminder set for 3 days before deadline`,
    });
  };

  const isUniScholarship = opportunity.category === "University Scholarship";

  return (
    <div
      className="group relative flex flex-col rounded-lg border bg-card p-5 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-0.5 animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top: category badge + save button */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryStyles[opportunity.category]}`}>
            {isUniScholarship && <GraduationCap className="h-3 w-3" />}
            {opportunity.category}
          </span>
          {opportunity.level && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {opportunity.level}
            </span>
          )}
          {opportunity.funding && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              opportunity.funding === "Fully funded"
                ? "bg-success/10 text-success"
                : "bg-warning/10 text-warning"
            }`}>
              {opportunity.funding}
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          className="shrink-0 rounded-md p-1.5 transition-colors hover:bg-secondary"
          aria-label={saved ? "Unsave" : "Save"}
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Title + org */}
      <h3 className="font-display text-lg font-semibold leading-tight mb-1">
        {opportunity.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">{opportunity.organization}</p>

      {/* Description */}
      <p className="text-sm text-foreground/80 leading-relaxed mb-4 line-clamp-2">
        {opportunity.description}
      </p>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {opportunity.location}
        </span>
        <UrgencyBadge deadline={opportunity.deadline} />
        {opportunity.amount && (
          <span className="font-medium text-primary">{opportunity.amount}</span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2">
        <button
          onClick={handleCalendar}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          Add to Calendar
        </button>
        <Link
          to={`/opportunity/${opportunity.id}`}
          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline"
        >
          Details <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
