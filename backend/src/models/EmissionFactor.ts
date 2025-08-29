import { z } from 'zod'

export const EmissionFactorSchema = z.object({
  id: z.number().optional(),
  model_pattern: z.string(),
  emissions_per_1k_tokens: z.number().positive(),
  description: z.string().optional(),
  source: z.string().optional(),
  effective_from: z.string(),
  created_at: z.string().optional()
})

export const TeamConfigSchema = z.object({
  id: z.number().optional(),
  team_size: z.number().int().positive().default(1),
  usage_multiplier: z.number().positive().default(1.0),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

export const EnvironmentalContextSchema = z.object({
  co2_grams: z.number(),
  car_km_driven: z.number(),
  miles_driven: z.number(), // kept for backwards compatibility
  trees_needed: z.number(),
  kwh_electricity: z.number(),
  household_energy_days: z.number(),
  annual_person_equivalent: z.number()
})

export const TeamProjectionSchema = z.object({
  team_size: z.number(),
  daily: z.object({
    tokens: z.number(),
    cost: z.number(),
    co2: z.number()
  }),
  monthly: z.object({
    tokens: z.number(),
    cost: z.number(),
    co2: z.number()
  }),
  yearly: z.object({
    tokens: z.number(),
    cost: z.number(),
    co2: z.number()
  }),
  environmental_context: EnvironmentalContextSchema
})

export type EmissionFactor = z.infer<typeof EmissionFactorSchema>
export type TeamConfig = z.infer<typeof TeamConfigSchema>
export type EnvironmentalContext = z.infer<typeof EnvironmentalContextSchema>
export type TeamProjection = z.infer<typeof TeamProjectionSchema>