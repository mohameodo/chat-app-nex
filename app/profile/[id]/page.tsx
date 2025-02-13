"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, addDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { MessageCircle, UserPlus } from "lucide-react"
import { getDefaultProfileImage } from "@/lib/utils"
import { motion } from "framer-motion"
import { BottomNav } from "@/components/layout/bottom-nav"

type ProfileData = {
  id: string
  displayName: string
  username: string
  bio: string
  photoURL: string
  coverPhotoURL: string
}

export default function UserProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSendingRequest, setIsSendingRequest] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [id])

  const loadProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", id as string))
      if (userDoc.exists()) {
        setProfile({ id: userDoc.id, ...userDoc.data() } as ProfileData)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const startChat = async () => {
    if (!user || !profile) return

    try {
      // Check if chat already exists
      const chatsRef = collection(db, "chats")
      const newChat = await addDoc(chatsRef, {
        participants: [user.uid, profile.id],
        createdAt: new Date(),
        lastMessage: null
      })
      router.push(`/chat/${newChat.id}`)
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  const sendFriendRequest = async () => {
    if (!user || !profile) return

    try {
      setIsSendingRequest(true)
      await addDoc(collection(db, "friendRequests"), {
        from: user.uid,
        to: profile.id,
        status: 'pending',
        createdAt: new Date()
      })
      // Show success message
    } catch (error) {
      console.error("Error sending friend request:", error)
    } finally {
      setIsSendingRequest(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">User not found</h1>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black text-white"
    >
      {/* Cover Photo */}
      <div className="relative h-48">
        {profile.coverPhotoURL ? (
          <img
            src={profile.coverPhotoURL}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-50" />
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-4 pb-20">
        <div className="relative -mt-20 mb-4">
          <img
            src={profile.photoURL || getDefaultProfileImage(profile.displayName)}
            alt={profile.displayName}
            className="w-32 h-32 rounded-full border-4 border-black object-cover"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{profile.displayName}</h1>
            <p className="text-gray-400">@{profile.username}</p>
          </div>

          {profile.bio && (
            <p className="text-gray-200">{profile.bio}</p>
          )}

          {user && user.uid !== profile.id && (
            <div className="flex gap-2">
              <Button onClick={startChat} className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button onClick={sendFriendRequest} variant="outline" disabled={isSendingRequest} className="flex-1">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Friend
              </Button>
            </div>
          )}
        </div>
      </div>
      <BottomNav />

    </motion.div>
  )
}

