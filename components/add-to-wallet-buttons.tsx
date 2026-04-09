"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface AddToWalletButtonsProps {
  orderId: string
}

export function AddToWalletButtons({ orderId }: AddToWalletButtonsProps) {
  const [appleLoading, setAppleLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [appleError, setAppleError] = useState<string | null>(null)
  const [googleError, setGoogleError] = useState<string | null>(null)

  const handleAppleWallet = async () => {
    setAppleLoading(true)
    setAppleError(null)
    try {
      const res = await fetch(`/api/wallet/apple/${orderId}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to generate pass")
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `tcs-ticket-${orderId}.pkpass`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      setAppleError(err.message ?? "Something went wrong")
    } finally {
      setAppleLoading(false)
    }
  }

  const handleGoogleWallet = async () => {
    setGoogleLoading(true)
    setGoogleError(null)
    try {
      const res = await fetch(`/api/wallet/google/${orderId}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to generate pass")
      }
      const { url } = await res.json()
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (err: any) {
      setGoogleError(err.message ?? "Something went wrong")
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-gray-500 text-xs text-center uppercase tracking-widest">Add to Wallet</p>
      <div className="flex gap-3">
        {/* Apple Wallet */}
        <button
          onClick={handleAppleWallet}
          disabled={appleLoading}
          className="flex-1 flex items-center justify-center gap-2 bg-black border border-gray-700 hover:border-gray-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
          aria-label="Add to Apple Wallet"
        >
          {appleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <AppleWalletIcon />
          )}
          <span>Apple Wallet</span>
        </button>

        {/* Google Wallet */}
        <button
          onClick={handleGoogleWallet}
          disabled={googleLoading}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-900 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
          aria-label="Add to Google Wallet"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <GoogleWalletIcon />
          )}
          <span>Google Wallet</span>
        </button>
      </div>

      {appleError && (
        <p className="text-xs text-red-400 text-center">{appleError}</p>
      )}
      {googleError && (
        <p className="text-xs text-red-400 text-center">{googleError}</p>
      )}
    </div>
  )
}

function AppleWalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

function GoogleWalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M21.56 10.738l-9.259-9.26a1.957 1.957 0 00-2.767 0l-1.995 1.994 2.497 2.497a2.326 2.326 0 012.943.297 2.33 2.33 0 01.291 2.955l2.408 2.408a2.326 2.326 0 012.955.291 2.336 2.336 0 010 3.305 2.336 2.336 0 01-3.305 0 2.34 2.34 0 01-.505-2.544l-2.247-2.247v5.915a2.336 2.336 0 01.616 4.462 2.336 2.336 0 01-2.893-2.283 2.336 2.336 0 011.388-2.134V10.28a2.336 2.336 0 01-1.388-2.134 2.336 2.336 0 012.336-2.336c.175 0 .345.019.508.055L10.937 3.45 2.44 11.944a1.957 1.957 0 000 2.767l9.26 9.26a1.957 1.957 0 002.767 0l7.093-7.094a1.957 1.957 0 000-2.767z" fill="#4285F4"/>
    </svg>
  )
}
