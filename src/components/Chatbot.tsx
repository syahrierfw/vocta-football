// src/components/Chatbot.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Send } from 'lucide-react'
import Image from 'next/image'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

type VoctaChatbotProps = {
  /** If provided, the chat open state becomes controlled by the parent */
  isOpen?: boolean
  /** Called when user clicks the close button */
  onClose?: () => void
}

const MAX_HISTORY = 12

const quickReplies = [
  { label: 'What are the jersey conditions?', key: 'conditions' },
  { label: 'What is your return policy?', key: 'returns' },
  { label: 'Do you ship to my city?', key: 'shipping' },
  { label: 'Tell me about Player Issue jerseys', key: 'player_issue' },
] as const

function getCurrentTime() {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function TypingDots() {
  return (
    <div className="flex space-x-1 px-2 py-1">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0s]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
    </div>
  )
}

// 1) helper to push greeting once
function makeGreeting() {
  return (
    <span>
      Hi there! I&apos;m <span className="font-semibold text-red-600">Paolo</span>, your Jersey
      Specialist. How can I help you today?
    </span>
  );
}

export default function VoctaChatbot({ isOpen, onClose }: VoctaChatbotProps) {
  // If parent provides isOpen, we mirror it; otherwise we manage our own.
  const [open, setOpen] = useState<boolean>(isOpen ?? false)
  useEffect(() => {
    if (typeof isOpen === 'boolean') setOpen(isOpen)
  }, [isOpen])

  const [messages, setMessages] = useState<
    { from: 'user' | 'agent'; text: string | React.ReactNode; time: string }[]
  >([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showInitialSuggestions, setShowInitialSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ from: 'agent', text: makeGreeting(), time: getCurrentTime() }]);
      setShowInitialSuggestions(true);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    if (onClose) onClose()
    else setOpen(false)
  }

  const handleSend = async (text?: string) => {
    const userMessage = text || input.trim()
    if (!userMessage) return

    // Build compact history (skip ReactNode greeting)
    const history = messages
      .filter((m) => typeof m.text === 'string' && (m.text as string).trim().length > 0)
      .slice(-MAX_HISTORY)
      .map((m) => ({
        role: m.from === 'user' ? 'user' : 'assistant',
        content: m.text as string,
      }))

    // Optimistic user message
    setMessages((prev) => [...prev, { from: 'user', text: userMessage, time: getCurrentTime() }])
    setInput('')
    setIsTyping(true)

    const payload = {
      message: userMessage,
      messages: [...history, { role: 'user', content: userMessage }],
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let errMsg = `API error (${res.status})`
        try {
          const maybeJson = await res.json()
          if (maybeJson?.message) errMsg = maybeJson.message as string
        } catch {
          const txt = await res.text()
          if (txt) errMsg = txt
        }
        setMessages((prev) => [...prev, { from: 'agent', text: `⚠️ ${errMsg}`, time: getCurrentTime() }])
        setIsTyping(false)
        return
      }

      const data: unknown = await res.json()
      const reply =
        typeof (data as { message?: unknown }).message === 'string'
          ? (data as { message: string }).message
          : "Sorry, I didn’t quite catch that."
      setMessages((prev) => [...prev, { from: 'agent', text: reply, time: getCurrentTime() }])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setMessages((prev) => [...prev, { from: 'agent', text: `⚠️ Network error: ${msg}`, time: getCurrentTime() }])
    } finally {
      setIsTyping(false)
    }
  }

  // Open button: show greeting on first open
  const openWithGreeting = () => {
    setOpen(true)
    if (messages.length === 0) {
      const greeting = (
        <span>
          Hi there! I&apos;m <span className="font-semibold text-red-600">Paolo</span>, your Jersey
          Specialist. How can I help you today?
        </span>
      )
      setMessages([{ from: 'agent', text: greeting, time: getCurrentTime() }])
      setShowInitialSuggestions(true)
    }
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 text-sm ${poppins.className}`}>
      {!open ? (
        <button
          onClick={openWithGreeting}
          className="rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
        >
          <Image src="/images/paolo-avatar.png" alt="Paolo" width={80} height={80} className="rounded-full object-contain" />
        </button>
      ) : (
        <div className="w-[22rem] h-[520px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden border">
          <div className="bg-black text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/paolo-avatar.png" alt="Paolo Icon" className="rounded-full bg-white" width={40} height={40} priority />
              <div>
                <div className="text-sm font-bold">Paolo</div>
                <div className="text-xs opacity-80 font-semibold">VOCTA&apos;s Jersey Specialist</div>
              </div>
            </div>
            <button onClick={handleClose}>
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Greeting + Quick Replies */}
            {messages.length > 0 && showInitialSuggestions && (
              <div className="flex items-end gap-2 max-w-full">
                <Image src="/images/paolo-avatar.png" className="rounded-full self-end" alt="Paolo" width={30} height={30} />
                <div className="bg-gray-50 border border-gray-200 shadow-md rounded-2xl overflow-hidden w-full">
                  <div className="px-4 pt-3 pb-2">
                    <p className="font-medium text-gray-800">{messages[0].text}</p>
                  </div>
                  <div className="flex flex-col border-t border-gray-200">
                    {quickReplies.map((q) => (
                      <button
                        key={q.key}
                        onClick={() => handleSend(q.label)}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 font-medium text-sm border-b border-gray-200 last:border-b-0"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* History */}
            {messages.map(
              (msg, i) =>
                i > 0 && (
                  <div key={i} className={`flex flex-col ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`flex ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[85%]`}>
                      {msg.from === 'agent' && (
                        <Image src="/images/paolo-avatar.png" className="rounded-full self-end" alt="Paolo" width={30} height={30} />
                      )}
                      <div
                        className={`px-4 py-2 text-sm rounded-2xl shadow-md border break-words ${
                          msg.from === 'user'
                            ? 'bg-red-100 text-red-800 border-red-200 rounded-br-none'
                            : 'bg-gray-50 text-gray-800 border-gray-200 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                    <span className={`text-[11px] text-gray-400 mt-1 ${msg.from === 'user' ? 'mr-1' : 'ml-10'}`}>{msg.time}</span>
                  </div>
                )
            )}

            {isTyping && (
              <div className="flex items-end gap-2 max-w-[85%]">
                <Image src="/images/paolo-avatar.png" alt="Paolo" width={30} height={30} className="rounded-full self-end" />
                <div className="bg-gray-50 border border-gray-200 text-gray-800 rounded-2xl px-4 py-2 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-2 border-t bg-white">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 text-gray-600 focus:ring-red-500"
                placeholder="Type your message..."
              />
              <button onClick={() => handleSend()} className="w-10 h-10 bg-black hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors">
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-500 mt-1">
              Powered by <span className="font-semibold">VOCTA Football</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
