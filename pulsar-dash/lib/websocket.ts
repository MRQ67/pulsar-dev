import { auth } from './api'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'

export type WebSocketEventType =
  | 'pr_opened'
  | 'pr_closed'
  | 'pr_merged'
  | 'pr_updated'
  | 'workflow_started'
  | 'workflow_completed'
  | 'workflow_failed'
  | 'metric_update'
  | 'integration_synced'

export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType
  project_id: string
  data: T
  timestamp: number
}

type MessageHandler = (message: WebSocketMessage) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private handlers: Map<WebSocketEventType, Set<MessageHandler>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private isConnecting = false

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return
    }

    this.isConnecting = true
    const token = auth.getToken()
    const url = token ? `${WS_URL}/ws?token=${token}` : `${WS_URL}/ws`

    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        this.isConnecting = false
        this.stopHeartbeat()
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.isConnecting = false
      }
    } catch (error) {
      this.isConnecting = false
      console.error('Failed to create WebSocket connection:', error)
    }
  }

  disconnect(): void {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.handlers.get(message.type)
    if (handlers) {
      handlers.forEach((handler) => handler(message))
    }
  }

  on(type: WebSocketEventType, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)

    return () => {
      this.handlers.get(type)?.delete(handler)
    }
  }

  off(type: WebSocketEventType, handler: MessageHandler): void {
    this.handlers.get(type)?.delete(handler)
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    setTimeout(() => {
      this.connect()
    }, delay)
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

export const wsClient = new WebSocketClient()
