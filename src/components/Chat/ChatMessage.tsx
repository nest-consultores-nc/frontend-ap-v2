interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === 'user'

  return (
    <div className={`flex w-full mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
    
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#CDEA80] flex items-center justify-center mr-2 mt-1">
          <span className="text-white text-xs">IA</span>
        </div>
      )}

      <div
          className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${

          isUser
            ? 'bg-[#CDEA80] text-white rounded-tr-sm'
            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
        }`}
      >
        {content}
      </div>

      
      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center ml-2 mt-1">
          <span className="text-gray-600 text-xs">Tú</span>
        </div>
      )}
    </div>
  )
}