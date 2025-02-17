"use client"
import { useState, useEffect } from 'react'
import { formatDistanceToNow, format, isAfter, sub } from 'date-fns'
import ReactMarkdown from 'react-markdown'

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

const pinnedPosts: Record<string, Omit<Post, 'id'>> = {
  timeline: {
    content: "everything goes here. this is the main feed.",
    user: "system",
    tags: ["timeline"],
    system: true,
    rotation: (Math.random() * 4 - 2),
    timestamp: new Date().toISOString()
  },
  discussion: {
    content: "general chat for anything and everything",
    user: "system",
    tags: ["discussion"],
    system: true,
    rotation: (Math.random() * 4 - 2),
    timestamp: new Date().toISOString()
  },
  docs: {
    content: "documentation and longer form writing lives here",
    user: "system",
    tags: ["docs"],
    system: true,
    rotation: (Math.random() * 4 - 2),
    timestamp: new Date().toISOString()
  },
  neurotech: {
    content: "discoveries about cognition and productivity",
    user: "system",
    tags: ["neurotech"],
    system: true,
    rotation: (Math.random() * 4 - 2),
    timestamp: new Date().toISOString()
  },
  sources: {
    content: "interesting links and resources",
    user: "system",
    tags: ["sources"],
    system: true,
    rotation: (Math.random() * 4 - 2),
    timestamp: new Date().toISOString()
  }
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
  const date = new Date(timestamp)
  const isOld = isAfter(date, sub(new Date(), { months: 1 }))
  const displayDate = isOld 
    ? format(date, 'dd-MM-yyyy')
    : formatDistanceToNow(date, { addSuffix: true })

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
            {displayDate}
          </div>
        </div>
        <div className="font-mono text-gray-800">
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
      // add empty tags array to each post since we're not using tags rn
      const postsWithTags = data.map(post => ({ ...post, tags: [] }))
      setPosts(postsWithTags)
      
      // check for unreads based on timestamp only for now
      const lastRead = localStorage.getItem(`lastRead_${activeTag}`)
      if (lastRead) {
        const hasUnread = data.some(post => 
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
      rotation: (Math.random() * 4 - 2),
      timestamp: new Date().toISOString()
    }

    const res = await fetch('https://pack-api.raiyanrahmanxx.workers.dev/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    })

    if (res.ok) {
      setPosts(prev => [{
        ...post,
        id: crypto.randomUUID()
      }, ...prev])
      setNewPost('')
    }
  }

  if (!user) return <NameSelector onSelect={setUser} />

  const pinnedPost = pinnedPosts[activeTag]

  return (
    <div className="min-h-screen bg-[#FFE5B4] font-mono text-gray-800">
      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#FFF4E0] p-2 shadow-lg overflow-x-auto">
        <div className="flex space-x-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`flex items-center p-2 text-sm whitespace-nowrap transition-all ${
                activeTag === tag ? 'bg-[#FFD580] text-gray-900' : 'hover:bg-[#FFEBC1]'
              }`}
            >
              {tag}
              {unreadTags.has(tag) && (
                <div className="ml-1 w-2 h-2 rounded-full bg-red-500"/>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex fixed left-4 top-4 flex-col space-y-2 rounded-lg bg-[#FFF4E0] p-2 shadow-lg">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`flex items-center p-2 text-sm transition-all ${
              activeTag === tag ? 'bg-[#FFD580] text-gray-900' : 'hover:bg-[#FFEBC1]'
            }`}
          >
            <span className="relative">
              {tag}
              {unreadTags.has(tag) && (
                <div className="absolute -right-2 -top-1 w-2 h-2 rounded-full bg-red-500"/>
              )}
            </span>
          </button>
        ))}
      </div>
      
      <div className="max-w-2xl mx-auto p-8 pt-16 md:pt-8 relative">
        <div className="grid gap-6">
          {pinnedPost && (
            <Post {...pinnedPost} />
          )}

          {posts
            .filter(post => !post.system) // for now just show all non-system posts
            .map(post => (
              <Post key={post.id} {...post} />
            ))}
        </div>

        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="rounded-lg bg-[#FFF4E0] p-4 shadow-lg shadow-black/5">
            <div className="flex gap-2 mb-2">
              <button 
                onClick={() => setIsPreview(false)}
                className={`text-sm ${!isPreview ? 'text-gray-900' : 'text-gray-500'}`}
              >
                edit
              </button>
              <button
                onClick={() => setIsPreview(true)}
                className={`text-sm ${isPreview ? 'text-gray-900' : 'text-gray-500'}`}
              >
                preview
              </button>
            </div>
            {isPreview ? (
              <div className="min-h-[5rem] font-mono text-gray-800">
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