"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import RevealAnimation from "@/components/reveal-animation"
import { ArrowLeft, ShoppingCart, Star, Plus, Minus, Heart, Share2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

interface ProductDetails {
  id: string
  name: string
  price: number
  stripePriceId: string // Added Stripe price ID
  images: string[]
  description: string
  category: string
  rating: number
  reviewCount: number
  sizes?: string[]
  colors?: string[]
  features: string[]
  isNew?: boolean
  isBestseller?: boolean
}

// Mock product data - in real app, this would come from API
const getProductById = (id: string): ProductDetails | null => {
  const products: Record<string, ProductDetails> = {
    "tcs-hoodie-black": {
      id: "tcs-hoodie-black",
      name: "Texas Combat Sport Hoodie",
      price: 65,
      stripePriceId: "price_1RmlHoP4zC66HIIgJKvQzXmR", // Predefined Stripe price ID
      images: [
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600",
      ],
      description:
        "Premium quality hoodie featuring the iconic Texas Combat Sport logo. Made from a comfortable cotton-polyester blend, perfect for training sessions or casual wear. Features a spacious front pocket and adjustable drawstring hood.",
      category: "Apparel",
      rating: 4.8,
      reviewCount: 127,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["Black", "Red", "Gray"],
      features: [
        "80% Cotton, 20% Polyester blend",
        "Pre-shrunk fabric",
        "Double-lined hood with drawstring",
        "Front kangaroo pocket",
        "Ribbed cuffs and waistband",
        "Machine washable",
      ],
      isNew: true,
    },
    "fight-night-tee": {
      id: "fight-night-tee",
      name: "Fight Night T-Shirt",
      price: 25,
      stripePriceId: "price_1RmlICP4zC66HIIgYHnKmPqS", // Predefined Stripe price ID
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      description:
        "Show your fighting spirit with this bold Fight Night t-shirt. Featuring striking graphics and comfortable fit, perfect for fight fans and athletes alike.",
      category: "Apparel",
      rating: 4.6,
      reviewCount: 89,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["Red", "Black", "White"],
      features: [
        "100% Premium Cotton",
        "Screen-printed graphics",
        "Reinforced seams",
        "Tagless comfort",
        "Pre-shrunk",
        "Machine washable",
      ],
      isBestseller: true,
    },
  }

  return products[id] || null
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()

  useEffect(() => {
    // Redirect to home page immediately
    router.replace("/")
  }, [router])

  const product = getProductById(params.id as string)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
          <Link href="/merch">
            <Button className="bg-red-600 hover:bg-red-700 text-white">Back to Merchandise</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = async () => {
    if (product.sizes && !selectedSize) {
      alert("Please select a size")
      return
    }
    if (product.colors && !selectedColor) {
      alert("Please select a color")
      return
    }

    setIsAddingToCart(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      stripePriceId: product.stripePriceId, // Include Stripe price ID
      image: product.images[0],
      quantity,
      variant: `${selectedSize ? selectedSize + " " : ""}${selectedColor || "Default"}`.trim(),
    })

    setIsAddingToCart(false)
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <RevealAnimation>
          <Link href="/merch" className="inline-flex items-center text-red-400 hover:text-red-300 mb-8">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Merchandise
          </Link>
        </RevealAnimation>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <RevealAnimation direction="left">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-black/50 border border-red-900/30 rounded-lg overflow-hidden">
                <Image
                  src={product.images[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="flex gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square w-20 bg-black/50 border rounded-lg overflow-hidden transition-all ${
                        selectedImage === index ? "border-red-600" : "border-red-900/30 hover:border-red-600/50"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} view ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </RevealAnimation>

          {/* Product Details */}
          <RevealAnimation direction="right">
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex gap-2">
                {product.isNew && <Badge className="bg-green-600 text-white">NEW</Badge>}
                {product.isBestseller && <Badge className="bg-yellow-600 text-white">BESTSELLER</Badge>}
                <Badge variant="outline" className="border-gray-600 text-gray-400">
                  {product.category}
                </Badge>
              </div>

              {/* Title and Rating */}
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-4">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating) ? "text-yellow-500 fill-current" : "text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="text-gray-400 ml-2">
                      {product.rating} ({product.reviewCount} reviews)
                    </span>
                  </div>
                </div>
                <p className="text-4xl font-bold text-red-600 mb-6">${product.price}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{product.description}</p>
              </div>

              {/* Size Selection */}
              {product.sizes && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Size</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                          selectedSize === size
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-gray-600 text-gray-300 hover:border-red-600"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                          selectedColor === color
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-gray-600 text-gray-300 hover:border-red-600"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-800 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="px-4 py-2 text-white font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <span className="text-gray-400">
                    Total: <span className="text-red-600 font-bold">${(product.price * quantity).toFixed(2)}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-lg"
                >
                  {isAddingToCart ? (
                    "Adding to Cart..."
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Wishlist
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-gray-300 flex items-center">
                      <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </RevealAnimation>
        </div>
      </div>
    </div>
  )
}
