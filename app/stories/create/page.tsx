import { TopNav } from "@/components/layout/top-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, ImageIcon } from "lucide-react"

export default function CreateStoryPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav title="Create Story" showBack />

      <div className="p-4 space-y-6">
        <div className="aspect-[9/16] bg-zinc-900 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="font-medium">Create a Story</p>
              <p className="text-sm text-gray-400">Share a photo or video</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button className="w-full" variant="outline">
            <Camera className="w-4 h-4 mr-2" />
            Camera
          </Button>
          <Button className="w-full" variant="outline">
            <ImageIcon className="w-4 h-4 mr-2" />
            Gallery
          </Button>
        </div>

        <div className="space-y-4">
          <Input placeholder="Add a caption..." className="bg-zinc-900 border-none" />
          <Button className="w-full">Share Story</Button>
        </div>
      </div>
    </div>
  )
}

