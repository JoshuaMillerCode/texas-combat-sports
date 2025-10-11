"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Minus, CreditCard, Shield, Clock } from "lucide-react"
import type { CheckoutSessionData } from "@/types/stripe"
import { formatAmountForDisplay } from "@/lib/stripe"

// Updated interface to match the TicketTier model
interface TicketTier {
  _id: string
  event: string
  tierId: string
  name: string
  description?: string
  price: number
  currency: string
  features: string[]
  stripePriceId: string
  maxQuantity: number
  availableQuantity: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface TicketPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  ticketTiers: TicketTier[]
}

export default function TicketPurchaseModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  eventDate,
  eventVenue,
  ticketTiers,
}: TicketPurchaseModalProps) {
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({})
  const [customerEmail, setCustomerEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter active ticket tiers and sort by sortOrder
  const activeTicketTiers = ticketTiers
    .filter(tier => tier.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const updateTicketQuantity = (tierId: string, quantity: number) => {
    const tier = activeTicketTiers.find((t) => t._id === tierId)
    if (!tier) return

    // Check against both maxQuantity and availableQuantity
    const maxAllowed = Math.min(tier.maxQuantity, tier.availableQuantity)
    const newQuantity = Math.max(0, Math.min(quantity, maxAllowed))

    setSelectedTickets((prev) => ({
      ...prev,
      [tierId]: newQuantity,
    }))
  }

  const getTotalAmount = () => {
    return Object.entries(selectedTickets).reduce((total, [tierId, quantity]) => {
      const tier = activeTicketTiers.find((t) => t._id === tierId)
      return total + (tier ? tier.price * quantity : 0)
    }, 0)
  }

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0)
  }

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Validate selections
      const totalTickets = getTotalTickets()
      if (totalTickets === 0) {
        setError("Please select at least one ticket")
        setIsLoading(false)
        return
      }

      if (!customerEmail || !customerEmail.includes("@")) {
        setError("Please enter a valid email address")
        setIsLoading(false)
        return
      }

      // Prepare checkout data
      const tickets = Object.entries(selectedTickets)
        .filter(([_, quantity]) => quantity > 0)
        .map(([tierId, quantity]) => {
          const tier = activeTicketTiers.find((t) => t._id === tierId)!
          return {
            tierId: tier._id,
            tierName: tier.name,
            quantity,
            price: tier.price,
            stripePriceId: tier.stripePriceId,
          }
        })

      const checkoutData: CheckoutSessionData = {
        eventId,
        eventTitle,
        eventDate,
        eventVenue,
        tickets,
        customerEmail,
      }

      // Create checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      })

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Checkout API error:", errorText)

        // Try to parse as JSON, fallback to text
        let errorMessage = "Failed to create checkout session"
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          // If not JSON, use the text response or a generic message
          errorMessage = errorText.includes("Internal")
            ? "Server error occurred. Please try again."
            : errorText || errorMessage
        }

        throw new Error(errorMessage)
      }

      // Parse successful response
      const data = await response.json()

      if (!data.url) {
        throw new Error("No checkout URL received from server")
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      console.error("Checkout error:", err)
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during checkout"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-900 border border-red-900/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-red-900/30">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Purchase Tickets</h2>
                <p className="text-gray-400">
                  {eventTitle} - {eventVenue}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-600/10"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Security Notice */}
              <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4 mb-6">
                <div className="flex items-center text-green-400 mb-2">
                  <Shield className="w-5 h-5 mr-2" />
                  <span className="font-bold">Secure Checkout</span>
                </div>
                <p className="text-green-300 text-sm">
                  Your payment is processed securely by Stripe. We never store your payment information.
                </p>
              </div>

              {/* Customer Email */}
              <div className="mb-6">
                <label htmlFor="email" className="block text-white font-medium mb-2">
                  Email Address *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="bg-black/50 border-red-900/30 text-white placeholder-gray-500"
                  required
                />
                <p className="text-gray-400 text-sm mt-1">Tickets will be sent to this email address</p>
              </div>

              {/* Ticket Selection */}
              <div className="space-y-4 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Select Tickets</h3>

                {activeTicketTiers.length === 0 ? (
                  <div className="bg-black/50 border border-red-900/30 rounded-lg p-6 text-center">
                    <p className="text-gray-400">No tickets are currently available for this event.</p>
                  </div>
                ) : (
                  activeTicketTiers.map((tier) => {
                    const currentQuantity = selectedTickets[tier._id] || 0
                    const maxAllowed = Math.min(tier.maxQuantity, tier.availableQuantity)
                    const isSoldOut = tier.availableQuantity === 0

                    return (
                      <div
                        key={tier._id}
                        className={`bg-black/50 border border-red-900/30 rounded-lg p-4 transition-colors ${
                          isSoldOut ? 'opacity-50' : 'hover:border-red-600/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-white">{tier.name}</h4>
                            {tier.description && (
                              <p className="text-gray-400 text-sm mb-2">{tier.description}</p>
                            )}
                            <p className="text-2xl font-bold text-red-600">
                              {formatAmountForDisplay(tier.price, tier.currency)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateTicketQuantity(tier._id, currentQuantity - 1)}
                              disabled={!currentQuantity || isSoldOut}
                              className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="text-white font-bold w-8 text-center">{currentQuantity}</span>
                            <button
                              onClick={() => updateTicketQuantity(tier._id, currentQuantity + 1)}
                              disabled={currentQuantity >= maxAllowed || isSoldOut}
                              className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>

                        {tier.features && tier.features.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {tier.features.map((feature, index) => (
                              <div key={index} className="text-gray-300 text-sm flex items-start">
                                <span className="text-red-500 mr-2 mt-1">•</span>
                                {feature}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {isSoldOut ? (
                              <span className="text-red-400 font-semibold">SOLD OUT</span>
                            ) : (
                              `${tier.availableQuantity} available`
                            )}
                          </span>
                          {currentQuantity > 0 && (
                            <Badge className="bg-red-600 text-white">
                              Subtotal: {formatAmountForDisplay(tier.price * currentQuantity, tier.currency)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Order Summary */}
              {getTotalTickets() > 0 && (
                <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 mb-6">
                  <h4 className="text-white font-bold mb-3">Order Summary</h4>
                  <div className="space-y-2 mb-3">
                    {Object.entries(selectedTickets)
                      .filter(([_, quantity]) => quantity > 0)
                      .map(([tierId, quantity]) => {
                        const tier = activeTicketTiers.find((t) => t._id === tierId)!
                        return (
                          <div key={tierId} className="flex justify-between text-gray-300">
                            <span>
                              {tier.name} × {quantity}
                            </span>
                            <span>{formatAmountForDisplay(tier.price * quantity, tier.currency)}</span>
                          </div>
                        )
                      })}
                  </div>
                  <div className="border-t border-red-600/30 pt-3">
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total ({getTotalTickets()} tickets)</span>
                      <span>{formatAmountForDisplay(getTotalAmount(), "USD")}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-600/10 border border-red-600 rounded-lg p-4 mb-6">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Session Timeout Warning */}
              <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4 mb-6">
                <div className="flex items-center text-yellow-400 mb-2">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-bold">Session Timeout</span>
                </div>
                <p className="text-yellow-300 text-sm">
                  Your checkout session will expire in 30 minutes for security purposes.
                </p>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={isLoading || getTotalTickets() === 0 || !customerEmail || activeTicketTiers.length === 0}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceed to Secure Checkout
                  </div>
                )}
              </Button>

              <p className="text-gray-400 text-center text-sm mt-4">
                By proceeding, you agree to our terms of service and refund policy.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
