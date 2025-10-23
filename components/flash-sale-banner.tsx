"use client"

import { motion } from "framer-motion"
import { Zap, Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface FlashSaleBannerProps {
  title: string
  endAt: Date | string
  className?: string
}

export default function FlashSaleBanner({ title, endAt, className = "" }: FlashSaleBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState("")
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime()
      const end = new Date(endAt).getTime()
      const distance = end - now

      if (distance <= 0) {
        setIsExpired(true)
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${seconds}s`)
      }
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [endAt])

  // Don't render if expired
  if (isExpired) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg ${className}`}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          >
            <Zap className="w-6 h-6 fill-white" />
          </motion.div>
          <div>
            <p className="font-bold text-lg">🔥 {title}</p>
            <p className="text-sm text-white/90">Limited time offer - Don't miss out!</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
          <Clock className="w-4 h-4" />
          <span className="font-bold text-sm">Ends in: {timeRemaining}</span>
        </div>
      </div>
    </motion.div>
  )
}

