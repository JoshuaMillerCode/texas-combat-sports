"use client"

import { motion } from "framer-motion"
import { formatAmountForDisplay } from "@/lib/stripe"
import { Badge } from "@/components/ui/badge"

interface FlashSalePriceProps {
  originalPrice: number
  salePrice: number
  currency?: string
  showBadge?: boolean
  size?: "sm" | "md" | "lg"
}

export default function FlashSalePrice({
  originalPrice,
  salePrice,
  currency = "USD",
  showBadge = true,
  size = "md",
}: FlashSalePriceProps) {
  const savings = originalPrice - salePrice
  const savingsPercent = Math.round((savings / originalPrice) * 100)

  const sizeClasses = {
    sm: {
      original: "text-sm",
      sale: "text-lg",
      badge: "text-xs",
    },
    md: {
      original: "text-lg",
      sale: "text-2xl",
      badge: "text-sm",
    },
    lg: {
      original: "text-xl",
      sale: "text-3xl",
      badge: "text-base",
    },
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        {/* Original Price - Crossed Out */}
        <span
          className={`${sizeClasses[size].original} text-gray-400 line-through opacity-70 font-medium`}
        >
          {formatAmountForDisplay(originalPrice, currency)}
        </span>

        {/* Sale Price - Highlighted */}
        <motion.span
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`${sizeClasses[size].sale} font-bold text-red-600 dark:text-red-500`}
        >
          {formatAmountForDisplay(salePrice, currency)}
        </motion.span>
      </div>

      {/* Savings Badge */}
      {showBadge && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Badge
            variant="destructive"
            className={`${sizeClasses[size].badge} bg-red-600 hover:bg-red-700 text-white font-bold`}
          >
            Save {savingsPercent}%
          </Badge>
        </motion.div>
      )}
    </div>
  )
}

