"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import RevealAnimation from "@/components/reveal-animation"
import { ShoppingCart, Eye, Star } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

interface MerchandiseItem {
  id: string
  name: string
  price: number
  stripePriceId: string // Added Stripe price ID
  image: string
  category: string
  rating: number
  isNew?: boolean
  isBestseller?: boolean
}

const merchandiseItems: MerchandiseItem[] = [
  {
    id: "tcs-hoodie-black",
    name: "Texas Combat Sport Hoodie",
    price: 65,
    stripePriceId: "price_1RmlHoP4zC66HIIgJKvQzXmR", // Predefined Stripe price ID
    image: "/placeholder.svg?height=400&width=400",
    category: "Apparel",
    rating: 4.8,
    isNew: true,
  },
  {
    id: "fight-night-tee",
    name: "Fight Night T-Shirt",
    price: 25,
    stripePriceId: "price_1RmlICP4zC66HIIgYHnKmPqS", // Predefined Stripe price ID
    image: "/placeholder.svg?height=400&width=400",
    category: "Apparel",
    rating: 4.6,
    isBestseller: true,
  },
  {
    id: "boxing-gloves-pro",
    name: "Professional Boxing Gloves",
    price: 120,
    stripePriceId: "price_1RmlIWP4zC66HIIgvBxCzNmK", // Predefined Stripe price ID
    image: "/placeholder.svg?height=400&width=400",
    category: "Equipment",
    rating: 4.9,
  },
  {
    id: "tcs-cap",
    name: "TCS Snapback Cap",
    price: 35,
    stripePriceId: "price_1RmlIpP4zC66HIIgQRtYzXvL", // Predefined Stripe price ID
    image: "/placeholder.svg?height=400&width=400",
    category: "Accessories",
    rating: 4.5,
  },
  {
    id: "training-shorts",
    name: "Training Shorts",
    price: 45,
    stripePriceId: "price_1RmlJ8P4zC66HIIgMnPqRsTV", // Predefined Stripe price ID
    image: "/placeholder.svg?height=400&width=400",
    category: "Apparel",
    rating: 4.7,
  },
  {
    id: "gym-bag",
    name: "TCS Gym Bag",
    price: 55,
    stripePriceId: "price_1RmlJRP4zC66HIIgKLmNxYzW", // Predefined Stripe price ID
    image: "/placeholder.svg?height=400&width=400",
    category: "Accessories",
    rating: 4.4,
  },
  {
    id: "hand-wraps",
    name: "Professional Hand Wraps",
    price: 15,
    stripePriceId: "price_1RmlJkP4zC66HIIgHQrSzTuX", // Predefined Stripe price ID
    image: "/placeholder.svg?height=400&width=400",
    category: "Equipment",
    rating: 4.6,
  },
  {
    id: "tank-top",
    name: "Performance Tank Top",
    price: 30,
    stripePriceId: "price_1RmlK3P4zC66HIIgNVwXzYpQ", // Predefined Stripe price ID
    image: "/placeholder.svg?height=400&width=400",
    category: "Apparel",
    rating: 4.5,
    isNew: true,
  },
]

const categories = ["All", "Apparel", "Equipment", "Accessories"]

export default function MerchandisePage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const { addToCart } = useCart()

  const filteredItems =
    selectedCategory === "All"
      ? merchandiseItems
      : merchandiseItems.filter((item) => item.category === selectedCategory)

  const handleQuickAdd = (item: MerchandiseItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      stripePriceId: item.stripePriceId, // Include Stripe price ID
      image: item.image,
      quantity: 1,
      variant: "Default",
    })
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <RevealAnimation>
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
                OFFICIAL <span className="text-red-600">MERCH</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Gear up with authentic Texas Combat Sport merchandise. From training essentials to fan favorites.
              </p>
            </div>
          </RevealAnimation>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 pt-2">
        {/* Category Filter */}
        <RevealAnimation delay={0.2}>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`px-6 py-2 font-bold transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </RevealAnimation>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item, index) => (
            <RevealAnimation key={item.id} delay={0.1 * index}>
              <div className="group bg-black/50 border border-red-900/30 rounded-lg overflow-hidden hover:border-red-600/50 transition-all duration-300 hover:transform hover:scale-105">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {item.isNew && <Badge className="bg-green-600 text-white text-xs">NEW</Badge>}
                    {item.isBestseller && <Badge className="bg-yellow-600 text-white text-xs">BESTSELLER</Badge>}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link href={`/merch/${item.id}`}>
                      <Button size="sm" className="bg-white/90 hover:bg-white text-black p-2">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white p-2"
                      onClick={() => handleQuickAdd(item)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(item.rating) ? "text-yellow-500 fill-current" : "text-gray-600"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-400 ml-2">({item.rating})</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                    {item.name}
                  </h3>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-red-600">${item.price}</span>
                    <Badge variant="outline" className="border-gray-600 text-gray-400">
                      {item.category}
                    </Badge>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="mt-4 space-y-2">
                    <Link href={`/merch/${item.id}`} className="block">
                      <Button className="w-full bg-transparent border border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                      onClick={() => handleQuickAdd(item)}
                    >
                      Quick Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </RevealAnimation>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-white mb-4">No items found</h3>
            <p className="text-gray-400">Try selecting a different category.</p>
          </div>
        )}
      </div>
    </div>
  )
}
