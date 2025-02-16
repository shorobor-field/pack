"use client"
import { useState, useEffect } from 'react'
import { Hash, Pin } from 'lucide-react'

type User = {
  name: string
  emoji: string
}

type Post = {
  id: string
  tags: string[]
  content: string
  user: string
  userEmoji: string
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
    userEmoji: "🤖",
    tags: ["timeline"],
    pinned: true
  },
  discussion: {
    content: "general chat for anything and everything",
    user: "system",
    userEmoji: "🤖",
    tags: ["discussion"],
    pinned: true
  },
  docs: {
    content: "documentation and longer form writing lives here",
    user: "system",
    userEmoji: "🤖",
    tags: ["docs"],
    pinned: true
  },
  neurotech: {
    content: "discoveries about cognition and productivity",
    user: "system",
    userEmoji: "🤖",
    tags: ["neurotech"],
    pinned: true
  },
  sources: {
    content: "interesting links and resources",
    user: "system",
    userEmoji: "🤖",
    tags: ["sources"],
    pinned: true
  }
}

function NameSelector({ onSelect }: { onSelect: (user: User) => void }) {
  const users = [
    { name: 'nosilverv', emoji: '🦊' },
    { name: 'gf', emoji: '🦋' },
    { name: 'friend1', emoji: '🌸' },
    { name: 'friend2', emoji: '🌠' }
  ]

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-base">
      <div className="w-80 rounded-lg bg-mantle p-8 shadow-xl">
        <h2 className="mb-6 text-center font-mono text-text">who are you?</h2>
        <div className="grid grid-cols-2 gap-4">
          {users.map(user => (
            <button
              key={user.name}
              onClick={() => onSelect(user)}
              className="group flex items-center justify-center space-x-2 rounded-lg border-2 border-surface0 bg-base p-3 text-text transition-all hover:bg-surface0"
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

function Post({ tags, content, user, userEmoji, pinned }: Omit<Post, 'id'>) {
  const rotation = Math.random() > 0.5 ? 'rotate-1' : '-rotate-1'
  
  return (
    <div className={`transform ${rotation}`}>
      <div className="relative rounded-lg bg-base p-6 shadow-lg">
        <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full bg-red" />
        {pinned && (
          <div className="absolute -right-2 -top-2 rounded-full bg-red p-1.5">
            <Pin size={12} className="text-base" />
          </div>
        )}
        <div className="mb-4 border-b border-dashed border-surface0 pb-2 flex justify-between items-center">
          <div className="flex items-center text-xs text-subtext0">
            <span className="mr-1">{channelEmojis[tags[0] as keyof typeof channelEmojis]}</span>
            {tags[0]}
          </div>
          <div className="text-xs text-subtext0 flex items-center">
            <span className="mr-1">{userEmoji}</span>
            {user}
          </div>
        </div>
        <p className="font-mono text-text">{content}</p>
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

    const post = {
      content: newPost,
      user: user.name,
      userEmoji: user.emoji,
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

  return (
    <div className="min-h-screen bg-base font-mono text-text">
      <div className="fixed left-4 top-4 flex flex-col space-y-2 rounded-lg bg-mantle p-2 shadow-lg">
        {Object.entries(tags).map(([tag, emoji]) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`flex items-center p-2 text-sm transition-all ${
              activeTag === tag ? 'bg-surface0 text-text' : 'hover:bg-surface0'
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
            <Post {...pinnedPost} />
          )}

          {posts
            .filter(post => post.tags.includes(activeTag))
            .map(post => (
              <Post key={post.id} {...post} />
            ))}
        </div>

        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="rounded-lg bg-mantle p-4 shadow-lg">
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="what's on your mind..."
              className="w-full resize-none bg-base font-mono text-text placeholder-subtext0 focus:outline-none"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <button 
                onClick={createPost}
                className="rounded-lg bg-surface0 px-4 py-1 text-sm text-text hover:bg-surface1"
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