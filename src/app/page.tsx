"use client"
import { useState, useEffect, useRef } from 'react'
import { formatDistance, format, isAfter, sub } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { Layout, MessageSquare, FileText, Brain, Link, Palette, Hash, ChevronUp, ChevronDown, Send } from 'lucide-react'

type User = {
  name: string
}

type Post = {
  id: string
  tags: string[]
  content: string
  user: string
  timestamp: string
  rotation?: number
  system?: boolean
  readers?: string[]
}

const themes = {
  'playful-light': {
    bg: 'bg-[#FFE5B4]',
    nav: 'bg-[#FFF4E0]',
    navShadow: 'shadow-lg shadow-[#FFE5B4]/60',
    card: 'bg-white',
    systemCard: 'bg-[#FFFACD]',
    cardShadow: 'shadow-lg',
    accent: 'bg-[#FFD580]',
    accentHover: 'hover:bg-[#FFEBC1]',
    border: 'border-[#FFD580]',
    text: 'text-gray-800',
    textMuted: 'text-gray-600',
    rounded: 'rounded-lg',
    textArea: 'bg-transparent',
    rotate: true
  },
  'playful-dark': {
    bg: 'bg-[#1e1e2e]',
    nav: 'bg-[#181825]',
    navShadow: 'shadow-lg shadow-black/40',
    card: 'bg-[#181825]',
    systemCard: 'bg-[#11111b]',
    cardShadow: 'shadow-lg shadow-black/20',
    accent: 'bg-[#cba6f7]',
    accentHover: 'hover:bg-[#f5c2e7]',
    border: 'border-[#313244]',
    text: 'text-[#cdd6f4]',
    textMuted: 'text-[#9399b2]',
    rounded: 'rounded-lg',
    textArea: 'bg-transparent',
    rotate: true
  },
  'corpo-light': {
    bg: 'bg-gray-50',
    nav: 'bg-white',
    navShadow: 'shadow-lg shadow-gray-200/60',
    card: 'bg-white',
    systemCard: 'bg-white',
    cardShadow: 'shadow-sm',
    accent: 'bg-gray-100',
    accentHover: 'hover:bg-gray-100',
    border: 'border-gray-200',
    text: 'text-gray-800',
    textMuted: 'text-gray-600',
    rounded: '',
    textArea: 'bg-transparent',
    rotate: false
  },
  'corpo-dark': {
    bg: 'bg-[#1F1F1F]',
    nav: 'bg-[#2A2A2A]',
    navShadow: 'shadow-lg shadow-black/40',
    card: 'bg-[#2A2A2A]',
    systemCard: 'bg-[#333333]',
    cardShadow: 'shadow-lg shadow-black/20',
    accent: 'bg-[#3A3A3A]',
    accentHover: 'hover:bg-[#444444]',
    border: 'border-[#404040]',
    text: 'text-gray-200',
    textMuted: 'text-gray-400',
    rounded: '',
    textArea: 'bg-transparent',
    rotate: false
  }
} as const

const channelIcons: Record<string, React.ElementType> = {
  timeline: Layout,
  discussion: MessageSquare,
  docs: FileText,
  neurotech: Brain,
  sources: Link
}

// two

const pinnedPosts: Record<string, Omit<Post, 'id'>> = {
  timeline: {
    content: "everything goes here. this is the main feed.",
    user: "system",
    tags: ["timeline"],
    system: true,
    timestamp: new Date().toISOString()
  },
  discussion: {
    content: "general chat for anything and everything",
    user: "system",
    tags: ["discussion"],
    system: true,
    timestamp: new Date().toISOString()
  },
  docs: {
    content: "documentation and longer form writing lives here",
    user: "system",
    tags: ["docs"],
    system: true,
    timestamp: new Date().toISOString()
  },
  neurotech: {
    content: "discoveries about cognition and productivity",
    user: "system",
    tags: ["neurotech"],
    system: true,
    timestamp: new Date().toISOString()
  },
  sources: {
    content: "interesting links and resources",
    user: "system",
    tags: ["sources"],
    system: true,
    timestamp: new Date().toISOString()
  }
}

