"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

export default function CartIcon() {
  const { state } = useCart()

  return (
    <Link href="/cart" className="relative p-2 text-white hover:text-red-400 transition-colors">
      <ShoppingCart className="w-6 h-6" />
      {state.itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {state.itemCount > 99 ? "99+" : state.itemCount}
        </span>
      )}
    </Link>
  )
}
