import { NextRequest, NextResponse } from 'next/server'
import { UazapiService } from '@/lib/services/uazapi.service'
import { MessageService } from '@/lib/services/message.service'
import { StorageService } from '@/lib/services/storage.service'
import { createClient } from '@/lib/supabase/server'
import { MessageType } from '@/lib/types/database'

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

    // Parse form data
    const formData = await request.formData()
    const conversationId = formData.get('conversationId') as string
    const number = formData.get('number') as string
    const type = formData.get('type') as MessageType
    const text = formData.get('text') as string | null
    const file = formData.get('file') as File

    // Validate input
    if (!conversationId || !number || !type || !file) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, number, type, file' },
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

    // Upload file to storage
    const folder = getMediaFolder(type)
    const mediaUrl = await StorageService.uploadFile(file, folder)

    // Send media via UAZAPI
    const response = await UazapiService.sendMedia({
      number,
      type,
      file: mediaUrl,
      text: text || undefined,
    })

    // Save message to database
    const message = await MessageService.createMessage({
      contactId: conversation.contact.id,
      conversationId,
      direction: 'outbound',
      type,
      text: text || null,
      mediaUrl,
      apiFileUrl: mediaUrl,
      status: 'sent',
      rawPayload: response,
    })

    return NextResponse.json({
      success: true,
      message_id: message.id,
      media_url: mediaUrl,
      api_response: response,
    })
  } catch (error: any) {
    console.error('Send media error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send media' },
      { status: 500 }
    )
  }
}

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
