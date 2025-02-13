'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Users, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const links = [
    {
      href: "/",
      icon: Home,
      label: "Home"
    },
    {
      href: "/friends",
      icon: Users,
      label: "Friends"
    },
    {
      href: user ? `/profile` : '/login',
      icon: User,
      label: "Profile"
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800/50">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                isActive ? "text-white" : "text-zinc-400"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

