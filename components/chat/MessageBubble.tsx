'use client'

import { Message } from '@/lib/types/database'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === 'outbound'
  const time = format(new Date(message.created_at), 'HH:mm', { locale: ptBR })

  return (
    <div className={`flex mb-4 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[70%] rounded-lg px-4 py-2 shadow-sm
          ${
            isOutbound
              ? 'bg-green-500 text-white rounded-br-none'
              : 'bg-white text-gray-900 rounded-bl-none'
          }
        `}
      >
        {/* Media */}
        {message.media_url && (
          <div className="mb-2">
            {message.type === 'image' && (
              <img
                src={message.media_url}
                alt="Imagem"
                className="rounded-lg max-w-full h-auto"
              />
            )}
            {message.type === 'audio' && (
              <audio controls className="max-w-full">
                <source src={message.media_url} />
              </audio>
            )}
            {message.type === 'video' && (
              <video controls className="rounded-lg max-w-full">
                <source src={message.media_url} />
              </video>
            )}
            {message.type === 'document' && (
              <a
                href={message.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 ${
                  isOutbound ? 'text-white' : 'text-blue-600'
                } hover:underline`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span>Documento</span>
              </a>
            )}
          </div>
        )}

        {/* Text */}
        {message.text && (
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        )}

        {/* Time and Status */}
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-xs ${
            isOutbound ? 'text-green-100' : 'text-gray-500'
          }`}
        >
          <span>{time}</span>
          {isOutbound && (
            <span>
              {message.status === 'sent' && '✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'read' && <span className="text-blue-400">✓✓</span>}
              {message.status === 'error' && '✗'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
