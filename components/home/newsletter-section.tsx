"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import RevealAnimation from "@/components/reveal-animation"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 text-center">
        <RevealAnimation>
          <h2 className="text-4xl font-black mb-4 text-white">
            BE THE FIRST TO <span className="text-red-600">KNOW</span>
          </h2>
        </RevealAnimation>

        <RevealAnimation delay={0.2}>
          <p className="text-gray-400 mb-8 text-lg">
            Get exclusive access to tickets, fighter announcements, and event updates
          </p>
        </RevealAnimation>

        <RevealAnimation delay={0.4}>
          <div className="max-w-md mx-auto flex gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/50 border-red-900/30 text-white placeholder-gray-500 transition-all duration-300 focus:border-red-500"
            />
            <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 transition-all duration-300 hover:scale-105">
              Subscribe
            </Button>
          </div>
        </RevealAnimation>
      </div>
    </section>
  )
} 