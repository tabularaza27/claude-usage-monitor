export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    path: process.env.DB_PATH || './data/usage.db'
  },
  claudeMonitor: {
    logFile: process.env.CLAUDE_LOG_FILE || 'daily-usage.log',
    refreshInterval: parseInt(process.env.REFRESH_INTERVAL || '300000', 10) // 5 minutes
  },
  websocket: {
    heartbeatInterval: 30000, // 30 seconds
    maxClients: 50
  }
}