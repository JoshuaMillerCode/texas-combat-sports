"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export default function CallToActionSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-black mb-4 text-white">
          NEVER MISS A <span className="text-red-600">FIGHT</span>
        </h2>
        <p className="text-gray-400 mb-8 text-lg max-w-2xl mx-auto">
          Subscribe to our YouTube channel and hit the notification bell to get alerts 
          when we go live for the next big fight night.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4"
            onClick={() => window.open('https://www.youtube.com/@TexasCombatSports', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Subscribe to TXCS
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4"
            onClick={() => window.open('https://www.youtube.com/@AZTECATEXAS', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Subscribe to Azteca Texas
          </Button>
        </div>
      </div>
    </section>
  )
} 