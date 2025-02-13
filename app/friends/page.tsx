"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, DocumentData } from "firebase/firestore"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"

interface ChatData {
  id: string;
  participants: string[];
  lastMessage: {
    text: string;
    timestamp: any;
  } | null;
  createdAt: any;
}

interface UserData {
  displayName: string;
  photoURL: string;
}

type Chat = {
  chatId: string
  participants: string[]
  lastMessage: {
    text: string
    timestamp: any
  } | null
  otherUser: {
    displayName: string
    photoURL: string
    id: string
  }
}

export function ChatList() {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    let unsubscribe: () => void;

    const loadChats = async () => {
      try {
        const chatsQuery = query(
          collection(db, "chats"),
          where("participants", "array-contains", user.uid),
          orderBy("lastMessage.timestamp", "desc")
        )

        unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
          const chatsPromises = snapshot.docs.map(async (docSnapshot) => {
            const chatData = docSnapshot.data() as ChatData
            const otherUserId = chatData.participants.find(p => p !== user.uid)
            
            if (otherUserId) {
              const userDocRef = doc(db, "users", otherUserId)
              const userDocSnap = await getDoc(userDocRef)
              const userData = userDocSnap.data() as UserData

              if (userData) {
                return {
                  chatId: docSnapshot.id, // Changed from id to chatId
                  ...chatData,
                  otherUser: {
                    id: otherUserId,
                    displayName: userData.displayName,
                    photoURL: userData.photoURL
                  }
                }
              }
            }
            return null
          })

          const resolvedChats = (await Promise.all(chatsPromises)).filter(Boolean) as Chat[]
          setChats(resolvedChats)
          setLoading(false)
        })
      } catch (error) {
        console.error("Error loading chats:", error)
        setLoading(false)
      }
    }

    loadChats()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
        <p>No conversations yet</p>
        <button
          onClick={() => router.push('/friends')}
          className="text-blue-500 mt-2 hover:underline"
        >
          Find friends to chat with
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2 p-4">
      {chats.map((chat) => (
        <Link
          key={chat.chatId} // Update here if needed
          href={`/chat/${chat.chatId}`} // And here
          className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
        >
          <div className="relative">
            <img
              src={chat.otherUser.photoURL}
              alt={chat.otherUser.displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{chat.otherUser.displayName}</h3>
            {chat.lastMessage ? (
              <p className="text-sm text-gray-400 truncate">
                {chat.lastMessage.text}
              </p>
            ) : (
              <p className="text-sm text-gray-400">Start a conversation</p>
            )}
          </div>
          {chat.lastMessage?.timestamp && (
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(chat.lastMessage.timestamp.toDate(), { addSuffix: true })}
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}

