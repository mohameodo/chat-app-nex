"use client"

import { Search, Mic } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function SearchBar({ 
  placeholder = "Search...",
  onSearch
}: { 
  placeholder?: string
  onSearch?: (query: string) => void 
}) {
  const [query, setQuery] = useState("")

  const handleSearch = (value: string) => {
    setQuery(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  return (
    <div className="px-4 py-2">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-gray-400" />
        <Input 
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder} 
          className="w-full bg-zinc-900 border-none h-9 pl-9 pr-9 rounded-xl text-sm" 
        />
        <Mic className="absolute right-3 w-4 h-4 text-gray-400" />
      </div>
    </div>
  )
}

