import { exec } from 'child_process'
import { promisify } from 'util'
import { readFileSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { logger } from '../utils/logger.js'
import { ClaudeMonitorRow, ClaudeMonitorRowSchema } from '../models/Usage.js'
import { config } from '../config/environment.js'

const execAsync = promisify(exec)

export class ClaudeMonitorParser {
  private static readonly TABLE_START_PATTERN = /┏━+┳.*┓/
  private static readonly TABLE_ROW_PATTERN = /│\s*([^│]+)\s*│\s*([^│]+)\s*│\s*([^│]+)\s*│\s*([^│]+)\s*│\s*([^│]+)\s*│\s*([^│]+)\s*│\s*([^│]+)\s*│\s*([^│]+)\s*│/
  private static readonly TOTAL_ROW_PATTERN = /│\s*Total\s*│/

  async parseDaily(): Promise<ClaudeMonitorRow[]> {
    try {
      logger.info('Starting claude-monitor data collection')
      
      // Create logs directory if it doesn't exist
      const logsDir = join(process.cwd(), 'logs')
      if (!existsSync(logsDir)) {
        require('fs').mkdirSync(logsDir, { recursive: true })
      }
      
      // Generate unique filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const outputFile = join(logsDir, `claude-monitor-${timestamp}.log`)
      const command = `claude-monitor --view daily > "${outputFile}"`
      logger.debug(`Executing command: ${command}`)
      
      await this.executeAndWriteToFile(command, outputFile)
      
      const content = this.readOutputFile(outputFile)
      const cleanContent = this.stripAnsiCodes(content)
      const rows = this.parseTableOutput(cleanContent)
      logger.info(`Parsed ${rows.length} usage records from claude-monitor`)
      logger.info(`Log file saved to: ${outputFile}`)
      
      if (rows.length === 0) {
        logger.debug('Raw file content length:', content.length)
        logger.debug('Raw file content sample:', content.substring(0, 500))
        logger.debug('Clean content sample:', cleanContent.substring(0, 500))
      }
      
      return rows
    } catch (error: any) {
      logger.error('Failed to execute claude-monitor:', error)
      throw new Error(`Failed to parse claude-monitor output: ${error.message}`)
    }
  }

  private async executeAndWriteToFile(command: string, outputFile: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process')
      
      // Use shell to handle redirection properly
      const child = spawn('sh', ['-c', command], { 
        stdio: ['pipe', 'pipe', 'pipe']
      })
      
      let stderr = ''
      
      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString()
      })
      
      child.on('close', (code) => {
        // Wait a moment for file system to flush
        setTimeout(() => {
          if (existsSync(outputFile)) {
            const stats = require('fs').statSync(outputFile)
            if (stats.size > 0) {
              logger.info(`claude-monitor output written to file successfully (${stats.size} bytes)`)
              resolve()
            } else {
              reject(new Error(`Output file ${outputFile} is empty`))
            }
          } else {
            reject(new Error(`Output file ${outputFile} was not created`))
          }
        }, 100)
      })
      
      child.on('error', (error) => {
        reject(error)
      })
      
      // Send Ctrl+C after a reasonable time to exit claude-monitor
      setTimeout(() => {
        child.kill('SIGINT')
      }, 3000) // 3 seconds should be enough for data collection
    })
  }

  private readOutputFile(filePath: string): string {
    try {
      if (!existsSync(filePath)) {
        throw new Error(`Output file ${filePath} does not exist`)
      }
      
      const content = readFileSync(filePath, 'utf-8')
      logger.debug(`Read ${content.length} characters from ${filePath}`)
      return content
    } catch (error) {
      logger.error('Failed to read output file:', error)
      throw error
    }
  }


  private stripAnsiCodes(content: string): string {
    // Remove ANSI color codes and other escape sequences
    return content.replace(/\x1b\[[0-9;]*m/g, '')
  }

  private parseTableOutput(output: string): ClaudeMonitorRow[] {
    const lines = output.split('\n')
    const rows: ClaudeMonitorRow[] = []
    let inTable = false

    for (const line of lines) {
      // Start parsing when we hit the table header
      if (ClaudeMonitorParser.TABLE_START_PATTERN.test(line)) {
        inTable = true
        continue
      }

      // Stop when we hit the total row
      if (ClaudeMonitorParser.TOTAL_ROW_PATTERN.test(line)) {
        break
      }

      // Skip non-data rows
      if (!inTable || !line.includes('│') || line.includes('━')) {
        continue
      }

      const row = this.parseTableRow(line)
      if (row) {
        try {
          const validatedRow = ClaudeMonitorRowSchema.parse(row)
          rows.push(validatedRow)
        } catch (error) {
          logger.warn('Invalid row data, skipping:', { row, error })
        }
      }
    }

    return rows
  }

  private parseTableRow(line: string): ClaudeMonitorRow | null {
    const match = line.match(ClaudeMonitorParser.TABLE_ROW_PATTERN)
    if (!match) {
      return null
    }

    try {
      const [, dateStr, modelStr, inputStr, outputStr, cacheCreateStr, cacheReadStr, totalStr, costStr] = match

      // Clean and parse the data
      const date = this.parseDate(dateStr.trim())
      const models = this.parseModelName(modelStr.trim())
      const input = this.parseNumber(inputStr.trim())
      const output = this.parseNumber(outputStr.trim())
      const cacheCreate = this.parseNumber(cacheCreateStr.trim())
      const cacheRead = this.parseNumber(cacheReadStr.trim())
      const totalTokens = this.parseNumber(totalStr.trim())
      const costUsd = this.parseCost(costStr.trim())

      return {
        date,
        models,
        input,
        output,
        cacheCreate,
        cacheRead,
        totalTokens,
        costUsd
      }
    } catch (error) {
      logger.debug('Failed to parse row:', { line, error })
      return null
    }
  }

  private parseDate(dateStr: string): string {
    // Handle dates like "2025-08-29" or "2025-…"
    if (dateStr.includes('…')) {
      // If truncated, use current date as fallback
      const today = new Date()
      return today.toISOString().split('T')[0]
    }
    
    return dateStr
  }

  private parseModelName(modelStr: string): string {
    // Handle model names like "claude-sonnet…"
    if (modelStr.includes('claude-sonnet')) {
      return 'claude-sonnet-3.5'
    } else if (modelStr.includes('claude-haiku')) {
      return 'claude-haiku-3'
    } else if (modelStr.includes('claude-opus')) {
      return 'claude-opus-3'
    }
    
    return modelStr.replace('…', '').trim()
  }

  private parseNumber(numStr: string): number {
    // Handle numbers with commas and ellipsis like "1,234…" or "12,345"
    const cleanStr = numStr.replace(/[,…]/g, '').trim()
    const num = parseInt(cleanStr, 10)
    return isNaN(num) ? 0 : num
  }

  private parseCost(costStr: string): number {
    // Handle cost like "$3.10" or "$12.…"
    const cleanStr = costStr.replace(/[$,…]/g, '').trim()
    const cost = parseFloat(cleanStr)
    return isNaN(cost) ? 0 : cost
  }

  async testParser(): Promise<void> {
    try {
      const rows = await this.parseDaily()
      logger.info('Parser test successful', { rowCount: rows.length })
      
      if (rows.length > 0) {
        logger.info('Sample row:', rows[0])
      }
    } catch (error) {
      logger.error('Parser test failed:', error)
      throw error
    }
  }
}