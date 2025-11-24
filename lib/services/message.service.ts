import { createClient } from '@/lib/supabase/server'
import { Contact, Conversation, Message, MessageDirection, MessageStatus, MessageType } from '@/lib/types/database'

export class MessageService {
  /**
   * Find or create a contact by phone number
   */
  static async findOrCreateContact(number: string, name?: string): Promise<Contact> {
    const supabase = await createClient()

    // Try to find existing contact
    const { data: existingContact, error: findError } = await supabase
      .from('contacts')
      .select('*')
      .eq('number', number)
      .single()

    if (existingContact && !findError) {
      return existingContact
    }

    // Create new contact
    const { data: newContact, error: createError } = await supabase
      .from('contacts')
      .insert({
        number,
        name: name || null,
      })
      .select()
      .single()

    if (createError || !newContact) {
      throw new Error(`Failed to create contact: ${createError?.message}`)
    }

    return newContact
  }

  /**
   * Find or create a conversation for a contact
   */
  static async findOrCreateConversation(contactId: string): Promise<Conversation> {
    const supabase = await createClient()

    // Try to find existing open conversation
    const { data: existingConversation, error: findError } = await supabase
      .from('conversations')
      .select('*')
      .eq('contact_id', contactId)
      .in('status', ['open', 'waiting'])
      .single()

    if (existingConversation && !findError) {
      return existingConversation
    }

    // Create new conversation
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        contact_id: contactId,
        status: 'open',
      })
      .select()
      .single()

    if (createError || !newConversation) {
      throw new Error(`Failed to create conversation: ${createError?.message}`)
    }

    return newConversation
  }

  /**
   * Create a new message
   */
  static async createMessage(params: {
    contactId: string
    conversationId: string
    direction: MessageDirection
    type: MessageType
    text?: string
    mediaUrl?: string
    apiFileUrl?: string
    status?: MessageStatus
    rawPayload?: any
  }): Promise<Message> {
    const supabase = await createClient()

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        contact_id: params.contactId,
        conversation_id: params.conversationId,
        direction: params.direction,
        type: params.type,
        text: params.text || null,
        media_url: params.mediaUrl || null,
        api_file_url: params.apiFileUrl || null,
        status: params.status || 'pending',
        raw_payload: params.rawPayload || null,
      })
      .select()
      .single()

    if (error || !message) {
      throw new Error(`Failed to create message: ${error?.message}`)
    }

    // Update contact's last_message_at
    await supabase
      .from('contacts')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', params.contactId)

    return message
  }

  /**
   * Update message status
   */
  static async updateMessageStatus(
    messageId: string,
    status: MessageStatus,
    rawPayload?: any
  ): Promise<void> {
    const supabase = await createClient()

    // Update message
    const { error: updateError } = await supabase
      .from('messages')
      .update({ status })
      .eq('id', messageId)

    if (updateError) {
      throw new Error(`Failed to update message status: ${updateError.message}`)
    }

    // Create event log
    await supabase
      .from('message_events')
      .insert({
        message_id: messageId,
        status,
        raw_payload: rawPayload || null,
      })
  }

  /**
   * Get messages for a conversation
   */
  static async getConversationMessages(conversationId: string): Promise<Message[]> {
    const supabase = await createClient()

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to get messages: ${error.message}`)
    }

    return messages || []
  }

  /**
   * Get all conversations with latest message
   */
  static async getConversations(): Promise<any[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        contact:contacts(*),
        assigned_agent:agents(*)
      `)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get conversations: ${error.message}`)
    }

    return data || []
  }

  /**
   * Assign agent to conversation
   */
  static async assignAgent(conversationId: string, agentId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('conversations')
      .update({
        assigned_agent_id: agentId,
        status: 'waiting',
      })
      .eq('id', conversationId)

    if (error) {
      throw new Error(`Failed to assign agent: ${error.message}`)
    }
  }

  /**
   * Close conversation
   */
  static async closeConversation(conversationId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('conversations')
      .update({
        status: 'closed',
        assigned_agent_id: null,
      })
      .eq('id', conversationId)

    if (error) {
      throw new Error(`Failed to close conversation: ${error.message}`)
    }
  }
}
