"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, getDocs, addDoc, updateDoc, doc, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { TopNav } from "@/components/layout/top-nav"
import { BottomNav } from "@/components/layout/bottom-nav"
import { UserPlus, Check, X, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { SearchBar } from "@/components/search/search-bar"

type UserProfile = {
  id: string
  displayName: string
  username: string
  photoURL: string
}

type FriendRequest = {
  id: string
  from: string
  to: string
  status: 'pending' | 'accepted' | 'rejected'
  fromUser?: UserProfile
}

interface ChatData {
  participants: string[];
  createdAt: Date;
  lastMessage: any;
  updatedAt?: Date;
}

interface Chat extends ChatData {
  id: string;
}

export default function FriendsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [friends, setFriends] = useState<UserProfile[]>([])
  const [suggestions, setSuggestions] = useState<UserProfile[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    // Listen to friend requests
    const requestsQuery = query(
      collection(db, "friendRequests"),
      where("to", "==", user.uid)
    )

    const unsubscribeRequests = onSnapshot(requestsQuery, async (snapshot) => {
      const requests: FriendRequest[] = []
      for (const doc of snapshot.docs) {
        const data = doc.data()
        const fromUserDoc = await getDocs(query(
          collection(db, "users"),
          where("__name__", "==", data.from)
        ))
        const fromUser = fromUserDoc.docs[0]?.data() as UserProfile
        requests.push({
          id: doc.id,
          ...data,
          fromUser: { ...fromUser, id: data.from }
        } as FriendRequest)
      }
      setRequests(requests)
    })

    // Load friends
    const loadFriends = async () => {
      const friendsQuery = query(
        collection(db, "users"),
        where("friends", "array-contains", user.uid)
      )
      const snapshot = await getDocs(friendsQuery)
      setFriends(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile)))
    }

    // Load suggestions
    const loadSuggestions = async () => {
      const suggestionsQuery = query(
        collection(db, "users"),
        where("__name__", "!=", user.uid)
      )
      const snapshot = await getDocs(suggestionsQuery)
      const suggestions = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
        .filter(u => !friends.some(f => f.id === u.id))
        .slice(0, 5)
      setSuggestions(suggestions)
      setLoading(false)
    }

    loadFriends()
    loadSuggestions()

    return () => {
      unsubscribeRequests()
    }
  }, [user])

  const findExistingChat = async (userId1: string, userId2: string): Promise<Chat | null> => {
    try {
      const chatsRef = collection(db, "chats")
      const q = query(
        chatsRef,
        where("participants", "array-contains", userId1)
      )
      
      const querySnapshot = await getDocs(q)
      let existingChat: Chat | null = null

      querySnapshot.forEach((doc) => {
        const chatData = doc.data() as ChatData
        if (chatData.participants.includes(userId2)) {
          existingChat = { id: doc.id, ...chatData }
        }
      })

      return existingChat
    } catch (error) {
      console.error("Error finding chat:", error)
      return null
    }
  }

  const handleFriendRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    if (!user) return
  
    try {
      await updateDoc(doc(db, "friendRequests", requestId), { status })
      
      if (status === 'accepted') {
        const request = requests.find(r => r.id === requestId)
        if (request) {
          // Get current friends lists for both users
          const userDoc = await getDoc(doc(db, "users", user.uid))
          const otherUserDoc = await getDoc(doc(db, "users", request.from))
          
          const userFriends = userDoc.data()?.friends || []
          const otherUserFriends = otherUserDoc.data()?.friends || []
  
          // Update both users' friends lists using Array methods instead of Set
          await updateDoc(doc(db, "users", user.uid), {
            friends: Array.from(new Set([...userFriends, request.from]))
          })
          await updateDoc(doc(db, "users", request.from), {
            friends: Array.from(new Set([...otherUserFriends, user.uid]))
          })
  
          // Create chat only if it doesn't exist
          const existingChat = await findExistingChat(user.uid, request.from)
          if (!existingChat) {
            const participants = [user.uid, request.from].sort()
            await addDoc(collection(db, "chats"), {
              participants,
              createdAt: new Date(),
              lastMessage: null
            })
          }
        }
      }
    } catch (error) {
      console.error("Error handling friend request:", error)
    }
  }

  const sendFriendRequest = async (toUserId: string) => {
    if (!user) return

    try {
      await addDoc(collection(db, "friendRequests"), {
        from: user.uid,
        to: toUserId,
        status: 'pending',
        createdAt: new Date()
      })
    } catch (error) {
      console.error("Error sending friend request:", error)
    }
  }

  const startChat = async (friendId: string) => {
    if (!user) return

    try {
      const existingChat = await findExistingChat(user.uid, friendId)

      if (existingChat) {
        router.push(`/chat/${existingChat.id}`)
      } else {
        const newChatRef = await addDoc(collection(db, "chats"), {
          participants: [user.uid, friendId].sort(),
          createdAt: new Date(),
          lastMessage: null,
          updatedAt: new Date()
        })
        router.push(`/chat/${newChatRef.id}`)
      }
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <TopNav title="Friends" />
      <SearchBar placeholder="Search friends..." />

      {/* Friend Requests */}
      {requests.length > 0 && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between bg-zinc-900 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={request.fromUser?.photoURL || "/placeholder.svg"}
                    alt={request.fromUser?.displayName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{request.fromUser?.displayName}</h3>
                    <p className="text-sm text-gray-400">@{request.fromUser?.username}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleFriendRequest(request.id, 'accepted')}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleFriendRequest(request.id, 'rejected')}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friend Suggestions */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">People You May Know</h2>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="flex items-center justify-between bg-zinc-900 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={suggestion.photoURL || "/placeholder.svg"}
                  alt={suggestion.displayName}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{suggestion.displayName}</h3>
                  <p className="text-sm text-gray-400">@{suggestion.username}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendFriendRequest(suggestion.id)}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Add Friend
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Friends List */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Your Friends</h2>
        <div className="space-y-4">
          {friends.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between bg-zinc-900 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={friend.photoURL || "/placeholder.svg"}
                  alt={friend.displayName}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{friend.displayName}</h3>
                  <p className="text-sm text-gray-400">@{friend.username}</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => startChat(friend.id)}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Message
              </Button>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

