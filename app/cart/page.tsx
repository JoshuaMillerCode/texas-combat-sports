"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import RevealAnimation from "@/components/reveal-animation"
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page immediately
    router.replace("/")
  }, [router])

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleCheckout = async () => {
    if (state.items.length === 0) return

    setIsCheckingOut(true)

    try {
      const response = await fetch("/api/checkout/merch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: state.items.map((item) => ({
            id: item.id,
            stripePriceId: item.stripePriceId, // Send only price ID and quantity
            quantity: item.quantity,
            variant: item.variant, // Include variant for metadata
          })),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Checkout API error:", errorText)
        throw new Error("Failed to create checkout session")
      }

      const { url } = await response.json()

      if (!url) {
        throw new Error("No checkout URL received from server")
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error("Checkout error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during checkout"
      alert(`Checkout Error: ${errorMessage}`)
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4 py-20">
          <RevealAnimation>
            <div className="text-center max-w-md mx-auto">
              <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-8" />
              <h1 className="text-3xl font-black text-white mb-4">Your Cart is Empty</h1>
              <p className="text-gray-400 mb-8">Looks like you haven't added any items to your cart yet.</p>
              <Link href="/merch">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3">Shop Merchandise</Button>
              </Link>
            </div>
          </RevealAnimation>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <RevealAnimation>
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/merch" className="inline-flex items-center text-red-400 hover:text-red-300 mb-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Continue Shopping
              </Link>
              <h1 className="text-4xl font-black text-white">
                Shopping <span className="text-red-600">Cart</span>
              </h1>
              <p className="text-gray-400 mt-2">
                {state.itemCount} {state.itemCount === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            {state.items.length > 0 && (
              <Button
                variant="outline"
                onClick={clearCart}
                className="border-gray-600 text-gray-400 hover:bg-gray-800 bg-transparent"
              >
                Clear Cart
              </Button>
            )}
          </div>
        </RevealAnimation>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {state.items.map((item, index) => (
              <RevealAnimation key={`${item.id}-${item.variant}`} delay={0.1 * index}>
                <div className="bg-black/50 border border-red-900/30 rounded-lg p-6 hover:border-red-600/50 transition-all">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gray-800 rounded-lg overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-white">{item.name}</h3>
                          {item.variant !== "Default" && <p className="text-sm text-gray-400">{item.variant}</p>}
                          <p className="text-xs text-gray-500 font-mono">Price ID: {item.stripePriceId}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(`${item.id}-${item.variant}`)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-600 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-800 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                          <span className="px-4 py-2 text-white font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-800 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-gray-400">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealAnimation>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <RevealAnimation direction="right">
              <div className="bg-black/50 border border-red-900/30 rounded-lg p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal ({state.itemCount} items)</span>
                    <span>${state.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between text-xl font-bold text-white">
                      <span>Total</span>
                      <span className="text-red-600">${state.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || state.items.length === 0}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-lg mb-4"
                >
                  {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Secure checkout powered by Stripe</p>
                  <div className="flex justify-center gap-2 text-xs text-gray-500">
                    <span>🔒 SSL Encrypted</span>
                    <span>•</span>
                    <span>💳 All Cards Accepted</span>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="font-bold text-white mb-3">Shipping Information</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Free shipping on all orders</li>
                    <li>• 3-5 business days delivery</li>
                    <li>• Tracking number provided</li>
                    <li>• 30-day return policy</li>
                  </ul>
                </div>
              </div>
            </RevealAnimation>
          </div>
        </div>
      </div>
    </div>
  )
}
