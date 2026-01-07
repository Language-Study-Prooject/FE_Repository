import { createContext, useContext, useState, useCallback } from 'react'

const ChatContext = createContext(null)

export const ChatProvider = ({ children }) => {
  const [activeRoom, setActiveRoom] = useState(null)

  const openChatRoom = useCallback((room) => {
    setActiveRoom(room)
  }, [])

  const closeChatRoom = useCallback(() => {
    setActiveRoom(null)
  }, [])

  return (
    <ChatContext.Provider value={{ activeRoom, openChatRoom, closeChatRoom }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
