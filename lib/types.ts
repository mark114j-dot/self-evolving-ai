export type AgentState = {
  id: number
  name: string
  generation: number
  capability_score: number
  current_focus: string
  mission: string
  status: string
  created_at: string
  updated_at: string
}

export type EvolutionEntry = {
  id: number
  generation: number
  reflection: string
  insight: string
  focus_next: string
  mood: string
  capability_delta: number
  created_at: string
}

export type DiscoveredApi = {
  id: number
  generation: number
  name: string
  category: string
  description: string
  base_url: string | null
  auth_type: string
  usefulness: number
  reason: string
  status: string
  created_at: string
}

export type KnowledgeEntry = {
  id: number
  generation: number
  topic: string
  content: string
  source: string
  created_at: string
}

export type Capability = {
  id: number
  name: string
  description: string
  level: number
  acquired_generation: number
  created_at: string
}
