"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Instagram } from "lucide-react"
import type { RingGirl } from "@/app/dolls/page"

interface RingGirlCardProps {
  ringGirl: RingGirl
}

export default function RingGirlCard({ ringGirl }: RingGirlCardProps) {
  return (
    <motion.div
      className="group relative w-full max-w-md"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      {/* Card Container with Glassmorphism */}
      <div className="relative bg-black/50 border border-pink-500/20 rounded-xl overflow-hidden transition-all duration-200 ease-out hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10 h-full flex flex-col will-change-transform">
        {/* Image Container */}
        <div className="relative h-[450px] overflow-hidden flex-shrink-0">
          <Image
            src={ringGirl.image}
            alt={ringGirl.name}
            fill
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105 will-change-transform"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />



        </div>

        {/* Card Content */}
        <div className="p-4 space-y-3 flex-grow flex flex-col min-h-0">
          {/* Name */}
          <div>
            <h3 className="text-xl font-black text-white mb-1 leading-tight">
              {ringGirl.name}
            </h3>
          </div>

          {/* Bio */}
          <p className="text-gray-300 text-sm leading-relaxed flex-grow overflow-hidden line-clamp-4">
            {ringGirl.bio}
          </p>

          {/* Social Media */}
          {ringGirl.instagram && (
            <div className="pt-3 border-t border-gray-800 mt-auto flex-shrink-0">
              <a
                href={`https://instagram.com/${ringGirl.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-400 transition-colors text-xs font-bold group/ig"
              >
                <Instagram className="w-4 h-4 group-hover/ig:scale-110 transition-transform" />
                {ringGirl.instagram}
              </a>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  )
}
