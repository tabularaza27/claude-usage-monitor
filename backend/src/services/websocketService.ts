import { WebSocketServer, WebSocket } from 'ws'
import { logger } from '../utils/logger.js'
import { config } from '../config/environment.js'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

interface ConnectedClient {
  ws: WebSocket
  id: string
  connectedAt: Date
  lastPing?: Date
}

export class WebSocketService {
  private clients: Map<string, ConnectedClient> = new Map()
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(private wsServer: WebSocketServer) {
    this.setupWebSocketServer()
    this.startHeartbeat()
  }

  private setupWebSocketServer(): void {
    this.wsServer.on('connection', (ws: WebSocket, request) => {
      const clientId = this.generateClientId()
      const client: ConnectedClient = {
        ws,
        id: clientId,
        connectedAt: new Date()
      }

      this.clients.set(clientId, client)
      logger.info(`WebSocket client connected: ${clientId}`, {
        clientCount: this.clients.size,
        userAgent: request.headers['user-agent']
      })

      // Send welcome message
      this.sendToClient(clientId, 'connection', {
        message: 'Connected to Claude Usage Monitor',
        clientId
      })

      // Handle client messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleClientMessage(clientId, message)
        } catch (error) {
          logger.warn(`Invalid message from client ${clientId}:`, error)
        }
      })

      // Handle client disconnect
      ws.on('close', () => {
        this.clients.delete(clientId)
        logger.info(`WebSocket client disconnected: ${clientId}`, {
          clientCount: this.clients.size
        })
      })

      // Handle errors
      ws.on('error', (error) => {
        logger.error(`WebSocket error for client ${clientId}:`, error)
        this.clients.delete(clientId)
      })

      // Enforce max clients limit
      if (this.clients.size > config.websocket.maxClients) {
        logger.warn(`Too many WebSocket connections (${this.clients.size}), closing oldest`)
        this.disconnectOldestClient()
      }
    })

    logger.info('WebSocket server setup complete')
  }

  private handleClientMessage(clientId: string, message: any): void {
    logger.debug(`Message from client ${clientId}:`, message)

    switch (message.type) {
      case 'ping':
        this.sendToClient(clientId, 'pong', { timestamp: new Date().toISOString() })
        break
      
      case 'subscribe':
        // Handle subscription to specific data updates
        this.sendToClient(clientId, 'subscribed', { 
          channels: message.channels || ['usage-updates']
        })
        break

      default:
        logger.warn(`Unknown message type from client ${clientId}:`, message.type)
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private disconnectOldestClient(): void {
    let oldestClient: ConnectedClient | null = null
    let oldestTime = Date.now()

    for (const client of this.clients.values()) {
      if (client.connectedAt.getTime() < oldestTime) {
        oldestTime = client.connectedAt.getTime()
        oldestClient = client
      }
    }

    if (oldestClient) {
      oldestClient.ws.close()
      this.clients.delete(oldestClient.id)
      logger.info(`Disconnected oldest client: ${oldestClient.id}`)
    }
  }

  sendToClient(clientId: string, type: string, data: any): void {
    const client = this.clients.get(clientId)
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return
    }

    const message: WebSocketMessage = {
      type,
      data,
      timestamp: new Date().toISOString()
    }

    try {
      client.ws.send(JSON.stringify(message))
    } catch (error) {
      logger.error(`Failed to send message to client ${clientId}:`, error)
      this.clients.delete(clientId)
    }
  }

  broadcast(type: string, data: any): void {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: new Date().toISOString()
    }

    const messageStr = JSON.stringify(message)
    let sentCount = 0

    for (const [clientId, client] of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(messageStr)
          sentCount++
        } catch (error) {
          logger.error(`Failed to broadcast to client ${clientId}:`, error)
          this.clients.delete(clientId)
        }
      } else {
        // Clean up dead connections
        this.clients.delete(clientId)
      }
    }

    logger.debug(`Broadcasted ${type} to ${sentCount} clients`)
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.broadcast('heartbeat', {
        timestamp: new Date().toISOString(),
        clientCount: this.clients.size
      })
      
      // Clean up dead connections
      this.cleanupDeadConnections()
      
    }, config.websocket.heartbeatInterval)

    logger.info(`WebSocket heartbeat started (${config.websocket.heartbeatInterval}ms interval)`)
  }

  private cleanupDeadConnections(): void {
    const deadClients: string[] = []

    for (const [clientId, client] of this.clients) {
      if (client.ws.readyState !== WebSocket.OPEN) {
        deadClients.push(clientId)
      }
    }

    deadClients.forEach(clientId => {
      this.clients.delete(clientId)
    })

    if (deadClients.length > 0) {
      logger.debug(`Cleaned up ${deadClients.length} dead WebSocket connections`)
    }
  }

  getClientCount(): number {
    return this.clients.size
  }

  getClientInfo(): Array<{ id: string; connectedAt: Date; lastPing?: Date }> {
    return Array.from(this.clients.values()).map(client => ({
      id: client.id,
      connectedAt: client.connectedAt,
      lastPing: client.lastPing
    }))
  }

  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    // Close all client connections
    for (const client of this.clients.values()) {
      client.ws.close()
    }

    this.clients.clear()
    logger.info('WebSocket service shutdown complete')
  }
}