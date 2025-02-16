"use client"
import { Pin } from 'lucide-react'
import { useState, useEffect } from 'react'

type User = {
  name: string
  emoji: string
}

type Post = {
  id: string
  tags: string[]
  content: string
  user: string
  pinned?: boolean
}

const channelEmojis = {
  timeline: '⏳',
  discussion: '🗣️',
  docs: '📋',
  neurotech: '🔬',
  sources: '🗃️'
}

const pinnedPosts = {
  timeline: {
    content: "everything goes here. this is the main feed.",
    user: "system",
    tags: ["timeline"],
    pinned: true
  },
  discussion: {
    content: "general chat for anything and everything",
    user: "system",
    tags: ["discussion"],
    pinned: true
  },
  docs: {
    content: "documentation and longer form writing lives here",
    user: "system",
    tags: ["docs"],
    pinned: true
  },
  neurotech: {
    content: "discoveries about cognition and productivity",
    user: "system",
    tags: ["neurotech"],
    pinned: true
  },
  sources: {
    content: "interesting links and resources",
    user: "system",
    tags: ["sources"],
    pinned: true
  }
}

function NameSelector({ onSelect }: { onSelect: (user: User) => void }) {
  const users = [
    { name: 'raiyan', emoji: '🦊' },
    { name: 'zarin', emoji: '🦋' },
    { name: 'jeba', emoji: '🌸' },
    { name: 'inan', emoji: '🌠' }
  ]

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="w-80 rounded-lg bg-gray-100 p-8 shadow-xl">
        <h2 className="mb-6 text-center font-mono text-gray-800">who are you?</h2>
        <div className="grid grid-cols-2 gap-4">
          {users.map(user => (
            <button
              key={user.name}
              onClick={() => onSelect(user)}
              className="group flex items-center justify-center space-x-2 rounded-lg border-2 border-gray-300 bg-white p-3 text-gray-800 transition-all hover:bg-gray-100"
            >
              <span className="text-xl mr-2">{user.emoji}</span>
              <span className="font-mono">{user.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Post({ tags, content, user, pinned, firstInChannel }: Omit<Post, 'id'> & { firstInChannel?: boolean }) {
  return (
    <div>
      <div className="relative rounded-lg bg-white p-6 shadow-lg">
        {firstInChannel && (
          <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full bg-red-500" />
        )}
        {pinned && (
          <div className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5">
            <Pin size={12} className="text-white" />
          </div>
        )}
        <div className="mb-4 border-b border-dashed border-gray-300 pb-2 flex justify-between items-center">
          <div className="flex items-center text-xs text-gray-600">
            <span className="mr-1">{channelEmojis[tags[0] as keyof typeof channelEmojis]}</span>
            {tags[0]}
          </div>
          <div className="text-xs text-gray-600 flex items-center">
            {user}
          </div>
        </div>
        <p className="font-mono text-gray-800">{content}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTag, setActiveTag] = useState('timeline')
  const [newPost, setNewPost] = useState('')

  const tags = {
    timeline: '⏳',
    discussion: '🗣️',
    docs: '📋',
    neurotech: '🔬',
    sources: '🗃️'
  }

  useEffect(() => {
    fetch('https://pack-api.raiyanrahmanxx.workers.dev/posts')
      .then(res => res.json())
      .then(setPosts)
  }, [])

  const createPost = async () => {
    if (!newPost.trim() || !user) return

    if (newPost.trim() === 'DELETEALLDELETEALL') {
      setPosts(posts.filter(post => Object.values(pinnedPosts).some(p => p.content === post.content)))
      setNewPost('')
      return
    }

    const post = {
      content: newPost,
      user: user.name,
      tags: [activeTag]
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

  const pinnedPost = pinnedPosts[activeTag as keyof typeof pinnedPosts]
  const channelPosts = posts.filter(post => post.tags.includes(activeTag))

  return (
    <div className="min-h-screen bg-gray-50 font-mono text-gray-800">
      <div className="fixed left-4 top-4 flex flex-col space-y-2 rounded-lg bg-white p-2 shadow-lg">
        {Object.entries(tags).map(([tag, emoji]) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`flex items-center p-2 text-sm transition-all ${
              activeTag === tag ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100'
            }`}
          >
            <span className="mr-2">{emoji}</span>
            {tag}
          </button>
        ))}
      </div>
      
      <div className="max-w-2xl mx-auto p-8 relative">
        <div className="grid gap-6">
          {pinnedPost && (
            <Post {...pinnedPost} firstInChannel />
          )}

          {channelPosts.map((post, index) => (
            <Post 
              key={post.id} 
              {...post} 
              firstInChannel={index === 0} 
            />
          ))}
        </div>

        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="rounded-lg bg-transparent p-4 shadow-lg">
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="what's on your mind..."
              className="w-full resize-none bg-transparent font-mono text-gray-800 placeholder-gray-500 focus:outline-none border-b border-gray-300"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <button 
                onClick={createPost}
                className="rounded-lg bg-gray-200 px-4 py-1 text-sm text-gray-800 hover:bg-gray-300"
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