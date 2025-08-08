"use client"

import Image from "next/image"
import SmoothParallax from "@/components/smooth-parallax"
import RevealAnimation from "@/components/reveal-animation"
import ScrollTriggeredAnimation from "@/components/scroll-triggered-animation"

export default function FeaturedFightersSection() {
  const featuredFighters = [
    {
      id: 1,
      name: 'Marcus "The Hammer" Rodriguez',
      record: "15-2-0",
      image: "/placeholder.svg?height=300&width=250",
      bio: "Houston native with devastating knockout power",
    },
    {
      id: 2,
      name: 'Sarah "Lightning" Chen',
      record: "12-1-0",
      image: "/placeholder.svg?height=300&width=250",
      bio: "Speed and precision define this rising star",
    },
    {
      id: 3,
      name: 'Antonio "The Bull" Martinez',
      record: "18-3-1",
      image: "/placeholder.svg?height=300&width=250",
      bio: "Veteran fighter with unmatched experience",
    },
  ]

  return (
    <SmoothParallax className="py-20 bg-gradient-to-b from-black to-gray-900" speed={0.4} direction="down">
      <div className="container mx-auto px-4">
        <RevealAnimation>
          <h2 className="text-5xl font-black text-center mb-16 text-white">
            FEATURED <span className="text-red-600">FIGHTERS</span>
          </h2>
        </RevealAnimation>

        <div className="grid md:grid-cols-3 gap-8">
          {featuredFighters.map((fighter, index) => (
            <RevealAnimation key={fighter.id} delay={index * 0.15}>
              <ScrollTriggeredAnimation
                scaleRange={[0.9, 1]}
                yRange={[50, 0]}
                className="bg-black/50 border border-red-900/30 rounded-lg overflow-hidden group hover:border-red-600/50 transition-all duration-500 hover:scale-105"
              >
                <div className="relative h-80">
                  <Image
                    src={fighter.image || "/placeholder.svg"}
                    alt={fighter.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{fighter.name}</h3>
                  <div className="text-red-500 font-bold mb-3">Record: {fighter.record}</div>
                  <p className="text-gray-300">{fighter.bio}</p>
                </div>
              </ScrollTriggeredAnimation>
            </RevealAnimation>
          ))}
        </div>
      </div>
    </SmoothParallax>
  )
} 