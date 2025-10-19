"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import type { GalleryImage } from "@/hooks/use-queries"

interface ImageViewerProps {
  images: GalleryImage[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

function toOptimized(url: string) {
  // Check if URL already has transformations from API
  if (url.includes("/upload/f_auto") || url.includes("/upload/w_")) {
    // Replace existing transformations with full-screen optimized ones
    const parts = url.split("/upload/")
    if (parts.length === 2) {
      const [base, rest] = parts
      // Find where version starts (v + numbers)
      const versionMatch = rest.match(/\/(v\d+\/.+)$/)
      if (versionMatch) {
        return `${base}/upload/f_auto,q_auto:good,w_1200,h_800,c_fill/${versionMatch[1]}`
      }
    }
    return url
  }
  // Optimized for full-screen viewing with auto format and quality
  return url.replace("/upload/", "/upload/f_auto,q_auto:good,w_1200,h_800,c_fill/")
}

function toBlur(url: string) {
  // Check if URL already has transformations from API
  if (url.includes("/upload/f_auto") || url.includes("/upload/w_") || url.includes("/upload/e_blur")) {
    // Extract base URL without transformations for blur
    const parts = url.split("/upload/")
    if (parts.length === 2) {
      const [base, rest] = parts
      // Find where version starts (v + numbers)
      const versionMatch = rest.match(/\/(v\d+\/.+)$/)
      if (versionMatch) {
        return `${base}/upload/e_blur:2000,q_1,w_30,h_20,c_fill/${versionMatch[1]}`
      }
    }
    return url
  }
  // Small blurry placeholder for faster loading
  return url.replace("/upload/", "/upload/e_blur:2000,q_1,w_30,h_20,c_fill/")
}

export default function ImageViewer({ images, initialIndex, isOpen, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          e.preventDefault()
          goToPrevious()
          break
        case "ArrowRight":
          e.preventDefault()
          goToNext()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex, onClose])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]
  const optimized = toOptimized(currentImage.secureUrl)
  const blur = toBlur(currentImage.secureUrl)

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-red-500 transition-colors"
        aria-label="Close viewer"
      >
        <X size={32} />
      </button>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-red-500 transition-colors p-2"
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-red-500 transition-colors p-2"
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Image counter */}
      <div className="absolute top-4 left-4 z-10 text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main image */}
      <div className="relative max-w-4xl max-h-full mx-4">
        <Image
          src={optimized}
          alt={currentImage.publicId}
          width={1000}
          height={700}
          className="object-contain max-h-[80vh] w-auto"
          placeholder="blur"
          blurDataURL={blur}
          priority
          loading="eager"
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="flex gap-2 max-w-full overflow-x-auto px-4">
            {images.map((img, index) => (
              <button
                key={img.id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-red-500 scale-110"
                    : "border-transparent hover:border-white/50"
                }`}
              >
                <Image
                  src={toOptimized(img.secureUrl)}
                  alt={img.publicId}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 