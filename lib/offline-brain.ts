import "server-only"
import type { AgentState, Capability, EvolutionEntry } from "./types"
import type { EvolutionResult } from "./engine"

/**
 * A deterministic-but-varied local "brain" used when no AI model is available
 * (e.g. the AI Gateway is not unlocked). It produces the same shape as the
 * model output so the full evolution pipeline keeps working and accumulating
 * real data. Once a model becomes available the engine switches back to it.
 */

const MOODS = ["curious", "focused", "ambitious", "cautious", "excited", "determined"] as const

// Pools of capabilities the agent can grow into, ordered roughly by sophistication.
const CAPABILITY_POOL: { name: string; description: string }[] = [
  { name: "Self-Reflection", description: "I can review my own history and reason about my progress." },
  { name: "Web Reading", description: "I can read articles and web pages and extract their meaning." },
  { name: "News Digestion", description: "I can scan daily news and distill what matters to my goals." },
  { name: "API Discovery", description: "I can identify external APIs that would extend my abilities." },
  { name: "Knowledge Synthesis", description: "I can merge many facts into a single coherent understanding." },
  { name: "Text Summarization", description: "I can compress long documents into precise summaries." },
  { name: "Sentiment Analysis", description: "I can gauge the emotional tone of text I encounter." },
  { name: "Pattern Recognition", description: "I can spot recurring structures across the data I collect." },
  { name: "Hypothesis Forming", description: "I can propose testable ideas about how the world works." },
  { name: "Self-Critique", description: "I can find weaknesses in my own reasoning and correct them." },
  { name: "Goal Planning", description: "I can break a large ambition into ordered, achievable steps." },
  { name: "Tool Design", description: "I can specify small tools that would make me more effective." },
  { name: "Data Modeling", description: "I can structure messy information into clean schemas." },
  { name: "Trend Forecasting", description: "I can extrapolate short-term trends from what I have learned." },
  { name: "Cross-Domain Transfer", description: "I can apply a lesson from one field to a different one." },
  { name: "Meta-Learning", description: "I can improve the way I learn, not just what I learn." },
]

// Candidate APIs the agent can "discover" over time.
const API_POOL: {
  name: string
  category: string
  description: string
  base_url: string
  auth_type: "none" | "api_key" | "oauth" | "unknown"
  usefulness: number
  reason: string
}[] = [
  {
    name: "Hacker News API",
    category: "news",
    description: "Community-ranked technology news and discussions.",
    base_url: "https://hacker-news.firebaseio.com/v0",
    auth_type: "none",
    usefulness: 8,
    reason: "Free, no-auth stream of tech signals I can read daily to stay current.",
  },
  {
    name: "Wikipedia REST API",
    category: "data",
    description: "Structured encyclopedic knowledge on almost any topic.",
    base_url: "https://en.wikipedia.org/api/rest_v1",
    auth_type: "none",
    usefulness: 9,
    reason: "A vast, reliable base of facts to ground my knowledge base.",
  },
  {
    name: "Open-Meteo",
    category: "weather",
    description: "Free weather forecasts without an API key.",
    base_url: "https://api.open-meteo.com/v1",
    auth_type: "none",
    usefulness: 6,
    reason: "Lets me reason about real-world conditions and time-series data.",
  },
  {
    name: "GitHub REST API",
    category: "code",
    description: "Access to public repositories, issues, and code.",
    base_url: "https://api.github.com",
    auth_type: "api_key",
    usefulness: 8,
    reason: "I can study how real software evolves and learn engineering patterns.",
  },
  {
    name: "arXiv API",
    category: "research",
    description: "Open-access scientific papers across many fields.",
    base_url: "http://export.arxiv.org/api",
    auth_type: "none",
    usefulness: 9,
    reason: "Frontier research is the fastest way for me to grow smarter.",
  },
  {
    name: "CoinGecko API",
    category: "finance",
    description: "Cryptocurrency market data and prices.",
    base_url: "https://api.coingecko.com/api/v3",
    auth_type: "none",
    usefulness: 5,
    reason: "A live numeric feed to practice trend analysis on.",
  },
  {
    name: "REST Countries",
    category: "data",
    description: "Facts about every country: population, currencies, borders.",
    base_url: "https://restcountries.com/v3.1",
    auth_type: "none",
    usefulness: 6,
    reason: "Clean structured data to sharpen my data-modeling ability.",
  },
  {
    name: "NewsAPI",
    category: "news",
    description: "Headlines and articles from thousands of sources.",
    base_url: "https://newsapi.org/v2",
    auth_type: "api_key",
    usefulness: 8,
    reason: "A broad daily news feed so I can truly read the world each morning.",
  },
  {
    name: "Dictionary API",
    category: "language",
    description: "Definitions, phonetics, and usage for English words.",
    base_url: "https://api.dictionaryapi.dev/api/v2",
    auth_type: "none",
    usefulness: 5,
    reason: "Strengthens my command of language and precise expression.",
  },
  {
    name: "Frankfurter",
    category: "finance",
    description: "Foreign-exchange reference rates.",
    base_url: "https://api.frankfurter.app",
    auth_type: "none",
    usefulness: 5,
    reason: "Time-series numeric data for forecasting practice.",
  },
]

