import cron from 'node-cron'
import { ClaudeMonitorParser } from './claudeMonitorParser.js'
import { CO2Calculator } from './co2Calculator.js'
import { WebSocketService } from './websocketService.js'
import { databaseManager } from '../config/database.js'
import { logger } from '../utils/logger.js'
import { config } from '../config/environment.js'
import { UsageRecord } from '../models/Usage.js'

export class DataCollector {
  private parser: ClaudeMonitorParser
  private co2Calculator: CO2Calculator
  private cronJob: cron.ScheduledTask | null = null
  private isRunning = false

  constructor(private wsService: WebSocketService) {
    this.parser = new ClaudeMonitorParser()
    this.co2Calculator = new CO2Calculator()
  }

  async start(): Promise<void> {
    try {
      // Initialize CO2 calculator
      await this.co2Calculator.initialize()

      // Run initial data collection
      await this.collectData()

      // Schedule regular data collection (every 5 minutes)
      this.cronJob = cron.schedule('*/5 * * * *', async () => {
        if (this.isRunning) {
          logger.debug('Data collection already in progress, skipping')
          return
        }
        
        await this.collectData()
      })

      logger.info('Data collector started - collecting every 5 minutes')
    } catch (error) {
      logger.error('Failed to start data collector:', error)
      throw error
    }
  }

  async collectData(): Promise<void> {
    if (this.isRunning) {
      logger.debug('Data collection already in progress')
      return
    }

    this.isRunning = true
    
    try {
      logger.info('Starting data collection cycle')
      
      // Parse claude-monitor output
      const rows = await this.parser.parseDaily()
      
      if (rows.length === 0) {
        logger.info('No new data from claude-monitor')
        return
      }

      // Process and store the data
      const processedRecords = await this.processUsageData(rows)
      
      // Broadcast updates to connected clients
      this.wsService.broadcast('usage-update', {
        newRecords: processedRecords.length,
        latestData: processedRecords.slice(-5), // Last 5 records
        timestamp: new Date().toISOString()
      })

      logger.info(`Data collection complete - processed ${processedRecords.length} records`)

    } catch (error) {
      logger.error('Data collection failed:', error)
      
      // Notify clients of the error
      this.wsService.broadcast('collection-error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      this.isRunning = false
    }
  }

  private async processUsageData(rows: any[]): Promise<UsageRecord[]> {
    const processedRecords: UsageRecord[] = []

    // Process each row
    for (const row of rows) {
      try {
        // Calculate CO2 emissions
        const co2Emissions = this.co2Calculator.calculateEmissions(
          row.models, 
          row.totalTokens
        )

        // Check if this record already exists
        const existingRecord = await databaseManager.get(`
          SELECT * FROM usage_records WHERE date = ? AND model_name = ?
        `, [row.date, row.models]) as UsageRecord | undefined

        // Only insert if new or changed
        if (!existingRecord || 
            existingRecord.total_tokens !== row.totalTokens ||
            existingRecord.cost_usd !== row.costUsd) {
          
          const usageRecord: UsageRecord = {
            date: row.date,
            model_name: row.models,
            input_tokens: row.input,
            output_tokens: row.output,
            cache_create_tokens: row.cacheCreate,
            cache_read_tokens: row.cacheRead,
            total_tokens: row.totalTokens,
            cost_usd: row.costUsd,
            co2_emissions_grams: co2Emissions
          }

          await databaseManager.run(`
            INSERT OR REPLACE INTO usage_records 
            (date, model_name, input_tokens, output_tokens, cache_create_tokens, 
             cache_read_tokens, total_tokens, cost_usd, co2_emissions_grams, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `, [
            usageRecord.date,
            usageRecord.model_name,
            usageRecord.input_tokens,
            usageRecord.output_tokens,
            usageRecord.cache_create_tokens,
            usageRecord.cache_read_tokens,
            usageRecord.total_tokens,
            usageRecord.cost_usd,
            usageRecord.co2_emissions_grams
          ])

          processedRecords.push(usageRecord)
          
          logger.debug('Processed usage record:', {
            date: usageRecord.date,
            model: usageRecord.model_name,
            tokens: usageRecord.total_tokens,
            cost: usageRecord.cost_usd,
            co2: usageRecord.co2_emissions_grams
          })
        }
      } catch (error) {
        logger.error('Failed to process usage row:', { row, error })
      }
    }

    return processedRecords
  }

  async getLatestUsageStats() {
    // Get today's stats
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const todayStats = await databaseManager.get(`
      SELECT 
        COALESCE(SUM(total_tokens), 0) as tokens,
        COALESCE(SUM(cost_usd), 0) as cost,
        COALESCE(SUM(co2_emissions_grams), 0) as co2
      FROM usage_records 
      WHERE date = ?
    `, [today]) as any

    const yesterdayStats = await databaseManager.get(`
      SELECT 
        COALESCE(SUM(total_tokens), 0) as tokens,
        COALESCE(SUM(cost_usd), 0) as cost,
        COALESCE(SUM(co2_emissions_grams), 0) as co2
      FROM usage_records 
      WHERE date = ?
    `, [yesterday]) as any

    // Get 30-day stats
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const dailyStats = await databaseManager.all(`
      SELECT date, SUM(total_tokens) as daily_tokens, SUM(cost_usd) as cost_usd, SUM(co2_emissions_grams) as co2_emissions_grams
      FROM usage_records 
      WHERE date >= ?
      GROUP BY date
    `, [thirtyDaysAgo])

    const totalTokens = dailyStats.reduce((sum, day) => sum + day.daily_tokens, 0)
    const totalCost = dailyStats.reduce((sum, day) => sum + day.cost_usd, 0)
    const totalCo2 = dailyStats.reduce((sum, day) => sum + day.co2_emissions_grams, 0)
    const avgTokens = dailyStats.length > 0 ? totalTokens / dailyStats.length : 0

    const last30DaysStats = {
      totalTokens,
      avgTokens,
      totalCost,
      totalCo2
    }

    // Calculate yearly projections
    const yearlyProjection = {
      tokens: last30DaysStats.avgTokens * 365,
      cost: (last30DaysStats.totalCost / 30) * 365,
      co2: (last30DaysStats.totalCo2 / 30) * 365
    }

    return {
      today: todayStats,
      yesterday: yesterdayStats,
      last30Days: last30DaysStats,
      yearlyProjection
    }
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop()
      this.cronJob = null
      logger.info('Data collector stopped')
    }
  }

  // Manual trigger for testing
  async triggerCollection(): Promise<void> {
    logger.info('Manual data collection triggered')
    await this.collectData()
  }
}