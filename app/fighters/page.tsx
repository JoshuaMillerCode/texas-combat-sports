"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"
import { useFightersQuery } from "@/hooks/use-queries"

export default function FightersPage() {
  const { data: fighters = [], isLoading } = useFightersQuery()

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-gray-900/20" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <motion.div
        className="relative z-10 pt-24 pb-10 text-center px-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-wider">
          THE <span className="text-red-600">ROSTER</span>
        </h1>
        <p className="text-xl text-gray-400 font-bold">Texas Combat Sports Fighters</p>
      </motion.div>

      {/* Fighter Grid */}
      <div className="relative z-10 px-4 md:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-900 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : fighters.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No fighters on the roster yet.</div>
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {fighters.map((fighter: any, index: number) => (
                <FighterCard key={fighter._id} fighter={fighter} index={index} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function FighterCard({ fighter, index }: { fighter: any; index: number }) {
  const href = fighter.slug ? `/fighters/${fighter.slug}` : null

  const card = (
    <motion.div
      className={`relative group ${index % 2 === 0 ? "mt-0" : "mt-4 md:mt-8"} ${href ? "cursor-pointer" : ""}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="relative aspect-[3/4] bg-gradient-to-br from-red-900/20 to-black rounded-lg overflow-hidden border border-red-900/30 transition-all duration-300">
        {fighter.image ? (
          <Image
            src={fighter.image}
            alt={fighter.name}
            fill
            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
            loading={index < 4 ? "eager" : "lazy"}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <span className="text-gray-600 text-4xl font-black">{fighter.name.charAt(0)}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

        {fighter.featured && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-1.5 rounded-full">
            <Trophy className="w-3 h-3" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <Badge className="bg-red-600/90 text-white text-xs font-bold mb-2">{fighter.weight}</Badge>
          <h3 className="text-white font-black text-sm md:text-base leading-tight mb-1">{fighter.name}</h3>
          <p className="text-red-400 font-bold text-xs md:text-sm">"{fighter.nickname}"</p>
          <div className="text-white font-bold text-xs mt-1">{fighter.record}</div>
        </div>

        {href && (
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: "radial-gradient(circle at center, rgba(220, 38, 38, 0.2) 0%, transparent 70%)",
            }}
          />
        )}
      </div>
    </motion.div>
  )

  return href ? <Link href={href}>{card}</Link> : card
}
