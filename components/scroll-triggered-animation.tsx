"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

interface ScrollTriggeredAnimationProps {
  children: React.ReactNode
  className?: string
  startOffset?: string
  endOffset?: string
  scaleRange?: [number, number]
  opacityRange?: [number, number]
  yRange?: [number, number]
}

export default function ScrollTriggeredAnimation({
  children,
  className = "",
  startOffset = "start end",
  endOffset = "end start",
  scaleRange,
  opacityRange,
  yRange,
}: ScrollTriggeredAnimationProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [startOffset, endOffset] as any,
  })

  // Transform values
  const scale = useTransform(scrollYProgress, [0, 1], scaleRange || [1, 1])
  const opacity = useTransform(scrollYProgress, [0, 1], opacityRange || [1, 1])
  const y = useTransform(scrollYProgress, [0, 1], yRange || [0, 0])

  // Smooth spring animations
  const smoothScale = useSpring(scale, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })
  const smoothOpacity = useSpring(opacity, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })
  const smoothY = useSpring(y, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{
        scale: smoothScale,
        opacity: smoothOpacity,
        y: smoothY,
      }}
    >
      {children}
    </motion.div>
  )
}
