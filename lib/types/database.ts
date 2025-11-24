export type ConversationStatus = 'open' | 'waiting' | 'closed'
export type MessageDirection = 'inbound' | 'outbound'
export type MessageType = 'text' | 'image' | 'audio' | 'document' | 'video'
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'error'
export type AgentRole = 'human' | 'ai'

export interface Contact {
  id: string
  number: string
  name: string | null
  last_message_at: string | null
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  user_id: string | null
  name: string
  role: AgentRole
  online: boolean
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  contact_id: string
  assigned_agent_id: string | null
  status: ConversationStatus
  created_at: string
  updated_at: string
  contact?: Contact
  assigned_agent?: Agent
}

export interface Message {
  id: string
  contact_id: string
  conversation_id: string
  direction: MessageDirection
  type: MessageType
  text: string | null
  media_url: string | null
  api_file_url: string | null
  status: MessageStatus
  raw_payload: any
  created_at: string
  updated_at: string
}

export interface MessageEvent {
  id: string
  message_id: string
  status: MessageStatus
  timestamp: string
  raw_payload: any
}

// API Types
export interface WebhookPayload {
  from: string
  type: MessageType
  text?: string
  media?: string
  timestamp: string
  raw: any
}

export interface SendTextRequest {
  number: string
  text: string
}

export interface SendMediaRequest {
  number: string
  type: MessageType
  file: string
  text?: string
}
