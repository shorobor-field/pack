"use client"
import React, { useState, useEffect, useRef } from 'react'
import { formatDistance, format, isAfter, sub } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { Layout, MessageSquare, FileText, Brain, Link as LinkIcon, ChevronUp, ChevronDown, Send, Palette, Image as LucideImage, BookOpen } from 'lucide-react'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'

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
  readers?: string[]
  image?: string
}

const themes = {
  'playful-light': {
    bg: 'bg-[#FFE5B4]',
    nav: 'bg-[#FFF4E0]',
    navShadow: 'shadow-lg shadow-[#FFE5B4]/60',
    card: 'bg-white',
    systemCard: 'bg-[#FFFACD]',
    cardShadow: 'shadow-lg',
    accent: 'bg-[#FFD580]',
    accentHover: 'hover:bg-[#FFEBC1]',
    border: 'border-[#FFD580]',
    text: 'text-gray-800',
    textMuted: 'text-gray-600',
    rounded: 'rounded-lg',
    textArea: 'bg-transparent',
    rotate: true
  },
  'playful-dark': {
    bg: 'bg-[#1e1e2e]',
    nav: 'bg-[#181825]',
    navShadow: 'shadow-lg shadow-black/40',
    card: 'bg-[#181825]',
    systemCard: 'bg-[#11111b]',
    cardShadow: 'shadow-lg shadow-black/20',
    accent: 'bg-[#cba6f7]',
    accentHover: 'hover:bg-[#f5c2e7]',
    border: 'border-[#313244]',
    text: 'text-[#cdd6f4]',
    textMuted: 'text-[#9399b2]',
    rounded: 'rounded-lg',
    textArea: 'bg-transparent',
    rotate: true
  },
  'corpo-light': {
    bg: 'bg-gray-50',
    nav: 'bg-white',
    navShadow: 'shadow-lg shadow-gray-200/60',
    card: 'bg-white',
    systemCard: 'bg-white',
    cardShadow: 'shadow-sm',
    accent: 'bg-gray-100',
    accentHover: 'hover:bg-gray-100',
    border: 'border-gray-200',
    text: 'text-gray-800',
    textMuted: 'text-gray-600',
    rounded: '',
    textArea: 'bg-transparent',
    rotate: false
  },
  'corpo-dark': {
    bg: 'bg-[#1F1F1F]',
    nav: 'bg-[#2A2A2A]',
    navShadow: 'shadow-lg shadow-black/40',
    card: 'bg-[#2A2A2A]',
    systemCard: 'bg-[#333333]',
    cardShadow: 'shadow-lg shadow-black/20',
    accent: 'bg-[#3A3A3A]',
    accentHover: 'hover:bg-[#444444]',
    border: 'border-[#404040]',
    text: 'text-gray-200',
    textMuted: 'text-gray-400',
    rounded: '',
    textArea: 'bg-transparent',
    rotate: false
  }
} as const

const getThemeColors = (themeName: string) => {
  switch (themeName) {
    case 'playful-light':
      return { dark: [237, 170, 36], light: [255, 255, 255] }  // #FFD580
    case 'playful-dark':
      return { dark: [0, 0, 0], light: [203, 166, 247] }  // #cba6f7
    default:
      return { dark: [0, 0, 0], light: [255, 255, 255] }
  }
}

const channelIcons: Record<string, React.ElementType> = {
  timeline: Layout,
  discussion: MessageSquare,
  docs: FileText,
  neurotech: Brain,
  sources: LinkIcon
}

