"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

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

  // Smooth spring for better performance
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Parallax transforms
  const backgroundY = useTransform(smoothProgress, [0, 1], ["0%", "50%"])
  const contentY = useTransform(smoothProgress, [0, 1], ["0%", "25%"])
  const contentOpacity = useTransform(smoothProgress, [0, 0.5, 1], [1, 0.8, 0.3])
  const contentScale = useTransform(smoothProgress, [0, 1], [1, 0.95])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ height }}>
      {/* Background Layer */}
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: backgroundY }}>
        {backgroundVideo ? (
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover scale-110">
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : backgroundImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{ backgroundImage: `url(${backgroundImage})` }}
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
          scale: contentScale,
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
