"use server"

import { revalidatePath } from "next/cache"
import { runEvolutionCycle } from "@/lib/engine"

export async function evolveOnce() {
  try {
    const { state, result } = await runEvolutionCycle()
    revalidatePath("/")
    return { ok: true as const, state, result }
  } catch (err) {
    console.error("[v0] evolveOnce failed:", err)
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Unknown error during evolution.",
    }
  }
}
