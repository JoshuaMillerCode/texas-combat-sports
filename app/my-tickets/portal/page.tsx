"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })
}

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
}

function QRCodeImage({ ticketNumber }: { ticketNumber: string }) {
  const [src, setSrc] = useState<string>("")
  const [error, setError] = useState(false)

  useEffect(() => {
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(ticketNumber, { width: 160, margin: 1, color: { dark: "#000000", light: "#ffffff" } })
        .then(setSrc)
        .catch(() => setError(true))
    }).catch(() => setError(true))
  }, [ticketNumber])

  if (error) return (
    <div className="w-[160px] h-[160px] bg-gray-800 rounded flex items-center justify-center">
      <p className="text-gray-500 text-xs text-center px-2">QR unavailable — use ticket number below</p>
    </div>
  )

  if (!src) return <div className="w-[160px] h-[160px] bg-gray-800 rounded animate-pulse" />

  return (
    <div className="bg-white p-2 rounded-lg inline-block">
      <img src={src} alt={`QR code for ticket ${ticketNumber}`} width={160} height={160} />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
    pending:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    refunded:  "bg-red-500/20 text-red-400 border-red-500/30",
    cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${map[status] ?? map.cancelled}`}>
      {status}
    </span>
  )
}

function OrderCard({ order, showQR }: { order: any; showQR: boolean }) {
  const [expanded, setExpanded] = useState(showQR)

  const tickets = (order.ticketItems ?? []).flatMap((item: any) =>
    (item.tickets ?? []).map((t: any) => ({
      ...t,
      tierName: item.tierName,
      quantity: item.quantity,
    }))
  )

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Order header */}
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold text-base truncate">
              {order.event?.title ?? "Event"}
            </h3>
            <StatusBadge status={order.status} />
          </div>
          {order.event?.date && (
            <p className="text-gray-500 text-sm mt-0.5">{fmtDate(order.event.date)}</p>
          )}
          {order.event?.venue && (
            <p className="text-gray-600 text-xs mt-0.5">{order.event.venue}</p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-gray-400 text-xs font-mono">{order.orderId}</span>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-gray-400 text-xs">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
            </span>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-gray-400 text-xs">{fmt(order.summary?.totalAmount ?? 0)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={`/api/tickets/${order.orderId}/download`}
            download
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            ↓ PDF
          </a>
          {showQR && tickets.length > 0 && (
            <button
              onClick={() => setExpanded((p) => !p)}
              className="text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              {expanded ? "Hide QR" : "Show QR"}
            </button>
          )}
        </div>
      </div>

      {/* QR codes */}
      {expanded && showQR && tickets.length > 0 && (
        <div className="border-t border-gray-800 px-5 py-5">
          <p className="text-gray-500 text-xs mb-4 uppercase tracking-wider font-medium">Your Tickets</p>
          <div className="flex flex-wrap gap-6">
            {tickets.map((ticket: any) => (
              <div key={ticket._id ?? ticket.ticketNumber} className="flex flex-col items-center gap-2">
                <QRCodeImage ticketNumber={ticket.ticketNumber} />
                <div className="text-center">
                  <p className="text-white text-xs font-medium">{ticket.tierName}</p>
                  <p className="text-gray-600 text-xs font-mono mt-0.5">{ticket.ticketNumber}</p>
                  {ticket.isUsed && (
                    <p className="text-red-400 text-xs mt-0.5">Used</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PortalPage() {
  const router = useRouter()
  const [data, setData] = useState<{ upcoming: any[]; past: any[]; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [pastExpanded, setPastExpanded] = useState(false)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/orders", { credentials: "include" })
      if (res.status === 401) {
        router.push("/my-tickets")
        return
      }
      if (!res.ok) throw new Error("Failed to fetch")
      setData(await res.json())
    } catch {
      router.push("/my-tickets")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleSignOut = async () => {
    setSigningOut(true)
    await fetch("/api/customer/auth/logout", { method: "POST", credentials: "include" })
    router.push("/my-tickets")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading your tickets…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-900 bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/">
              <span className="text-white font-black text-lg tracking-tight uppercase">
                Texas <span className="text-red-600">Combat</span> Sports
              </span>
            </Link>
            {data?.email && (
              <p className="text-gray-600 text-xs mt-0.5">{data.email}</p>
            )}
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

        {/* Upcoming */}
        <section>
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-red-600 rounded-full inline-block" />
            Upcoming Events
          </h2>
          {data?.upcoming && data.upcoming.length > 0 ? (
            <div className="space-y-4">
              {data.upcoming.map((order: any) => (
                <OrderCard key={order._id} order={order} showQR={true} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-8 text-center">
              <p className="text-gray-500 text-sm">No upcoming events.</p>
              <Link
                href="/events"
                className="inline-block mt-3 text-sm text-red-500 hover:text-red-400 transition-colors"
              >
                Browse upcoming events →
              </Link>
            </div>
          )}
        </section>

        {/* Past */}
        {data?.past && data.past.length > 0 && (
          <section>
            <button
              onClick={() => setPastExpanded((p) => !p)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-full text-left"
            >
              <h2 className="font-bold text-lg flex items-center gap-2">
                <span className="w-1.5 h-5 bg-gray-700 rounded-full inline-block" />
                Past Orders
                <span className="text-gray-600 text-sm font-normal">({data.past.length})</span>
              </h2>
              <svg
                className={`ml-auto w-4 h-4 transition-transform ${pastExpanded ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {pastExpanded && (
              <div className="space-y-4 mt-4">
                {data.past.map((order: any) => (
                  <OrderCard key={order._id} order={order} showQR={false} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
