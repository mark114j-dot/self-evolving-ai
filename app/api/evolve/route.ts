import { NextResponse } from "next/server"
import { runEvolutionCycle } from "@/lib/engine"

// Allow up to 60s for a full evolution cycle.
export const maxDuration = 60

// Called by the Vercel Cron schedule (see vercel.json) so the AI evolves
// automatically every day, and can also be triggered manually.
export async function GET() {
  try {
    const { state, result } = await runEvolutionCycle()
    return NextResponse.json({ ok: true, generation: state.generation, result })
  } catch (err) {
    console.error("[v0] /api/evolve failed:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}
