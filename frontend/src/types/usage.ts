export interface UsageRecord {
  id?: number
  date: string
  model_name: string
  input_tokens: number
  output_tokens: number
  cache_create_tokens: number
  cache_read_tokens: number
  total_tokens: number
  cost_usd: number
  co2_emissions_grams: number
  created_at?: string
  updated_at?: string
}

export interface DailyUsageSummary {
  date: string
  total_tokens: number
  total_cost: number
  total_co2: number
  models: Array<{
    name: string
    tokens: number
    cost: number
    co2: number
    percentage: number
  }>
}

export interface UsageStats {
  today: {
    tokens: number
    cost: number
    co2: number
  }
  yesterday: {
    tokens: number
    cost: number
    co2: number
  }
  last30Days: {
    avgTokens: number
    totalTokens: number
    totalCost: number
    totalCo2: number
  }
  yearlyProjection: {
    tokens: number
    cost: number
    co2: number
  }
}

export interface TeamConfig {
  id?: number
  team_size: number
  usage_multiplier: number
  created_at?: string
  updated_at?: string
}

export interface EnvironmentalContext {
  co2_grams: number
  miles_driven: number
  trees_needed: number
  kwh_electricity: number
  household_energy_days: number
}

export interface TeamProjection {
  team_size: number
  daily: {
    tokens: number
    cost: number
    co2: number
  }
  monthly: {
    tokens: number
    cost: number
    co2: number
  }
  yearly: {
    tokens: number
    cost: number
    co2: number
  }
  environmental_context: EnvironmentalContext
}

export interface EmissionFactor {
  id?: number
  model_pattern: string
  emissions_per_1k_tokens: number
  description?: string
  source?: string
  effective_from: string
  created_at?: string
}