"use client"

import { Button } from "@/components/ui/button"
import HeroParallax from "@/components/hero-parallax"
import RevealAnimation from "@/components/reveal-animation"

export default function HeroSection() {
  return (
    <HeroParallax backgroundVideo="/videos/hero-fight.mp4" className="relative">
      <div className="text-center px-4 max-w-6xl mx-auto">
        <RevealAnimation delay={0.2}>
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-white">
            TEXAS
            <span className="block text-red-600">COMBAT</span>
            <span className="block text-4xl md:text-6xl">SPORT</span>
          </h1>
        </RevealAnimation>

        <RevealAnimation delay={0.4}>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 font-bold">Real Fights. Real Houston.</p>
        </RevealAnimation>

        <RevealAnimation delay={0.6}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105"
            >
              Buy Tickets
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 bg-transparent"
            >
              See Fight Card
            </Button>
          </div>
        </RevealAnimation>
      </div>
    </HeroParallax>
  )
} 