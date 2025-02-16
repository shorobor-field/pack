<div className="fixed left-4 top-4 flex flex-col space-y-2 rounded-lg bg-[#FFF4E0] p-2 shadow-lg">
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
        <div className="text-center text-xl font-bold mt-4">
          p{packEmoji}ck
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto pl-48 p-8 relative">
        <div className="grid gap-6 max-w-xl mx-auto">
          {pinnedPost && (
            <Post 
              {...pinnedPost} 
              rotation={Math.random() > 0.5 ? 1 : -1} 
            />
          )}

          {posts
            .filter(post => post.tags.includes(activeTag))
            .map((post, index) => (
              <Post 
                key={post.id} 
                {...post} 
                rotation={postRotations[index]} 
                onDelete={deletePost}
              />
            ))}
        </div>

        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
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
      </div>function Post({ tags, content, user, system, rotation, onDelete, id }: Omit<Post, 'content'> & { 
  content: string, 
  onDelete?: (id: string) => void 
}) {
  return (
    <div className={`transform rotate-[${rotation}deg] relative group`}>
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
        {onDelete && !system && (
          <button 
            onClick={() => onDelete(id)}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500 text-xs"
          >
            × delete
          </button>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTag, setActiveTag] = useState('timeline')
  const [newPost, setNewPost] = useState('')

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(post => post.id !== id))
  }

  // ... rest of the previous code remains the same ...

  return (
    <div className="min-h-screen bg-[#FFE5B4] font-mono text-gray-800">
      {/* ... previous code ... */}
      
      <div className="max-w-2xl ml-48 p-8 relative">
        <div className="grid gap-6">
          {pinnedPost && (
            <Post 
              {...pinnedPost} 
              rotation={Math.random() > 0.5 ? 1 : -1} 
            />
          )}

          {posts
            .filter(post => post.tags.includes(activeTag))
            .map((post, index) => (
              <Post 
                key={post.id} 
                {...post} 
                rotation={postRotations[index]} 
                onDelete={deletePost}
              />
            ))}
        </div>
        
        {/* ... rest of the previous code ... */}
      </div>
    </div>
  )
}"use client"
import { useState, useEffect, useMemo } from 'react'

type User = {
  name: string
}

type Post = {
  id: string
  tags: string[]
  content: string
  user: string
  rotation?: number
  system?: boolean
}

const pinnedPosts = {
  timeline: {
    content: "everything goes here. this is the main feed.",
    user: "system",
    tags: ["timeline"],
    system: true
  },
  discussion: {
    content: "general chat for anything and everything",
    user: "system",
    tags: ["discussion"],
    system: true
  },
  docs: {
    content: "documentation and longer form writing lives here",
    user: "system",
    tags: ["docs"],
    system: true
  },
  neurotech: {
    content: "discoveries about cognition and productivity",
    user: "system",
    tags: ["neurotech"],
    system: true
  },
  sources: {
    content: "interesting links and resources",
    user: "system",
    tags: ["sources"],
    system: true
  }
}

const dogEmojis = ['🐕', '🦮', '🐶', '🐕‍🦺', '🐩', '🐾', '🦴']

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

function Post({ tags, content, user, system, rotation }: Omit<Post, 'id'>) {
  return (
    <div className={`transform rotate-[${rotation}deg]`}>
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
  const packEmoji = dogEmojis[Math.floor(Math.random() * dogEmojis.length)]

  const tags = [
    'timeline',
    'discussion',
    'docs',
    'neurotech',
    'sources'
  ]

  const postRotations = useMemo(() => {
    return posts.map(() => Math.random() > 0.5 ? 1 : -1)
  }, [posts])

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
        id: crypto.randomUUID(),
        rotation: Math.random() > 0.5 ? 1 : -1
      }, ...prev])
      setNewPost('')
    }
  }

  if (!user) return <NameSelector onSelect={setUser} />

  const pinnedPost = pinnedPosts[activeTag as keyof typeof pinnedPosts]

  return (
    <div className="min-h-screen bg-[#FFE5B4] font-mono text-gray-800">
      <div className="fixed left-4 top-4 flex flex-col space-y-2 rounded-lg bg-[#FFF4E0] p-2 shadow-lg">
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
      
      <div className="max-w-2xl ml-48 p-8 relative">
        <div className="grid gap-6">
          {pinnedPost && (
            <Post 
              {...pinnedPost} 
              rotation={Math.random() > 0.5 ? 1 : -1} 
            />
          )}

          {posts
            .filter(post => post.tags.includes(activeTag))
            .map((post, index) => (
              <Post 
                key={post.id} 
                {...post} 
                rotation={postRotations[index]} 
              />
            ))}
        </div>

        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="rounded-lg bg-[#FFF4E0] p-4 shadow-lg mb-4">
            <div className="text-center text-xl font-bold mb-2">
              p{packEmoji}ck
            </div>
          </div>
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