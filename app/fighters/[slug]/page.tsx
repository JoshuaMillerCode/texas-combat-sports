"use client"

import { useFighterBySlugQuery } from "@/hooks/use-queries"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Trophy, Award, ChevronLeft, X } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

// ── Decorative Components ─────────────────────────────────

function CornerPost({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const pos = {
    tl: "top-20 left-4 md:left-8",
    tr: "top-20 right-4 md:right-8",
    bl: "bottom-4 left-4 md:left-8",
    br: "bottom-4 right-4 md:right-8",
  }[position]
  return (
    <div className={`absolute ${pos} z-10 pointer-events-none hidden md:block`}>
      <div className="w-5 h-5 rounded-full bg-amber-400 border-2 border-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.9)]" />
    </div>
  )
}

function RingRopes({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex flex-col gap-2 py-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-0">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70 flex-shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(to right, rgba(251,191,36,0.6) 0%, rgba(251,191,36,0.25) 50%, rgba(251,191,36,0.6) 100%)",
              boxShadow: "0 0 3px rgba(251,191,36,0.3)",
            }}
          />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70 flex-shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
        </div>
      ))}
    </div>
  )
}

function SectionHeading({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-7 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
      <h2 className="text-lg font-black text-white tracking-widest uppercase">{children}</h2>
      {icon}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────

export default function FighterProfilePage({ params }: { params: { slug: string } }) {
  const { data, isLoading, error } = useFighterBySlugQuery(params.slug)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 text-sm tracking-widest uppercase">Loading Fighter</p>
      </div>
    )
  }

  if (error || !data?.fighter) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Fighter not found.</p>
          <Link href="/fighters" className="text-red-500 hover:text-red-400 text-sm">← Back to Fighters</Link>
        </div>
      </div>
    )
  }

  const { fighter, upcomingFights, pastFights } = data
  const totalFinishes = fighter.stats.knockouts + fighter.stats.submissions + fighter.stats.decisions
  const recordParts = fighter.record.split("-")

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════
          HERO — full viewport, fight-night atmosphere
      ══════════════════════════════════════════════════════ */}
      <div className="relative min-h-screen flex flex-col overflow-hidden">

        {/* Canvas texture */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,transparent,transparent 60px,rgba(255,255,255,0.012) 60px,rgba(255,255,255,0.012) 61px),repeating-linear-gradient(-45deg,transparent,transparent 60px,rgba(255,255,255,0.012) 60px,rgba(255,255,255,0.012) 61px)",
          }}
        />

        {/* Fighter image as blurred background */}
        {fighter.image && (
          <div className="absolute inset-0">
            <Image
              src={fighter.image}
              alt=""
              fill
              className="object-cover object-top blur-3xl scale-110 opacity-15"
              priority
            />
          </div>
        )}

        {/* Red spotlight from below */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 90% 55% at 50% 115%, rgba(220,38,38,0.55) 0%, transparent 65%)",
          }}
        />

        {/* Top-to-bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/20 to-black pointer-events-none" />

        {/* Ring rope lines */}
        {[28, 46, 64].map((pct) => (
          <div
            key={pct}
            className="absolute inset-x-6 md:inset-x-16 h-px pointer-events-none hidden md:block"
            style={{
              top: `${pct}%`,
              background:
                "linear-gradient(to right, transparent 0%, rgba(251,191,36,0.55) 8%, rgba(251,191,36,0.28) 50%, rgba(251,191,36,0.55) 92%, transparent 100%)",
              boxShadow: "0 0 5px rgba(251,191,36,0.25)",
            }}
          />
        ))}

        {/* Corner posts */}
        <CornerPost position="tl" />
        <CornerPost position="tr" />
        <CornerPost position="bl" />
        <CornerPost position="br" />

        {/* Back nav */}
        <div className="relative z-10 pt-20 px-6 md:px-14">
          <Link
            href="/fighters"
            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-300 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            All Fighters
          </Link>
        </div>

        {/* Main hero layout */}
        <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center md:items-end justify-center gap-8 md:gap-16 max-w-6xl mx-auto w-full px-6 md:px-14 pt-8 pb-16">

          {/* Left — name, record, stats */}
          <motion.div
            className="order-2 md:order-1 flex-1 text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Nickname */}
            <p className="text-red-500 font-bold text-xs tracking-[0.35em] uppercase mb-3">
              &ldquo;{fighter.nickname}&rdquo;
            </p>

            {/* Name — last word in red */}
            <h1
              className="text-5xl md:text-7xl font-black text-white uppercase leading-none tracking-tight mb-5"
              style={{ textShadow: "0 0 60px rgba(220,38,38,0.35)" }}
            >
              {fighter.name
                .trim()
                .split(" ")
                .map((word, i, arr) =>
                  i === arr.length - 1 ? (
                    <span key={i} className="text-red-600">{word}</span>
                  ) : (
                    <span key={i}>{word} </span>
                  )
                )}
            </h1>

            {/* Record — broadcast card */}
            <div className="inline-flex items-center gap-1 bg-black/70 backdrop-blur-sm border border-gray-800 rounded-xl px-5 py-3 mb-6">
              {recordParts.map((val, i) => {
                const labels = ["W", "L", "D"]
                const colors = ["text-green-400", "text-red-500", "text-yellow-400"]
                return (
                  <div key={i} className="flex items-baseline gap-1.5">
                    {i > 0 && <span className="text-gray-700 mx-1 text-xl">·</span>}
                    <span className={`text-4xl font-black ${colors[i] ?? "text-white"}`}>{val}</span>
                    <span className="text-xs text-gray-500 font-bold tracking-widest">{labels[i]}</span>
                  </div>
                )
              })}
            </div>

            {/* Physical details */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center md:justify-start text-sm text-gray-500 mb-8">
              {[fighter.weight, fighter.hometown, `${fighter.age} yrs`, `${fighter.height} · ${fighter.reach} reach`].map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="text-gray-800">|</span>}
                  {item}
                </span>
              ))}
            </div>

            {/* Stat bubbles */}
            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto md:mx-0">
              {[
                { label: "KOs", value: fighter.stats.knockouts, border: "border-red-900/50", bg: "bg-red-950/40", glow: "shadow-[inset_0_1px_0_rgba(220,38,38,0.3)]" },
                { label: "Subs", value: fighter.stats.submissions, border: "border-orange-900/50", bg: "bg-orange-950/30", glow: "" },
                { label: "Dec", value: fighter.stats.decisions, border: "border-gray-700/50", bg: "bg-gray-900/60", glow: "" },
                { label: "Streak", value: fighter.stats.winStreak, border: "border-yellow-900/50", bg: "bg-yellow-950/30", glow: "shadow-[inset_0_1px_0_rgba(251,191,36,0.2)]" },
              ].map(({ label, value, border, bg, glow }) => (
                <div key={label} className={`border ${border} ${bg} ${glow} rounded-xl p-3 text-center`}>
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="text-xs text-gray-600 mt-0.5 tracking-widest uppercase">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — fighter photo */}
          <motion.div
            className="order-1 md:order-2 w-64 md:w-80 lg:w-96 flex-shrink-0 relative"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Outer glow */}
            <div
              className="absolute -inset-6 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle at 50% 80%, rgba(220,38,38,0.5) 0%, transparent 65%)",
              }}
            />
            {/* Photo */}
            <div
              className="relative aspect-[3/4] rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 0 80px rgba(220,38,38,0.25), 0 40px 100px rgba(0,0,0,0.9)" }}
            >
              {fighter.image ? (
                <Image
                  src={fighter.image}
                  alt={fighter.name}
                  fill
                  className="object-cover object-top"
                  priority
                  sizes="(max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
                />
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <span className="text-gray-700 text-7xl font-black">{fighter.name.trim().charAt(0)}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Bio — bottom of hero */}
        {fighter.bio && (
          <motion.div
            className="relative z-10 max-w-6xl mx-auto w-full px-6 md:px-14 pb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <p className="text-gray-400 leading-relaxed max-w-2xl border-l-2 border-red-700 pl-5 text-sm">
              {fighter.bio}
            </p>
          </motion.div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          BODY SECTIONS
      ══════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 md:px-14 pb-28">

        <RingRopes className="mb-14" />

        <div className="space-y-16">

          {/* Upcoming Fights */}
          {upcomingFights?.length > 0 && (
            <section>
              <SectionHeading>Next Fight</SectionHeading>
              <div className="space-y-3">
                {upcomingFights.map((fight: any) => {
                  const opponent =
                    fight.fighter1?._id?.toString() === fighter._id?.toString()
                      ? fight.fighter2
                      : fight.fighter1
                  return (
                    <div
                      key={fight._id}
                      className="relative bg-gray-950 border border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 overflow-hidden"
                    >
                      <div className="absolute left-0 inset-y-0 w-1 bg-red-600 rounded-l-xl" />
                      <div className="flex-1 pl-2">
                        <p className="text-white font-black text-lg uppercase tracking-wide">
                          vs {opponent?.name ?? "TBA"}
                        </p>
                        <p className="text-gray-500 text-sm mt-0.5">{fight.title}</p>
                      </div>
                      <div className="text-right">
                        {fight.event?.name && (
                          <p className="text-red-400 font-bold text-sm">{fight.event.name}</p>
                        )}
                        {fight.event?.date && (
                          <p className="text-gray-600 text-xs mt-0.5">
                            {format(new Date(fight.event.date), "MMMM d, yyyy")}
                          </p>
                        )}
                      </div>
                      {fight.event?.slug && (
                        <Link
                          href={`/events/${fight.event.slug}`}
                          className="text-xs bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap"
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
            <section>
              <SectionHeading>TCS Fight History</SectionHeading>
              <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-950 border-b border-gray-800 text-gray-600 text-xs uppercase tracking-widest">
                      <th className="text-left px-4 py-3">Result</th>
                      <th className="text-left px-4 py-3">Opponent</th>
                      <th className="text-left px-4 py-3 hidden sm:table-cell">Method</th>
                      <th className="text-left px-4 py-3 hidden sm:table-cell">Rnd</th>
                      <th className="text-left px-4 py-3">Event</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900">
                    {pastFights.map((fight: any) => {
                      const isWin = fight.result?.winner?.toString() === fighter._id?.toString()
                      const isDraw = fight.result?.method === "Draw"
                      const isNC = fight.result?.method === "No Contest"
                      const opponent =
                        fight.fighter1?._id?.toString() === fighter._id?.toString()
                          ? fight.fighter2
                          : fight.fighter1
                      const resultLabel = isDraw ? "Draw" : isNC ? "NC" : isWin ? "Win" : "Loss"
                      const resultColor = isDraw || isNC ? "text-yellow-400" : isWin ? "text-green-400" : "text-red-500"
                      const rowBg = isWin ? "hover:bg-green-950/20" : isDraw || isNC ? "hover:bg-yellow-950/20" : "hover:bg-red-950/10"
                      return (
                        <tr key={fight._id} className={`transition-colors ${rowBg}`}>
                          <td className={`px-4 py-3 font-black ${resultColor}`}>{resultLabel}</td>
                          <td className="px-4 py-3 text-white font-medium">{opponent?.name ?? "Unknown"}</td>
                          <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{fight.result?.method}</td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{fight.result?.round ?? "—"}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {fight.event?.name ?? "—"}
                            {fight.event?.date && (
                              <span className="text-gray-700 ml-1 text-xs">
                                ({format(new Date(fight.event.date), "MMM yy")})
                              </span>
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

          {/* Finish Breakdown */}
          {totalFinishes > 0 && (
            <section>
              <SectionHeading>Finish Breakdown</SectionHeading>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Knockouts", value: fighter.stats.knockouts, bar: "bg-red-600", glow: "shadow-[0_0_20px_rgba(220,38,38,0.3)]", border: "border-red-900/40" },
                  { label: "Submissions", value: fighter.stats.submissions, bar: "bg-orange-500", glow: "shadow-[0_0_20px_rgba(249,115,22,0.2)]", border: "border-orange-900/40" },
                  { label: "Decisions", value: fighter.stats.decisions, bar: "bg-gray-500", glow: "", border: "border-gray-700/40" },
                ].map(({ label, value, bar, glow, border }) => {
                  const pct = totalFinishes > 0 ? Math.round((value / totalFinishes) * 100) : 0
                  return (
                    <div key={label} className={`bg-gray-950 border ${border} rounded-xl p-5 ${glow}`}>
                      <div className="text-4xl font-black text-white mb-1">{value}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">{label}</div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${bar} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        />
                      </div>
                      <div className="text-xs text-gray-700 mt-1.5">{pct}%</div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Achievements */}
          {fighter.achievements?.length > 0 && (
            <section>
              <SectionHeading icon={<Trophy className="w-5 h-5 text-amber-400" />}>
                Achievements
              </SectionHeading>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fighter.achievements.map((a: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 hover:border-gray-700 transition-colors"
                  >
                    <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{a}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Photo Gallery */}
          {fighter.images?.length > 0 && (
            <section>
              <RingRopes className="mb-10" />
              <SectionHeading>Photo Gallery</SectionHeading>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {fighter.images.map((url: string, i: number) => (
                  <motion.button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-800 group"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={url}
                      alt={`${fighter.name} photo ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-red-900/20 transition-colors duration-300" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ boxShadow: "inset 0 0 0 2px rgba(220,38,38,0.5)" }}
                    />
                  </motion.button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          LIGHTBOX
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/97 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              className="relative w-full max-w-2xl"
              style={{ maxHeight: "85vh", aspectRatio: "3/4" }}
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={fighter.images[lightboxIndex]}
                alt={`${fighter.name} photo ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="85vw"
              />
            </motion.div>

            {fighter.images.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                {fighter.images.map((_: string, i: number) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                    className={`rounded-full transition-all duration-200 ${
                      i === lightboxIndex
                        ? "w-5 h-2 bg-red-500"
                        : "w-2 h-2 bg-gray-700 hover:bg-gray-500"
                    }`}
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
