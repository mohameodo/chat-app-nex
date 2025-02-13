"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

type Friend = {
  id: string
  displayName: string
  photoURL: string
  username: string
  hasStory?: boolean
}

export function StoryList() {
  const { user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])

  useEffect(() => {
    if (!user) return

    const loadFriends = async () => {
      try {
        // First get user's friends list
        const userDoc = await getDocs(query(
          collection(db, "users"),
          where("__name__", "==", user.uid)
        ))
        
        const friendIds = userDoc.docs[0]?.data()?.friends || []

        // Then get friends' profiles
        const friendsQuery = query(
          collection(db, "users"),
          where("__name__", "in", friendIds)
        )
        
        const snapshot = await getDocs(friendsQuery)
        const friendsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          hasStory: Math.random() > 0.5 // Temporary: randomly assign story status
        } as Friend))

        setFriends(friendsData)
      } catch (error) {
        console.error("Error loading friends for stories:", error)
      }
    }

    loadFriends()
  }, [user])

  if (!user || friends.length === 0) return null

  return (
    <div className="px-4 py-2 overflow-x-auto scrollbar-hide">
      <div className="flex gap-4 min-w-max">
        <Link href="/stories/create" className="relative text-center">
          <div className="relative">
            <img
              src={user.photoURL || "/placeholder.svg"}
              alt="Create Story"
              className="w-14 h-14 rounded-full bg-zinc-800 object-cover"
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full border-2 border-black flex items-center justify-center">
              <Plus className="w-3 h-3 text-black" />
            </div>
          </div>
          <span className="text-xs mt-1 block">Your Story</span>
        </Link>

        {friends.map((friend) => (
          <Link 
            key={friend.id} 
            href={`/stories/${friend.id}`} 
            className="relative text-center"
          >
            <div className="relative">
              <div className={`w-14 h-14 rounded-full p-0.5 ${
                friend.hasStory 
                  ? 'bg-gradient-to-br from-primary to-blue-400' 
                  : 'bg-zinc-800'
              }`}>
                <img
                  src={friend.photoURL || "/placeholder.svg"}
                  alt={friend.displayName}
                  className="w-full h-full rounded-full border-2 border-black object-cover"
                />
              </div>
            </div>
            <span className="text-xs mt-1 block">{friend.displayName.split(' ')[0]}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

