import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { databaseManager } from './config/database.js'
import { config } from './config/environment.js'
import { logger } from './utils/logger.js'
import apiRoutes, { setDataCollector } from './routes/api.js'
import { WebSocketService } from './services/websocketService.js'
import { DataCollector } from './services/dataCollector.js'

class Server {
  private app: express.Application
  private httpServer: any
  private wsServer: WebSocketServer | null = null
  private wsService: WebSocketService | null = null
  private dataCollector: DataCollector | null = null

  constructor() {
    this.app = express()
    this.httpServer = createServer(this.app)
    this.setupMiddleware()
    this.setupRoutes()
  }

  private setupMiddleware(): void {
    this.app.use(helmet())
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }))
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true }))

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      })
      next()
    })
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      })
    })

    // API routes
    this.app.use('/api', apiRoutes)

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' })
    })

    // Error handler
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error:', err)
      res.status(500).json({ 
        error: config.nodeEnv === 'development' ? err.message : 'Internal server error' 
      })
    })
  }

  private setupWebSocket(): void {
    this.wsServer = new WebSocketServer({ 
      server: this.httpServer,
      path: '/ws'
    })

    this.wsService = new WebSocketService(this.wsServer)
    logger.info('WebSocket server initialized')
  }

  private setupDataCollection(): void {
    if (!this.wsService) {
      throw new Error('WebSocket service must be initialized before data collection')
    }
    
    this.dataCollector = new DataCollector(this.wsService)
    setDataCollector(this.dataCollector)
    this.dataCollector.start()
    logger.info('Data collection service started')
  }

  async start(): Promise<void> {
    try {
      // Initialize database
      await databaseManager.initialize()

      // Setup WebSocket
      this.setupWebSocket()

      // Setup data collection
      this.setupDataCollection()

      // Start HTTP server
      this.httpServer.listen(config.port, () => {
        logger.info(`Server running on port ${config.port}`)
        logger.info(`Environment: ${config.nodeEnv}`)
        logger.info(`WebSocket available at ws://localhost:${config.port}/ws`)
      })

      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown())
      process.on('SIGINT', () => this.shutdown())

    } catch (error) {
      logger.error('Failed to start server:', error)
      process.exit(1)
    }
  }

  private shutdown(): void {
    logger.info('Shutting down server...')
    
    if (this.dataCollector) {
      this.dataCollector.stop()
    }

    if (this.wsServer) {
      this.wsServer.close()
    }

    this.httpServer.close(() => {
      databaseManager.close()
      logger.info('Server shutdown complete')
      process.exit(0)
    })
  }
}

// Start server
const server = new Server()
server.start().catch(error => {
  logger.error('Failed to start server:', error)
  process.exit(1)
})