function formatPostDate(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  
  if (isAfter(date, sub(now, { hours: 1 }))) {
    return formatDistance(date, now, { addSuffix: true })
      .replace('about ', '')
      .replace('less than a minute ago', 'just now')
  }
  
  if (isAfter(date, sub(now, { days: 1 }))) {
    const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  
  if (isAfter(date, sub(now, { days: 7 }))) {
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  }
  
  return format(date, 'dd-MM-yyyy')
}

function NameSelector({ onSelect, theme }: { 
  onSelect: (user: User) => void
  theme: typeof themes[keyof typeof themes]
}) {
  const users = [
    { name: 'raiyan' },
    { name: 'zarin' },
    { name: 'jeba' },
    { name: 'inan' }
  ]

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${theme.bg}`}>
      <div className={`w-80 ${theme.rounded} ${theme.nav} ${theme.cardShadow} p-8`}>
        <h2 className={`mb-6 text-center font-mono ${theme.text}`}>who are you?</h2>
        <div className="grid grid-cols-2 gap-4">
          {users.map(user => (
            <button
              key={user.name}
              onClick={() => onSelect(user)}
              className={`group flex items-center justify-center space-x-2 ${theme.rounded} 
                border-2 ${theme.border} ${theme.card} p-3 ${theme.text} 
                transition-all ${theme.accentHover}`}
            >
              <span className="font-mono">{user.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// three

function Post({ content, user, system, rotation = 0, timestamp, readers = [], theme }: Omit<Post, 'id'> & { 
  theme: typeof themes[keyof typeof themes] 
}) {
  const [showReaders, setShowReaders] = useState(false)
  const linkRegex = /(https?:\/\/[^\s]+)/g
  const formattedContent = content
    .replace(/\n/g, '  \n')
    .replace(linkRegex, '[$1]($1)')
  
  const style = theme.rotate ? { transform: `rotate(${rotation}deg)` } : {}
  
  return (
    <div style={style}>
      <div className={`relative border ${theme.border} ${system ? theme.systemCard : theme.card} 
        ${theme.cardShadow} ${theme.rounded} p-6 transition-colors duration-200`}
        onMouseEnter={() => setShowReaders(true)}
        onMouseLeave={() => setShowReaders(false)}
      >
        {system && theme.rotate && (
          <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full bg-red-500" />
        )}
        <div className={`mb-4 flex items-center justify-between border-b border-dashed ${theme.border} pb-2`}>
          <div className={`text-xs ${theme.textMuted}`}>
            {user}
          </div>
          {!system && (
            <div className={`text-xs ${theme.textMuted}`}>
              {formatPostDate(timestamp)}
            </div>
          )}
        </div>
        <div className={`prose prose-sm max-w-none font-mono ${theme.text}`}>
          <ReactMarkdown>{formattedContent}</ReactMarkdown>
        </div>
        {showReaders && readers.length > 0 && (
          <div className={`mt-2 font-mono text-xs ${theme.textMuted}`}>
            read by: {readers.join(' ')}
          </div>
        )}
      </div>
    </div>
  )
}

function NewPostEditor({ onSubmit, theme }: { 
  onSubmit: (content: string) => void
  theme: typeof themes[keyof typeof themes]
}) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (!content.trim()) return
    onSubmit(content)
    setContent('')
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [content])

  return (
    <div className={`${theme.card} ${theme.rounded} ${theme.cardShadow} border ${theme.border} p-4`}>
      <div className={`prose prose-sm mb-2 font-mono ${theme.text}`}>
        <ReactMarkdown>{content || '*preview*'}</ReactMarkdown>
      </div>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="what's on your mind..."
        className={`w-full resize-none ${theme.textArea} font-mono ${theme.text} 
          placeholder-gray-500 focus:outline-none`}
        style={{ minHeight: '3rem' }}
      />
    </div>
  )
}