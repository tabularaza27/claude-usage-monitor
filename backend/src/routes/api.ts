import { Router } from 'express'
import { databaseManager } from '../config/database.js'
import { CO2Calculator } from '../services/co2Calculator.js'
import { DataCollector } from '../services/dataCollector.js'
import { logger } from '../utils/logger.js'
import { getDaysAgo, formatDate } from '../utils/dateUtils.js'
import { 
  UsageRecord, 
  DailyUsageSummary, 
  UsageStats 
} from '../models/Usage.js'
import { 
  TeamConfig, 
  TeamProjection, 
  EmissionFactor 
} from '../models/EmissionFactor.js'

const router = Router()
let co2Calculator: CO2Calculator | null = null
let dataCollector: DataCollector | null = null

// Initialize services
async function initializeServices() {
  if (!co2Calculator) {
    co2Calculator = new CO2Calculator()
    await co2Calculator.initialize()
  }
}

// Middleware to ensure services are initialized
router.use(async (req, res, next) => {
  try {
    await initializeServices()
    next()
  } catch (error) {
    logger.error('Failed to initialize services:', error)
    res.status(500).json({ error: 'Service initialization failed' })
  }
})

// GET /api/usage/daily - Get daily usage data
router.get('/usage/daily', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    const startDate = getDaysAgo(days)
    
    const records = await databaseManager.all(`
      SELECT 
        date,
        model_name,
        input_tokens,
        output_tokens,
        cache_create_tokens,
        cache_read_tokens,
        total_tokens,
        cost_usd,
        co2_emissions_grams
      FROM usage_records 
      WHERE date >= ?
      ORDER BY date DESC, model_name
    `, [startDate]) as UsageRecord[]
    
    res.json({
      records,
      period: { days, startDate },
      count: records.length
    })
    
  } catch (error) {
    logger.error('Failed to fetch daily usage:', error)
    res.status(500).json({ error: 'Failed to fetch usage data' })
  }
})

// GET /api/usage/summary - Get summarized daily usage
router.get('/usage/summary', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    const startDate = getDaysAgo(days)
    
    // Get daily summaries
    const summariesData = await databaseManager.all(`
      SELECT 
        date,
        SUM(total_tokens) as total_tokens,
        SUM(cost_usd) as total_cost,
        SUM(co2_emissions_grams) as total_co2,
        GROUP_CONCAT(
          model_name || ':' || total_tokens || ':' || cost_usd || ':' || co2_emissions_grams,
          '|'
        ) as model_data
      FROM usage_records 
      WHERE date >= ?
      GROUP BY date
      ORDER BY date DESC
    `, [startDate])

    const summaries = summariesData.map((row: any) => {
      const models = row.model_data ? row.model_data.split('|').map((modelStr: string) => {
        const [name, tokens, cost, co2] = modelStr.split(':')
        const tokenCount = parseInt(tokens)
        return {
          name,
          tokens: tokenCount,
          cost: parseFloat(cost),
          co2: parseFloat(co2),
          percentage: Math.round((tokenCount / row.total_tokens) * 100)
        }
      }) : []

      const summary: DailyUsageSummary = {
        date: row.date,
        total_tokens: row.total_tokens,
        total_cost: row.total_cost,
        total_co2: row.total_co2,
        models
      }

      return summary
    })

    res.json({
      summaries,
      period: { days, startDate },
      count: summaries.length
    })
    
  } catch (error) {
    logger.error('Failed to fetch usage summary:', error)
    res.status(500).json({ error: 'Failed to fetch usage summary' })
  }
})

