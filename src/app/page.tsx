"use client"
import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow, format, isAfter, sub } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { Layout, MessageSquare, FileText, Brain, Link, Eye, Pencil } from 'lucide-react'

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

const createRotation = () => (Math.random() * 4 - 2)

const pinnedPosts: Record<string, Omit<Post, 'id'>> = {
  timeline: {
    content: "everything goes here. this is the main feed.",
    user: "system",
    tags: ["timeline"],
    system: true,
    rotation: createRotation(),
    timestamp: new Date().toISOString()
  },
  discussion: {
    content: "general chat for anything and everything",
    user: "system",
    tags: ["discussion"],
    system: true,
    rotation: createRotation(),
    timestamp: new Date().toISOString()
  },
  docs: {
    content: "documentation and longer form writing lives here",
    user: "system",
    tags: ["docs"],
    system: true,
    rotation: createRotation(),
    timestamp: new Date().toISOString()
  },
  neurotech: {
    content: "discoveries about cognition and productivity",
    user: "system",
    tags: ["neurotech"],
    system: true,
    rotation: createRotation(),
    timestamp: new Date().toISOString()
  },
  sources: {
    content: "interesting links and resources",
    user: "system",
    tags: ["sources"],
    system: true,
    rotation: createRotation(),
    timestamp: new Date().toISOString()
  }
}

const tagIcons = {
  timeline: Layout,
  discussion: MessageSquare,
  docs: FileText,
  neurotech: Brain,
  sources: Link
}

function formatPostDate(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays >= 7) {
    return format(date, 'dd-MM-yyyy')
  }
  
  if (diffInDays >= 1) {
    return `${diffInDays} days ago`
  }
  
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  if (diffInHours >= 1) {
    return `${diffInHours} hours ago`
  }
  
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  return `${diffInMinutes} minutes ago`
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
              className="group flex items-center justify-center space-x-2 rounded-lg border-2 border-[#FFD580] bg-white p-3 text-gray-800 transition-all hover:bg-[#FFF4E0]"
            >
              <span className="font-mono">{user.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Post({ content, user, system, rotation, timestamp }: Omit<Post, 'id'>) {
  return (
    <div style={{ transform: `rotate(${rotation}deg)` }}>
      <div className={`relative rounded-lg p-6 shadow-lg ${system ? 'bg-[#FFFACD]' : 'bg-white'}`}>
        {system && (
          <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full bg-red-500" />
        )}
        <div className="mb-4 border-b border-dashed border-[#FFD580] pb-2 flex justify-between items-center">
          <div className="flex items-center text-xs text-gray-600">
            {user}
          </div>
          <div className="text-xs text-gray-600">
            {formatPostDate(timestamp)}
          </div>
        </div>
        <div className="prose prose-sm max-w-none font-mono text-gray-800">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTag, setActiveTag] = useState('timeline')
  const [newPost, setNewPost] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [unreadTags, setUnreadTags] = useState<Set<string>>(new Set())
  
  const rotationRef = useRef<number>(createRotation())

  const tags = [
    'timeline',
    'discussion',
    'docs',
    'neurotech',
    'sources'
  ]

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        createPost()
        e.preventDefault()
      }
    }
  }

  const createPost = async () => {
    if (!newPost.trim() || !user) return

    const post = {
      content: newPost,
      user: user.name,
      tags: [activeTag],
      rotation: rotationRef.current
    }

    try {
      const res = await fetch('https://pack-api.raiyanrahmanxx.workers.dev/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      })

      if (!res.ok) throw new Error('Failed to create post')
      
      const data = await res.json()
      
      setPosts(prev => [{
        ...data,
        rotation: post.rotation
      }, ...prev])
      
      setNewPost('')
      rotationRef.current = createRotation()
    } catch (err) {
      console.error('Error creating post:', err)
    }
  }

  if (!user) return <NameSelector onSelect={setUser} />

  const pinnedPost = pinnedPosts[activeTag]

  return (
    <div className="min-h-screen bg-[#FFE5B4] font-mono text-gray-800">
      {/* Navigation */}
      <div className="sticky top-0 z-50 mx-auto mb-8 max-w-2xl px-4 pt-4">
        <div className="flex justify-center rounded-lg bg-[#FFF4E0] p-2 shadow-lg">
          {tags.map((tag) => {
            const Icon = tagIcons[tag as keyof typeof tagIcons]
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`relative mx-2 flex items-center rounded-lg p-2 transition-all hover:scale-110 ${
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
      </div>
      
      <div className="mx-auto max-w-2xl p-4">
        <div className="grid gap-6">
          {pinnedPost && (
            <Post {...pinnedPost} />
          )}

          {posts
            .filter(post => post.tags.includes(activeTag))
            .map(post => (
              <Post key={post.id} {...post} />
            ))}
        </div>

        <div className="fixed bottom-4 left-1/2 w-full max-w-2xl -translate-x-1/2 transform px-4">
          <div className="rounded-lg bg-[#FFF4E0] p-4 shadow-lg">
            <div className="mb-2 flex gap-2">
              <button 
                onClick={() => setIsPreview(false)}
                className={`flex items-center text-sm ${!isPreview ? 'text-gray-900' : 'text-gray-500'}`}
              >
                <Pencil size={16} className="mr-1" />
                edit
              </button>
              <button
                onClick={() => setIsPreview(true)}
                className={`flex items-center text-sm ${isPreview ? 'text-gray-900' : 'text-gray-500'}`}
              >
                <Eye size={16} className="mr-1" />
                preview
              </button>
            </div>
            {isPreview ? (
              <div className="prose prose-sm min-h-[5rem] max-w-none font-mono text-gray-800">
                <ReactMarkdown>{newPost}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="what's on your mind..."
                className="w-full resize-none bg-transparent font-mono text-gray-800 placeholder-gray-500 focus:outline-none"
                rows={3}
              />
            )}
            <div className="mt-2 flex justify-end">
              <button 
                onClick={createPost}
                className="rounded-lg bg-[#FFD580] px-4 py-1 text-sm text-gray-800 hover:bg-[#FFEBC1]"
              >
                post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}