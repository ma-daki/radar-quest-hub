/** Skeleton placeholder matching OpportunityCard dimensions to eliminate CLS */
export default function OpportunityCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border bg-card p-5 animate-pulse" style={{ minHeight: 260 }}>
      {/* Category badge row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-full bg-muted" />
          <div className="h-5 w-14 rounded-full bg-muted" />
        </div>
        <div className="h-7 w-7 rounded-md bg-muted" />
      </div>

      {/* Title */}
      <div className="h-5 w-3/4 rounded bg-muted mb-2" />
      {/* Organization */}
      <div className="h-4 w-1/2 rounded bg-muted mb-3" />

      {/* Description lines */}
      <div className="space-y-2 mb-4">
        <div className="h-3.5 w-full rounded bg-muted" />
        <div className="h-3.5 w-5/6 rounded bg-muted" />
      </div>

      {/* Meta row */}
      <div className="flex gap-3 mb-4">
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2">
        <div className="h-7 w-28 rounded-md bg-muted" />
        <div className="ml-auto h-4 w-14 rounded bg-muted" />
      </div>
    </div>
  );
}
