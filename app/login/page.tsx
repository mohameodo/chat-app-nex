'use client'

import LoginForm from "@/components/auth/login-form"
import { BottomNav } from "@/components/layout/bottom-nav"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <LoginForm />
      <BottomNav />

    </div>
  )
}

