import sqlite3 from 'sqlite3'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { config } from './environment.js'
import { logger } from '../utils/logger.js'
import { mkdirSync } from 'fs'

class DatabaseManager {
  private db: sqlite3.Database | null = null
  private initialized = false

  constructor() {
    // Ensure data directory exists
    const dbDir = dirname(config.database.path)
    try {
      mkdirSync(dbDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(config.database.path, (err) => {
        if (err) {
          logger.error('Failed to connect to SQLite database:', err)
          reject(err)
          return
        }

        logger.info('Connected to SQLite database')
        
        // Configure database
        this.db!.run('PRAGMA journal_mode = WAL')
        this.db!.run('PRAGMA synchronous = NORMAL')
        this.db!.run('PRAGMA cache_size = 1000')
        this.db!.run('PRAGMA temp_store = memory')

        // Run migrations and seeds
        this.runMigrations()
          .then(() => this.runSeeds())
          .then(() => {
            this.initialized = true
            logger.info('Database initialized successfully')
            resolve()
          })
          .catch(reject)
      })
    })
  }

  private async runMigrations(): Promise<void> {
    const migrationPath = join(process.cwd(), 'database/migrations/001_initial_schema.sql')
    return new Promise((resolve, reject) => {
      try {
        const migrationSQL = readFileSync(migrationPath, 'utf-8')
        this.db!.exec(migrationSQL, (err) => {
          if (err) {
            logger.error('Migration failed:', err)
            reject(err)
          } else {
            logger.info('Database migrations completed')
            resolve()
          }
        })
      } catch (error) {
        logger.error('Failed to read migration file:', error)
        reject(error)
      }
    })
  }

  private async runSeeds(): Promise<void> {
    const seedPath = join(process.cwd(), 'database/seeds/001_emission_factors.sql')
    return new Promise((resolve, reject) => {
      try {
        const seedSQL = readFileSync(seedPath, 'utf-8')
        this.db!.exec(seedSQL, (err) => {
          if (err) {
            logger.error('Seeding failed:', err)
            reject(err)
          } else {
            logger.info('Database seeds completed')
            resolve()
          }
        })
      } catch (error) {
        logger.error('Failed to read seed file:', error)
        reject(error)
      }
    })
  }

  getDatabase(): sqlite3.Database {
    if (!this.initialized || !this.db) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return this.db
  }

  // Helper methods for common operations
  async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function(err) {
        if (err) {
          reject(err)
        } else {
          resolve({ lastID: this.lastID, changes: this.changes })
        }
      })
    })
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db!.get(sql, params, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db!.all(sql, params, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows || [])
        }
      })
    })
  }

  close(): void {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          logger.error('Error closing database:', err)
        } else {
          logger.info('Database connection closed')
        }
      })
      this.db = null
    }
  }
}

export const databaseManager = new DatabaseManager()
export { sqlite3 }