"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function StoryViewer({
  stories,
  onClose,
}: {
  stories: { id: number; image: string; username: string }[]
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setProgress(0)
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative h-full">
        <div className="absolute top-0 left-0 right-0 z-10 p-4">
          <Progress value={progress} className="h-1" />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <img
                src={`/placeholder.svg?height=32&width=32`}
                alt={stories[currentIndex].username}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium">{stories[currentIndex].username}</span>
            </div>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <img
          src={stories[currentIndex].image || "/placeholder.svg"}
          alt="Story"
          className="w-full h-full object-cover"
        />

        <button
          onClick={prevStory}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2"
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextStory}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2"
          disabled={currentIndex === stories.length - 1}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

