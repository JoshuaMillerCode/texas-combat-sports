"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface ParallaxSectionProps {
  children: React.ReactNode
  className?: string
  speed?: number
  backgroundImage?: string
}

export default function ParallaxSection({
  children,
  className = "",
  speed = 0.5,
  backgroundImage,
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const scrolled = window.pageYOffset
      const section = sectionRef.current
      const rect = section.getBoundingClientRect()

      if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
        const yPos = -(scrolled * speed)
        section.style.transform = `translateY(${yPos}px)`
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [speed])

  return (
    <div
      ref={sectionRef}
      className={`relative ${className}`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {children}
    </div>
  )
}
