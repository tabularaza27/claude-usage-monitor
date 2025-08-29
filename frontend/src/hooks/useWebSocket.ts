import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const queryClient = useQueryClient()

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws`
    
    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onopen = () => {
      setIsConnected(true)
      console.log('WebSocket connected')
      
      // Clear any reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }

    wsRef.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        setLastMessage(message)
        handleMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    wsRef.current.onclose = () => {
      setIsConnected(false)
      console.log('WebSocket disconnected')
      
      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, 5000)
    }

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
    }
  }

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'usage-update':
        // Invalidate usage-related queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['usage'] })
        break
        
      case 'heartbeat':
        // Connection health check
        break
        
      case 'collection-error':
        console.error('Data collection error:', message.data)
        break
        
      default:
        console.log('Unknown message type:', message.type)
    }
  }

  const sendMessage = (type: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }))
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setIsConnected(false)
  }

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  }
}