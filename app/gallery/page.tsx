"use client"

import Link from "next/link"
import Image from "next/image"
import { useGalleryEventsQuery, useRandomImagesQuery } from "@/hooks/use-queries"

export default function GalleryPage() {
  const { data: events = [], isLoading, error } = useGalleryEventsQuery()
  const { data: randomImages = [], isLoading: loadingImages } = useRandomImagesQuery()

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Loading events...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-400">Error loading events</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-gray-900">
      <section className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        {/* Dynamic Image Grid Background */}
        <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 opacity-50">
          {randomImages.map((img, index) => (
            <div key={img.id} className="relative overflow-hidden">
              <Image
                src={img.url}
                alt={`Gallery background ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, (max-width: 1024px) 16vw, 12vw"
                loading="lazy"
              />
            </div>
          ))}
          {/* Fallback if no images loaded */}
          {randomImages.length === 0 && !loadingImages && (
            <div className="absolute inset-0 bg-[url('/placeholder.jpg')] bg-cover bg-center opacity-30" />
          )}
        </div>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center p-6">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-2">
            EVENT <span className="text-red-600">GALLERY</span>
          </h1>
          <p className="text-base md:text-xl text-gray-300">Browse events and relive the action</p>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          {events.length === 0 ? (
            <div className="text-center text-gray-400">No events found.</div>
          ) : (
            <div className={`${events.length < 4 ? 'flex flex-wrap justify-center gap-6'  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}`}>
              {events.map((evt) => {
                // Convert dashes to spaces for display
                const displayName = evt.name.replace(/-/g, ' ')
                
                return (
                  <Link key={evt.name} href={`/gallery/${encodeURIComponent(evt.name)}`} className={`group block rounded-lg overflow-hidden bg-black/30 ${
                    events.length < 4 ? 'w-full sm:w-80 lg:w-72 xl:w-64' : ''
                  }`}>
                    <div className="relative w-full h-56">
                      {evt.thumbnail?.url ? (
                        <Image
                          src={evt.thumbnail.url}
                          alt={`${displayName} thumbnail`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-400 text-sm">No image</div>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">{displayName}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
