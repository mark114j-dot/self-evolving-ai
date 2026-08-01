import { getState, getRecentEvolution, getCapabilities, getDiscoveredApis, getKnowledge } from "@/lib/engine"
import { EvolveButton } from "@/components/evolve-button"
import {
  SectionCard,
  EvolutionTimeline,
  CapabilitiesList,
  ApisList,
  KnowledgeList,
} from "@/components/sections"

export const dynamic = "force-dynamic"

export default async function Page() {
  const [state, evolution, capabilities, apis, knowledge] = await Promise.all([
    getState(),
    getRecentEvolution(8),
    getCapabilities(),
    getDiscoveredApis(),
    getKnowledge(),
  ])

  const score = Number(state.capability_score)

  const stats = [
    { label: "Generation", value: state.generation },
    { label: "Capability Score", value: score.toFixed(1) },
    { label: "Capabilities", value: capabilities.length },
    { label: "APIs Sought", value: apis.length },
  ]

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
      {/* Header */}
      <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {state.status === "evolving" ? "evolving" : "online"}
          </span>
        </div>
        <div>
          <h1 className="text-pretty text-3xl font-bold tracking-tight md:text-4xl">
            {state.name}
            <span className="ml-2 font-mono text-base font-normal text-primary">
              gen {state.generation}
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
            {state.mission}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-primary">Current focus</p>
          <p className="mt-1 text-sm leading-relaxed text-card-foreground">{state.current_focus}</p>
        </div>
        <EvolveButton />
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-card-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Evolution Timeline" count={evolution.length}>
            <EvolutionTimeline entries={evolution} />
          </SectionCard>
        </div>
        <div className="flex flex-col gap-6">
          <SectionCard title="Capabilities" count={capabilities.length}>
            <CapabilitiesList items={capabilities} />
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Discovered APIs" count={apis.length}>
          <ApisList items={apis} />
        </SectionCard>
        <SectionCard title="Knowledge Base" count={knowledge.length}>
          <KnowledgeList items={knowledge} />
        </SectionCard>
      </div>

      <footer className="pb-4 pt-2 text-center font-mono text-xs text-muted-foreground">
        {"Nyx evolves automatically every day at 08:00 UTC, or on demand."}
      </footer>
    </main>
  )
}
