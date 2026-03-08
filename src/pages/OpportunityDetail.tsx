import { useParams, Link } from "react-router-dom";
import { opportunities } from "@/lib/opportunities";
import { useSaved } from "@/hooks/use-saved";
import { generateICSFile } from "@/lib/calendar";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CalendarPlus,
  Clock,
  ExternalLink,
  MapPin,
  Users,
} from "lucide-react";

/** Opportunity detail page with full info */
export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { isSaved, toggleSave } = useSaved();
  const opp = opportunities.find((o) => o.id === id);

  if (!opp) {
    return (
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg text-muted-foreground">Opportunity not found.</p>
        <Link to="/" className="mt-4 text-primary hover:underline">
          ← Back to feed
        </Link>
      </div>
    );
  }

  const saved = isSaved(opp.id);
  const daysLeft = Math.ceil(
    (new Date(opp.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="container max-w-3xl py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      <article className="rounded-lg border bg-card p-6 card-shadow sm:p-8">
        {/* Category + actions */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {opp.category}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toggleSave(opp.id);
                toast(saved ? "Removed" : "Saved!");
              }}
              className="rounded-md border p-2 transition-colors hover:bg-secondary"
            >
              {saved ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={() => {
                generateICSFile(opp.title, opp.deadline);
                toast("Calendar event downloaded!");
              }}
              className="rounded-md border p-2 transition-colors hover:bg-secondary"
            >
              <CalendarPlus className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold sm:text-3xl">{opp.title}</h1>
        <p className="mt-1 text-muted-foreground">{opp.organization}</p>

        {/* Meta */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-md bg-secondary p-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Deadline</p>
              <p className="text-sm font-medium">
                {new Date(opp.deadline).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                <span className={`ml-1 text-xs ${daysLeft <= 7 ? "text-destructive" : "text-muted-foreground"}`}>
                  ({daysLeft > 0 ? `${daysLeft}d left` : "Passed"})
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-secondary p-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm font-medium">{opp.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-secondary p-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Eligibility</p>
              <p className="text-sm font-medium">{opp.eligibility}</p>
            </div>
          </div>
        </div>

        {opp.amount && (
          <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-muted-foreground">Award / Cost</p>
            <p className="text-lg font-semibold text-primary">{opp.amount}</p>
          </div>
        )}

        {/* Description */}
        <div className="mt-6">
          <h2 className="font-display text-lg font-semibold mb-2">About this opportunity</h2>
          <p className="text-foreground/80 leading-relaxed">{opp.description}</p>
        </div>

        {/* Apply CTA */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={opp.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Apply Now <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={() => {
              generateICSFile(opp.title, opp.deadline);
              toast("Calendar event downloaded!");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <CalendarPlus className="h-4 w-4" />
            Add Deadline to Calendar
          </button>
        </div>
      </article>
    </div>
  );
}
