import { NextRequest, NextResponse } from 'next/server'
import { UazapiService } from '@/lib/services/uazapi.service'
import { MessageService } from '@/lib/services/message.service'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { conversationId, number, text } = body

    // Validate input
    if (!conversationId || !number || !text) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, number, text' },
        { status: 400 }
      )
    }

    // Get conversation and contact
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*, contact:contacts(*)')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Send message via UAZAPI
    const response = await UazapiService.sendText({
      number,
      text,
    })

    // Save message to database
    const message = await MessageService.createMessage({
      contactId: conversation.contact.id,
      conversationId,
      direction: 'outbound',
      type: 'text',
      text,
      status: 'sent',
      rawPayload: response,
    })

    return NextResponse.json({
      success: true,
      message_id: message.id,
      api_response: response,
    })
  } catch (error: any) {
    console.error('Send text error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}
