"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const galleryImages = [
    {
      id: 1,
      src: "/placeholder.svg?height=400&width=600",
      alt: "Intense fight moment",
      category: "Action",
    },
    {
      id: 2,
      src: "/placeholder.svg?height=400&width=600",
      alt: "Victory celebration",
      category: "Victory",
    },
    {
      id: 3,
      src: "/placeholder.svg?height=400&width=600",
      alt: "Crowd energy",
      category: "Crowd",
    },
    {
      id: 4,
      src: "/placeholder.svg?height=400&width=600",
      alt: "Behind the scenes",
      category: "Behind the Scenes",
    },
    {
      id: 5,
      src: "/placeholder.svg?height=400&width=600",
      alt: "Fighter preparation",
      category: "Preparation",
    },
    {
      id: 6,
      src: "/placeholder.svg?height=400&width=600",
      alt: "Championship moment",
      category: "Championship",
    },
    {
      id: 7,
      src: "/placeholder.svg?height=400&width=600",
      alt: "Training session",
      category: "Training",
    },
    {
      id: 8,
      src: "/placeholder.svg?height=400&width=600",
      alt: "Event atmosphere",
      category: "Atmosphere",
    },
    {
      id: 9,
      src: "/placeholder.svg?height=400&width=600",
      alt: "Fighter portrait",
      category: "Portrait",
    },
    {
      id: 10,
      src: "/placeholder.svg?height=400&width=600",
      alt: "Action shot",
      category: "Action",
    },
    {
      id: 11,
      src: "/placeholder.svg?height=400&width=600",
      alt: "Victory moment",
      category: "Victory",
    },
    {
      id: 12,
      src: "/placeholder.svg?height=400&width=600",
      alt: "Crowd reaction",
      category: "Crowd",
    },
  ]

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/gallery-hero.mp4" type="video/mp4" />
          <source src="/videos/gallery-hero.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-black text-white mb-4">
            EVENT <span className="text-red-600">GALLERY</span>
          </h1>
          <p className="text-xl text-gray-300">Capturing the Intensity</p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryImages.map((image) => (
              <div
                key={image.id}
                className="relative group cursor-pointer overflow-hidden rounded-lg"
                onClick={() => setSelectedImage(image.src)}
              >
                <div className="relative h-64">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">{image.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={selectedImage || "/placeholder.svg"}
              alt="Gallery image"
              width={800}
              height={600}
              className="object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </div>
  )
}
