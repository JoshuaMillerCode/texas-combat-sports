"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import RevealAnimation from "@/components/reveal-animation"
import { Sparkles, Mail, UserPlus } from "lucide-react"
import RingGirlCard from "@/components/dolls/ring-girl-card"
import { useDollsQuery } from "@/hooks/use-queries"
import type { IDoll } from "@/lib/models/Doll"

// Interface for ring girls (compatible with existing card component)
export interface RingGirl {
  id: string
  name: string
  bio: string
  image: string
  instagram: string
}

export default function DollsPage() {
  const { data: dolls = [], isLoading, error } = useDollsQuery()

  useEffect(() => {
    // Add Google Fonts
    const link1 = document.createElement('link')
    link1.rel = 'preconnect'
    link1.href = 'https://fonts.googleapis.com'
    document.head.appendChild(link1)

    const link2 = document.createElement('link')
    link2.rel = 'preconnect'
    link2.href = 'https://fonts.gstatic.com'
    link2.crossOrigin = 'anonymous'
    document.head.appendChild(link2)

    const link3 = document.createElement('link')
    link3.href = 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Bungee+Tint&family=Macondo&family=MonteCarlo&family=Parisienne&display=swap'
    link3.rel = 'stylesheet'
    document.head.appendChild(link3)

    // Add class to html and body for pink scrollbar
    document.documentElement.classList.add('dolls-page')
    document.body.classList.add('dolls-page')

    // Cleanup: remove class when component unmounts
    return () => {
      document.documentElement.classList.remove('dolls-page')
      document.body.classList.remove('dolls-page')
    }
  }, [])

  // Transform database dolls to RingGirl format
  const ringGirls: RingGirl[] = dolls.map((doll: IDoll) => ({
    id: doll._id.toString(),
    name: doll.name,
    bio: doll.bio,
    image: doll.image,
    instagram: doll.instagram,
  }))

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Ambient Background with Spotlight Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-pink-900/5" />

      {/* Spotlight Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.5) 1px, transparent 0)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Hero Banner Section */}
      <section className="relative pt-40 pb-4">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-3 tracking-wider">
            TEXAS COMBAT{" "}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400" style={{ fontFamily: '"MonteCarlo", cursive', fontWeight: 400, fontStyle: 'normal' }}>
              DOLLS
            </span>
          </h1>

        </div>
      </section>

      {/* Intro / Brand Copy Section
      <section className="relative z-10 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <RevealAnimation>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                ELEGANCE MEETS{" "}
                <span className="text-red-600">COMBAT</span>
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                The Texas Combat Dolls are more than ring girls—they're ambassadors of the sport,
                bringing glamour, professionalism, and energy to every fight night. These talented
                women represent the premium experience that Texas Combat Sports delivers, combining
                athletic elegance with the raw intensity of combat sports. From championship nights
                to main event showdowns, they light up the arena and enhance the spectacle that makes
                our events unforgettable.
              </p>
            </div>
          </RevealAnimation>
        </div>
      </section> */}

      {/* Ring Girl Grid Section */}
      <section className="relative z-10 py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
            MEET THE <span className="text-pink-500">DOLLS</span>
          </h2>

          {isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading dolls...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-400">Error loading dolls. Please try again later.</p>
            </div>
          )}

          {!isLoading && !error && ringGirls.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">Dolls Coming Soon!</p>
            </div>
          )}

          {!isLoading && !error && ringGirls.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 justify-items-center">
              {ringGirls.map((girl, index) => (
                <RevealAnimation key={girl.id} delay={index * 0.1}>
                  <RingGirlCard
                    ringGirl={girl}
                  />
                </RevealAnimation>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <RevealAnimation>
            <div className="bg-gradient-to-br from-red-900/20 via-black to-pink-900/10 border-2 border-pink-500/30 rounded-2xl p-8 md:p-12 text-center backdrop-blur-sm">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                JOIN THE <span className="text-pink-500">TEAM</span>
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Interested in becoming a Texas Combat Doll? We're always looking for talented,
                professional individuals who want to be part of the premier combat sports experience
                in Texas.
              </p>

              <div className="mt-8 pt-8 border-t border-gray-800">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:from-pink-500 hover:to-pink-700 px-8 py-4 text-lg font-black transition-all duration-300 hover:scale-105"
                  onClick={() => window.location.href = "mailto:info@texascombatsports.com?subject=Become a Combat Doll"}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Become a Combat Doll
                </Button>
              </div>
            </div>
          </RevealAnimation>
        </div>
      </section> */}
    </div>
  )
}
