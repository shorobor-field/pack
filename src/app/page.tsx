"use client"
import { useState, useEffect } from 'react'

type User = {
  name: string
}

type Post = {
  id: string
  tags: string[]
  content: string
  user: string
  system?: boolean
  rotation: number
}

const generateRotation = () => {
  const angles = [-3, -2, -1, 1, 2, 3];
  return angles[Math.floor(Math.random() * angles.length)];
}

const generateRotation = () => {
  const angles = [-3, -2, -1, 1, 2, 3];
  return angles[Math.floor(Math.random() * angles.length)];
}

const pinnedPosts = {
  timeline: {
    content: "everything goes here. this is the main feed.",
    user: "system",
    tags: ["timeline"],
    system: true,
    rotation: generateRotation()
  },
  discussion: {
    content: "general chat for anything and everything",
    user: "system",
    tags: ["discussion"],
    system: true,
    rotation: generateRotation()
  },
  docs: {
    content: "documentation and longer form writing lives here",
    user: "system",
    tags: ["docs"],
    system: true,
    rotation: generateRotation()
  },
  neurotech: {
    content: "discoveries about cognition and productivity",
    user: "system",
    tags: ["neurotech"],
    system: true,
    rotation: generateRotation()
  },
  sources: {
    content: "interesting links and resources",
    user: "system",
    tags: ["sources"],
    system: true,
    rotation: generateRotation()
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
              <span className="font-mono">{user.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Post({ tags, content, user, system, rotation }: Omit<Post, 'id'>) {
  return (
    <div className={`transform rotate-${rotation}`}>
      <div className={`relative rounded-lg p-6 shadow-lg ${system ? 'bg-[#FFFACD]' : 'bg-white'}`}>
        {system && (
          <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full bg-red-500" />
        )}
        <div className="mb-4 border-b border-dashed border-[#FFD580] pb-2 flex justify-between items-center">
          <div className="flex items-center text-xs text-gray-600">
            {tags[0]}
          </div>
          <div className="text-xs text-gray-600">
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

  const tags = [
    'timeline',
    'discussion',
    'docs',
    'neurotech',
    'sources'
  ]

  useEffect(() => {
    fetch('https://pack-api.raiyanrahmanxx.workers.dev/posts')
      .then(res => res.json())
      .then(fetchedPosts => {
        const postsWithRotation = fetchedPosts.map((post: Omit<Post, 'rotation'>) => ({
          ...post,
          rotation: generateRotation()
        }));
        setPosts(postsWithRotation);
      })
  }, [])

  const createPost = async () => {
    if (!newPost.trim() || !user) return

    const post = {
      content: newPost,
      user: user.name,
      tags: [activeTag],
      rotation: generateRotation()
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
    <div className="min-h-screen bg-[#FFE5B4] font-mono text-gray-800">
      <div className="fixed left-4 top-4 flex flex-col space-y-2 rounded-lg bg-[#FFF4E0] p-2 shadow-lg w-32">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`flex items-center p-2 text-sm transition-all ${
              activeTag === tag ? 'bg-[#FFD580] text-gray-900' : 'hover:bg-[#FFEBC1]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      
      <div className="max-w-3xl mx-auto pl-36 p-8 relative">
        <div className="grid gap-6 max-w-xl mx-auto">
          {pinnedPost && (
            <Post {...pinnedPost} />
          )}

          {posts
            .filter(post => post.tags.includes(activeTag))
            .map(post => (
              <Post key={post.id} {...post} />
            ))}
        </div>

        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-xl px-4 pl-8">
          <div className="rounded-lg bg-[#FFF4E0] p-4 shadow-lg">
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="what's on your mind..."
              className="w-full resize-none bg-transparent font-mono text-gray-800 placeholder-gray-500 focus:outline-none"
              rows={3}
            />
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