// GET /api/usage/stats - Get usage statistics
router.get('/usage/stats', async (req, res) => {
  try {
    const today = formatDate(new Date())
    const yesterday = getDaysAgo(1)
    const thirtyDaysAgo = getDaysAgo(30)

    // Today's stats
    const todayStats = await databaseManager.get(`
      SELECT 
        COALESCE(SUM(total_tokens), 0) as tokens,
        COALESCE(SUM(cost_usd), 0) as cost,
        COALESCE(SUM(co2_emissions_grams), 0) as co2
      FROM usage_records 
      WHERE date = ?
    `, [today]) as any

    // Yesterday's stats
    const yesterdayStats = await databaseManager.get(`
      SELECT 
        COALESCE(SUM(total_tokens), 0) as tokens,
        COALESCE(SUM(cost_usd), 0) as cost,
        COALESCE(SUM(co2_emissions_grams), 0) as co2
      FROM usage_records 
      WHERE date = ?
    `, [yesterday]) as any

    // Last 30 days stats
    const last30DaysData = await databaseManager.all(`
      SELECT 
        date,
        SUM(total_tokens) as daily_tokens,
        SUM(cost_usd) as daily_cost,
        SUM(co2_emissions_grams) as daily_co2
      FROM usage_records 
      WHERE date >= ?
      GROUP BY date
    `, [thirtyDaysAgo])

    const totalTokens = last30DaysData.reduce((sum, day) => sum + day.daily_tokens, 0)
    const totalCost = last30DaysData.reduce((sum, day) => sum + day.daily_cost, 0)
    const totalCo2 = last30DaysData.reduce((sum, day) => sum + day.daily_co2, 0)
    const avgTokens = last30DaysData.length > 0 ? totalTokens / last30DaysData.length : 0

    // Calculate yearly projections
    const dailyAvg = avgTokens
    const yearlyProjection = {
      tokens: Math.round(dailyAvg * 365),
      cost: Math.round((totalCost / 30) * 365 * 100) / 100,
      co2: Math.round((totalCo2 / 30) * 365 * 100) / 100
    }

    const stats: UsageStats = {
      today: todayStats,
      yesterday: yesterdayStats,
      last30Days: {
        avgTokens: Math.round(avgTokens),
        totalTokens: totalTokens,
        totalCost: Math.round(totalCost * 100) / 100,
        totalCo2: Math.round(totalCo2 * 100) / 100
      },
      yearlyProjection
    }

    res.json(stats)
    
  } catch (error) {
    logger.error('Failed to fetch usage stats:', error)
    res.status(500).json({ error: 'Failed to fetch usage statistics' })
  }
})

// GET /api/team/config - Get team configuration
router.get('/team/config', async (req, res) => {
  try {
    const config = await databaseManager.get(`
      SELECT * FROM team_configs ORDER BY created_at DESC LIMIT 1
    `) as TeamConfig | undefined
    
    res.json(config || {
      team_size: 1,
      usage_multiplier: 1.0
    })
    
  } catch (error) {
    logger.error('Failed to fetch team config:', error)
    res.status(500).json({ error: 'Failed to fetch team configuration' })
  }
})

// PUT /api/team/config - Update team configuration
router.put('/team/config', async (req, res) => {
  try {
    const { team_size, usage_multiplier = 1.0 } = req.body
    
    if (!team_size || team_size < 1) {
      return res.status(400).json({ error: 'Team size must be at least 1' })
    }

    if (usage_multiplier < 0) {
      return res.status(400).json({ error: 'Usage multiplier must be positive' })
    }

    await databaseManager.run(`
      INSERT INTO team_configs (team_size, usage_multiplier)
      VALUES (?, ?)
    `, [team_size, usage_multiplier])
    
    res.json({
      success: true,
      config: { team_size, usage_multiplier }
    })
    
  } catch (error) {
    logger.error('Failed to update team config:', error)
    res.status(500).json({ error: 'Failed to update team configuration' })
  }
})

