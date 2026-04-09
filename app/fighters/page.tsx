"use client"

import { Oswald } from "next/font/google"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Trophy } from "lucide-react"
import { useFightersQuery } from "@/hooks/use-queries"

const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

export default function FightersPage() {
  const { data: fighters = [], isLoading } = useFightersQuery()

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "#050505" }}>
      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.025) 59px, rgba(255,255,255,0.025) 60px), repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,255,255,0.025) 59px, rgba(255,255,255,0.025) 60px)",
      }} />

      {/* Red spotlight from top */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(220,38,38,0.18) 0%, transparent 70%)",
      }} />

      {/* Header */}
      <motion.div
        className="relative z-10 pt-24 pb-10 text-center px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-red-600 text-xs tracking-[0.4em] uppercase mb-3 font-bold">Texas Combat Sports</p>
        <h1
          className={`${oswald.className} text-white uppercase mb-3`}
          style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)", letterSpacing: "-0.02em", fontWeight: 700 }}
        >
          The <span className="text-red-600">Roster</span>
        </h1>
        <div className="w-16 h-px bg-red-700 mx-auto" />
      </motion.div>

      {/* Grid */}
      <div className="relative z-10 px-4 md:px-8 pb-24 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl animate-pulse" style={{ backgroundColor: "#111" }} />
            ))}
          </div>
        ) : fighters.length === 0 ? (
          <div className={`${oswald.className} text-center py-20 text-gray-600 text-xl tracking-widest uppercase`}>
            No fighters on the roster yet.
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {fighters.map((fighter: any, index: number) => (
              <FighterCard key={fighter._id} fighter={fighter} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function FighterCard({ fighter, index }: { fighter: any; index: number }) {
  const href = fighter.slug ? `/fighters/${fighter.slug}` : null

  const card = (
    <motion.div
      className={`relative group ${href ? "cursor-pointer" : ""}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div
        className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-800/60 transition-all duration-300 group-hover:border-red-900/60"
        style={{ backgroundColor: "#0f0f0f", boxShadow: "0 4px 24px rgba(0,0,0,0.6)" }}
      >
        {/* Photo */}
        {fighter.image ? (
          <Image
            src={fighter.image}
            alt={fighter.name}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            loading={index < 4 ? "eager" : "lazy"}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#111" }}>
            <span className={`${oswald.className} text-gray-700 text-5xl font-bold`}>
              {fighter.name.trim().charAt(0)}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to top, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.3) 45%, transparent 100%)",
        }} />

        {/* Red hover wash */}
        {href && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "rgba(220,38,38,0.08)" }}
          />
        )}

        {/* Featured badge */}
        {fighter.featured && (
          <div className="absolute top-3 right-3 bg-amber-500 text-black p-1.5 rounded-full shadow-lg">
            <Trophy className="w-3 h-3" />
          </div>
        )}

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
          <p className="text-red-500 text-xs font-bold tracking-widest uppercase mb-1">
            {fighter.weight}
          </p>
          <h3 className={`${oswald.className} text-white leading-tight mb-0.5 uppercase`}
            style={{ fontSize: "clamp(0.85rem, 2vw, 1.05rem)", fontWeight: 600, letterSpacing: "-0.01em" }}
          >
            {fighter.name.trim()}
          </h3>
          <p className="text-gray-500 text-xs mb-1.5">&ldquo;{fighter.nickname}&rdquo;</p>
          <div className="flex items-center gap-1.5">
            {fighter.record.split("-").map((val: string, i: number) => {
              const colors = ["text-green-400", "text-red-500", "text-yellow-400"]
              const labels = ["W", "L", "D"]
              return (
                <span key={i} className="flex items-baseline gap-0.5">
                  {i > 0 && <span className="text-gray-700 text-xs mx-0.5">·</span>}
                  <span className={`${oswald.className} font-bold text-sm ${colors[i] ?? "text-white"}`}>{val}</span>
                  <span className="text-gray-700 text-xs">{labels[i]}</span>
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )

  return href ? <Link href={href}>{card}</Link> : card
}
