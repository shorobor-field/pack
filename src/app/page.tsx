"use client"
import { useState, useEffect } from 'react'
import { formatDistanceToNow, format, isAfter, sub } from 'date-fns'
import ReactMarkdown from 'react-markdown'

// keeping the existing User and base Post types, adding timestamp
type Post = {
  id: string
  tags: string[]
  content: string
  user: string
  timestamp: string // new
  rotation?: number
  system?: boolean
}

// keep name selector exactly as is, no changes needed there...

// modified post component
function Post({ tags, content, user, system, rotation, timestamp }: Omit<Post, 'id'>) {
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

// main component with new features
export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTag, setActiveTag] = useState('timeline')
  const [newPost, setNewPost] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [unreadTags, setUnreadTags] = useState<Set<string>>(new Set())

  // keep existing tags...

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('https://pack-api.raiyanrahmanxx.workers.dev/posts')
      const data = await res.json()
      setPosts(data)
      
      // check for unreads
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
    const interval = setInterval(fetchPosts, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [activeTag])

  // mark as read when changing tags
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

  // keeping createPost logic but adding timestamp...

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
        {/* rest of the content... */}

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