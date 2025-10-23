"use client"

import { useState, useEffect } from "react"
import {
  HeroSection,
  AchievementsSection,
  UpcomingEventsSection,
  FeaturedFightersSection,
  PastEventsSection,
  WhySection,
  NewsletterSection
} from "@/components/home"
import FlashSaleBanner from "@/components/flash-sale-banner"

export default function HomePage() {
  const [activeFlashSales, setActiveFlashSales] = useState<any[]>([])

  // Fetch active flash sales for banner display
  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const response = await fetch("/api/flash-sales?status=active")
        const data = await response.json()
        if (data.flashSales && data.flashSales.length > 0) {
          setActiveFlashSales(data.flashSales)
        }
      } catch (error) {
        console.error("Error fetching flash sales:", error)
      }
    }

    fetchFlashSales()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Flash Sale Banner */}
      {activeFlashSales.length > 0 && (
        <div className="fixed top-20 right-4 z-40">
          <div className="max-w-sm">
            <FlashSaleBanner
              title={activeFlashSales[0].title}
              endAt={activeFlashSales[0].endAt}
            />
          </div>
        </div>
      )}

      <HeroSection />
      <AchievementsSection />
      <UpcomingEventsSection />
      {/* <FeaturedFightersSection /> */}
      {/* <PastEventsSection /> */}
      <WhySection />
      {/* <NewsletterSection /> */}
    </div>
  )
}
