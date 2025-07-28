"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import RevealAnimation from "@/components/reveal-animation"
import { CheckCircle, Download, Mail, Calendar, MapPin, Clock } from "lucide-react"
import { formatAmountForDisplay } from "@/lib/stripe"
import { useTransactionQuery, useDownloadTicketMutation } from "@/hooks/use-queries"

interface CheckoutSession {
  id: string
  amount_total: number
  currency: string
  customer_details: {
    email: string
    name: string
    phone: string
  }
  metadata: {
    eventId: string
    eventTitle: string
    eventDate: string
    eventVenue: string
    ticketData: string
  }
  line_items: {
    data: Array<{
      description: string
      quantity: number
      amount_total: number
    }>
  }
  payment_status: string
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [orderId, setOrderId] = useState<string | null>(null)
  const [session, setSession] = useState<CheckoutSession | null>(null)
  const { data: transaction, isLoading: isTransactionLoading } = useTransactionQuery(sessionId || "")
  const downloadTicketMutation = useDownloadTicketMutation()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided")
      setLoading(false)
      return
    }

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/checkout/session?session_id=${sessionId}`)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Session fetch error:", errorText)

          // Try to parse error response
          let errorMessage = "Failed to retrieve session"
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || errorMessage
          } catch {
            errorMessage = errorText.includes("Internal")
              ? "Server error occurred. Please contact support."
              : errorText || errorMessage
          }

          throw new Error(errorMessage)
        }
        const sessionData = await response.json()
        setSession(sessionData)
      } catch (err) {
        console.error("Error fetching session:", err)
        const errorMessage = err instanceof Error ? err.message : "An error occurred while loading your order"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  useEffect(() => {
    setOrderId(transaction?.transaction?.orderId || null)
  }, [transaction])

  const handleDownloadTickets = async () => {
    if (!orderId) {
      console.error('No order ID available')
      return
    }

    try {
      const blob = await downloadTicketMutation.mutateAsync(orderId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ticket-${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading tickets:', error)
      // You could show a toast notification here
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white">Loading your order details...</p>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 mb-4">
            <CheckCircle size={64} className="mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Order Not Found</h1>
          <p className="text-gray-400 mb-6">{error || "We couldn't find your order details."}</p>
          <Link href="/events">
            <Button className="bg-red-600 hover:bg-red-700 text-white">Back to Events</Button>
          </Link>
        </div>
      </div>
    )
  }

  const ticketData = JSON.parse(session.metadata.ticketData)
  const eventDate = new Date(session.metadata.eventDate)

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <RevealAnimation>
            <div className="text-center mb-12">
              <div className="text-green-500 mb-6">
                <CheckCircle size={80} className="mx-auto" />
              </div>
              <h1 className="text-4xl font-black text-white mb-4">
                PAYMENT <span className="text-red-600">SUCCESSFUL!</span>
              </h1>
              <p className="text-xl text-gray-300">
                Your tickets have been confirmed and will be sent to your email shortly.
              </p>
            </div>
          </RevealAnimation>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <RevealAnimation direction="left">
              <div className="bg-black/50 border border-red-900/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

                {/* Event Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">{session.metadata.eventTitle}</h3>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-red-500" />
                      {eventDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-red-500" />
                      {eventDate.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-red-500" />
                      {session.metadata.eventVenue}
                    </div>
                  </div>
                </div>

                {/* Tickets */}
                <div className="mb-6">
                  <h4 className="text-white font-bold mb-3">Tickets Purchased</h4>
                  <div className="space-y-3">
                    {session.line_items.data.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="text-white font-medium">{item.description}</span>
                          <span className="text-gray-400 ml-2">× {item.quantity}</span>
                        </div>
                        <span className="text-white font-bold">
                          {formatAmountForDisplay(item.amount_total / 100, session.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-red-900/30 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-white">Total Paid</span>
                    <span className="text-2xl font-bold text-red-600">
                      {formatAmountForDisplay(session.amount_total / 100, session.currency)}
                    </span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="mt-4">
                  <Badge className="bg-green-600 text-white">Payment {session.payment_status}</Badge>
                </div>
              </div>
            </RevealAnimation>

            {/* Customer & Next Steps */}
            <RevealAnimation direction="right">
              <div className="space-y-6">
                {/* Customer Details */}
                <div className="bg-black/50 border border-red-900/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Customer Details</h3>
                  <div className="space-y-2 text-gray-300">
                    <div>
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white ml-2">{session.customer_details.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white ml-2">{session.customer_details.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Phone:</span>
                      <span className="text-white ml-2">{session.customer_details.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">What's Next?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Mail className="w-5 h-5 text-red-500 mr-3 mt-1" />
                      <div>
                        <h4 className="text-white font-bold">Check Your Email</h4>
                        <p className="text-gray-300 text-sm">
                          Your tickets and receipt have been sent to {session.customer_details.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Download className="w-5 h-5 text-red-500 mr-3 mt-1" />
                      <div>
                        <h4 className="text-white font-bold">Download Tickets</h4>
                        <p className="text-gray-300 text-sm">Save your tickets to your phone or print them for entry</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 text-red-500 mr-3 mt-1" />
                      <div>
                        <h4 className="text-white font-bold">Add to Calendar</h4>
                        <p className="text-gray-300 text-sm">Don't forget to add the event to your calendar</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                    onClick={handleDownloadTickets}
                    disabled={!orderId || isTransactionLoading || downloadTicketMutation.isPending}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {downloadTicketMutation.isPending ? 'Downloading...' : 'Download Tickets'}
                  </Button>
                  <Link href="/events" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold py-3 bg-transparent"
                    >
                      Browse More Events
                    </Button>
                  </Link>
                </div>
              </div>
            </RevealAnimation>
          </div>

          {/* Important Information */}
          <RevealAnimation delay={0.4}>
            <div className="mt-12 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Important Information</h3>
              <div className="grid md:grid-cols-2 gap-6 text-gray-300 text-sm">
                <div>
                  <h4 className="text-white font-bold mb-2">Event Entry</h4>
                  <ul className="space-y-1">
                    <li>• Arrive 30 minutes before event start</li>
                    <li>• Bring valid photo ID</li>
                    <li>• Present tickets (digital or printed)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2">Need Help?</h4>
                  <ul className="space-y-1">
                    <li>• Email: support@texascombatsport.com</li>
                    <li>• Phone: (713) 555-FIGHT</li>
                    {isTransactionLoading ? (
                      <li>• Order ID: Loading...</li>
                    ) : (
                      <li>• Order ID: {orderId}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </RevealAnimation>
        </div>
      </div>
    </div>
  )
}
