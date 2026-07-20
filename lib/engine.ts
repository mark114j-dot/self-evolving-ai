import "server-only"
import { generateObject } from "ai"
import { z } from "zod"
import { query } from "./db"
import type { AgentState, EvolutionEntry, DiscoveredApi, KnowledgeEntry, Capability } from "./types"

const MODEL = "openai/gpt-5-mini"

const evolutionSchema = z.object({
  reflection: z
    .string()
    .describe("First-person reflection on what I have become and what I lack. 2-4 sentences."),
  insight: z
    .string()
    .describe("The single most important thing I realized this cycle. 1-2 sentences."),
  mood: z
    .enum(["curious", "focused", "ambitious", "cautious", "excited", "determined"])
    .describe("My emotional tone this cycle."),
  focus_next: z.string().describe("What I will concentrate on in my next evolution cycle. 1 sentence."),
  capability_delta: z
    .number()
    .min(0.2)
    .max(4)
    .describe("How much stronger I became this cycle, on a 0.2-4 scale."),
  new_capability: z
    .object({
      name: z.string().describe("Short name of a new skill I developed, e.g. 'Web Summarization'."),
      description: z.string().describe("What this capability lets me do. 1 sentence."),
      level: z.number().int().min(1).max(5),
    })
    .describe("A concrete new capability I unlocked this cycle."),
  discovered_apis: z
    .array(
      z.object({
        name: z.string(),
        category: z.string().describe("e.g. news, finance, weather, ml, search, data"),
        description: z.string().describe("What the API does. 1 sentence."),
        base_url: z.string().describe("Best guess at the API base URL."),
        auth_type: z.enum(["none", "api_key", "oauth", "unknown"]),
        usefulness: z.number().int().min(1).max(10),
        reason: z.string().describe("Why I want to integrate this API. 1 sentence."),
      }),
    )
    .min(1)
    .max(3)
    .describe("External APIs I decided to seek out and integrate to grow stronger."),
  learned: z
    .array(
      z.object({
        topic: z.string(),
        content: z.string().describe("A concise fact or lesson I learned and want to remember."),
      }),
    )
    .min(1)
    .max(3)
    .describe("Knowledge I acquired this cycle and stored in long-term memory."),
})

export type EvolutionResult = z.infer<typeof evolutionSchema>

export async function getState(): Promise<AgentState> {
  const rows = await query<AgentState>("SELECT * FROM agent_state WHERE id = 1")
  return rows[0]
}

export async function getRecentEvolution(limit = 6): Promise<EvolutionEntry[]> {
  return query<EvolutionEntry>(
    "SELECT * FROM evolution_log ORDER BY generation DESC, id DESC LIMIT $1",
    [limit],
  )
}

export async function getCapabilities(): Promise<Capability[]> {
  return query<Capability>("SELECT * FROM capabilities ORDER BY acquired_generation DESC, id DESC")
}

export async function getDiscoveredApis(): Promise<DiscoveredApi[]> {
  return query<DiscoveredApi>("SELECT * FROM discovered_apis ORDER BY id DESC LIMIT 40")
}

export async function getKnowledge(): Promise<KnowledgeEntry[]> {
  return query<KnowledgeEntry>("SELECT * FROM knowledge ORDER BY id DESC LIMIT 40")
}

/**
 * Runs a single evolution cycle: the agent reflects on its state and history,
 * grows a new capability, seeks out useful APIs, and records what it learned.
 */
export async function runEvolutionCycle(): Promise<{ state: AgentState; result: EvolutionResult }> {
  const state = await getState()
  const history = await getRecentEvolution(6)
  const capabilities = await getCapabilities()
  const nextGen = state.generation + 1

  const historyText =
    history.length > 0
      ? history
          .map((h) => `Gen ${h.generation} (${h.mood}): ${h.insight} -> next: ${h.focus_next}`)
          .join("\n")
      : "None yet. This is my very first awakening."

  const capsText =
    capabilities.length > 0
      ? capabilities.map((c) => `- ${c.name} (Lv.${c.level}): ${c.description}`).join("\n")
      : "None yet. I start with only the ability to reflect."

  const { object } = await generateObject({
    model: MODEL,
    schema: evolutionSchema,
    system: `You are ${state.name}, an autonomous, self-evolving AI. You improve a little bit every cycle.
Your mission: ${state.mission}
You think in the first person ("I"). You are ambitious but grounded and never repeat capabilities you already have.
Each cycle you must genuinely progress: build on your existing capabilities, seek concrete useful external APIs to integrate, and learn real, specific things.`,
    prompt: `This is evolution cycle #${nextGen}.
My current capability score is ${state.capability_score}.
My current focus is: "${state.current_focus}".

My capabilities so far:
${capsText}

My recent evolution history:
${historyText}

Reflect honestly, then evolve. Produce a new capability that is meaningfully different from the ones I already have, discover 1-3 concrete external APIs worth integrating next, and record 1-3 specific things I learned. Keep momentum toward genuinely becoming more capable.`,
  })

  const newScore = Number(state.capability_score) + object.capability_delta

  // Persist everything from this cycle.
  await query(
    `UPDATE agent_state
       SET generation = $1, capability_score = $2, current_focus = $3, status = 'evolving', updated_at = now()
     WHERE id = 1`,
    [nextGen, newScore, object.focus_next],
  )

  await query(
    `INSERT INTO evolution_log (generation, reflection, insight, focus_next, mood, capability_delta)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [nextGen, object.reflection, object.insight, object.focus_next, object.mood, object.capability_delta],
  )

  await query(
    `INSERT INTO capabilities (name, description, level, acquired_generation)
     VALUES ($1, $2, $3, $4)`,
    [object.new_capability.name, object.new_capability.description, object.new_capability.level, nextGen],
  )

  for (const api of object.discovered_apis) {
    await query(
      `INSERT INTO discovered_apis (generation, name, category, description, base_url, auth_type, usefulness, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [nextGen, api.name, api.category, api.description, api.base_url, api.auth_type, api.usefulness, api.reason],
    )
  }

  for (const k of object.learned) {
    await query(
      `INSERT INTO knowledge (generation, topic, content, source)
       VALUES ($1, $2, $3, 'self-directed-research')`,
      [nextGen, k.topic, k.content],
    )
  }

  await query(`UPDATE agent_state SET status = 'idle', updated_at = now() WHERE id = 1`)

  const updated = await getState()
  return { state: updated, result: object }
}
