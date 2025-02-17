"use client"
import { useState, useEffect } from 'react'
import { formatDistance, format, isAfter, sub } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { Layout, MessageSquare, FileText, Brain, Link, Eye, Pencil, ChevronUp, ChevronDown, Send } from 'lucide-react'

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
}

const channelIcons: Record<string, React.ElementType> = {
  timeline: Layout,
  discussion: MessageSquare,
  docs: FileText,
  neurotech: Brain,
  sources: Link
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

function NameSelector({ onSelect }: { onSelect: (user: User) => void }) {
  const users = [
    { name: 'raiyan' },
    { name: 'zarin' },
    { name: 'jeba' },
    { name: 'inan' }
  ]

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#FFE5B4]">
      <div className="w-80 rounded-lg bg-[#FFF4E0] p-8 shadow-xl">
        <h2 className="mb-6 text-center font-mono text-gray-800">who are you?</h2>
        <div className="grid grid-cols-2 gap-4">
          {users.map(user => (
            <button
              key={user.name}
              onClick={() => onSelect(user)}
              className="group flex items-center justify-center space-x-2 rounded-lg border-2 border-[#FFD580] bg-white p-3 text-gray-800 transition-all hover:bg-[#FFEBC1]"
            >
              <span className="font-mono">{user.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Post({ content, user, system, rotation = 0, timestamp }: Omit<Post, 'id'>) {
  const formattedContent = content.split('\n').join('\n\n')
  return (
    <div style={{ transform: `rotate(${rotation}deg)` }}>
      <div className={`relative rounded-lg p-6 shadow-lg ${system ? 'bg-[#FFFACD]' : 'bg-white'}`}>
        {system && (
          <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full bg-red-500" />
        )}
        <div className="mb-4 flex items-center justify-between border-b border-dashed border-[#FFD580] pb-2">
          <div className="text-xs text-gray-600">
            {user}
          </div>
          {!system && (
            <div className="text-xs text-gray-600">
              {formatPostDate(timestamp)}
            </div>
          )}
        </div>
        <div className="prose prose-sm max-w-none font-mono text-gray-800">
          <ReactMarkdown>{formattedContent}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

function NewPostEditor({ onSubmit }: { onSubmit: (content: string) => void }) {
  const [content, setContent] = useState('')
  const [isPreview, setIsPreview] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
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
    <div className="rounded-lg bg-[#FFF4E0] p-4 shadow-lg shadow-[#FFE5B4]">
      <div className="mb-2 flex gap-2">
        <button 
          onClick={() => setIsPreview(false)}
          className={`rounded p-1 transition-all hover:scale-110 ${!isPreview ? 'bg-[#FFD580] text-gray-900' : 'text-gray-500 hover:bg-[#FFEBC1]'}`}
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => setIsPreview(true)}
          className={`rounded p-1 transition-all hover:scale-110 ${isPreview ? 'bg-[#FFD580] text-gray-900' : 'text-gray-500 hover:bg-[#FFEBC1]'}`}
        >
          <Eye size={16} />
        </button>
      </div>
      {isPreview ? (
        <div className="prose prose-sm min-h-[5rem] max-w-none font-mono text-gray-800">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="what's on your mind..."
          className="w-full resize-none bg-transparent font-mono text-gray-800 placeholder-gray-500 focus:outline-none"
          rows={3}
        />
      )}
      <div className="mt-2 flex justify-end">
        <button 
          onClick={handleSubmit}
          className="rounded-lg p-2 text-gray-800 transition-all hover:scale-110 hover:bg-[#FFD580]"
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

  const tags = Object.keys(channelIcons)

  const generateRotations = (postIds: string[]) => {
    const newRotations: Record<string, number> = {}
    postIds.forEach(id => {
      // randomize between 3 ranges: slight (-0.5 to 0.5), medium (-0.8 to 0.8), and full (-1 to 1)
      const range = Math.floor(Math.random() * 3)
      let rotation
      switch(range) {
        case 0:
          rotation = (Math.random() - 0.5) * 1 // -0.5 to 0.5
          break
        case 1:
          rotation = (Math.random() - 0.5) * 1.6 // -0.8 to 0.8
          break
        default:
          rotation = (Math.random() - 0.5) * 2 // -1 to 1
      }
      newRotations[id] = rotation
    })
    setRotations(newRotations)
  }

  const handleTagChange = (tag: string) => {
    setActiveTag(tag)
    generateRotations(['pinned', ...posts.filter(p => p.tags.includes(tag)).map(p => p.id)])
    // scroll to bottom after a brief delay to allow for render
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
    }

    fetchPosts()
    const interval = setInterval(fetchPosts, 30000)
    return () => clearInterval(interval)
  }, []) // removed activeTag dependency

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
      
      // Add rotation for new post
      setRotations(prev => ({
        ...prev,
        [data.id]: Math.random() * 4 - 2
      }))
    } catch (err) {
      console.error('Error creating post:', err)
    }
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })

  if (!user) return <NameSelector onSelect={setUser} />

  const pinnedPost = pinnedPosts[activeTag]
  const filteredPosts = posts.filter(post => post.tags.includes(activeTag))

  return (
    <div className="min-h-screen bg-[#FFE5B4] font-mono text-gray-800">
      <div className="sticky top-0 z-10 mx-auto mb-8 max-w-2xl px-4 pt-4">
        <div className="flex items-center justify-between space-x-4 rounded-lg bg-[#FFF4E0] p-2 shadow-lg shadow-[#FFE5B4]">
          <div className="flex items-center space-x-4">
            {tags.map((tag) => {
              const Icon = channelIcons[tag]
              return (
                <button
                  key={tag}
                  onClick={() => handleTagChange(tag)}
                  className={`relative flex items-center rounded-lg p-2 transition-all hover:scale-110 ${
                    activeTag === tag ? 'bg-[#FFD580] text-gray-900' : 'text-gray-600 hover:bg-[#FFEBC1]'
                  }`}
                >
                  <Icon size={20} />
                  {unreadTags.has(tag) && (
                    <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </button>
              )
            })}
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={scrollToTop}
              className="rounded-lg p-2 text-gray-600 transition-all hover:scale-110 hover:bg-[#FFEBC1]"
            >
              <ChevronUp size={20} />
            </button>
            <button 
              onClick={scrollToBottom}
              className="rounded-lg p-2 text-gray-600 transition-all hover:scale-110 hover:bg-[#FFEBC1]"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-2xl px-4 pb-16">
        <div className="grid gap-6">
          {pinnedPost && (
            <Post {...pinnedPost} rotation={rotations['pinned'] || 0} />
          )}

          {filteredPosts
            .slice()
            .reverse()
            .map(post => (
              <Post key={post.id} {...post} rotation={rotations[post.id] || 0} />
            ))}

          <NewPostEditor onSubmit={createPost} />
        </div>
      </div>
    </div>
  )
}