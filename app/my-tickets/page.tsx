"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function MyTicketsForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error" | "ratelimit" | "noorders">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (searchParams.get("error") === "invalid-link") {
      setStatus("error")
      setErrorMessage("That link has expired or already been used. Enter your email to get a new one.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    try {
      const res = await fetch("/api/customer/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.status === 429) {
        setStatus("ratelimit")
        return
      }
      if (res.status === 404) {
        setStatus("noorders")
        return
      }
      if (!res.ok) {
        const data = await res.json()
        setStatus("error")
        setErrorMessage(data.error || "Something went wrong. Please try again.")
        return
      }

      setStatus("sent")
    } catch {
      setStatus("error")
      setErrorMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 pt-24 pb-16">
      <div className="w-full max-w-md">

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="bg-red-600 px-6 py-5">
            <h1 className="text-white font-bold text-xl">Access Your Tickets</h1>
            <p className="text-red-200 text-sm mt-1">
              Enter the email you used when purchasing tickets
            </p>
          </div>

          <div className="p-6">
            {status === "sent" ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-white font-semibold text-lg mb-2">Check your email</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  If that email has orders with us, you&apos;ll receive a link to access your tickets. The link expires in 15 minutes.
                </p>
                <button
                  onClick={() => { setStatus("idle"); setEmail("") }}
                  className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {(status === "error" || status === "ratelimit" || status === "noorders") && (
                  <div className={`border rounded-lg px-4 py-3 ${status === "noorders" ? "bg-yellow-900/20 border-yellow-800" : "bg-red-900/30 border-red-800"}`}>
                    <p className={`text-sm ${status === "noorders" ? "text-yellow-400" : "text-red-400"}`}>
                      {status === "ratelimit"
                        ? "Too many requests. Please wait an hour before trying again."
                        : status === "noorders"
                        ? "We couldn't find any orders associated with that email. Double-check the email you used when purchasing."
                        : errorMessage}
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending link…
                    </>
                  ) : (
                    "Send My Ticket Link"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Need help?{" "}
          <Link href="/contact" className="text-gray-500 hover:text-gray-300 transition-colors">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function MyTicketsPage() {
  return (
    <Suspense fallback={null}>
      <MyTicketsForm />
    </Suspense>
  )
}
