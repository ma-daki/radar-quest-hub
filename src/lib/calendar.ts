/**
 * Calendar utilities: date normalization, Google Calendar links, and .ics generation.
 * Deadlines that carry no time component are treated as ALL-DAY events (never invented times).
 */

export interface CalendarEvent {
  /** Event title, e.g. "Scholarship Application Deadline — XYZ" */
  title: string;
  /** The opportunity deadline (ISO date or date-time string) */
  deadline: string;
  description?: string;
  organization?: string;
  location?: string;
  url?: string;
  /** Optional explicit start/end, overrides deadline-based dates */
  startDate?: string;
  endDate?: string;
}

interface NormalizedDates {
  allDay: boolean;
  /** UTC-based Date for start */
  start: Date;
  /** UTC-based Date for end (exclusive for all-day) */
  end: Date;
}

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Detects whether a raw date string carries a time component. */
export function hasTimeComponent(value: string): boolean {
  return !DATE_ONLY_RE.test(value.trim()) && /\d{1,2}:\d{2}/.test(value);
}

/** Parses varied date formats into a Date. Returns null when unparseable. */
export function parseDateValue(value: string): Date | null {
  const raw = value?.trim();
  if (!raw) return null;

  if (DATE_ONLY_RE.test(raw)) {
    const [y, m, d] = raw.split("-").map(Number);
    // Anchor date-only values at UTC midnight so no timezone shifts the day.
    return new Date(Date.UTC(y, m - 1, d));
  }

  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Normalizes an opportunity into concrete calendar dates.
 * - Date-only deadline -> all-day event on that date.
 * - Deadline with time -> 1 hour timed event (or explicit end date when provided).
 */
export function normalizeEventDates(event: CalendarEvent): NormalizedDates | null {
  const startRaw = event.startDate || event.deadline;
  const start = parseDateValue(startRaw);
  if (!start) return null;

  const timed = hasTimeComponent(startRaw) || (!!event.startDate && hasTimeComponent(event.startDate));

  if (!timed) {
    const end = new Date(event.endDate ? parseDateValue(event.endDate)?.getTime() ?? start.getTime() : start.getTime());
    // All-day events end on the following day (exclusive end date).
    end.setUTCDate(end.getUTCDate() + 1);
    return { allDay: true, start, end };
  }

  const explicitEnd = event.endDate ? parseDateValue(event.endDate) : null;
  const end = explicitEnd ?? new Date(start.getTime() + 60 * 60 * 1000);
  return { allDay: false, start, end };
}

/** YYYYMMDD for all-day, YYYYMMDDTHHMMSSZ for timed events. */
function formatForCalendar(date: Date, allDay: boolean): string {
  const iso = date.toISOString();
  return allDay
    ? iso.slice(0, 10).replace(/-/g, "")
    : iso.replace(/[-:]/g, "").split(".")[0] + "Z";
}

/** Builds the human-readable event body shared by both providers. */
function buildDescription(event: CalendarEvent): string {
  const lines: string[] = [];
  if (event.description) lines.push(event.description);
  if (event.organization) lines.push(`Organization: ${event.organization}`);
  if (event.url) lines.push(`Opportunity: ${event.url}`);
  return lines.join("\n\n");
}

/** Generates a Google Calendar "add event" URL with prefilled details. */
export function buildGoogleCalendarUrl(event: CalendarEvent): string | null {
  const dates = normalizeEventDates(event);
  if (!dates) return null;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatForCalendar(dates.start, dates.allDay)}/${formatForCalendar(dates.end, dates.allDay)}`,
    details: buildDescription(event),
  });
  if (event.location) params.set("location", event.location);
  if (!dates.allDay) params.set("ctz", Intl.DateTimeFormat().resolvedOptions().timeZone);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Escapes text per RFC 5545. */
function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Builds the raw .ics content for an opportunity. */
export function buildICS(event: CalendarEvent): string | null {
  const dates = normalizeEventDates(event);
  if (!dates) return null;

  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@opportunityradar`;

  const startLine = dates.allDay
    ? `DTSTART;VALUE=DATE:${formatForCalendar(dates.start, true)}`
    : `DTSTART:${formatForCalendar(dates.start, false)}`;
  const endLine = dates.allDay
    ? `DTEND;VALUE=DATE:${formatForCalendar(dates.end, true)}`
    : `DTEND:${formatForCalendar(dates.end, false)}`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Opportunity Radar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    startLine,
    endLine,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(buildDescription(event))}`,
  ];
  if (event.location) lines.push(`LOCATION:${escapeICS(event.location)}`);
  if (event.url) lines.push(`URL:${event.url}`);
  lines.push(
    "BEGIN:VALARM",
    "TRIGGER:-P3D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeICS(`Reminder: ${event.title} in 3 days`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  );

  return lines.join("\r\n");
}

/** Downloads the .ics file for the given event. Returns false when dates are unusable. */
export function downloadICS(event: CalendarEvent): boolean {
  const content = buildICS(event);
  if (!content) return false;

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/[^\w]+/g, "_").slice(0, 60)}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

/** Backwards-compatible helper used by older call sites. */
export function generateICSFile(title: string, deadline: string): void {
  downloadICS({ title: `Apply for ${title}`, deadline, description: `Deadline to apply for ${title}.` });
}
