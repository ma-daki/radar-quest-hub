/** Urgency indicator based on days until deadline */
export default function UrgencyBadge({ deadline }: { deadline: string }) {
  const daysLeft = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft <= 0) {
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">⚫ Expired</span>;
  }
  if (daysLeft <= 3) {
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">🔴 {daysLeft}d left</span>;
  }
  if (daysLeft <= 7) {
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning">🟡 {daysLeft}d left</span>;
  }
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-success">🟢 {daysLeft}d left</span>;
}
