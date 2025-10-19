import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { QueryProvider } from "@/contexts/query-context"
import { AuthProvider } from "@/contexts/auth-context"
import { CurrentEventProvider } from "@/contexts/current-event-context"
import { Analytics } from '@vercel/analytics/next';


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Texas Combat Sport - Real Fights. Real Houston.",
  description: "Houston-based combat sports promotion company putting on high-intensity boxing events.",
  generator: 'v0.dev',
  icons: {
    icon: 'https://res.cloudinary.com/dujmomznj/image/upload/f_webp/v1755476673/helmet_ouwsr5.jpg',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white overflow-x-hidden`}>
        <QueryProvider>
          <AuthProvider>
            <CurrentEventProvider>
              <Header />
              <main>{children}</main>
              <Footer />
            </CurrentEventProvider>
          </AuthProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
