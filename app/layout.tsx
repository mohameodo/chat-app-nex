import "@/styles/globals.css"
import type React from "react"
import dynamic from 'next/dynamic'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
}

export const metadata = {
  title: 'nindoe',
  description: 'nidnoe is a chating app',
  generator: 'nexiloop',
  manifest: '/manifest.json',
  themeColor: '#000000'
}

// Dynamically import AuthProvider with no SSR
const AuthProviderNoSSR = dynamic(
  () => import('@/contexts/AuthContext').then(mod => mod.AuthProvider),
  { ssr: false }
)

const RouteProtectionNoSSR = dynamic(
  () => import('@/components/auth/route-protection'),
  { ssr: false }
)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="min-h-screen bg-background text-foreground overflow-x-hidden scrollbar-hide">
        <AuthProviderNoSSR>
          <RouteProtectionNoSSR>
            {children}
          </RouteProtectionNoSSR>
        </AuthProviderNoSSR>
      </body>
    </html>
  )
}