const pinnedPosts: Record<string, Post> = {
  timeline: {
    id: 'pinned-timeline',
    content: "everything goes here. this is the main feed.",
    user: "system",
    tags: ["timeline"],
    system: true,
    timestamp: new Date().toISOString()
  },
  discussion: {
    id: 'pinned-discussion',
    content: "general chat for anything and everything",
    user: "system",
    tags: ["discussion"],
    system: true,
    timestamp: new Date().toISOString()
  },
  docs: {
    id: 'pinned-docs',
    content: "documentation and longer form writing lives here",
    user: "system",
    tags: ["docs"],
    system: true,
    timestamp: new Date().toISOString()
  },
  neurotech: {
    id: 'pinned-neurotech',
    content: "discoveries about cognition and productivity",
    user: "system",
    tags: ["neurotech"],
    system: true,
    timestamp: new Date().toISOString()
  },
  sources: {
    id: 'pinned-sources',
    content: "interesting links and resources",
    user: "system",
    tags: ["sources"],
    system: true,
    timestamp: new Date().toISOString()
  }
}

function applyThemeToImage(imageUrl: string, themeName: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = async () => {
      const processed = await processImage(img, themeName)
      resolve(processed)
    }
    img.src = imageUrl
  })
}

function processImage(img: HTMLImageElement, themeName: string): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    const maxWidth = 800
    const maxHeight = 800
    let width = img.width
    let height = img.height
    
    const scaleFactor = Math.min(maxWidth / width, maxHeight / height)
    width = Math.round(width * scaleFactor)
    height = Math.round(height * scaleFactor)
    
    canvas.width = width
    canvas.height = height
    
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, width, height)
    
    const imageData = ctx.getImageData(0, 0, width, height)
    
    // grayscale
    for (let i = 0; i < imageData.data.length; i += 4) {
      const gray = Math.round(
        imageData.data[i] * 0.299 + 
        imageData.data[i + 1] * 0.587 + 
        imageData.data[i + 2] * 0.114
      )
      imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = gray
    }

    const { dark, light } = getThemeColors(themeName)
    
    // dithering
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        const oldPixel = imageData.data[idx]
        const newPixel = oldPixel < 128 ? 0 : 255
        
        // set rgb values based on theme
        const targetColor = newPixel === 0 ? dark : light
        imageData.data[idx] = targetColor[0]
        imageData.data[idx + 1] = targetColor[1]
        imageData.data[idx + 2] = targetColor[2]

        const error = oldPixel - newPixel

        if (x + 1 < width) {
          imageData.data[idx + 4] += error * 7/16
          if (y + 1 < height) {
            imageData.data[idx + width * 4 + 4] += error * 1/16
          }
        }
        if (y + 1 < height) {
          imageData.data[idx + width * 4] += error * 5/16
          if (x > 0) {
            imageData.data[idx + width * 4 - 4] += error * 3/16
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    resolve(canvas.toDataURL('image/webp', 0.85))
  })
}

