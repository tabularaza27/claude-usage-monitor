import { z } from 'zod'

export const UsageRecordSchema = z.object({
  id: z.number().optional(),
  date: z.string(),
  model_name: z.string(),
  input_tokens: z.number().default(0),
  output_tokens: z.number().default(0),
  cache_create_tokens: z.number().default(0),
  cache_read_tokens: z.number().default(0),
  total_tokens: z.number(),
  cost_usd: z.number(),
  co2_emissions_grams: z.number(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

export const ClaudeMonitorRowSchema = z.object({
  date: z.string(),
  models: z.string(),
  input: z.number(),
  output: z.number(),
  cacheCreate: z.number(),
  cacheRead: z.number(),
  totalTokens: z.number(),
  costUsd: z.number()
})

export const DailyUsageSummarySchema = z.object({
  date: z.string(),
  total_tokens: z.number(),
  total_cost: z.number(),
  total_co2: z.number(),
  models: z.array(z.object({
    name: z.string(),
    tokens: z.number(),
    cost: z.number(),
    co2: z.number(),
    percentage: z.number()
  }))
})

export const UsageStatsSchema = z.object({
  today: z.object({
    tokens: z.number(),
    cost: z.number(),
    co2: z.number()
  }),
  yesterday: z.object({
    tokens: z.number(),
    cost: z.number(),
    co2: z.number()
  }),
  last30Days: z.object({
    avgTokens: z.number(),
    totalTokens: z.number(),
    totalCost: z.number(),
    totalCo2: z.number()
  }),
  yearlyProjection: z.object({
    tokens: z.number(),
    cost: z.number(),
    co2: z.number()
  })
})

export type UsageRecord = z.infer<typeof UsageRecordSchema>
export type ClaudeMonitorRow = z.infer<typeof ClaudeMonitorRowSchema>
export type DailyUsageSummary = z.infer<typeof DailyUsageSummarySchema>
export type UsageStats = z.infer<typeof UsageStatsSchema>