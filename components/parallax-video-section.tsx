"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface ParallaxVideoSectionProps {
  videoSrc: string
  webmSrc?: string
  fallbackImage: string
  children: React.ReactNode
  className?: string
  speed?: number
  overlayOpacity?: number
}

export default function ParallaxVideoSection({
  videoSrc,
  webmSrc,
  fallbackImage,
  children,
  className = "",
  speed = 0.5,
  overlayOpacity = 0.8,
}: ParallaxVideoSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !videoRef.current) return

      const scrolled = window.pageYOffset
      const section = sectionRef.current
      const video = videoRef.current
      const rect = section.getBoundingClientRect()

      if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
        const yPos = -(scrolled * speed)
        video.style.transform = `translateY(${yPos}px)`
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [speed])

  return (
    <div ref={sectionRef} className={`relative overflow-hidden ${className}`}>
      {/* Fallback background */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-fixed transition-opacity duration-1000 ${
          isVideoLoaded ? "opacity-0" : "opacity-100"
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
          isVideoLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoadedData={() => setIsVideoLoaded(true)}
      >
        <source src={videoSrc} type="video/mp4" />
        {webmSrc && <source src={webmSrc} type="video/webm" />}
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
