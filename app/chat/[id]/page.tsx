"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { db, storage } from "@/lib/firebase"
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { uploadBytes, ref as storageRef, getDownloadURL } from "firebase/storage"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getDefaultProfileImage } from "@/lib/utils"
import { ChevronLeft, Phone, Video, MoreVertical, Send, Image as ImageIcon, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"

type Message = {
  id: string
  text: string
  senderId: string
  timestamp: any
  imageUrl?: string
}

type ChatData = {
  participants: string[]
  participantProfiles: {
    [key: string]: {
      displayName: string
      photoURL: string
    }
  }
}

export default function ChatPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [chatData, setChatData] = useState<ChatData | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (mounted && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, mounted])

  useEffect(() => {
    if (!user || !id || !mounted) return

    const loadChat = async () => {
      try {
        const chatDoc = await getDoc(doc(db, "chats", id as string))
        if (!chatDoc.exists()) {
          router.push('/')
          return
        }

        const chatData = chatDoc.data()
        const participantProfiles: ChatData["participantProfiles"] = {}

        for (const participantId of chatData.participants) {
          if (!participantId) continue
          const userDoc = await getDoc(doc(db, "users", participantId))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            participantProfiles[participantId] = {
              displayName: userData.displayName,
              photoURL: userData.photoURL || getDefaultProfileImage(userData.displayName)
            }
          }
        }

        setChatData({ participants: chatData.participants, participantProfiles })
        setLoading(false)
      } catch (error) {
        console.error("Error loading chat:", error)
        setLoading(false)
      }
    }

    loadChat()

    const messagesRef = collection(db, "chats", id as string, "messages")
    const q = query(messagesRef, orderBy("timestamp"))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = []
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() } as Message)
      })
      setMessages(newMessages)
    })

    return () => {
      unsubscribe()
    }
  }, [id, user, mounted, router])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !chatData || !mounted) return

    try {
      const messageData = {
        text: newMessage,
        senderId: user.uid,
        timestamp: serverTimestamp()
      }

      await addDoc(collection(db, "chats", id as string, "messages"), messageData)

      await updateDoc(doc(db, "chats", id as string), {
        lastMessage: {
          text: newMessage,
          timestamp: serverTimestamp()
        }
      })

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!user || !file) return
    
    try {
      setIsUploading(true)
      const imageRef = storageRef(storage, `chats/${id}/images/${Date.now()}-${file.name}`)
      await uploadBytes(imageRef, file)
      const imageUrl = await getDownloadURL(imageRef)

      await addDoc(collection(db, "chats", id as string, "messages"), {
        senderId: user.uid,
        imageUrl,
        timestamp: serverTimestamp()
      })

      await updateDoc(doc(db, "chats", id as string), {
        lastMessage: {
          text: "📸 Image",
          timestamp: serverTimestamp()
        }
      })
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  if (!mounted) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <LoadingSpinner />
      </div>
    )
  }

  if (!chatData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white">
        <h2 className="text-xl font-semibold mb-4">Chat not found</h2>
        <Button onClick={() => router.push('/')}>Go Back</Button>
      </div>
    )
  }

  const otherParticipantId = chatData.participants.find(p => p !== user?.uid)
  const otherUser = otherParticipantId ? chatData.participantProfiles[otherParticipantId] : null

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-zinc-800/50"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push(`/profile/${otherParticipantId}`)}
          >
            <div className="relative">
              <img
                src={otherUser?.photoURL}
                alt={otherUser?.displayName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-800"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-950" />
            </div>
            <div>
              <h2 className="font-semibold">{otherUser?.displayName}</h2>
              <p className="text-xs text-zinc-400">Online</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-zinc-800/50 w-10 h-10"
          >
            <Video className="w-5 h-5 text-zinc-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-zinc-800/50 w-10 h-10"
          >
            <Phone className="w-5 h-5 text-zinc-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-zinc-800/50 w-10 h-10"
          >
            <MoreVertical className="w-5 h-5 text-zinc-400" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pt-20 pb-24 space-y-4 scrollbar-hide">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`relative max-w-[60%] rounded-2xl px-4 py-2 shadow-sm ${
                message.senderId === user?.uid
                  ? 'bg-blue-600 rounded-br-sm'
                  : 'bg-zinc-800/50 rounded-bl-sm'
              }`}
            >
              {message.imageUrl ? (
                <div className="relative">
                  <img 
                    src={message.imageUrl} 
                    alt="Shared image" 
                    className="rounded-lg max-w-full h-auto mb-1 hover:brightness-110 transition-all cursor-pointer"
                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                    onClick={() => window.open(message.imageUrl, '_blank')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 rounded-lg pointer-events-none" />
                </div>
              ) : (
                <p className="text-[15px] leading-tight">{message.text}</p>
              )}
              <span 
                className={`text-[10px] ${
                  message.senderId === user?.uid 
                    ? 'text-blue-100/70' 
                    : 'text-zinc-400/70'
                } mt-1 inline-block`}
              >
                {message.timestamp?.toDate().toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true
                }).toLowerCase()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-800/50">
        <form onSubmit={sendMessage} className="p-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-zinc-800/50 rounded-full px-4 py-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hover:bg-zinc-700/30 w-8 h-8 transition-colors"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImageIcon className="w-4 h-4 text-zinc-400" />
              </Button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent focus:outline-none placeholder:text-zinc-500"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hover:bg-zinc-700/30 w-8 h-8 transition-colors"
              >
                <Smile className="w-4 h-4 text-zinc-400" />
              </Button>
            </div>
            <Button
              type="submit"
              disabled={(!newMessage.trim() && !isUploading) || isUploading}
              className="bg-blue-600 hover:bg-blue-700 rounded-full w-10 h-10 flex items-center justify-center shrink-0 transition-colors"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          />
        </form>
      </div>
    </div>
  )
}

