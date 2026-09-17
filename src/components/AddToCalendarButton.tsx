import { CalendarPlus, Download, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buildGoogleCalendarUrl, downloadICS, type CalendarEvent } from "@/lib/calendar";
import { Opportunity } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  opportunity: Opportunity;
  /** Visual style: full button with label, or compact icon-only */
  variant?: "default" | "icon";
  className?: string;
  label?: string;
}

/** Builds a calendar event from an opportunity, preserving its real deadline semantics. */
function toCalendarEvent(opp: Opportunity): CalendarEvent {
  const isDeadlineStyle =
    opp.category === "Scholarship" ||
    opp.category === "University Scholarship" ||
    opp.category === "Fellowship" ||
    opp.category === "Internship";

  return {
    title: isDeadlineStyle
      ? `Application Deadline — ${opp.title}`
      : `Deadline — ${opp.title}`,
    deadline: opp.deadline,
    description: `Application deadline for ${opp.title}.`,
    organization: opp.organization,
    location: opp.location,
    url: opp.applyLink,
  };
}

/**
 * "Add to Calendar" control offering Google Calendar or a downloadable .ics file.
 * Works across iOS, Android, Windows, macOS via the standard .ics fallback.
 */
export default function AddToCalendarButton({ opportunity, variant = "default", className, label = "Add to Calendar" }: Props) {
  const event = toCalendarEvent(opportunity);

  const handleGoogle = () => {
    const url = buildGoogleCalendarUrl(event);
    if (!url) {
      toast("Deadline date unavailable", { description: "This opportunity has no usable date." });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleIcs = () => {
    const ok = downloadICS(event);
    toast(
      ok ? "Calendar file downloaded" : "Deadline date unavailable",
      ok ? { description: "Open it to add the deadline to your calendar." } : undefined
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${label}: ${opportunity.title}`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          variant === "icon" ? "p-2 text-muted-foreground" : "px-3 py-1.5 text-xs",
          className
        )}
        onClick={(e) => e.preventDefault()}
      >
        <CalendarPlus className={variant === "icon" ? "h-4 w-4" : "h-3.5 w-3.5"} />
        {variant === "default" && label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-popover">
        <DropdownMenuLabel>Add to Calendar</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleGoogle} className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleIcs} className="gap-2">
          <Download className="h-4 w-4" />
          Download calendar file
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
