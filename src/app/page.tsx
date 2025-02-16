"use client"
import { useState } from 'react'
import { Hash, Pin, Image, Eye, Edit, MessageCircle } from 'lucide-react'

export default function Home() {
  const [activeTag, setActiveTag] = useState('timeline')
  const tags = {
    timeline: 'everything',
    discussion: 'general chat', 
    docs: 'documents',
    neurotech: 'discoveries',
    sources: 'resources'
  }

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
    </div>
  )
}