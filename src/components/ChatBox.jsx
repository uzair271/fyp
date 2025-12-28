import { useState, useRef, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import Button from './Button'

const ChatBox = ({
  requestID,
  userID,
  className = '',
}) => {
  const { chatMessages, addChatMessage, authState } = useApp()
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Filter messages for this request
  const filteredMessages = useMemo(() => {
    if (!requestID) return []
    return chatMessages.filter(
      (msg) => msg.requestId === requestID || msg.requestID === requestID
    )
  }, [chatMessages, requestID])

  // Determine if message is from current user
  const isMessageFromMe = (msg) => {
    return msg.senderId === userID || 
           msg.senderID === userID || 
           msg.senderId === authState.user?.id ||
           msg.senderID === authState.user?.id ||
           msg.isMe === true
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [filteredMessages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }
  }

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    // If less than 1 minute ago
    if (diff < 60000) {
      return 'Just now'
    }

    // If today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    }

    // If yesterday
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}`
    }

    // Otherwise show date and time
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Handle sending messages
  const handleSendMessage = async (e) => {
    e?.preventDefault()

    if (!message.trim() || isSending) return

    const messageText = message.trim()
    setMessage('')
    setIsSending(true)

    try {
      // Create new message object
      const newMessage = {
        requestId: requestID,
        requestID: requestID, // Support both formats
        senderId: userID || authState.user?.id,
        senderID: userID || authState.user?.id, // Support both formats
        senderName: authState.user?.name || 'You',
        message: messageText,
        timestamp: new Date().toISOString(),
        isMe: true,
      }

      // Add message to global state
      addChatMessage(newMessage)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300))
    } catch (error) {
      console.error('Error sending message:', error)
      // Restore message on error
      setMessage(messageText)
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div
      className={`
        flex flex-col
        bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20
        h-[500px] md:h-[600px] lg:h-[700px]
        overflow-hidden
        ${className}
      `}
      role="region"
      aria-label={`Chat for request ${requestID}`}
    >
      {/* Chat Header */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Chat - Request {requestID || 'N/A'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-label="Online" />
            <span className="text-xs text-gray-600 hidden sm:inline">Online</span>
          </div>
        </div>
      </div>

      {/* Scrollable Message Display Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 bg-gradient-to-b from-gray-50 to-white"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
        style={{
          scrollBehavior: 'smooth',
        }}
      >
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-4 p-4 bg-indigo-100 rounded-full">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-sm md:text-base font-medium">
              No messages yet
            </p>
            <p className="text-gray-400 text-xs md:text-sm mt-1">
              Start the conversation!
            </p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const isMe = isMessageFromMe(msg)
            const showAvatar = index === 0 || 
              filteredMessages[index - 1]?.senderId !== msg.senderId ||
              filteredMessages[index - 1]?.senderID !== msg.senderID

            return (
              <div
                key={msg.id || index}
                className={`
                  flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2
                  animate-in fade-in slide-in-from-bottom-2 duration-300
                  ${showAvatar ? 'mt-4' : 'mt-1'}
                `}
              >
                {/* Avatar for received messages */}
                {!isMe && (
                  <div
                    className={`
                      flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full
                      bg-gradient-to-br from-indigo-400 to-purple-500
                      flex items-center justify-center text-white font-bold text-sm md:text-base
                      shadow-md
                      ${showAvatar ? 'opacity-100' : 'opacity-0'}
                    `}
                    aria-label={`Avatar for ${msg.senderName || 'User'}`}
                  >
                    {(msg.senderName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}

                <div
                  className={`
                    max-w-[75%] md:max-w-[65%] lg:max-w-[55%]
                    ${isMe ? 'order-2' : 'order-1'}
                  `}
                >
                  {/* Sender Name */}
                  {!isMe && showAvatar && (
                    <p 
                      className="text-xs font-semibold text-gray-700 mb-1 px-2" 
                      aria-label={`Message from ${msg.senderName || 'User'}`}
                    >
                      {msg.senderName || 'User'}
                    </p>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`
                      rounded-2xl px-4 py-2.5 md:px-5 md:py-3
                      shadow-lg
                      transition-all duration-200 ease-in-out
                      transform hover:scale-[1.02]
                      ${
                        isMe
                          ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                      }
                    `}
                    role="article"
                    aria-label={`Message ${isMe ? 'from you' : `from ${msg.senderName || 'User'}`}`}
                  >
                    <p className="text-sm md:text-base break-words whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <p
                    className={`
                      text-xs text-gray-500 mt-1 px-2
                      ${isMe ? 'text-right' : 'text-left'}
                    `}
                    aria-label={`Sent at ${formatTime(msg.timestamp)}`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>

                {/* Avatar for sent messages */}
                {isMe && (
                  <div
                    className={`
                      flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full
                      bg-gradient-to-br from-green-400 to-emerald-500
                      flex items-center justify-center text-white font-bold text-sm md:text-base
                      shadow-md
                      ${showAvatar ? 'opacity-100' : 'opacity-0'}
                    `}
                    aria-label="Your avatar"
                  >
                    {(authState.user?.name || 'Y').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 md:px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="
                w-full px-4 py-2.5 md:py-3 rounded-xl border-2 border-gray-300
                text-sm md:text-base
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                hover:border-indigo-400
                transition-all duration-200 ease-in-out
                bg-white shadow-sm
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              aria-label="Type your message"
              aria-describedby="send-button"
              disabled={isSending || !requestID}
            />
            {message.trim() && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded">
                  Enter
                </kbd>
              </div>
            )}
          </div>
          <Button
            id="send-button"
            label={isSending ? 'Sending...' : 'Send'}
            onClick={handleSendMessage}
            loading={isSending}
            type="primary"
            className="px-4 md:px-6 min-w-[100px]"
            ariaLabel="Send message"
            disabled={!message.trim() || isSending || !requestID}
          />
        </form>
        {!requestID && (
          <p className="text-xs text-red-500 mt-2 text-center">
            Request ID is required to send messages
          </p>
        )}
      </div>
    </div>
  )
}

export default ChatBox
