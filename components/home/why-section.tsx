"use client"

import SmoothParallax from "@/components/smooth-parallax"
import RevealAnimation from "@/components/reveal-animation"
import StaggeredReveal from "@/components/staggered-reveal"
import ScrollTriggeredAnimation from "@/components/scroll-triggered-animation"
import { Trophy, Users, MapPin } from "lucide-react"

export default function WhySection() {
  return (
    <SmoothParallax
      className="py-20"
      backgroundImage="https://res.cloudinary.com/dujmomznj/image/upload/f_webp,q_auto/v1754612352/10-DSC04518_reme1d.jpg"
      speed={0.6}
      overlayOpacity={0.8}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <RevealAnimation>
            <h2 className="text-5xl font-black mb-8 text-white">
              WHY <span className="text-red-600">TEXAS COMBAT SPORT?</span>
            </h2>
          </RevealAnimation>

          <RevealAnimation delay={0.2}>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              We bring the raw intensity and authentic spirit of combat sports to Houston. Our events showcase the
              finest fighters in Texas, delivering unforgettable nights of pure adrenaline and championship-level
              competition.
            </p>
          </RevealAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <ScrollTriggeredAnimation
                scaleRange={[0.5, 1]}
                className="transition-transform duration-300 hover:scale-110"
              >
                <Trophy className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-3">Elite Competition</h3>
                <p className="text-lg text-gray-400">Top-tier fighters from across Texas</p>
              </ScrollTriggeredAnimation>
            </div>
            <div className="text-center">
              <ScrollTriggeredAnimation
                scaleRange={[0.5, 1]}
                className="transition-transform duration-300 hover:scale-110"
              >
                <Users className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-3">Houston Pride</h3>
                <p className="text-lg text-gray-400">Supporting local talent and community</p>
              </ScrollTriggeredAnimation>
            </div>
            <div className="text-center">
              <ScrollTriggeredAnimation
                scaleRange={[0.5, 1]}
                className="transition-transform duration-300 hover:scale-110"
              >
                <MapPin className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-3">Premium Venues</h3>
                <p className="text-lg text-gray-400">World-class facilities for every event</p>
              </ScrollTriggeredAnimation>
            </div>
          </div>
        </div>
      </div>
    </SmoothParallax>
  )
} 