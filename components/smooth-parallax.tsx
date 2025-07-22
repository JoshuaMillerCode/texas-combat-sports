"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

interface SmoothParallaxProps {
  children: React.ReactNode
  className?: string
  speed?: number
  direction?: "up" | "down"
  backgroundImage?: string
  overlay?: boolean
  overlayOpacity?: number
}

export default function SmoothParallax({
  children,
  className = "",
  speed = 0.5,
  direction = "up",
  backgroundImage,
  overlay = true,
  overlayOpacity = 0.7,
}: SmoothParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // Create smooth spring animation for better performance
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Transform values based on direction and speed
  const y = useTransform(
    smoothProgress,
    [0, 1],
    direction === "up" ? [100 * speed, -100 * speed] : [-100 * speed, 100 * speed],
  )

  const backgroundY = useTransform(smoothProgress, [0, 1], ["0%", `${speed * 50}%`])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* Background with parallax */}
      {backgroundImage && (
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            y: backgroundY,
            scale: 1.1, // Slight scale to prevent gaps
          }}
        />
      )}

      {/* Overlay */}
      {overlay && <div className="absolute inset-0 bg-black z-10" style={{ opacity: overlayOpacity }} />}

      {/* Content with parallax */}
      <motion.div className="relative z-20 will-change-transform" style={{ y }}>
        {children}
      </motion.div>
    </div>
  )
}
