'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Conversation, Message } from '@/lib/types/database'
import ConversationList from '@/components/chat/ConversationList'
import ChatArea from '@/components/chat/ChatArea'
import { useRouter } from 'next/navigation'

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [])

  // Load conversations
  useEffect(() => {
    loadConversations()

    // Subscribe to real-time updates for conversations
    const conversationsChannel = supabase
      .channel('conversations-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          loadConversations()
        }
      )
      .subscribe()

    // Subscribe to real-time updates for messages
    const messagesChannel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message

          // Update messages if this conversation is selected
          if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
            setMessages((prev) => [...prev, newMessage])
          }

          // Refresh conversations list
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      conversationsChannel.unsubscribe()
      messagesChannel.unsubscribe()
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(*),
          assigned_agent:agents(*)
        `)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setConversations(data || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    loadMessages(conversation.id)
  }

  const handleSendText = async (text: string) => {
    if (!selectedConversation) return

    try {
      const response = await fetch('/api/messages/send-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          number: selectedConversation.contact?.number,
          text,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Message will be added via real-time subscription
    } catch (error) {
      console.error('Error sending text:', error)
      throw error
    }
  }

  const handleSendMedia = async (file: File, type: string, caption?: string) => {
    if (!selectedConversation) return

    try {
      const formData = new FormData()
      formData.append('conversationId', selectedConversation.id)
      formData.append('number', selectedConversation.contact?.number || '')
      formData.append('type', type)
      formData.append('file', file)
      if (caption) formData.append('text', caption)

      const response = await fetch('/api/messages/send-media', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to send media')
      }

      // Message will be added via real-time subscription
    } catch (error) {
      console.error('Error sending media:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      <ConversationList
        conversations={conversations}
        selectedId={selectedConversation?.id}
        onSelectConversation={handleSelectConversation}
      />
      <ChatArea
        conversation={selectedConversation}
        messages={messages}
        onSendText={handleSendText}
        onSendMedia={handleSendMedia}
      />
    </div>
  )
}
