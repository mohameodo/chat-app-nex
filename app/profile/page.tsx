"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useState, useRef, useEffect } from "react"
import { auth, db, storage } from "@/lib/firebase"
import { updateProfile } from "firebase/auth"
import { Camera, LogOut, Edit2, X, Check, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { motion, AnimatePresence } from "framer-motion"
import { BottomNav } from "@/components/layout/bottom-nav"

type ProfileData = {
  displayName: string
  username: string
  bio: string
  photoURL: string
  coverPhotoURL: string
}

const DEFAULT_COVER_STYLE = {
  background: 'linear-gradient(to right, rgb(55, 65, 81), rgb(17, 24, 39), rgb(0, 0, 0))',
  backgroundSize: 'cover',
  height: '100%',
  width: '100%',
  position: 'absolute' as const,
  top: 0,
  left: 0,
  opacity: 0.8
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverPhotoInputRef = useRef<HTMLInputElement>(null)
  
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: user?.displayName || "",
    username: user?.email?.split('@')[0] || "",
    bio: "",
    photoURL: user?.photoURL || "",
    coverPhotoURL: ""
  })

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user!.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setProfileData({
          displayName: data.displayName || user!.displayName || "",
          username: data.username || user!.email?.split('@')[0] || "",
          bio: data.bio || "",
          photoURL: data.photoURL || user!.photoURL || "",
          coverPhotoURL: data.coverPhotoURL || ""
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleFileUpload = async (file: File, type: 'profile' | 'cover') => {
    if (!user) return

    try {
      setLoading(true)
      const storageRef = ref(storage, `users/${user.uid}/${type}-${Date.now()}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      
      if (type === 'profile') {
        setProfileData(prev => ({ ...prev, photoURL: downloadURL }))
      } else {
        setProfileData(prev => ({ ...prev, coverPhotoURL: downloadURL }))
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      })

      // Update Firestore user document
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        username: profileData.username,
        bio: profileData.bio,
        photoURL: profileData.photoURL,
        coverPhotoURL: profileData.coverPhotoURL,
        updatedAt: new Date()
      })

      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <Button onClick={() => router.push('/login')}>Sign In</Button>
      </div>
    )
  }

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <LoadingSpinner />
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black text-white"
    >
      {/* Cover Photo with loading overlay */}
      <div className="relative h-48">
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm"
          >
            <LoadingSpinner />
          </motion.div>
        )}
        
        {profileData.coverPhotoURL ? (
          <img
            src={profileData.coverPhotoURL}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full overflow-hidden">
            <div style={DEFAULT_COVER_STYLE} />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
            <div className="absolute inset-0 backdrop-blur-sm" />
            <div className="absolute inset-0 opacity-30">
              <div className="absolute w-40 h-40 rounded-full bg-blue-500/30 blur-xl animate-float top-[-20%] left-[10%]" />
              <div className="absolute w-40 h-40 rounded-full bg-purple-500/30 blur-xl animate-float-delayed top-[20%] right-[10%]" />
            </div>
          </div>
        )}
        {isEditing && (
          <button
            onClick={() => coverPhotoInputRef.current?.click()}
            className="absolute bottom-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <Upload className="w-5 h-5" />
          </button>
        )}
        <input
          ref={coverPhotoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cover')}
        />
      </div>

      {/* Profile Section */}
      <motion.div 
        className="relative px-4 pb-20"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Profile picture section */}
        <div className="relative -mt-20 mb-4">
          <motion.div 
            className="relative inline-block"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img
              src={profileData.photoURL || "/placeholder.svg?height=128&width=128"}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-black object-cover"
            />
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'profile')}
            />
          </motion.div>
        </div>

        {/* Edit/Save Buttons */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? <LoadingSpinner /> : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="not-editing"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit Profile
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Info */}
        <div className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Display Name</label>
                <Input
                  value={profileData.displayName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Display Name"
                  className="bg-zinc-800 border-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Username</label>
                <Input
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Username"
                  className="bg-zinc-800 border-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Write something about yourself..."
                  className="w-full bg-zinc-800 border-none rounded-md p-2 min-h-[100px] text-white"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-bold">{profileData.displayName}</h1>
                <p className="text-gray-400">@{profileData.username}</p>
              </div>
              {profileData.bio && (
                <p className="text-gray-200">{profileData.bio}</p>
              )}
            </>
          )}
        </div>

        {/* Sign Out Button */}
        <div className="mt-8">
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
        <BottomNav />

      </motion.div>
    </motion.div>

  )
}

