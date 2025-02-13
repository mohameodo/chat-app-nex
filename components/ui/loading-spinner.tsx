"use client"

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-10 h-10">
        <div className="absolute top-0 left-0 right-0 bottom-0">
          <div className="w-10 h-10 rounded-full border-4 border-blue-500/30 animate-pulse"></div>
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0">
          <div className="w-10 h-10 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
        </div>
      </div>
    </div>
  )
} 