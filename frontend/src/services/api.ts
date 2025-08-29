import { 
  UsageRecord, 
  DailyUsageSummary, 
  UsageStats, 
  TeamConfig, 
  TeamProjection,
  EmissionFactor
} from '../types/usage'

const API_BASE = '/api'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new ApiError(response.status, errorData.error || `HTTP ${response.status}`)
  }

  return response.json()
}

export const api = {
  // Usage endpoints
  async getDailyUsage(days = 30): Promise<{ records: UsageRecord[]; period: { days: number; startDate: string }; count: number }> {
    return fetchApi(`/usage/daily?days=${days}`)
  },

  async getUsageSummary(days = 30): Promise<{ summaries: DailyUsageSummary[]; period: { days: number; startDate: string }; count: number }> {
    return fetchApi(`/usage/summary?days=${days}`)
  },

  async getUsageStats(): Promise<UsageStats> {
    return fetchApi('/usage/stats')
  },

  // Team endpoints
  async getTeamConfig(): Promise<TeamConfig> {
    return fetchApi('/team/config')
  },

  async updateTeamConfig(config: Partial<TeamConfig>): Promise<{ success: boolean; config: TeamConfig }> {
    return fetchApi('/team/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    })
  },

  async getTeamProjection(): Promise<TeamProjection> {
    return fetchApi('/team/projection')
  },

  // CO2 endpoints
  async getEmissionFactors(): Promise<EmissionFactor[]> {
    return fetchApi('/co2/factors')
  },

  async updateEmissionFactor(factor: Partial<EmissionFactor>): Promise<{ success: boolean; factor: EmissionFactor }> {
    return fetchApi('/co2/factors', {
      method: 'PUT',
      body: JSON.stringify(factor),
    })
  },

  // Data collection
  async triggerDataCollection(): Promise<{ success: boolean; message: string }> {
    return fetchApi('/data/collect', {
      method: 'POST',
    })
  },

  // Health check
  async getHealth(): Promise<{ status: string; timestamp: string; uptime: number }> {
    return fetchApi('/health')
  }
}

export { ApiError }