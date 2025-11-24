import { createClient } from '@/lib/supabase/server'

const BUCKET_NAME = 'whatsapp-media'

export class StorageService {
  /**
   * Upload file to Supabase Storage
   */
  static async uploadFile(
    file: File,
    folder: 'images' | 'audios' | 'documents' | 'videos' = 'documents'
  ): Promise<string> {
    const supabase = await createClient()

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const filename = `${folder}/${timestamp}-${randomString}.${extension}`

    // Upload file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return publicUrl
  }

  /**
   * Upload file from buffer (for webhook received media)
   */
  static async uploadFromBuffer(
    buffer: Buffer,
    filename: string,
    contentType: string,
    folder: 'images' | 'audios' | 'documents' | 'videos' = 'documents'
  ): Promise<string> {
    const supabase = await createClient()

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = filename.split('.').pop()
    const uniqueFilename = `${folder}/${timestamp}-${randomString}.${extension}`

    // Upload buffer
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueFilename, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType,
      })

    if (error) {
      throw new Error(`Failed to upload buffer: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return publicUrl
  }

  /**
   * Download media from external URL and upload to Storage
   */
  static async downloadAndUpload(
    externalUrl: string,
    folder: 'images' | 'audios' | 'documents' | 'videos' = 'documents'
  ): Promise<string> {
    try {
      // Download file
      const response = await fetch(externalUrl)
      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      const contentType = response.headers.get('content-type') || 'application/octet-stream'

      // Extract filename from URL or generate one
      const urlParts = externalUrl.split('/')
      const filename = urlParts[urlParts.length - 1] || `file-${Date.now()}`

      // Upload to storage
      return await this.uploadFromBuffer(buffer, filename, contentType, folder)
    } catch (error) {
      console.error('Failed to download and upload:', error)
      throw error
    }
  }

  /**
   * Delete file from storage
   */
  static async deleteFile(filepath: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filepath])

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  }

  /**
   * Get signed URL (for private files)
   */
  static async getSignedUrl(filepath: string, expiresIn: number = 3600): Promise<string> {
    const supabase = await createClient()

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filepath, expiresIn)

    if (error || !data) {
      throw new Error(`Failed to get signed URL: ${error?.message}`)
    }

    return data.signedUrl
  }
}
