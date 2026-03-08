/**
 * Generates an .ics calendar file for an opportunity deadline.
 * Compatible with Google Calendar, Outlook, and Apple Calendar.
 */
export function generateICSFile(title: string, deadline: string): void {
  const eventDate = new Date(deadline);
  // Reminder: 3 days before deadline
  const reminderDate = new Date(eventDate);
  reminderDate.setDate(reminderDate.getDate() - 3);

  const formatDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Opportunity Radar//EN",
    "BEGIN:VEVENT",
    `DTSTART:${formatDate(eventDate)}`,
    `DTEND:${formatDate(eventDate)}`,
    `SUMMARY:Apply for ${title}`,
    `DESCRIPTION:Deadline to apply for ${title}. Don't miss this opportunity!`,
    // VALARM for 3-day reminder
    "BEGIN:VALARM",
    "TRIGGER:-P3D",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: ${title} deadline in 3 days!`,
    "END:VALARM",
    `UID:${Date.now()}@opportunityradar`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  // Create and download the .ics file
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/\s+/g, "_")}_deadline.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
