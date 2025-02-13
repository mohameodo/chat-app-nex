import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchBar() {
  return (
    <div className="px-4 py-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input placeholder="Search chats..." className="w-full bg-zinc-900 border-none h-12 pl-12 rounded-xl" />
      </div>
    </div>
  )
}

