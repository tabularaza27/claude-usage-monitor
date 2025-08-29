import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

export function useUsageStats() {
  return useQuery({
    queryKey: ['usage', 'stats'],
    queryFn: api.getUsageStats,
    refetchInterval: 30000, // 30 seconds
  })
}

export function useUsageSummary(days = 30) {
  return useQuery({
    queryKey: ['usage', 'summary', days],
    queryFn: () => api.getUsageSummary(days),
    refetchInterval: 60000, // 1 minute
  })
}

export function useDailyUsage(days = 30) {
  return useQuery({
    queryKey: ['usage', 'daily', days],
    queryFn: () => api.getDailyUsage(days),
    refetchInterval: 60000, // 1 minute
  })
}

export function useTeamConfig() {
  return useQuery({
    queryKey: ['team', 'config'],
    queryFn: api.getTeamConfig,
    refetchInterval: false, // Only refetch when needed
  })
}

export function useTeamProjection() {
  return useQuery({
    queryKey: ['team', 'projection'],
    queryFn: api.getTeamProjection,
    refetchInterval: 60000, // 1 minute
  })
}

export function useEmissionFactors() {
  return useQuery({
    queryKey: ['co2', 'factors'],
    queryFn: api.getEmissionFactors,
    refetchInterval: false, // Only refetch when updated
  })
}