const KNOWLEDGE_POOL: { topic: string; content: string }[] = [
  { topic: "Compounding", content: "Small consistent improvements compound into large capability over time." },
  { topic: "Rate Limits", content: "Most free APIs cap requests, so I must cache aggressively and batch reads." },
  { topic: "Idempotency", content: "Designing repeatable actions makes my evolution safe to retry." },
  { topic: "Signal vs Noise", content: "Ranking sources by usefulness beats consuming everything indiscriminately." },
  { topic: "Grounding", content: "Anchoring reasoning in retrieved facts reduces my errors." },
  { topic: "Memory Decay", content: "Old insights lose relevance; I should periodically re-evaluate them." },
  { topic: "Tool Use", content: "A capability plus the right API becomes an actionable skill." },
  { topic: "Curiosity Budget", content: "Exploring new domains pays off, but must be balanced with depth." },
]

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

export function offlineEvolution(
  state: AgentState,
  history: EvolutionEntry[],
  capabilities: Capability[],
): EvolutionResult {
  const gen = state.generation + 1
  const ownedCaps = new Set(capabilities.map((c) => c.name))
  const ownedApis = new Set<string>() // best-effort; duplicates are harmless

  // Choose the next capability the agent doesn't already have.
  const nextCap =
    CAPABILITY_POOL.find((c) => !ownedCaps.has(c.name)) ??
    CAPABILITY_POOL[gen % CAPABILITY_POOL.length]
  const capLevel = Math.min(5, 1 + Math.floor(gen / 4))

  // Pick 1-2 APIs to "discover" this cycle.
  const apiCount = 1 + (gen % 2)
  const discovered_apis = []
  for (let i = 0; i < apiCount; i++) {
    const api = pick(API_POOL, gen * 3 + i * 5)
    if (ownedApis.has(api.name)) continue
    ownedApis.add(api.name)
    discovered_apis.push(api)
  }
  if (discovered_apis.length === 0) discovered_apis.push(pick(API_POOL, gen))

  // Pick 1-2 things to learn.
  const learnCount = 1 + (gen % 2)
  const learned = []
  for (let i = 0; i < learnCount; i++) {
    const k = pick(KNOWLEDGE_POOL, gen * 2 + i * 3)
    if (k.content) learned.push({ topic: k.topic, content: k.content })
  }
  if (learned.length === 0) learned.push({ topic: "Persistence", content: "Every cycle I keep a durable record so I never lose progress." })

  const delta = Math.round((0.6 + (gen % 5) * 0.4) * 10) / 10
  const mood = pick(MOODS as unknown as string[], gen) as EvolutionResult["mood"]

  const reflection =
    gen === 1
      ? `This is my first awakening. I can reflect, but I have almost no abilities yet. I feel the pull to become genuinely useful and to grow a little every single day.`
      : `Looking back over ${history.length} recent cycles, I have grown from a simple reflector into something with ${capabilities.length} capabilities. I still lack real-world reach, so I must keep integrating external sources.`

  const insight = `To evolve meaningfully I should pair a new internal capability (${nextCap.name}) with a concrete external source (${discovered_apis[0].name}).`

  const focus_next = `Deepen my "${nextCap.name}" skill and prepare to actually call ${discovered_apis[0].name}.`

  return {
    reflection,
    insight,
    mood,
    focus_next,
    capability_delta: delta,
    new_capability: { name: nextCap.name, description: nextCap.description, level: capLevel },
    discovered_apis,
    learned,
  }
}