function formatPostDate(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  
  if (isAfter(date, sub(now, { hours: 1 }))) {
    return formatDistance(date, now, { addSuffix: true })
      .replace('about ', '')
      .replace('less than a minute ago', 'just now')
  }
  
  if (isAfter(date, sub(now, { days: 1 }))) {
    const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  
  if (isAfter(date, sub(now, { days: 7 }))) {
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  }
  
  return format(date, 'dd-MM-yyyy')
}

// replace the current NameSelector with this
function NameSelector({ onSelect, theme }: { 
  onSelect: (user: User) => void
  theme: typeof themes[keyof typeof themes]
}) {
  const users = [
    { name: 'raiyan' },
    { name: 'zarin' },
    { name: 'jeba' },
    { name: 'inan' }
  ]

  return (
    <div className={`${theme.card} ${theme.rounded} ${theme.cardShadow} border ${theme.border} p-6`}>
      <div className={`mb-4 border-b border-dashed ${theme.border} pb-2`}>
        <div className={`text-xs ${theme.textMuted}`}>system</div>
      </div>
      <div className={`prose prose-sm max-w-none font-mono ${theme.text} mb-4`}>
        who are you?
      </div>
      <div className="grid grid-cols-2 gap-3">
        {users.map(user => (
          <button
            key={user.name}
            onClick={() => onSelect(user)}
            className={`${theme.rounded} border ${theme.border} ${theme.card} 
              p-2 ${theme.text} transition-all ${theme.accentHover}`}
          >
            <span className="font-mono">{user.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Post({ 
 content, 
 user, 
 system, 
 rotation = 0, 
 timestamp, 
 readers = [], 
 image, 
 theme, 
 currentTheme,
 onRead,
 currentUser,
 id 
}: Omit<Post, 'tags'> & { 
 theme: typeof themes[keyof typeof themes],
 currentTheme: keyof typeof themes,
 onRead?: (id: string) => void,
 currentUser?: User | null,
 id: string
}) {
 const [processedImage, setProcessedImage] = useState<string | undefined>(image)
 const style = theme.rotate ? { transform: `rotate(${rotation}deg)` } : {}

 useEffect(() => {
   if (image) {
     applyThemeToImage(image, currentTheme).then(setProcessedImage)
   }
 }, [image, currentTheme])

 return (
   <div style={style}>
     <div className={`relative border ${theme.border} ${system ? theme.systemCard : theme.card} 
       ${theme.cardShadow} ${theme.rounded} p-6`}>
       {system && theme.rotate && (
         <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full bg-red-500" />
       )}
       <div className={`mb-4 flex items-center justify-between border-b border-dashed ${theme.border} pb-2`}>
         <div className={`text-xs ${theme.textMuted}`}>
           {user}
         </div>
         {!system && (
           <div className={`text-xs ${theme.textMuted}`}>
             {formatPostDate(timestamp)}
           </div>
         )}
       </div>
       
       {processedImage && (
         <div className="mb-4">
           <Image 
             src={processedImage} 
             alt="Post image"
             width={800}
             height={600}
             className="w-full"
           />
         </div>
       )}
       
       <div className={`prose prose-sm max-w-none font-mono ${theme.text}`}>
         <ReactMarkdown remarkPlugins={[remarkGfm]} 
           components={{ 
             ul: (props) => <ul className="list-disc pl-5" {...props} />, 
             ol: (props) => <ol className="list-decimal pl-5" {...props} /> 
           }}
         >
           {content}
         </ReactMarkdown>
       </div>
       
       {readers.length > 0 && (
         <div className={`mt-4 text-xs ${theme.textMuted} font-mono`}>
           read by {readers.join(', ')}
         </div>
       )}
       
       {!system && user !== currentUser?.name && currentUser?.name && !readers.includes(currentUser.name) && (
         <div className="mt-4 flex justify-end">
           <button
             onClick={() => onRead?.(id)}
             className={`${theme.rounded} ${theme.accent} p-2 ${theme.text} transition-all hover:scale-110`}
           >
             <BookOpen size={16} />
           </button>
         </div>
       )}
     </div>
   </div>
 )
}

function NewPostEditor({ onSubmit, theme, themeName, user }: { 
  onSubmit: (content: string, image?: string) => void
  theme: typeof themes[keyof typeof themes]
  themeName: keyof typeof themes
  user: User
}) {
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const img = document.createElement('img')
        img.onload = async () => {
          const processed = await processImage(img, themeName)
          setImage(processed)
          setUploading(false)
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Error processing image:', err)
      setUploading(false)
    }
  }

  const handleSubmit = () => {
    if (!content.trim() && !image) return
    onSubmit(content, image || undefined)
    setContent('')
    setImage(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={`${theme.card} ${theme.rounded} ${theme.cardShadow} border ${theme.border} p-4`}>
      {image && (
        <div className="mb-4">
          <Image 
            src={image} 
            alt="" 
            width={800}
            height={600}
            className="w-full mb-2" 
          />
          <button 
            onClick={() => setImage(null)}
            className={`text-xs ${theme.textMuted} hover:${theme.text}`}
          >
            remove image
          </button>
        </div>
      )}
      
      <div className={`prose prose-sm w-full font-mono ${theme.text}`}>
        <div className="min-h-[5rem]">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={async (e) => {
              const items = Array.from(e.clipboardData.items)
              const imageItem = items.find(item => item.type.startsWith('image'))
    
              if (imageItem) {
                e.preventDefault()
                setUploading(true)
      
                try {
                  const file = imageItem.getAsFile()
                  if (!file) return
        
                  const reader = new FileReader()
                  reader.onload = async (event) => {
                    const img = document.createElement('img')
                    img.onload = async () => {
                      const processed = await processImage(img, themeName)
                      setImage(processed)
                      setUploading(false)
                    }
                    img.src = event.target?.result as string
                  }
                  reader.readAsDataURL(file)
                } catch (err) {
                  console.error('Error processing pasted image:', err)
                  setUploading(false)
                }
              }
            }}
            placeholder={`what's on your mind, ${user.name}?`}
            className={`w-full resize-none ${theme.textArea} font-mono ${theme.text} 
              placeholder-gray-500 focus:outline-none`}
            rows={3}
          />
        </div>
      </div>
      
      <div className="mt-2 flex justify-end space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`${theme.rounded} ${theme.accent} p-2 ${theme.text} transition-all hover:scale-110 
            disabled:opacity-50 disabled:hover:scale-100`}
        >
          <LucideImage size={16} />
        </button>
        <button 
          onClick={handleSubmit}
          className={`${theme.rounded} ${theme.accent} p-2 ${theme.text} transition-all hover:scale-110`}
        >
          <Send size={16} />
        </button>
      </div>
      
      {uploading && (
        <div className={`mt-2 text-xs ${theme.textMuted}`}>
          processing image...
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('pack-user')
    return saved ? JSON.parse(saved) : null
  })
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTag, setActiveTag] = useState('timeline')
  const [unreadTags, setUnreadTags] = useState<Set<string>>(new Set())
  const [rotations, setRotations] = useState<Record<string, number>>({})
  const [isNavExpanded, setIsNavExpanded] = useState(false)
  
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>('corpo-light')

  useEffect(() => {
    const saved = localStorage.getItem('pack-theme')
    if (saved && (saved === 'playful-light' || saved === 'playful-dark' || saved === 'corpo-light' || saved === 'corpo-dark')) {
      setCurrentTheme(saved)
    }
  }, [])

  const theme = themes[currentTheme]
  const tags = Object.keys(channelIcons)


  useEffect(() => {
    // get current theme bg color
    const bgColor = theme.bg.includes('amber') ? '#FFE5B4' : 
                    theme.bg.includes('[#1e1e2e]') ? '#1e1e2e' :
                    theme.bg.includes('gray-50') ? '#F9FAFB' :
                    theme.bg.includes('[#1F1F1F]') ? '#1F1F1F' : '#ffffff'

    // update document bg color
    document.documentElement.style.backgroundColor = bgColor
  }, [currentTheme])
  
  const cycleTheme = () => {
    setCurrentTheme(current => {
      const themeOrder: (keyof typeof themes)[] = ['playful-light', 'playful-dark', 'corpo-light', 'corpo-dark']
      const currentIndex = themeOrder.indexOf(current)
      const newTheme = themeOrder[(currentIndex + 1) % themeOrder.length]
    
      // if switching to a playful theme, regenerate rotations
      if (newTheme.startsWith('playful')) {
        const postIds = ['pinned', ...filteredPosts.map(p => p.id)]
        generateRotations(postIds)
      }
    
      return newTheme
    })
  }

  const generateRotations = (postIds: string[]) => {
    if (!theme.rotate) return
    const newRotations: Record<string, number> = {}
    postIds.forEach(id => {
      newRotations[id] = (Math.random() - 0.5) * 2
    })
    setRotations(newRotations)
  }

  const handleTagChange = (tag: string) => {
    setActiveTag(tag)
    setIsNavExpanded(false)
    const filteredPosts = posts.filter(p => p.tags.includes(tag))
    generateRotations(['pinned', ...filteredPosts.map(p => p.id)])
  }

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('https://pack-api.raiyanrahmanxx.workers.dev/posts')
      const data = await res.json()
      if (!Array.isArray(data)) {
        console.error('invalid api response:', data)
        setPosts([])
        return
      }
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
      
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100)
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

  useEffect(() => {
    localStorage.setItem('pack-theme', currentTheme)
  }, [currentTheme])

const handleRead = async (postId: string) => {
  if (!user) return

  // optimistic update
  setPosts(prev => prev.map(post => {
    if (post.id === postId) {
      return {
        ...post,
        readers: [...(post.readers || []), user.name].sort()
      }
    }
    return post
  }))

  try {
    const res = await fetch('https://pack-api.raiyanrahmanxx.workers.dev/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_id: postId,
        reader: user.name
      })
    })

    if (!res.ok) throw new Error('Failed to mark as read')
    
    const { readers } = await res.json()
    
    // update with server response
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          readers
        }
      }
      return post
    }))
  } catch (err) {
    console.error('Error marking as read:', err)
    // revert optimistic update on error
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          readers: (post.readers || []).filter(r => r !== user.name)
        }
      }
      return post
    }))
  }
}

  const createPost = async (content: string, image?: string) => {
    if (!user) return

    const post = {
      content,
      user: user.name,
      tags: [activeTag],
      timestamp: new Date().toISOString(),
      image
    }

    try {
      const res = await fetch('https://pack-api.raiyanrahmanxx.workers.dev/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      })

      if (!res.ok) throw new Error('Failed to create post')
    
      const data = await res.json()
      console.log('api response:', data)
      setPosts(prev => [data, ...prev])
    
      if (theme.rotate) {
        setRotations(prev => ({
          ...prev,
          [data.id]: (Math.random() - 0.5) * 2
        }))
      }

      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    } catch (err) {
      console.error('Error creating post:', err)
    }
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  
  const pinnedPost = pinnedPosts[activeTag]
  const filteredPosts = posts.filter(post => post.tags.includes(activeTag))
  const content = user ? (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <div className="mb-6 flex items-center justify-between">
        <div className={`flex-grow ${theme.nav} ${theme.rounded} ${theme.navShadow} overflow-hidden transition-all duration-200`} style={{ maxHeight: isNavExpanded ? '300px' : '48px' }}>
          <div className={`flex items-center justify-between p-3 cursor-pointer ${theme.border} border-b border-dashed`} onClick={() => setIsNavExpanded(!isNavExpanded)}>
            <div className="flex items-center space-x-2">
              {React.createElement(channelIcons[activeTag], { size: 14, className: 'mr-2' })}
              <span className={theme.text}>{activeTag}</span>
            </div>
            <ChevronDown size={14} className={`transform transition-transform duration-200 ${isNavExpanded ? 'rotate-180' : ''}`} />
          </div>
          <div className="divide-y divide-dashed">
            {tags.map(tag => (
              <div
                key={tag}
                className={`p-3 cursor-pointer ${tag === activeTag ? `${theme.accent} ${theme.text}` : theme.textMuted}`}
                onClick={() => handleTagChange(tag)}
              >
                <div className="flex items-center space-x-2">
                  {React.createElement(channelIcons[tag], { size: 14 })}
                  <span>{tag}</span>
                  {unreadTags.has(tag) && (
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button onClick={cycleTheme} className={`${theme.rounded} p-2 ${theme.textMuted} transition-all hover:scale-110 ${theme.accentHover}`}>
            <Palette size={20} />
          </button>
          <button onClick={scrollToBottom} className={`${theme.rounded} p-2 ${theme.textMuted} transition-all hover:scale-110 ${theme.accentHover}`}>
            <ChevronDown size={20} />
          </button>
        </div>
      </div>
      <div className="grid gap-6">
        {pinnedPost && (
          <Post 
            {...pinnedPost} 
            rotation={rotations['pinned'] || 0} 
            theme={theme} 
            currentTheme={currentTheme}
            currentUser={user}
            onRead={handleRead}
          />
        )}
        {filteredPosts.slice().reverse().map(post => (
          <Post 
            key={post.id} 
            {...post} 
            rotation={rotations[post.id] || 0} 
            theme={theme} 
            currentTheme={currentTheme}
            currentUser={user}
            onRead={handleRead}
          />
        ))}
        <NewPostEditor onSubmit={createPost} theme={theme} themeName={currentTheme} user={user} />
        <div className="flex justify-end">
          <button onClick={scrollToTop} className={`${theme.rounded} p-2 ${theme.textMuted} transition-all hover:scale-110 ${theme.accentHover}`}>
            <ChevronUp size={20} />
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <NameSelector onSelect={(selectedUser: User) => {
        setUser(selectedUser)
        localStorage.setItem('pack-user', JSON.stringify(selectedUser))
      }} theme={theme} />
    </div>
  )

  return (
    <div className={`min-h-screen ${theme.bg} font-mono ${theme.text}`}>
      {content}
    </div>
  )

  return (
    <div className={`min-h-screen ${theme.bg} font-mono ${theme.text}`}>
      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="mb-6 flex items-center justify-between">
          <div className={`flex-grow ${theme.nav} ${theme.rounded} ${theme.navShadow} overflow-hidden transition-all duration-200`} 
            style={{ maxHeight: isNavExpanded ? '300px' : '48px' }}>
            <div className={`flex items-center justify-between p-3 cursor-pointer ${theme.border} border-b border-dashed`} 
              onClick={() => setIsNavExpanded(!isNavExpanded)}>
              <div className="flex items-center space-x-2">
                {React.createElement(channelIcons[activeTag], { size: 14, className: 'mr-2' })}
                <span className={theme.text}>{activeTag}</span>
              </div>
              <ChevronDown size={14} className={`transform transition-transform duration-200 ${isNavExpanded ? 'rotate-180' : ''}`} />
            </div>
            <div className="divide-y divide-dashed">
              {tags.map(tag => (
                <div
                  key={tag}
                  className={`p-3 cursor-pointer ${tag === activeTag ? `${theme.accent} ${theme.text}` : theme.textMuted}`}
                  onClick={() => handleTagChange(tag)}
                >
                  <div className="flex items-center space-x-2">
                    {React.createElement(channelIcons[tag], { size: 14 })}
                    <span>{tag}</span>
                    {unreadTags.has(tag) && (
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button onClick={cycleTheme} className={`${theme.rounded} p-2 ${theme.textMuted} transition-all hover:scale-110 ${theme.accentHover}`}>
              <Palette size={20} />
            </button>
            <button onClick={scrollToBottom} className={`${theme.rounded} p-2 ${theme.textMuted} transition-all hover:scale-110 ${theme.accentHover}`}>
              <ChevronDown size={20} />
            </button>
          </div>
        </div>
        
        <div className="grid gap-6">
          {pinnedPost && (
            <Post 
              {...pinnedPost} 
              rotation={rotations['pinned'] || 0} 
              theme={theme} 
              currentTheme={currentTheme}
              currentUser={user}
              onRead={handleRead}
            />
          )}
          {filteredPosts
            .slice()
            .reverse()
            .map(post => (
              <Post 
                key={post.id} 
                {...post} 
                rotation={rotations[post.id] || 0} 
                theme={theme} 
                currentTheme={currentTheme}
                onRead={handleRead}
                currentUser={user}
              />
            ))}

          {user ? (
            <NewPostEditor 
              onSubmit={createPost} 
              theme={theme} 
              themeName={currentTheme} 
              user={user as User} 
            />
          ) : null}
          
          <div className="flex justify-end">
            <button 
              onClick={scrollToTop}
              className={`${theme.rounded} p-2 ${theme.textMuted} transition-all hover:scale-110 ${theme.accentHover}`}
            >
              <ChevronUp size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}