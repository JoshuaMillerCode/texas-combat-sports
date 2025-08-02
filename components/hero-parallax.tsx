"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface HeroParallaxProps {
  children: React.ReactNode
  backgroundVideo?: string
  backgroundImage?: string
  className?: string
  height?: string
}

export default function HeroParallax({
  children,
  backgroundVideo,
  backgroundImage,
  className = "",
  height = "100vh",
}: HeroParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Simplified transforms for better performance
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.9, 0.6])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ height }}>
      {/* Background Layer */}
      <motion.div 
        className="absolute inset-0 will-change-transform" 
        style={{ y: backgroundY }}
      >
        {backgroundVideo ? (
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover scale-110"
            style={{ transform: 'translateZ(0)' }} // Force GPU acceleration
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : backgroundImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{ 
              backgroundImage: `url(${backgroundImage})`,
              transform: 'translateZ(0)' // Force GPU acceleration
            }}
          />
        ) : null}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </motion.div>

      {/* Content Layer */}
      <motion.div
        className="relative z-10 h-full flex items-center justify-center will-change-transform"
        style={{
          y: contentY,
          opacity: contentOpacity,
          transform: 'translateZ(0)', // Force GPU acceleration
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
