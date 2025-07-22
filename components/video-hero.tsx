"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface VideoHeroProps {
  videoSrc: string
  webmSrc?: string
  fallbackImage: string
  children: React.ReactNode
  className?: string
  overlayOpacity?: number
}

export default function VideoHero({
  videoSrc,
  webmSrc,
  fallbackImage,
  children,
  className = "",
  overlayOpacity = 0.6,
}: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlay = () => {
      setIsVideoLoaded(true)
    }

    const handleError = () => {
      setHasError(true)
    }

    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("error", handleError)

    return () => {
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("error", handleError)
    }
  }, [])

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Fallback background image */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          isVideoLoaded && !hasError ? "opacity-0" : "opacity-100"
        }`}
        style={{
          backgroundImage: `url(${fallbackImage})`,
        }}
      />

      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          isVideoLoaded && !hasError ? "opacity-100" : "opacity-0"
        }`}
        onLoadedData={() => setIsVideoLoaded(true)}
        onError={() => setHasError(true)}
      >
        <source src={videoSrc} type="video/mp4" />
        {webmSrc && <source src={webmSrc} type="video/webm" />}
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </section>
  )
}
