"use client"

import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, onSnapshot, addDoc, DocumentData, doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Friend {
  id: string;
  displayName: string;
  photoURL: string;
  lastActive: Date | null;
  isOnline?: boolean;
}

interface UserData {
  friends?: string[];
  lastActive?: any;
}

export function ActiveFriends() {
  const { user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!user) return

    const loadFriends = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        const userData = userDoc.data() as UserData
        const friendIds = userData?.friends || []

        const unsubscribe = onSnapshot(
          query(collection(db, "users"), where("__name__", "in", friendIds)),
          (snapshot) => {
            const friendsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              lastActive: doc.data().lastActive?.toDate() || null,
              isOnline: (Date.now() - (doc.data().lastActive?.toDate()?.getTime() || 0)) < 300000
            })) as Friend[]

            setFriends(friendsData)
          }
        )

        return unsubscribe
      } catch (error) {
        console.error("Error loading friends:", error)
      }
    }

    loadFriends()
  }, [user])

  const startChat = async (friendId: string) => {
    if (!user) return

    try {
      const chatsRef = collection(db, "chats")
      const q = query(
        chatsRef,
        where("participants", "array-contains", user.uid)
      )
      const querySnapshot = await getDocs(q)
      let existingChat = null

      querySnapshot.forEach((doc) => {
        const chatData = doc.data() as DocumentData
        if (chatData.participants.includes(friendId)) {
          existingChat = { id: doc.id, ...chatData }
        }
      })

      if (existingChat) {
        router.push(`/chat/${existingChat.id}`)
      } else {
        const newChatRef = await addDoc(chatsRef, {
          participants: [user.uid, friendId].sort(),
          createdAt: new Date(),
          lastMessage: null
        })
        router.push(`/chat/${newChatRef.id}`)
      }
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  if (!user) return null

  return (
    <div className="px-4 py-2 overflow-x-auto scrollbar-hide">
      <div className="flex gap-4 min-w-max">
        {/* Current User Profile */}
        <div className="relative text-center">
          <div 
            className="relative cursor-pointer"
            onClick={() => router.push('/profile')}
          >
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-blue-500 to-purple-500">
              <img
                src={user.photoURL || "/placeholder.svg"}
                alt="Your Profile"
                className="w-full h-full rounded-full border-2 border-black object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-zinc-950" />
          </div>
          <span className="text-xs mt-1 block">You</span>
        </div>

        {/* Active Friends */}
        {friends.map((friend) => (
          <div key={friend.id} className="relative text-center">
            <div 
              className="relative cursor-pointer"
              onClick={() => startChat(friend.id)}
            >
              <div className="w-14 h-14 rounded-full p-0.5">
                <img
                  src={friend.photoURL || "/placeholder.svg"}
                  alt={friend.displayName}
                  className="w-full h-full rounded-full border-2 border-black object-cover"
                />
                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-zinc-950 ${
                  friend.isOnline ? 'bg-green-500' : 'bg-zinc-500'
                }`} />
              </div>
            </div>
            <span className="text-xs mt-1 block">{friend.displayName.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
