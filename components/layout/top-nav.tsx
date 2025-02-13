import { ChevronLeft, Plus, Menu } from "lucide-react"
import Link from "next/link"

export function TopNav({
  title,
  showBack = false,
  showAdd = false,
  onAddClick,
}: {
  title: string
  showBack?: boolean
  showAdd?: boolean
  onAddClick?: () => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b  text-center border-secondary">
      <div className="flex items-center  text-center gap-3">
        {showBack ? (
          <Link href="/">
            <ChevronLeft className="w-6 h-6" />
          </Link>
        ) : (
          <Menu className="w-6 h-6" />
        )}
        <h1 className="text-xl font-semibold flex-1 text-center">{title}</h1>
      </div>
      {showAdd && (
        <button onClick={onAddClick}>
          <Plus className="w-6 h-6 text-primary" />
        </button>
      )}
    </div>
  )
}

