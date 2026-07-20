"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { evolveOnce } from "@/app/actions"
import type { EvolutionResult } from "@/lib/engine"

export function EvolveButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [last, setLast] = useState<EvolutionResult | null>(null)

  function handleEvolve() {
    setError(null)
    startTransition(async () => {
      const res = await evolveOnce()
      if (res.ok) {
        setLast(res.result)
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleEvolve}
        disabled={isPending}
        className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          className={`h-2 w-2 rounded-full bg-primary-foreground ${isPending ? "animate-pulse-ring" : ""}`}
          aria-hidden
        />
        {isPending ? "Evolving…" : "Trigger Evolution Cycle"}
      </button>

      {error && (
        <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          {`Evolution failed: ${error}`}
        </p>
      )}

      {last && !error && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 font-mono text-xs uppercase tracking-wider text-primary">Latest insight</p>
          <p className="text-sm leading-relaxed text-card-foreground">{last.insight}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{last.reflection}</p>
        </div>
      )}
    </div>
  )
}
