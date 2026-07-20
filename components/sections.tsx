import type { EvolutionEntry, DiscoveredApi, KnowledgeEntry, Capability } from "@/lib/types"

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function SectionCard({
  title,
  count,
  children,
}: {
  title: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
        {count !== undefined && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  )
}

export function EvolutionTimeline({ entries }: { entries: EvolutionEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No evolution cycles yet. Trigger the first one.</p>
  }
  return (
    <ol className="flex flex-col gap-4">
      {entries.map((e) => (
        <li key={e.id} className="relative border-l border-border pl-4">
          <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-primary">GEN {e.generation}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              {e.mood}
            </span>
            <span className="text-[10px] text-muted-foreground">+{Number(e.capability_delta).toFixed(1)}</span>
            <span className="ml-auto text-[10px] text-muted-foreground">{timeAgo(e.created_at)}</span>
          </div>
          <p className="mt-1 text-sm font-medium text-card-foreground">{e.insight}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{e.reflection}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            <span className="text-primary">Next:</span> {e.focus_next}
          </p>
        </li>
      ))}
    </ol>
  )
}

export function CapabilitiesList({ items }: { items: Capability[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No capabilities acquired yet.</p>
  }
  return (
    <ul className="flex flex-col gap-3">
      {items.map((c) => (
        <li key={c.id} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-card-foreground">{c.name}</span>
            <span className="font-mono text-xs text-primary">Lv.{c.level}</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{c.description}</p>
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(c.level / 5) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ApisList({ items }: { items: DiscoveredApi[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No APIs discovered yet.</p>
  }
  return (
    <ul className="flex flex-col gap-3">
      {items.map((a) => (
        <li key={a.id} className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-card-foreground">{a.name}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              {a.category}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground">
            <span className="rounded bg-muted px-1.5 py-0.5">auth: {a.auth_type}</span>
            <span className="rounded bg-muted px-1.5 py-0.5">use: {a.usefulness}/10</span>
            {a.base_url && <span className="truncate rounded bg-muted px-1.5 py-0.5">{a.base_url}</span>}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            <span className="text-primary">Why:</span> {a.reason}
          </p>
        </li>
      ))}
    </ul>
  )
}

export function KnowledgeList({ items }: { items: KnowledgeEntry[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No knowledge stored yet.</p>
  }
  return (
    <ul className="flex flex-col gap-3">
      {items.map((k) => (
        <li key={k.id} className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-primary">GEN {k.generation}</span>
            <span className="text-sm font-medium text-card-foreground">{k.topic}</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{k.content}</p>
        </li>
      ))}
    </ul>
  )
}
