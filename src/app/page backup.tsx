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
  pinned?: boolean
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
    { name: 'jeba', emoji: '🤦‍♀️' },
    { name: 'inan', emoji: '🌠' }
  ]

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-amber-50">
      <div className="transform rotate-1">
        <div className="w-72 rounded-lg bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-center font-mono text-black">who are you?</h2>
          <div className="grid grid-cols-2 gap-4">
            {users.map(user => (
              <button
                key={user.name}
                onClick={() => onSelect(user)}
                className="group flex h-16 transform items-center justify-center space-x-2 rounded-lg border-2 border-black bg-white p-3 transition-all hover:-translate-y-0.5 hover:bg-black hover:text-white"
              >
                <span className="text-xl group-hover:scale-110 group-hover:transform group-hover:transition-all">
                  {user.emoji}
                </span>
                <span className="font-mono text-black group-hover:text-white">{user.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Post({ tags, content, user, pinned }: Omit<Post, 'id'>) {
  const rotation = Math.random() > 0.5 ? 'rotate-1' : '-rotate-1'
  
  return (
    <div className={`transform ${rotation}`}>
      <div className="relative rounded-lg bg-white p-6 shadow-lg">
        <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full bg-red-500" />
        {pinned && (
          <div className="absolute -right-2 -top-2 rounded-full bg-black p-1.5">
            <Pin size={12} className="text-white" />
          </div>
        )}
        <div className="mb-4 border-b border-dashed border-gray-300 pb-2">
          {tags.map(tag => (
            <span key={tag} className="mr-2 flex items-center text-xs text-gray-500">
              <Hash size={12} className="mr-1" />
              {tag}
            </span>
          ))}
        </div>
        <p className="font-mono text-black">{content}</p>
        <div className="mt-4 text-xs text-gray-500">@{user}</div>
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
    timeline: 'everything',
    discussion: 'general chat',
    docs: 'documents',
    neurotech: 'discoveries',
    sources: 'resources'
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
    <div className="min-h-screen bg-amber-50 font-mono">
      <div className="fixed left-4 top-4 flex flex-col space-y-2 rounded-lg bg-white p-2 shadow-lg">
        {Object.entries(tags).map(([tag, label]) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`flex items-center p-2 text-sm transition-all ${
              activeTag === tag ? 'bg-black text-white' : 'text-black hover:bg-gray-100'
            }`}
          >
            <Hash size={14} className="mr-1" />
            {label}
          </button>
        ))}
      </div>
      
      <div className="ml-48 p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pinnedPost && (
            <div className="col-span-full">
              <Post {...pinnedPost} />
            </div>
          )}
          
          <div className="col-span-full">
            <div className="transform rotate-1">
              <div className="rounded-lg bg-white p-4 shadow-lg">
                <textarea
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  placeholder="what's on your mind..."
                  className="w-full resize-none bg-transparent font-mono text-gray-600 focus:outline-none"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <button 
                    onClick={createPost}
                    className="rounded-lg bg-black px-4 py-1 text-sm text-white"
                  >
                    post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {posts
            .filter(post => post.tags.includes(activeTag))
            .map(post => (
              <Post key={post.id} {...post} />
            ))}
        </div>
      </div>
    </div>
  )
}