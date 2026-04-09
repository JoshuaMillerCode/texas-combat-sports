"use client"

import { Oswald } from "next/font/google"
import { useFighterBySlugQuery } from "@/hooks/use-queries"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Trophy, Award, ChevronLeft, X } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

// ── Ring graphics ─────────────────────────────────────────

/** Three ropes stretched between two corner posts */
function RingFrame() {
  const ropePositions = ["32%", "47%", "62%"]
  return (
    <>
      {/* Left corner post */}
      <div className="absolute left-5 md:left-10 top-[18%] bottom-[8%] w-[10px] z-10 pointer-events-none rounded-sm hidden md:block"
        style={{
          background: "linear-gradient(to right, #78350f 0%, #d97706 20%, #fde68a 50%, #d97706 80%, #78350f 100%)",
          boxShadow: "0 0 18px rgba(217,119,6,0.5), inset 0 0 6px rgba(0,0,0,0.4)",
        }}
      />
      {/* Left post cap top */}
      <div className="absolute z-10 pointer-events-none hidden md:block"
        style={{ left: "calc(40px - 8px)", top: "18%" }}
      >
        <div className="w-[26px] h-[26px] rounded-full"
          style={{ background: "radial-gradient(circle at 35% 35%, #fde68a, #d97706 55%, #78350f)", boxShadow: "0 0 10px rgba(217,119,6,0.6)" }}
        />
      </div>
      {/* Left post cap bottom */}
      <div className="absolute z-10 pointer-events-none hidden md:block"
        style={{ left: "calc(40px - 8px)", bottom: "8%" }}
      >
        <div className="w-[26px] h-[26px] rounded-full"
          style={{ background: "radial-gradient(circle at 35% 35%, #fde68a, #d97706 55%, #78350f)", boxShadow: "0 0 10px rgba(217,119,6,0.6)" }}
        />
      </div>

      {/* Right corner post */}
      <div className="absolute right-5 md:right-10 top-[18%] bottom-[8%] w-[10px] z-10 pointer-events-none rounded-sm hidden md:block"
        style={{
          background: "linear-gradient(to right, #78350f 0%, #d97706 20%, #fde68a 50%, #d97706 80%, #78350f 100%)",
          boxShadow: "0 0 18px rgba(217,119,6,0.5), inset 0 0 6px rgba(0,0,0,0.4)",
        }}
      />
      {/* Right post cap top */}
      <div className="absolute z-10 pointer-events-none hidden md:block"
        style={{ right: "calc(40px - 8px)", top: "18%" }}
      >
        <div className="w-[26px] h-[26px] rounded-full"
          style={{ background: "radial-gradient(circle at 35% 35%, #fde68a, #d97706 55%, #78350f)", boxShadow: "0 0 10px rgba(217,119,6,0.6)" }}
        />
      </div>
      {/* Right post cap bottom */}
      <div className="absolute z-10 pointer-events-none hidden md:block"
        style={{ right: "calc(40px - 8px)", bottom: "8%" }}
      >
        <div className="w-[26px] h-[26px] rounded-full"
          style={{ background: "radial-gradient(circle at 35% 35%, #fde68a, #d97706 55%, #78350f)", boxShadow: "0 0 10px rgba(217,119,6,0.6)" }}
        />
      </div>

      {/* The 3 ropes */}
      {ropePositions.map((top, i) => (
        <div key={i} className="absolute z-10 pointer-events-none hidden md:block"
          style={{
            top,
            left: "40px",
            right: "40px",
            height: "5px",
            borderRadius: "3px",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, #dc2626 30%, #991b1b 70%, rgba(0,0,0,0.4) 100%)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.6), 0 -1px 0 rgba(255,255,255,0.15)",
            opacity: 1 - i * 0.08,
          }}
        >
          {/* Left turnbuckle */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-4 h-4 rounded-full"
            style={{ background: "radial-gradient(circle at 35% 35%, #fde68a, #b45309)", boxShadow: "0 0 6px rgba(217,119,6,0.7)" }}
          />
          {/* Right turnbuckle */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-4 h-4 rounded-full"
            style={{ background: "radial-gradient(circle at 35% 35%, #fde68a, #b45309)", boxShadow: "0 0 6px rgba(217,119,6,0.7)" }}
          />
        </div>
      ))}
    </>
  )
}

/** Decorative ring-rope section divider */
function RopeDivider() {
  return (
    <div className="flex flex-col gap-2 my-10">
      {[0, 1, 2].map(i => (
        <div key={i} className="flex items-center">
          <div className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: "radial-gradient(circle at 35% 35%, #fde68a, #b45309)", boxShadow: "0 0 5px rgba(217,119,6,0.5)" }}
          />
          <div className="flex-1 h-[3px] rounded-full"
            style={{
              background: "linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, #dc2626 35%, #991b1b 65%, rgba(0,0,0,0.3) 100%)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
          />
          <div className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: "radial-gradient(circle at 35% 35%, #fde68a, #b45309)", boxShadow: "0 0 5px rgba(217,119,6,0.5)" }}
          />
        </div>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────

export default function FighterProfilePage({ params }: { params: { slug: string } }) {
  const { data, isLoading, error } = useFighterBySlugQuery(params.slug)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className={`${oswald.className} text-gray-600 text-sm tracking-[0.3em] uppercase`}>Loading</p>
      </div>
    )
  }

  if (error || !data?.fighter) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <p className={`${oswald.className} text-gray-400 text-2xl mb-4`}>Fighter Not Found</p>
          <Link href="/fighters" className="text-red-500 hover:text-red-400 text-sm">← Back to Fighters</Link>
        </div>
      </div>
    )
  }

  const { fighter, upcomingFights, pastFights } = data
  const totalFinishes = fighter.stats.knockouts + fighter.stats.submissions + fighter.stats.decisions
  const recordParts = fighter.record.split("-")
  const recordLabels = ["W", "L", "D"]
  const recordColors = ["#4ade80", "#f87171", "#facc15"]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#050505" }}>

      {/* ═══════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════ */}
      <div className="relative min-h-screen flex flex-col overflow-hidden">

        {/* Ring canvas texture */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.025) 59px, rgba(255,255,255,0.025) 60px), repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,255,255,0.025) 59px, rgba(255,255,255,0.025) 60px)",
        }} />

        {/* Blurred fighter photo atmosphere */}
        {fighter.image && (
          <div className="absolute inset-0 overflow-hidden">
            <Image src={fighter.image} alt="" fill className="object-cover object-top blur-3xl scale-110 opacity-10" priority />
          </div>
        )}

        {/* Spotlight from below — red/amber */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 110%, rgba(220,38,38,0.6) 0%, rgba(180,30,20,0.2) 40%, transparent 70%)",
        }} />

        {/* Top fade to black */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(to bottom, #050505 0%, transparent 15%, transparent 70%, #050505 100%)",
        }} />

        {/* Ring frame */}
        <RingFrame />

        {/* Back nav */}
        <div className="relative z-20 pt-20 px-6 md:px-20">
          <Link href="/fighters" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-300 text-sm transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className={oswald.className}>All Fighters</span>
          </Link>
        </div>

        {/* Hero layout */}
        <div className="relative z-20 flex-1 flex flex-col md:flex-row items-center md:items-end gap-10 md:gap-20 max-w-6xl mx-auto w-full px-6 md:px-20 pt-8 pb-16">

          {/* Left — identity + record */}
          <motion.div
            className="order-2 md:order-1 flex-1 text-center md:text-left"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Nickname */}
            <p className="text-red-600 text-xs font-bold tracking-[0.4em] uppercase mb-3">
              &ldquo;{fighter.nickname}&rdquo;
            </p>

            {/* Name — Oswald, huge */}
            <h1
              className={`${oswald.className} text-white uppercase leading-none mb-6`}
              style={{
                fontSize: "clamp(3rem, 8vw, 6rem)",
                letterSpacing: "-0.02em",
                textShadow: "0 0 80px rgba(220,38,38,0.3)",
                fontWeight: 700,
              }}
            >
              {fighter.name.trim().split(" ").map((word, i, arr) =>
                i === arr.length - 1
                  ? <span key={i} className="text-red-600">{word}</span>
                  : <span key={i}>{word} </span>
              )}
            </h1>

            {/* W / L / D — Red Owl style big isolated blocks */}
            <div className="flex gap-3 justify-center md:justify-start mb-8">
              {recordParts.map((val, i) => (
                <div key={i} className="flex flex-col items-center border border-gray-800 rounded-lg px-5 py-3"
                  style={{ backgroundColor: "rgba(255,255,255,0.03)", minWidth: "72px" }}
                >
                  <span className={`${oswald.className} text-4xl font-bold`} style={{ color: recordColors[i] ?? "#fff" }}>
                    {val}
                  </span>
                  <span className={`${oswald.className} text-xs tracking-widest mt-0.5`} style={{ color: "#4b5563" }}>
                    {recordLabels[i]}
                  </span>
                </div>
              ))}
              <div className="flex flex-col items-center border border-gray-800 rounded-lg px-5 py-3"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", minWidth: "72px" }}
              >
                <span className={`${oswald.className} text-4xl font-bold text-white`}>
                  {fighter.stats.winStreak}
                </span>
                <span className={`${oswald.className} text-xs tracking-widest mt-0.5`} style={{ color: "#4b5563" }}>
                  STREAK
                </span>
              </div>
            </div>

            {/* Details row */}
            <p className={`${oswald.className} text-gray-500 text-sm tracking-wider mb-8 uppercase`}>
              {[fighter.weight, fighter.hometown, `${fighter.age} yrs`, `${fighter.height} · ${fighter.reach}`].join("  ·  ")}
            </p>

            {/* Bio */}
            {fighter.bio && (
              <p className="text-gray-400 text-sm leading-relaxed max-w-md border-l-2 border-red-700 pl-4">
                {fighter.bio}
              </p>
            )}
          </motion.div>

          {/* Right — photo */}
          <motion.div
            className="order-1 md:order-2 w-56 md:w-72 lg:w-80 flex-shrink-0 relative"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Glow */}
            <div className="absolute -inset-8 rounded-full pointer-events-none" style={{
              background: "radial-gradient(circle at 50% 85%, rgba(220,38,38,0.55) 0%, transparent 60%)",
            }} />
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 0 100px rgba(220,38,38,0.2), 0 50px 120px rgba(0,0,0,0.95)" }}
            >
              {fighter.image ? (
                <Image src={fighter.image} alt={fighter.name} fill className="object-cover object-top" priority
                  sizes="(max-width: 768px) 224px, (max-width: 1024px) 288px, 320px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#111" }}>
                  <span className={`${oswald.className} text-gray-700 text-8xl font-bold`}>
                    {fighter.name.trim().charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to top, rgba(5,5,5,0.8) 0%, transparent 40%)",
              }} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          STATS STRIP — broadcast bar across the page
      ═══════════════════════════════════════════════ */}
      <div className="border-y border-gray-900" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-20 py-6 grid grid-cols-3 md:grid-cols-6 gap-px">
          {[
            { label: "Knockouts", value: fighter.stats.knockouts },
            { label: "Submissions", value: fighter.stats.submissions },
            { label: "Decisions", value: fighter.stats.decisions },
            { label: "Win Streak", value: fighter.stats.winStreak },
            { label: "Height", value: fighter.height },
            { label: "Reach", value: fighter.reach },
          ].map(({ label, value }, i) => (
            <div key={i} className="text-center px-4 py-2 border-r border-gray-900 last:border-0">
              <div className={`${oswald.className} text-2xl font-bold text-white`}>{value}</div>
              <div className="text-gray-600 text-xs tracking-widest uppercase mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          BODY
      ═══════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 md:px-20 pb-28">

        {/* Upcoming Fights */}
        {upcomingFights?.length > 0 && (
          <section className="pt-16">
            <RopeDivider />
            <h2 className={`${oswald.className} text-white text-2xl font-bold tracking-widest uppercase mb-6 flex items-center gap-3`}>
              <span className="w-1 h-7 bg-red-600 rounded-full inline-block" />
              Next Fight
            </h2>
            <div className="space-y-3">
              {upcomingFights.map((fight: any) => {
                const opponent = fight.fighter1?._id?.toString() === fighter._id?.toString() ? fight.fighter2 : fight.fighter1
                return (
                  <div key={fight._id} className="relative border border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 overflow-hidden"
                    style={{ backgroundColor: "#0a0a0a" }}
                  >
                    <div className="absolute left-0 inset-y-0 w-1 bg-red-600 rounded-l-xl" />
                    <div className="flex-1 pl-3">
                      <p className={`${oswald.className} text-white text-xl uppercase tracking-wide font-bold`}>
                        vs {opponent?.name ?? "TBA"}
                      </p>
                      <p className="text-gray-500 text-sm mt-0.5">{fight.title}</p>
                    </div>
                    <div className="text-right">
                      {fight.event?.name && <p className="text-red-400 font-bold text-sm">{fight.event.name}</p>}
                      {fight.event?.date && (
                        <p className="text-gray-600 text-xs mt-0.5">{format(new Date(fight.event.date), "MMMM d, yyyy")}</p>
                      )}
                    </div>
                    {fight.event?.slug && (
                      <Link href={`/events/${fight.event.slug}`}
                        className={`${oswald.className} text-sm bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold transition-colors tracking-wider uppercase whitespace-nowrap`}
                      >
                        Get Tickets
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Fight History */}
        {pastFights?.length > 0 && (
          <section className="pt-16">
            <RopeDivider />
            <h2 className={`${oswald.className} text-white text-2xl font-bold tracking-widest uppercase mb-6 flex items-center gap-3`}>
              <span className="w-1 h-7 bg-gray-600 rounded-full inline-block" />
              TCS Fight History
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-800/60">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-xs tracking-widest uppercase" style={{ backgroundColor: "#0a0a0a" }}>
                    {["Result", "Opponent", "Method", "Rnd", "Event"].map((h, i) => (
                      <th key={h} className={`text-left px-4 py-3 text-gray-600 ${i > 1 ? "hidden sm:table-cell" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900">
                  {pastFights.map((fight: any) => {
                    const isWin = fight.result?.winner?.toString() === fighter._id?.toString()
                    const isDraw = fight.result?.method === "Draw"
                    const isNC = fight.result?.method === "No Contest"
                    const opponent = fight.fighter1?._id?.toString() === fighter._id?.toString() ? fight.fighter2 : fight.fighter1
                    const resultLabel = isDraw ? "Draw" : isNC ? "NC" : isWin ? "Win" : "Loss"
                    const resultColor = isDraw || isNC ? "#facc15" : isWin ? "#4ade80" : "#f87171"
                    return (
                      <tr key={fight._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <span className={`${oswald.className} font-bold text-base`} style={{ color: resultColor }}>{resultLabel}</span>
                        </td>
                        <td className="px-4 py-3 text-white font-medium">{opponent?.name ?? "Unknown"}</td>
                        <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{fight.result?.method}</td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{fight.result?.round ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {fight.event?.name ?? "—"}
                          {fight.event?.date && (
                            <span className="text-gray-700 ml-1 text-xs">({format(new Date(fight.event.date), "MMM yy")})</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Finish Breakdown — UFC-style percentage bars */}
        {totalFinishes > 0 && (
          <section className="pt-16">
            <RopeDivider />
            <h2 className={`${oswald.className} text-white text-2xl font-bold tracking-widest uppercase mb-8 flex items-center gap-3`}>
              <span className="w-1 h-7 bg-red-600 rounded-full inline-block" />
              Finish Breakdown
            </h2>
            <div className="space-y-5">
              {[
                { label: "Knockouts", value: fighter.stats.knockouts, color: "#dc2626" },
                { label: "Submissions", value: fighter.stats.submissions, color: "#ea580c" },
                { label: "Decisions", value: fighter.stats.decisions, color: "#4b5563" },
              ].map(({ label, value, color }) => {
                const pct = totalFinishes > 0 ? Math.round((value / totalFinishes) * 100) : 0
                return (
                  <div key={label} className="flex items-center gap-5">
                    <div className={`${oswald.className} text-white text-3xl font-bold w-10 text-right flex-shrink-0`}>{value}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`${oswald.className} text-gray-400 text-sm tracking-wider uppercase`}>{label}</span>
                        <span className={`${oswald.className} text-gray-600 text-sm`}>{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#1a1a1a" }}>
                        <motion.div className="h-full rounded-full"
                          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Achievements */}
        {fighter.achievements?.length > 0 && (
          <section className="pt-16">
            <RopeDivider />
            <h2 className={`${oswald.className} text-white text-2xl font-bold tracking-widest uppercase mb-6 flex items-center gap-3`}>
              <Trophy className="w-5 h-5 text-amber-400" />
              Achievements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fighter.achievements.map((a: string, i: number) => (
                <div key={i} className="flex items-center gap-3 border border-gray-800 rounded-xl px-4 py-3 hover:border-gray-700 transition-colors"
                  style={{ backgroundColor: "#0a0a0a" }}
                >
                  <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className={`${oswald.className} text-gray-300 text-sm tracking-wide`}>{a}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Photo Gallery */}
        {fighter.images?.length > 0 && (
          <section className="pt-16">
            <RopeDivider />
            <h2 className={`${oswald.className} text-white text-2xl font-bold tracking-widest uppercase mb-6 flex items-center gap-3`}>
              <span className="w-1 h-7 bg-red-600 rounded-full inline-block" />
              Gallery
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {fighter.images.map((url: string, i: number) => (
                <motion.button key={i} onClick={() => setLightboxIndex(i)}
                  className="relative aspect-square rounded-xl overflow-hidden border border-gray-800 group"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image src={url} alt={`${fighter.name} photo ${i + 1}`} fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "rgba(220,38,38,0.15)", boxShadow: "inset 0 0 0 2px rgba(220,38,38,0.4)" }}
                  />
                </motion.button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          LIGHTBOX
      ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(5,5,5,0.97)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <button onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              className="relative w-full max-w-2xl"
              style={{ maxHeight: "85vh", aspectRatio: "3/4" }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <Image src={fighter.images[lightboxIndex]} alt="" fill className="object-contain" sizes="85vw" />
            </motion.div>
            {fighter.images.length > 1 && (
              <div className="absolute bottom-6 flex justify-center gap-2 left-0 right-0">
                {fighter.images.map((_: string, i: number) => (
                  <button key={i}
                    onClick={e => { e.stopPropagation(); setLightboxIndex(i) }}
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: i === lightboxIndex ? "20px" : "8px",
                      height: "8px",
                      backgroundColor: i === lightboxIndex ? "#dc2626" : "#374151",
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
