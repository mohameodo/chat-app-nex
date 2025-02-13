"use client"

import { useState } from "react"
import { Plus, Image, Mic, SmilePlus, Send, ChevronRight, X } from "lucide-react"
import { Input } from "@/components/ui/input"

export function ChatInput() {
  const [message, setMessage] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="p-4 flex items-center gap-2">
      <button className="p-2" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? <X className="w-5 h-5 text-blue-500" /> : <ChevronRight className="w-5 h-5 text-blue-500" />}
      </button>

      {isExpanded && (
        <>
          <button className="p-2">
            <Plus className="w-5 h-5 text-blue-500" />
          </button>
          <button className="p-2">
            <Image className="w-5 h-5 text-blue-500" />
          </button>
        </>
      )}

      <Input
        placeholder="Aa"
        className="flex-1 bg-zinc-800 border-none rounded-full h-9"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {message ? (
        <button className="p-2">
          <Send className="w-5 h-5 text-blue-500" />
        </button>
      ) : (
        <>
          <button className="p-2">
            <Mic className="w-5 h-5 text-blue-500" />
          </button>
          <button className="p-2">
            <SmilePlus className="w-5 h-5 text-blue-500" />
          </button>
        </>
      )}
    </div>
  )
}

