import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services/message.service'
import { StorageService } from '@/lib/services/storage.service'
import { WebhookPayload, MessageType } from '@/lib/types/database'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Webhook endpoint to receive messages from UAZAPI
 * POST /api/webhook/messages
 */
export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json()

    console.log('Webhook received:', payload)

    // Validate payload
    if (!payload.from || !payload.type) {
      return NextResponse.json(
        { error: 'Invalid payload: missing required fields' },
        { status: 400 }
      )
    }

    // Create admin client for webhook operations (bypasses RLS)
    const adminClient = createAdminClient()

    // Extract phone number (remove @s.whatsapp.net if present)
    const phoneNumber = payload.from.replace('@s.whatsapp.net', '')

    // Find or create contact
    const contact = await MessageService.findOrCreateContact(phoneNumber, undefined, adminClient)

    // Find or create conversation
    const conversation = await MessageService.findOrCreateConversation(contact.id, adminClient)

    // Process media if exists
    let mediaUrl: string | undefined
    if (payload.media && payload.type !== 'text') {
      try {
        // Download media from UAZAPI and upload to our storage
        const folder = getMediaFolder(payload.type)
        mediaUrl = await StorageService.downloadAndUpload(payload.media, folder)
        console.log('Media uploaded to storage:', mediaUrl)
      } catch (error) {
        console.error('Failed to process media:', error)
        // Continue without media if upload fails
      }
    }

    // Create message in database
    const message = await MessageService.createMessage({
      contactId: contact.id,
      conversationId: conversation.id,
      direction: 'inbound',
      type: payload.type,
      text: payload.text || undefined,
      mediaUrl,
      apiFileUrl: payload.media || undefined,
      status: 'delivered',
      rawPayload: payload.raw || payload,
      client: adminClient,
    })

    console.log('Message saved:', message.id)

    // TODO: Trigger real-time notification via Supabase Realtime
    // TODO: Check if should trigger AI response

    return NextResponse.json({
      success: true,
      message_id: message.id,
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
