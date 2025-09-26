"use client"

import {
  HeroSection,
  AchievementsSection,
  UpcomingEventsSection,
  FeaturedFightersSection,
  PastEventsSection,
  WhySection,
  NewsletterSection
} from "@/components/home"

export default function HomePage() {
  return (
    <div className="min-h-screen">
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
