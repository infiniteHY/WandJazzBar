'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface Chat {
  id: string
  name: string
  lastMessage?: string
  updatedAt?: string
}

export default function ChatPage() {
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chat')
      if (response.status === 401) {
        router.push('/')
        return
      }
      if (!response.ok) {
        throw new Error('获取聊天列表失败')
      }
      const data = await response.json()
      setChats(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生错误')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !selectedChat || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: selectedChat, content: message }),
      })

      if (!response.ok) {
        throw new Error('发送消息失败')
      }

      setMessage('')
      // 可以在这里刷新聊天列表
    } catch (err) {
      alert(err instanceof Error ? err.message : '发送失败')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">聊天</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-3 h-[600px]">
            {/* 聊天列表 */}
            <div className="col-span-1 border-r border-gray-200 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  暂无聊天
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedChat === chat.id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">{chat.name}</div>
                      {chat.lastMessage && (
                        <div className="text-sm text-gray-500 truncate">
                          {chat.lastMessage}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 聊天内容 */}
            <div className="col-span-2 flex flex-col">
              {selectedChat ? (
                <>
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="text-center text-gray-500">
                      选择聊天查看消息历史
                    </div>
                  </div>
                  <div className="border-t border-gray-200 p-4">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="输入消息..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !message.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        发送
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  请选择一个聊天
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
