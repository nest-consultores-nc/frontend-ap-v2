import { useState } from 'react'
import { ChatDrawer } from './ChatDrawer'

interface ChatButtonProps {
  token: string
}

export const ChatButton = ({ token }: ChatButtonProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      
      <button
        onClick={() => setOpen(prev => !prev)}
        title="Asistente IA"
        className={`
          fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50
          w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-200
          ${open
            ? 'bg-gray-700 hover:bg-gray-800 rotate-90'
            : 'bg-[#CDEA80] hover:bg-[#BDDEFF] hover:scale-105'
          }
        `}
      >
        {open ? (
          
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
        
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

   
      {!open && (
        <div className="fixed bottom-6 right-24 z-50 pointer-events-none">
          <div className="bg-gray-800 text-black text-xs px-2.5 py-1.5 rounded-lg opacity-0 hover:opacity-100 whitespace-nowrap">
            Asistente IA
          </div>
        </div>
      )}


      {open && (
        <ChatDrawer
          token={token}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}