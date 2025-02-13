"use client"

import { TopNav } from "@/components/layout/top-nav"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ActiveFriends } from "@/components/friends/active-friends"
import { ChatList } from "@/components/chat/chat-list"
import { SearchBar } from "@/components/search/search-bar"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { UserPlus, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <Button onClick={() => router.push('/login')}>Sign In</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <TopNav title="Chats" showAdd />
      <SearchBar placeholder="Search in chats..." />
      <ActiveFriends />
      <ChatList />
      <BottomNav />
    </div>
  )
}

