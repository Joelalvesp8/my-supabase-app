import { SendTextRequest, SendMediaRequest, MessageType } from '@/lib/types/database'

const UAZAPI_BASE_URL = 'https://ia3jmdsolutions.uazapi.com'
const UAZAPI_TOKEN = process.env.UAZAPI_TOKEN!

export class UazapiService {
  private static async makeRequest(endpoint: string, data: any) {
    try {
      const response = await fetch(`${UAZAPI_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': UAZAPI_TOKEN,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`UAZAPI Error: ${JSON.stringify(error)}`)
      }

      return await response.json()
    } catch (error) {
      console.error('UAZAPI request failed:', error)
      throw error
    }
  }

  static async sendText(params: SendTextRequest) {
    return this.makeRequest('/send/text', {
      number: params.number,
      text: params.text,
    })
  }

  static async sendMedia(params: SendMediaRequest) {
    return this.makeRequest('/send/media', {
      number: params.number,
      type: params.type,
      file: params.file,
      text: params.text || '',
    })
  }

  static async sendImage(number: string, fileUrl: string, caption?: string) {
    return this.sendMedia({
      number,
      type: 'image',
      file: fileUrl,
      text: caption,
    })
  }

  static async sendAudio(number: string, fileUrl: string) {
    return this.sendMedia({
      number,
      type: 'audio',
      file: fileUrl,
    })
  }

  static async sendDocument(number: string, fileUrl: string, caption?: string) {
    return this.sendMedia({
      number,
      type: 'document',
      file: fileUrl,
      text: caption,
    })
  }

  static async sendVideo(number: string, fileUrl: string, caption?: string) {
    return this.sendMedia({
      number,
      type: 'video',
      file: fileUrl,
      text: caption,
    })
  }
}
