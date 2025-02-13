import { TopNav } from "@/components/layout/top-nav"
import { SearchBar } from "@/components/search/search-bar"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CreateChatPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav title="New Chat" showBack />
      <SearchBar placeholder="Search people..." />

      <div className="px-4 py-2">
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2 hover:bg-zinc-900 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={`/placeholder.svg?height=48&width=48`}
                  alt={`User ${i + 1}`}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-medium">User {i + 1}</h3>
                  <p className="text-sm text-gray-400">Active recently</p>
                </div>
              </div>
              <button className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-blue-500 hidden group-[.selected]:block" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-4 left-4 right-4">
        <Button className="w-full bg-blue-500 hover:bg-blue-600">Create Chat</Button>
      </div>
    </div>
  )
}

