import { databaseManager } from '../config/database.js'
import { logger } from '../utils/logger.js'
import { EmissionFactor, EnvironmentalContext } from '../models/EmissionFactor.js'

export class CO2Calculator {
  private factors: Map<string, EmissionFactor> = new Map()
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      await this.loadEmissionFactors()
      this.initialized = true
      logger.info('CO2Calculator initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize CO2Calculator:', error)
      throw error
    }
  }

  private async loadEmissionFactors(): Promise<void> {
    const factors = await databaseManager.all(`
      SELECT * FROM emission_factors 
      ORDER BY effective_from DESC
    `) as EmissionFactor[]
    
    this.factors.clear()
    factors.forEach(factor => {
      this.factors.set(factor.model_pattern, factor)
    })

    logger.info(`Loaded ${factors.length} emission factors`)
  }

  calculateEmissions(modelName: string, tokens: number): number {
    if (!this.initialized) {
      throw new Error('CO2Calculator not initialized. Call initialize() first.')
    }

    // Research-based calculation from CO2_calc_assumptions.md
    // energy_per_token_kwh = 0.000002 kWh
    // pue = 1.4 (data center overhead)  
    // emission_factor = 0.6 kg CO₂ per kWh
    // co2_g_per_token = 0.000002 * 1.4 * 0.6 * 1000 = 0.00168g per token
    const CO2_GRAMS_PER_TOKEN = 0.00168
    const emissions = tokens * CO2_GRAMS_PER_TOKEN
    
    logger.debug('CO2 calculation:', {
      model: modelName,
      tokens,
      factor: CO2_GRAMS_PER_TOKEN,
      emissions
    })

    return emissions
  }

  private getFactorForModel(modelName: string): EmissionFactor {
    // Try exact matches first
    if (this.factors.has(modelName)) {
      return this.factors.get(modelName)!
    }

    // Try pattern matching
    for (const [pattern, factor] of this.factors) {
      if (this.matchesPattern(modelName, pattern)) {
        return factor
      }
    }

    // Fallback to default
    const defaultFactor = this.factors.get('*')
    if (!defaultFactor) {
      logger.warn('No default emission factor found, using hardcoded fallback')
      return {
        model_pattern: '*',
        emissions_per_1k_tokens: 3.0,
        description: 'Hardcoded fallback factor',
        source: 'System default',
        effective_from: '2024-01-01'
      }
    }

    logger.debug(`Using default emission factor for model: ${modelName}`)
    return defaultFactor
  }

  private matchesPattern(modelName: string, pattern: string): boolean {
    if (pattern === '*') return true
    
    // Convert simple patterns to regex
    // claude-sonnet* -> /^claude-sonnet/
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
    
    try {
      const regex = new RegExp(`^${regexPattern}`, 'i')
      return regex.test(modelName)
    } catch (error) {
      logger.warn(`Invalid pattern: ${pattern}`, error)
      return false
    }
  }

  // Environmental context conversions based on research
  // Updated to use factors from CO2_calc_assumptions.md
  convertToEnvironmentalContext(co2Grams: number): EnvironmentalContext {
    return {
      co2_grams: co2Grams,
      car_km_driven: this.convertToCarKm(co2Grams),
      miles_driven: this.convertToMilesDriven(co2Grams), // kept for backwards compatibility
      trees_needed: this.convertToTreesNeeded(co2Grams),
      kwh_electricity: this.convertToKwhElectricity(co2Grams),
      household_energy_days: this.convertToHouseholdEnergyDays(co2Grams),
      annual_person_equivalent: this.convertToAnnualPersonEquivalent(co2Grams)
    }
  }

  private convertToCarKm(co2Grams: number): number {
    // From CO2_calc_assumptions.md: 0.25 kg CO₂/km (average gasoline car)
    return co2Grams / 250 // 0.25 kg = 250g
  }

  private convertToMilesDriven(co2Grams: number): number {
    // Convert km to miles for backwards compatibility: 1 mile = 1.609 km
    const carKm = this.convertToCarKm(co2Grams)
    return carKm / 1.609
  }

  private convertToTreesNeeded(co2Grams: number): number {
    // From CO2_calc_assumptions.md: 22 kg CO₂/year absorbed per tree
    return co2Grams / 22000 // 22 kg = 22000g
  }

  private convertToKwhElectricity(co2Grams: number): number {
    // From CO2_calc_assumptions.md: 0.43 kg CO₂/kWh (U.S. grid avg)
    return co2Grams / 430 // 0.43 kg = 430g
  }

  private convertToHouseholdEnergyDays(co2Grams: number): number {
    // Average household: ~28 kWh per day (keeping existing assumption)
    // Using new grid factor: 28 kWh * 0.43 kg CO2/kWh = 12.04 kg CO2 per day
    return co2Grams / 12040 // 12.04 kg = 12040g
  }

  private convertToAnnualPersonEquivalent(co2Grams: number): number {
    // From CO2_calc_assumptions.md: 4700 kg CO₂/year (global per capita avg)
    return co2Grams / 4700000 // 4700 kg = 4700000g
  }

  // Update emission factors (for admin use)
  async updateEmissionFactor(factor: Omit<EmissionFactor, 'id' | 'created_at'>): Promise<void> {
    await databaseManager.run(`
      INSERT OR REPLACE INTO emission_factors 
      (model_pattern, emissions_per_1k_tokens, description, source, effective_from)
      VALUES (?, ?, ?, ?, ?)
    `, [
      factor.model_pattern,
      factor.emissions_per_1k_tokens,
      factor.description,
      factor.source,
      factor.effective_from
    ])

    logger.info(`Updated emission factor for pattern: ${factor.model_pattern}`)
    
    // Reload factors
    await this.loadEmissionFactors()
  }

  async getEmissionFactors(): Promise<EmissionFactor[]> {
    return await databaseManager.all(`
      SELECT * FROM emission_factors 
      ORDER BY model_pattern
    `) as EmissionFactor[]
  }

  // Batch calculation for multiple records
  async calculateBatchEmissions(records: Array<{ modelName: string; tokens: number }>): Promise<number[]> {
    return records.map(({ modelName, tokens }) => 
      this.calculateEmissions(modelName, tokens)
    )
  }

  // Get emission factor for specific model (for debugging/info)
  getModelEmissionFactor(modelName: string): EmissionFactor {
    return this.getFactorForModel(modelName)
  }
}