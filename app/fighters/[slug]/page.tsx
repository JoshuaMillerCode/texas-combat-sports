"use client"

import { useFighterBySlugQuery } from "@/hooks/use-queries"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Trophy, Award, MapPin, Calendar, Ruler, ChevronLeft, X } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

export default function FighterProfilePage({ params }: { params: { slug: string } }) {
  const { data, isLoading, error } = useFighterBySlugQuery(params.slug)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data?.fighter) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Fighter not found.</p>
          <Link href="/fighters" className="text-red-500 hover:text-red-400 text-sm">
            ← Back to Fighters
          </Link>
        </div>
      </div>
    )
  }

  const { fighter, upcomingFights, pastFights } = data
  const totalFinishes = fighter.stats.knockouts + fighter.stats.submissions

  return (
    <div className="min-h-screen bg-black">
      {/* Back nav */}
      <div className="pt-20 pb-0 px-4 md:px-8 max-w-6xl mx-auto">
        <Link
          href="/fighters"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          All Fighters
        </Link>
      </div>

      {/* Hero */}
      <motion.div
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background blurred image */}
        {fighter.image && (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={fighter.image}
              alt=""
              fill
              className="object-cover object-top blur-2xl scale-110 opacity-20"
              priority
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 pt-8 pb-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Fighter photo */}
            <div className="w-full md:w-72 flex-shrink-0">
              <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-red-900/40 shadow-2xl">
                {fighter.image ? (
                  <Image
                    src={fighter.image}
                    alt={fighter.name}
                    fill
                    className="object-cover object-top"
                    priority
                    sizes="(max-width: 768px) 100vw, 288px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <span className="text-gray-600 text-5xl font-black">
                      {fighter.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </div>

            {/* Fighter info */}
            <div className="flex-1 pt-2">
              <p className="text-red-500 font-bold text-sm tracking-widest uppercase mb-1">
                "{fighter.nickname}"
              </p>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3">
                {fighter.name}
              </h1>

              <div className="text-3xl font-black text-white mb-4">
                <span className="text-red-500">{fighter.record}</span>
                <span className="text-gray-600 text-base font-normal ml-3">(W-L-D)</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className="bg-gray-800 text-gray-300 border-gray-700">
                  {fighter.weight}
                </Badge>
                <Badge className="bg-gray-800 text-gray-300 border-gray-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {fighter.hometown}
                </Badge>
                <Badge className="bg-gray-800 text-gray-300 border-gray-700 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {fighter.age} yrs
                </Badge>
                <Badge className="bg-gray-800 text-gray-300 border-gray-700 flex items-center gap-1">
                  <Ruler className="w-3 h-3" />
                  {fighter.height} • {fighter.reach} reach
                </Badge>
              </div>

              {fighter.bio && (
                <p className="text-gray-300 leading-relaxed max-w-xl mb-6">
                  {fighter.bio}
                </p>
              )}

              {/* Stats bar */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "KOs", value: fighter.stats.knockouts },
                  { label: "Subs", value: fighter.stats.submissions },
                  { label: "Decisions", value: fighter.stats.decisions },
                  { label: "Win Streak", value: fighter.stats.winStreak },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-red-500">{value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Body content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-20 space-y-10">

        {/* Upcoming Fights */}
        {upcomingFights?.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full" />
              Upcoming Fights
            </h2>
            <div className="space-y-3">
              {upcomingFights.map((fight: any) => {
                const opponent =
                  fight.fighter1?._id?.toString() === fighter._id?.toString()
                    ? fight.fighter2
                    : fight.fighter1
                return (
                  <div key={fight._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <p className="text-white font-semibold">vs {opponent?.name ?? "TBA"}</p>
                      <p className="text-gray-400 text-sm">{fight.title}</p>
                    </div>
                    <div className="text-right">
                      {fight.event?.name && (
                        <p className="text-red-400 font-medium text-sm">{fight.event.name}</p>
                      )}
                      {fight.event?.date && (
                        <p className="text-gray-500 text-xs">
                          {format(new Date(fight.event.date), "MMMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    {fight.event?.slug && (
                      <Link
                        href={`/events/${fight.event.slug}`}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
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
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gray-600 rounded-full" />
              TCS Fight History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left pb-3 pr-4">Result</th>
                    <th className="text-left pb-3 pr-4">Opponent</th>
                    <th className="text-left pb-3 pr-4">Method</th>
                    <th className="text-left pb-3 pr-4">Rnd</th>
                    <th className="text-left pb-3">Event</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {pastFights.map((fight: any) => {
                    const isWin = fight.result?.winner?.toString() === fighter._id?.toString()
                    const isDraw = fight.result?.method === "Draw"
                    const isNC = fight.result?.method === "No Contest"
                    const opponent =
                      fight.fighter1?._id?.toString() === fighter._id?.toString()
                        ? fight.fighter2
                        : fight.fighter1

                    const resultLabel = isDraw ? "Draw" : isNC ? "NC" : isWin ? "Win" : "Loss"
                    const resultColor = isDraw || isNC
                      ? "text-yellow-400"
                      : isWin
                      ? "text-green-400"
                      : "text-red-400"

                    return (
                      <tr key={fight._id} className="hover:bg-gray-900/40 transition-colors">
                        <td className={`py-3 pr-4 font-bold ${resultColor}`}>{resultLabel}</td>
                        <td className="py-3 pr-4 text-white">{opponent?.name ?? "Unknown"}</td>
                        <td className="py-3 pr-4 text-gray-300">{fight.result?.method}</td>
                        <td className="py-3 pr-4 text-gray-400">{fight.result?.round ?? "—"}</td>
                        <td className="py-3 text-gray-400">
                          {fight.event?.name ?? "—"}
                          {fight.event?.date && (
                            <span className="text-gray-600 ml-1 text-xs">
                              ({format(new Date(fight.event.date), "MMM yyyy")})
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

        {/* Achievements */}
        {fighter.achievements?.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Achievements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fighter.achievements.map((achievement: string, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                  <Award className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-gray-200 text-sm">{achievement}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Finish breakdown */}
        {totalFinishes > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full" />
              Finish Breakdown
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Knockouts", value: fighter.stats.knockouts, color: "bg-red-600" },
                { label: "Submissions", value: fighter.stats.submissions, color: "bg-orange-600" },
                { label: "Decisions", value: fighter.stats.decisions, color: "bg-gray-600" },
              ].map(({ label, value, color }) => {
                const total = fighter.stats.knockouts + fighter.stats.submissions + fighter.stats.decisions
                const pct = total > 0 ? Math.round((value / total) * 100) : 0
                return (
                  <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="text-2xl font-black text-white mb-1">{value}</div>
                    <div className="text-xs text-gray-400 mb-3">{label}</div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{pct}%</div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Photo Gallery */}
        {fighter.images?.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full" />
              Photo Gallery
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {fighter.images.map((url: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-800 group"
                >
                  <Image
                    src={url}
                    alt={`${fighter.name} photo ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              className="relative w-full max-w-3xl max-h-[85vh] aspect-square"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
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
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
                {fighter.images.map((_: string, i: number) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                    className={`w-2 h-2 rounded-full transition-colors ${i === lightboxIndex ? 'bg-white' : 'bg-gray-600 hover:bg-gray-400'}`}
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
