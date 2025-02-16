"use client"
import { Hash } from 'lucide-react'
Copytype Post = {
  id: string
  tags: string[]
  content: string
  user: string
}

function Post({ tags, content, user }: Omit<Post, 'id'>) {
  // remove timestamp from params
  const rotation = Math.random() > 0.5 ? 'rotate-1' : '-rotate-1'
  
  return (
    <div className={`transform ${rotation}`}>
      <div className="relative bg-white p-6 shadow-lg">
        <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full bg-red-500" />
        <div className="mb-4 border-b border-dashed border-gray-300 pb-2">
          {tags.map(tag => (
            <span key={tag} className="mr-2 flex items-center text-xs text-gray-500">
              <Hash size={12} className="mr-1" />
              {tag}
            </span>
          ))}
        </div>
        <p className="font-mono">{content}</p>
        <div className="mt-4 text-xs text-gray-500">@{user}</div>
      </div>
    </div>
  )
}

export default function Home() {
  // ... existing tag stuff ...

  const posts = [
    {id: '1', content: 'test post', tags: ['timeline'], user: 'nosilverv'},
    {id: '2', content: 'another test', tags: ['docs'], user: 'nosilverv'}
  ]

  return (
    <div className="min-h-screen bg-amber-50 font-mono">
      {/* existing tag switcher */}
      
      <div className="ml-48 p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <Post key={post.id} {...post} />
          ))}
        </div>
      </div>
    </div>
  )
}