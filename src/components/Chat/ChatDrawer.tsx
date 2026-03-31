import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from './ChatMessage'
import { getBaseUrl } from '../../api/auth/index'
import polarisbibot from '../../assets/polarisbi-bot.png'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatDrawerProps {
  token: string
  onClose: () => void
}

export const ChatDrawer = ({ token, onClose }: ChatDrawerProps) => {
  const [messages, setMessages]   = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de análisis de PolarisBI. Puedo ayudarte a interpretar datos de proyectos, ingresos, desembolsos, rentabilidad y dedicaciones. ¿Qué necesitas consultar?',
    },
  ])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const messagesEndRef             = useRef<HTMLDivElement>(null)
  const inputRef                   = useRef<HTMLTextAreaElement>(null)


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMessage: Message = { role: 'user', content: trimmed }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const baseUrl = getBaseUrl()
      const response = await fetch(`${baseUrl}/chat-api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
   
          messages: updatedMessages.slice(1).map(m => ({
            role: m.role,
            content: m.content,
          })),
          userMessage: trimmed,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.msg || 'Error al conectar con el asistente')
      }


      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ])
    } catch (err: any) {
      setError(err.message || 'Error inesperado. Intenta nuevamente.')
  
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>

      <div
        className="fixed inset-0 bg-black/30 z-40 sm:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
        <div className="fixed right-0 top-0 h-[100dvh] w-full sm:w-[min(24rem,100vw)] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#CDEA80] text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <img
              src={polarisbibot}
              alt="Asistente IA"
              className="w-16 h-16 object-contain"
            />
            <div>
              <p className="font-semibold text-sm text-black">Asistente PolarisBI</p>
              <p className="text-xs text-black">IA · Solo lectura · Versión Beta</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Cerrar */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-black hover:bg-white/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}

          {/* Indicador de escritura */}
          {loading && (
            <div className="flex justify-start mb-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#CDEA80] flex items-center justify-center mr-2 mt-1">
                <span className="text-white text-xs">IA</span>
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-2 h-2 bg-[#CDEA80] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#CDEA80] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#CDEA80] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mx-1 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
               {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-gray-200 px-3 py-3 bg-gray-50">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu consulta... (Enter para enviar)"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#BDDEFF] focus:border-transparent disabled:opacity-50 bg-white max-h-24 overflow-y-auto"
              style={{ minHeight: '2.625rem' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-10 h-10 bg-[#CDEA80] text-white rounded-xl flex items-center justify-center hover:bg-[#BDDEFF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            Solo lectura · Los datos no pueden modificarse desde aquí
          </p>
        </div>
      </div>
    </>
  )
}