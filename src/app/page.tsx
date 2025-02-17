"use client"
import { useState, useEffect } from 'react'
import { formatDistance, format, isAfter, sub } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { Hash, MessageSquare, FileText, Brain, Link as LinkIcon, ChevronUp, ChevronDown, Send } from 'lucide-react'

type User = { name: string }

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

const channelIcons: Record<string, React.ElementType> = {
  timeline: Hash,
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
    return `${hours}h ago`
  }
  
  if (isAfter(date, sub(now, { days: 7 }))) {
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    return `${days}d ago`
  }
  
  return format(date, 'dd-MM-yyyy')
}

// regex to find urls in text
const urlRegex = /(https?:\/\/[^\s]+)/g

// convert urls to markdown links
function linkifyText(text: string): string {
  return text.replace(urlRegex, url => `[${url}](${url})`)
}

function NameSelector({ onSelect }: { onSelect: (user: User) => void }) {
  const users = [
    { name: 'raiyan' },
    { name: 'zarin' },
    { name: 'jeba' },
    { name: 'inan' }
  ]

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-amber-50">
      <div className="w-80 bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center font-mono">who are you?</h2>
        <div className="grid grid-cols-2 gap-4">
          {users.map(user => (
            <button
              key={user.name}
              onClick={() => onSelect(user)}
              className="group flex items-center justify-center space-x-2 border-2 
                border-black bg-white p-3 text-black transition-all 
                hover:-translate-y-0.5 hover:bg-black hover:text-white"
            >
              <span className="font-mono">{user.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Post({ content, user, system, rotation = 0, timestamp, readers = [], currentUser }: 
  Omit<Post, 'id' | 'tags'> & { currentUser: string }) {
  const [isHovered, setIsHovered] = useState(false)
  const style = { transform: `rotate(${rotation}deg)` }
  
  return (
    <div style={style}>
      <div 
        className="relative bg-white p-6 shadow-lg transition-all hover:shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {system && (
          <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 
            transform rounded-full bg-red-500" />
        )}
        <div className="mb-4 flex items-center justify-between border-b border-dashed border-gray-300 pb-2">
          <div className="text-xs text-gray-500">{user}</div>
          {!system && (
            <div className="text-xs text-gray-500">
              {formatPostDate(timestamp)}
            </div>
          )}
        </div>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap font-mono">
          <ReactMarkdown>{linkifyText(content)}</ReactMarkdown>
        </div>
        {isHovered && readers.length > 0 && (
          <div className="mt-2 text-xs text-gray-400">
            read by: {readers.filter(r => r !== currentUser).join(' ')}
          </div>
        )}
      </div>
    </div>
  )
}

function NewPostEditor({ onSubmit }: { onSubmit: (content: string) => void }) {
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
    <div className="bg-white p-4 shadow-lg">
      <div className="mb-2 prose prose-sm max-w-none font-mono">
        <ReactMarkdown>{linkifyText(content)}</ReactMarkdown>
      </div>
      <div className="flex items-end gap-2">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="what's on your mind..."
          className="w-full resize-none bg-transparent font-mono 
            placeholder-gray-500 focus:outline-none"
          rows={3}
        />
        <button 
          onClick={handleSubmit}
          className="shrink-0 bg-black p-2 text-white"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
  
}


// main app 

}

// using the existing theme types defined above
export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTag, setActiveTag] = useState('timeline')
  const [unreadTags, setUnreadTags] = useState<Set<string>>(new Set())
  const [rotations, setRotations] = useState<Record<string, number>>({})
  const [isNavExpanded, setIsNavExpanded] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>('playful-light')

  const theme = themes[currentTheme]
  const tags = Object.keys(channelIcons)

  const generateRotations = (postIds: string[]) => {
    const newRotations: Record<string, number> = {}
    postIds.forEach(id => {
      const rotation = theme.rotate ? (Math.random() - 0.5) * 2 : 0
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

  const cycleTheme = () => {
    setCurrentTheme(current => {
      const themeOrder: (keyof typeof themes)[] = ['playful-light', 'playful-dark', 'corpo-light', 'corpo-dark']
      const currentIndex = themeOrder.indexOf(current)
      return themeOrder[(currentIndex + 1) % themeOrder.length]
    })
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

  const createPost = async (content: string) => {
    if (!user) return

    const post = {
      content,
      user: user.name,
      tags: [activeTag],
      timestamp: new Date().toISOString(),
      readers: [user.name]
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
      setRotations(prev => ({
        ...prev,
        [data.id]: theme.rotate ? (Math.random() - 0.5) * 2 : 0
      }))
    } catch (err) {
      console.error('Error creating post:', err)
    }
  }

  const markAsRead = async (postId: string) => {
    if (!user) return

    try {
      const res = await fetch(`https://pack-api.raiyanrahmanxx.workers.dev/posts/${postId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.name })
      })

      if (!res.ok) throw new Error('Failed to mark as read')
      
      const data = await res.json()
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, readers: data.readers } : p
      ))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })

  if (!user) return <NameSelector onSelect={setUser} theme={theme} />

  const pinnedPost = pinnedPosts[activeTag]
  const filteredPosts = posts.filter(post => post.tags.includes(activeTag))

  return (
    <div className={`min-h-screen ${theme.bg} font-mono transition-colors duration-200`}>
      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="flex items-center gap-2 mb-6">
          <div 
            className={`w-3/4 ${theme.nav} ${theme.cardShadow} ${theme.rounded} overflow-hidden transition-all duration-200 cursor-pointer`}
            style={{ maxHeight: isNavExpanded ? '300px' : '48px' }}
            onClick={() => setIsNavExpanded(!isNavExpanded)}
          >
            <div className={`p-3 border-b border-dashed ${theme.border} flex items-center justify-between`}>
              <div className="flex items-center space-x-2">
                <Hash size={14} className={theme.text} />
                <span className={theme.text}>{activeTag}</span>
              </div>
              <ChevronDown 
                size={14}
                className={`transform transition-transform duration-200 ${isNavExpanded ? 'rotate-180' : ''} ${theme.text}`}
              />
            </div>
            
            <div className={`divide-y divide-dashed ${theme.border}`}>
              {tags.map(tag => (
                <div
                  key={tag}
                  className={`p-3 ${tag === activeTag ? theme.accent : theme.accentHover}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTagChange(tag)
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Hash size={14} />
                    <span>{tag}</span>
                    {unreadTags.has(tag) && (
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={cycleTheme}
            className={`p-3 ${theme.nav} ${theme.cardShadow} ${theme.rounded} ${theme.text} transition-all hover:scale-105`}
          >
            <Palette size={14} />
          </button>

          <button 
            onClick={scrollToTop}
            className={`p-3 ${theme.nav} ${theme.cardShadow} ${theme.rounded} ${theme.text} transition-all hover:scale-105`}
          >
            <ChevronUp size={14} />
          </button>
        </div>

        <div className="space-y-6">
          {pinnedPost && (
            <Post 
              {...pinnedPost} 
              rotation={rotations['pinned'] || 0}
              currentUser={user.name}
              theme={theme}
            />
          )}

          {filteredPosts
            .slice()
            .reverse()
            .map(post => (
              <div 
                key={post.id}
                onClick={() => !post.readers?.includes(user.name) && markAsRead(post.id)}
              >
                <Post 
                  {...post} 
                  rotation={rotations[post.id] || 0}
                  currentUser={user.name}
                  theme={theme}
                />
              </div>
            ))}

          <div className="space-y-2">
            <NewPostEditor onSubmit={createPost} theme={theme} />
            <div className="flex justify-end gap-2">
              <button 
                onClick={scrollToTop}
                className={`${theme.nav} p-2 ${theme.cardShadow} ${theme.rounded} ${theme.text} transition-all hover:scale-105`}
              >
                <ChevronUp size={20} />
              </button>
              <button 
                onClick={scrollToBottom}
                className={`${theme.nav} p-2 ${theme.cardShadow} ${theme.rounded} ${theme.text} transition-all hover:scale-105`}
              >
                <ChevronDown size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}