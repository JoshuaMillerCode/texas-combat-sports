import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Admin Dashboard - Texas Combat Sports",
  description: "Admin dashboard for Texas Combat Sports management",
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.className} bg-black text-white overflow-x-hidden`}>
      {children}
    </div>
  )
} 