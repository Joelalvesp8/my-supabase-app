import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services/message.service'
import { StorageService } from '@/lib/services/storage.service'
import { UazapiWebhookPayload, MessageType } from '@/lib/types/database'
import { createAdminClient } from '@/lib/supabase/admin'

// Map UAZAPI message types to our MessageType
function mapMessageType(uazapiType: string, mediaType?: string): MessageType {
  if (mediaType === 'ptt' || uazapiType === 'AudioMessage') return 'audio'
  if (uazapiType === 'ImageMessage') return 'image'
  if (uazapiType === 'VideoMessage') return 'video'
  if (uazapiType === 'DocumentMessage') return 'document'
  return 'text'
}

/**
 * Webhook endpoint to receive messages from UAZAPI
 * POST /api/webhook/messages
 */
export async function POST(request: NextRequest) {
  console.log('[WEBHOOK] Request received at:', new Date().toISOString())
  console.log('[WEBHOOK] Headers:', Object.fromEntries(request.headers))

  try {
    const payload: UazapiWebhookPayload = await request.json()

    console.log('[WEBHOOK] Payload:', JSON.stringify(payload, null, 2))

    // Validate UAZAPI payload structure
    if (!payload.body || !payload.body.message || !payload.body.chat) {
      console.log('[WEBHOOK] Invalid payload - missing body structure')
      return NextResponse.json(
        { error: 'Invalid payload: missing required fields' },
        { status: 400 }
      )
    }

    const { message, chat } = payload.body

    // Ignore messages sent by us (fromMe: true)
    if (message.fromMe) {
      console.log('[WEBHOOK] Ignoring message sent by us')
      return NextResponse.json({ success: true, ignored: true })
    }

    // Create admin client for webhook operations (bypasses RLS)
    const adminClient = createAdminClient()
    console.log('[WEBHOOK] Admin client created')

    // Extract phone number (remove @s.whatsapp.net if present)
    const phoneNumber = message.chatid.replace('@s.whatsapp.net', '')
    console.log('[WEBHOOK] Phone number:', phoneNumber)

    // Get contact name
    const contactName = chat.wa_contactName || chat.name || null
    console.log('[WEBHOOK] Contact name:', contactName)

    // Find or create contact
    console.log('[WEBHOOK] Finding/creating contact...')
    const contact = await MessageService.findOrCreateContact(phoneNumber, contactName, adminClient)
    console.log('[WEBHOOK] Contact:', contact.id)

    // Find or create conversation
    console.log('[WEBHOOK] Finding/creating conversation...')
    const conversation = await MessageService.findOrCreateConversation(contact.id, adminClient)
    console.log('[WEBHOOK] Conversation:', conversation.id)

    // Map message type
    const messageType = mapMessageType(message.messageType, message.mediaType)
    console.log('[WEBHOOK] Message type:', messageType)

    // Process media if exists
    let mediaUrl: string | undefined
    let apiFileUrl: string | undefined

    if (message.content?.URL) {
      apiFileUrl = message.content.URL
      console.log('[WEBHOOK] Media URL from API:', apiFileUrl)

      try {
        // Download media from UAZAPI and upload to our storage
        const folder = getMediaFolder(messageType)
        mediaUrl = await StorageService.downloadAndUpload(apiFileUrl, folder)
        console.log('[WEBHOOK] Media uploaded to storage:', mediaUrl)
      } catch (error) {
        console.error('[WEBHOOK] Failed to process media:', error)
        // Continue without media if upload fails
      }
    }

    // Create message in database
    console.log('[WEBHOOK] Creating message...')
    const savedMessage = await MessageService.createMessage({
      contactId: contact.id,
      conversationId: conversation.id,
      direction: 'inbound',
      type: messageType,
      text: message.text || undefined,
      mediaUrl,
      apiFileUrl,
      status: 'delivered',
      rawPayload: payload,
      client: adminClient,
    })

    console.log('[WEBHOOK] Message saved:', savedMessage.id)

    // TODO: Trigger real-time notification via Supabase Realtime
    // TODO: Check if should trigger AI response

    return NextResponse.json({
      success: true,
      message_id: savedMessage.id,
      conversation_id: conversation.id,
    })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle message status updates
 * POST /api/webhook/messages/status
 */
export async function PUT(request: NextRequest) {
  try {
    const payload = await request.json()

    console.log('Status update received:', payload)

    // Validate payload
    if (!payload.message_id || !payload.status) {
      return NextResponse.json(
        { error: 'Invalid payload: missing message_id or status' },
        { status: 400 }
      )
    }

    // Create admin client for webhook operations (bypasses RLS)
    const adminClient = createAdminClient()

    // Update message status
    await MessageService.updateMessageStatus(
      payload.message_id,
      payload.status,
      payload,
      adminClient
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Status update error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get appropriate folder based on media type
 */
function getMediaFolder(type: MessageType): 'images' | 'audios' | 'documents' | 'videos' {
  switch (type) {
    case 'image':
      return 'images'
    case 'audio':
      return 'audios'
    case 'video':
      return 'videos'
    case 'document':
    default:
      return 'documents'
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
