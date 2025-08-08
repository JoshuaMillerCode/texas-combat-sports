"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useGalleryImagesQuery, type GalleryImage } from "@/hooks/use-queries"
import ImageViewer from "@/components/image-viewer"

function toOptimized(url: string) {
  // Since API now provides WebP, just add responsive sizing
  return url.replace("/upload/", "/upload/w_800,h_600,c_fill/")
}

function toBlur(url: string) {
  // Very small, blurry placeholder for faster loading
  return url.replace("/upload/", "/upload/e_blur:2000,q_1,w_20,h_15,c_fill/")
}

export default function EventGalleryPage({ params }: { params: { event: string } }) {
  const eventName = decodeURIComponent(params.event)
  const folder = useMemo(() => `events/${eventName}`, [eventName])
  
  // Convert dashes back to spaces for display
  const displayName = eventName.replace(/-/g, ' ')

  const [allImages, setAllImages] = useState<GalleryImage[]>([])
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const { data, isLoading, error, refetch } = useGalleryImagesQuery(folder, nextCursor)

  useEffect(() => {
    if (data) {
      // Only append new images, don't duplicate
      setAllImages((prev) => {
        // Create a Set of existing image IDs to avoid duplicates
        const existingIds = new Set(prev.map(img => img.id))
        const newImages = data.resources.filter(img => !existingIds.has(img.id))
        return [...prev, ...newImages]
      })
      setNextCursor(data.nextCursor)
      setIsLoadingMore(false)
    }
  }, [data])

  useEffect(() => {
    // Reset when folder changes
    setAllImages([])
    setNextCursor(undefined)
    setSelectedImageIndex(null)
    setIsLoadingMore(false)
  }, [folder])

  const handleLoadMore = async () => {
    if (nextCursor && !isLoadingMore) {
      setIsLoadingMore(true)
      await refetch()
    }
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
  }

  const handleCloseViewer = () => {
    setSelectedImageIndex(null)
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{displayName}</h1>
            <p className="text-sm text-gray-400">Gallery ({allImages.length} images)</p>
          </div>
          <Link href="/gallery" className="text-red-500 hover:text-red-400">&larr; Back to Gallery</Link>
        </div>

        {error && (
          <div className="mb-4 text-red-400 text-sm">Error loading images</div>
        )}

        {isLoading && allImages.length === 0 ? (
          <div className="text-center text-white">Loading images...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allImages.map((img, index) => {
                const optimized = toOptimized(img.secureUrl)
                const blur = toBlur(img.secureUrl)
                return (
                  <div 
                    key={img.id} 
                    className="relative overflow-hidden rounded-lg bg-black/30 cursor-pointer group hover:scale-105 transition-transform duration-200"
                    onClick={() => handleImageClick(index)}
                  >
                    <div className="relative w-full h-64">
                      <Image
                        src={optimized}
                        alt={img.publicId}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover"
                        placeholder="blur"
                        blurDataURL={blur}
                        loading="lazy"
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-sm font-medium">
                          Click to view
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-center mt-8">
              {nextCursor ? (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoadingMore ? "Loading..." : "Load More"}
                </button>
              ) : (
                !isLoading && allImages.length > 0 && (
                  <div className="text-gray-400 text-sm">No more images</div>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* Image Viewer */}
      <ImageViewer
        images={allImages}
        initialIndex={selectedImageIndex || 0}
        isOpen={selectedImageIndex !== null}
        onClose={handleCloseViewer}
      />
    </div>
  )
} 