// GET /api/team/projection - Get team usage projections
router.get('/team/projection', async (req, res) => {
  try {
    // Get team config
    const teamConfig = await databaseManager.get(`
      SELECT * FROM team_configs ORDER BY created_at DESC LIMIT 1
    `) as TeamConfig | undefined
    
    const teamSize = teamConfig?.team_size || 1
    const multiplier = teamConfig?.usage_multiplier || 1.0

    // Get last 30 days average for projections
    const thirtyDaysAgo = getDaysAgo(30)
    const dailyData = await databaseManager.all(`
      SELECT 
        date,
        SUM(total_tokens) as tokens,
        SUM(cost_usd) as cost,
        SUM(co2_emissions_grams) as co2
      FROM usage_records 
      WHERE date >= ?
      GROUP BY date
    `, [thirtyDaysAgo])

    const totalTokens = dailyData.reduce((sum, day) => sum + day.tokens, 0)
    const totalCost = dailyData.reduce((sum, day) => sum + day.cost, 0)
    const totalCo2 = dailyData.reduce((sum, day) => sum + day.co2, 0)
    
    // Use consistent calculation with personal stats - always divide by 30 for last 30 days average
    const personalDaily = {
      tokens: totalTokens / 30,
      cost: totalCost / 30,
      co2: totalCo2 / 30
    }

    // Calculate team projections
    const teamDaily = {
      tokens: Math.round(personalDaily.tokens * teamSize * multiplier),
      cost: Math.round(personalDaily.cost * teamSize * multiplier * 100) / 100,
      co2: Math.round(personalDaily.co2 * teamSize * multiplier * 100) / 100
    }

    const teamMonthly = {
      tokens: Math.round(teamDaily.tokens * 30),
      cost: Math.round(teamDaily.cost * 30 * 100) / 100,
      co2: Math.round(teamDaily.co2 * 30 * 100) / 100
    }

    const teamYearly = {
      tokens: Math.round(teamDaily.tokens * 365),
      cost: Math.round(teamDaily.cost * 365 * 100) / 100,
      co2: Math.round(teamDaily.co2 * 365 * 100) / 100
    }

    // Environmental context
    const environmentalContext = co2Calculator!.convertToEnvironmentalContext(teamYearly.co2)

    const projection: TeamProjection = {
      team_size: teamSize,
      daily: teamDaily,
      monthly: teamMonthly,
      yearly: teamYearly,
      environmental_context: environmentalContext
    }

    res.json(projection)
    
  } catch (error) {
    logger.error('Failed to calculate team projection:', error)
    res.status(500).json({ error: 'Failed to calculate team projections' })
  }
})

// GET /api/co2/factors - Get emission factors
router.get('/co2/factors', async (req, res) => {
  try {
    const factors = await co2Calculator!.getEmissionFactors()
    res.json(factors)
    
  } catch (error) {
    logger.error('Failed to fetch emission factors:', error)
    res.status(500).json({ error: 'Failed to fetch emission factors' })
  }
})

// PUT /api/co2/factors - Update emission factor
router.put('/co2/factors', async (req, res) => {
  try {
    const { model_pattern, emissions_per_1k_tokens, description, source } = req.body
    
    if (!model_pattern || !emissions_per_1k_tokens) {
      return res.status(400).json({ 
        error: 'model_pattern and emissions_per_1k_tokens are required' 
      })
    }

    if (emissions_per_1k_tokens <= 0) {
      return res.status(400).json({ 
        error: 'emissions_per_1k_tokens must be positive' 
      })
    }

    const factor: Omit<EmissionFactor, 'id' | 'created_at'> = {
      model_pattern,
      emissions_per_1k_tokens,
      description: description || '',
      source: source || 'User update',
      effective_from: formatDate(new Date())
    }

    await co2Calculator!.updateEmissionFactor(factor)
    
    res.json({
      success: true,
      factor
    })
    
  } catch (error) {
    logger.error('Failed to update emission factor:', error)
    res.status(500).json({ error: 'Failed to update emission factor' })
  }
})

// POST /api/data/collect - Manually trigger data collection
router.post('/data/collect', async (req, res) => {
  try {
    if (dataCollector) {
      await dataCollector.triggerCollection()
      res.json({ 
        success: true, 
        message: 'Data collection triggered successfully' 
      })
    } else {
      res.status(503).json({ error: 'Data collector not available' })
    }
    
  } catch (error) {
    logger.error('Manual data collection failed:', error)
    res.status(500).json({ error: 'Data collection failed' })
  }
})

// Set data collector reference (called from server.ts)
export function setDataCollector(collector: DataCollector) {
  dataCollector = collector
}

export default router