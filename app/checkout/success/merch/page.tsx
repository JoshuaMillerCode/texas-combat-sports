"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import RevealAnimation from "@/components/reveal-animation"
import { CheckCircle, Package, Mail, Truck, Home } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

interface CheckoutSession {
  id: string
  amount_total: number
  currency: string
  customer_details: {
    email: string
    name: string
    phone: string
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
  shipping_details: {
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
    name: string
  }
  metadata: {
    order_type: string
    item_count: string
    total_quantity: string
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

export default function MerchCheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const { clearCart } = useCart()

  const [session, setSession] = useState<CheckoutSession | null>(null)
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
          throw new Error("Failed to retrieve session")
        }

        const sessionData = await response.json()
        setSession(sessionData)

        // Clear the cart after successful purchase
        clearCart()
      } catch (err) {
        console.error("Error fetching session:", err)
        const errorMessage = err instanceof Error ? err.message : "An error occurred while loading your order"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId, clearCart])

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
          <Link href="/merch">
            <Button className="bg-red-600 hover:bg-red-700 text-white">Back to Merchandise</Button>
          </Link>
        </div>
      </div>
    )
  }

  const formatAddress = (address: any) => {
    return `${address.line1}${address.line2 ? `, ${address.line2}` : ""}, ${address.city}, ${address.state} ${address.postal_code}, ${address.country}`
  }

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
                ORDER <span className="text-red-600">CONFIRMED!</span>
              </h1>
              <p className="text-xl text-gray-300">
                Thank you for your purchase! Your order has been confirmed and will be shipped soon.
              </p>
            </div>
          </RevealAnimation>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <RevealAnimation direction="left">
              <div className="bg-black/50 border border-red-900/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

                {/* Order Details */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400">Order Number:</span>
                    <span className="text-white font-mono text-sm">{session.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400">Items:</span>
                    <span className="text-white">{session.metadata.total_quantity} items</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status:</span>
                    <Badge className="bg-green-600 text-white">Confirmed</Badge>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h4 className="text-white font-bold mb-3">Items Ordered</h4>
                  <div className="space-y-3">
                    {session.line_items.data.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="text-white font-medium">{item.description}</span>
                          <span className="text-gray-400 ml-2">× {item.quantity}</span>
                        </div>
                        <span className="text-white font-bold">${(item.amount_total / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-red-900/30 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-white">Total Paid</span>
                    <span className="text-2xl font-bold text-red-600">${(session.amount_total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </RevealAnimation>

            {/* Shipping & Customer Info */}
            <RevealAnimation direction="right">
              <div className="space-y-6">
                {/* Customer Details */}
                <div className="bg-black/50 border border-red-900/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Customer Information</h3>
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

                {/* Shipping Address */}
                <div className="bg-black/50 border border-red-900/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Shipping Address</h3>
                  <div className="text-gray-300">
                    <p className="text-white font-medium">{session.shipping_details.name}</p>
                    <p>{formatAddress(session.shipping_details.address)}</p>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">What's Next?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Mail className="w-5 h-5 text-red-500 mr-3 mt-1" />
                      <div>
                        <h4 className="text-white font-bold">Confirmation Email</h4>
                        <p className="text-gray-300 text-sm">
                          Order confirmation sent to {session.customer_details.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Package className="w-5 h-5 text-red-500 mr-3 mt-1" />
                      <div>
                        <h4 className="text-white font-bold">Processing</h4>
                        <p className="text-gray-300 text-sm">Your order will be processed within 1-2 business days</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Truck className="w-5 h-5 text-red-500 mr-3 mt-1" />
                      <div>
                        <h4 className="text-white font-bold">Shipping</h4>
                        <p className="text-gray-300 text-sm">Tracking information will be sent via email</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealAnimation>
          </div>

          {/* Action Buttons */}
          <RevealAnimation delay={0.4}>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/merch">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold px-8 py-3 bg-transparent"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </RevealAnimation>

          {/* Important Information */}
          <RevealAnimation delay={0.6}>
            <div className="mt-12 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Important Information</h3>
              <div className="grid md:grid-cols-2 gap-6 text-gray-300 text-sm">
                <div>
                  <h4 className="text-white font-bold mb-2">Shipping & Returns</h4>
                  <ul className="space-y-1">
                    <li>• Free shipping on all orders</li>
                    <li>• 3-5 business days delivery</li>
                    <li>• 30-day return policy</li>
                    <li>• Original packaging required for returns</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2">Need Help?</h4>
                  <ul className="space-y-1">
                    <li>• Email: support@texascombatsport.com</li>
                    <li>• Phone: (713) 555-FIGHT</li>
                    <li>• Order ID: {session.id.slice(-8).toUpperCase()}</li>
                    <li>• Live chat available 9AM-6PM CST</li>
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
