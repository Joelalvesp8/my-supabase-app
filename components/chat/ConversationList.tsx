'use client'

import { Conversation, Message } from '@/lib/types/database'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ConversationWithLastMessage extends Conversation {
  lastMessage?: Message
}

interface ConversationListProps {
  conversations: ConversationWithLastMessage[]
  selectedId?: string
  onSelectConversation: (conversation: Conversation) => void
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-gray-100 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">Conversas</h1>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <input
          type="text"
          placeholder="Buscar conversa..."
          className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg
              className="w-16 h-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p>Nenhuma conversa ainda</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.id === selectedId}
              onClick={() => onSelectConversation(conversation)}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface ConversationItemProps {
  conversation: ConversationWithLastMessage
  isSelected: boolean
  onClick: () => void
}

function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  const displayName = conversation.contact?.name || conversation.contact?.number || 'Desconhecido'
  const lastMessageTime = conversation.contact?.last_message_at
    ? formatDistanceToNow(new Date(conversation.contact.last_message_at), {
        addSuffix: false,
        locale: ptBR,
      })
    : ''

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center p-4 cursor-pointer border-b border-gray-100
        hover:bg-gray-50 transition-colors
        ${isSelected ? 'bg-gray-100' : ''}
      `}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mr-3">
        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold text-lg">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {displayName}
          </h3>
          {lastMessageTime && (
            <span className="text-xs text-gray-500 ml-2">{lastMessageTime}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate">
            {conversation.lastMessage?.text || 'Nova conversa'}
          </p>

          {conversation.status === 'open' && (
            <span className="flex-shrink-0 ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </div>
      </div>
    </div>
  )
}
