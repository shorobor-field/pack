"use client"
import React, { useState, useEffect } from 'react'
import { formatDistance, format, isAfter, sub } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { Layout, MessageSquare, FileText, Brain, Link as LinkIcon, ChevronUp, ChevronDown, Send, Palette } from 'lucide-react'
import remarkGfm from 'remark-gfm'

//hidebar
import './globals.css' // Add this to import custom CSS

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
  sources: LinkIcon
}

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

  const handleSelect = (user: User) => {
    onSelect(user);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${theme.bg} transition-colors duration-200`}>
      <div className={`w-80 ${theme.rounded} ${theme.nav} ${theme.cardShadow} p-8`}>
        <h2 className={`mb-6 text-center font-mono ${theme.text}`}>who are you?</h2>
        <div className="grid grid-cols-2 gap-4">
          {users.map(user => (
            <button
              key={user.name}
              onClick={() => handleSelect(user)}
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

function Post({ content, user, system, rotation = 0, timestamp, readers = [], theme }: Omit<Post, 'id'> & { 
  theme: typeof themes[keyof typeof themes] 
}) {
  const formattedContent = content
  const style = theme.rotate ? { transform: `rotate(${rotation}deg)` } : {}
  
  return (
    <div style={style}>
      <div className={`relative border ${theme.border} ${system ? theme.systemCard : theme.card} 
        ${theme.cardShadow} ${theme.rounded} p-6 transition-colors duration-200`}>
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
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ ul: (props) => <ul className="list-disc pl-5" {...props} />, ol: (props) => <ol className="list-decimal pl-5" {...props} /> }}>{formattedContent}</ReactMarkdown>
        </div>
        {readers.length > 0 && (
          <div className={`mt-4 text-xs ${theme.textMuted} font-mono`}>
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

  return (
    <div className={`${theme.card} ${theme.rounded} ${theme.cardShadow} border ${theme.border} 
      p-4 transition-colors duration-200`}>
      <div className={`prose prose-sm w-full font-mono ${theme.text}`}>
        <div className="min-h-[5rem]">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="what's on your mind?"
            className={`w-full resize-none ${theme.textArea} font-mono ${theme.text} 
              placeholder-gray-500 focus:outline-none`}
            rows={3}
          />
        </div>
    
      </div>
      <div className="mt-2 flex justify-end">
        <button 
          onClick={handleSubmit}
          className={`${theme.rounded} ${theme.accent} p-2 ${theme.text} transition-all hover:scale-110`}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTag, setActiveTag] = useState('timeline')
  const [unreadTags, setUnreadTags] = useState<Set<string>>(new Set())
  const [rotations, setRotations] = useState<Record<string, number>>({})
  const [isNavExpanded, setIsNavExpanded] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pack-theme')
      return (saved as keyof typeof themes) || 'corpo-light'
    }
    return 'corpo-light'
  })

  const theme = themes[currentTheme]
  const tags = Object.keys(channelIcons)

  const cycleTheme = () => {
    setCurrentTheme(current => {
      const themeOrder: (keyof typeof themes)[] = ['playful-light', 'playful-dark', 'corpo-light', 'corpo-dark']
      const currentIndex = themeOrder.indexOf(current)
      return themeOrder[(currentIndex + 1) % themeOrder.length]
    })
  }

  const generateRotations = (postIds: string[]) => {
    if (!theme.rotate) return
    const newRotations: Record<string, number> = {}
    postIds.forEach(id => {
      const range = Math.floor(Math.random() * 3)
      let rotation
      switch(range) {
        case 0:
          rotation = (Math.random() - 0.5) * 1
          break
        case 1:
          rotation = (Math.random() - 0.5) * 1.6
          break
        default:
          rotation = (Math.random() - 0.5) * 2
      }
      newRotations[id] = rotation
    })
    setRotations(newRotations)
  }

  const handleTagChange = (tag: string) => {
    setActiveTag(tag)
    setIsNavExpanded(false)
    const filteredPosts = posts.filter(p => p.tags.includes(tag))
    generateRotations(['pinned', ...filteredPosts.map(p => p.id)])
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100)
  }

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('https://pack-api.raiyanrahmanxx.workers.dev/posts')
      const data = await res.json() as Post[]
      setPosts(data)
      
      const lastRead = localStorage.getItem(`lastRead_${activeTag}`)
      if (lastRead) {
        const hasUnread = data.some(post => 
          post.tags.includes(activeTag) && 
          new Date(post.timestamp) > new Date(lastRead)
        )
        if (hasUnread) {
          setUnreadTags(prev => new Set([...prev, activeTag]))
        }
      }
      
      // Autoscroll after initial posts load
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100)
    }

    fetchPosts()
    const interval = setInterval(fetchPosts, 30000)
    return () => clearInterval(interval)
  }, [activeTag])

  useEffect(() => {
    localStorage.setItem(`lastRead_${activeTag}`, new Date().toISOString())
    setUnreadTags(prev => {
      const next = new Set(prev)
      next.delete(activeTag)
      return next
    })
  }, [activeTag])

  useEffect(() => {
    localStorage.setItem('pack-theme', currentTheme)
  }, [currentTheme])


  const createPost = async (content: string) => {
    if (!user) return

    const post = {
      content,
      user: user.name,
      tags: [activeTag],
      timestamp: new Date().toISOString()
    }

    try {
      const res = await fetch('https://pack-api.raiyanrahmanxx.workers.dev/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      })

      if (!res.ok) throw new Error('Failed to create post')
    
      const data = await res.json()
      setPosts(prev => [data, ...prev])
    
      if (theme.rotate) {
        setRotations(prev => ({
          ...prev,
          [data.id]: (Math.random() - 0.5) * 2
        }))
      }

      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    } catch (err) {
      console.error('Error creating post:', err)
    }
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })

  if (!user) return <NameSelector onSelect={setUser} theme={theme} />

  const pinnedPost = pinnedPosts[activeTag]
  const filteredPosts = posts.filter(post => post.tags.includes(activeTag))

  return (
    <div className={`min-h-screen ${theme.bg} font-mono ${theme.text} transition-colors duration-200`}>
      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="mb-6 flex items-center justify-between"><div className={`flex-grow ${theme.nav} ${theme.rounded} ${theme.navShadow} overflow-hidden transition-all duration-200`} style={{ maxHeight: isNavExpanded ? '300px' : '48px' }}><div className={`flex items-center justify-between p-3 cursor-pointer ${theme.border} border-b border-dashed`} onClick={() => setIsNavExpanded(!isNavExpanded)}><div className="flex items-center space-x-2">{React.createElement(channelIcons[activeTag], { size: 14, className: 'mr-2' })}<span className={theme.text}>{activeTag}</span></div><ChevronDown size={14} className={`transform transition-transform duration-200 ${isNavExpanded ? 'rotate-180' : ''}`} /></div><div className="divide-y divide-dashed">{tags.map(tag => (<div key={tag} className={`p-3 cursor-pointer ${tag === activeTag ? `${theme.accent} ${theme.text}` : theme.textMuted}`} onClick={() => handleTagChange(tag)}><div className="flex items-center space-x-2">{React.createElement(channelIcons[tag], { size: 14 })}<span>{tag}</span>{unreadTags.has(tag) && (<div className="h-2 w-2 rounded-full bg-red-500" />)}</div></div>))}</div></div><div className="flex items-center space-x-2 ml-4"><button onClick={cycleTheme} className={`${theme.rounded} p-2 ${theme.textMuted} transition-all hover:scale-110 ${theme.accentHover}`}><Palette size={20} /></button><button onClick={scrollToBottom} className={`${theme.rounded} p-2 ${theme.textMuted} transition-all hover:scale-110 ${theme.accentHover}`}><ChevronDown size={20} /></button></div></div>
        
        <div className="grid gap-6">
          {pinnedPost && (
            <Post {...pinnedPost} rotation={rotations['pinned'] || 0} theme={theme} />
          )}

          {filteredPosts
            .slice()
            .reverse()
            .map(post => (
              <Post key={post.id} {...post} rotation={rotations[post.id] || 0} theme={theme} />
            ))}

          <NewPostEditor onSubmit={createPost} theme={theme} />
          
          <div className="flex justify-end">
            <button 
              onClick={scrollToTop}
              className={`${theme.rounded} p-2 ${theme.textMuted} transition-all hover:scale-110 ${theme.accentHover}`}
            >
              <ChevronUp size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}