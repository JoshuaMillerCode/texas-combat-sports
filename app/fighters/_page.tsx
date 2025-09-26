"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Crown, Trophy, X, Flag, Award } from "lucide-react"

interface Fighter {
  id: number
  name: string
  nickname: string
  record: string
  weightClass: string
  hometown: string
  age: number
  height: string
  reach: string
  image: string
  bio: string
  achievements: string[]
  stats: {
    knockouts: number
    submissions: number
    decisions: number
    winStreak: number
    totalFights: number
    winPercentage: number
    koRate: number
  }
  isChampion?: boolean
  specialty: string
  fightingStyle: string
  ranking?: number
  country: string
  nextFight?: string
}

const fighters: Fighter[] = [
  {
    id: 1,
    name: 'Marcus "The Hammer" Rodriguez',
    nickname: "The Hammer",
    record: "15-2-0",
    weightClass: "Heavyweight",
    hometown: "Houston, TX",
    age: 28,
    height: "6'3\"",
    reach: '76"',
    image: "/placeholder.svg?height=600&width=400&text=Marcus+Rodriguez",
    bio: "Houston native with devastating knockout power and an unbreakable will to win.",
    achievements: ["TCS Heavyweight Champion", "12 KO Victories", "Fight of the Year 2023"],
    stats: {
      knockouts: 12,
      submissions: 0,
      decisions: 3,
      winStreak: 5,
      totalFights: 17,
      winPercentage: 88,
      koRate: 71,
    },
    isChampion: true,
    specialty: "Knockout Power",
    fightingStyle: "Aggressive Striker",
    ranking: 1,
    country: "USA",
    nextFight: "Houston Showdown 2024",
  },
  {
    id: 2,
    name: 'Sarah "Lightning" Chen',
    nickname: "Lightning",
    record: "12-1-0",
    weightClass: "Bantamweight",
    hometown: "Austin, TX",
    age: 25,
    height: "5'6\"",
    reach: '65"',
    image: "/placeholder.svg?height=600&width=400&text=Sarah+Chen",
    bio: "Speed and precision define this rising star who has taken the Texas combat scene by storm.",
    achievements: ["TCS Women's Champion", "Fastest KO Record", "Rookie of the Year 2022"],
    stats: {
      knockouts: 8,
      submissions: 2,
      decisions: 2,
      winStreak: 7,
      totalFights: 13,
      winPercentage: 92,
      koRate: 62,
    },
    isChampion: true,
    specialty: "Lightning Speed",
    fightingStyle: "Technical Striker",
    ranking: 1,
    country: "USA",
    nextFight: "Title Defense March 2024",
  },
  {
    id: 3,
    name: 'Antonio "The Bull" Martinez',
    nickname: "The Bull",
    record: "18-3-1",
    weightClass: "Middleweight",
    hometown: "San Antonio, TX",
    age: 32,
    height: "5'11\"",
    reach: '72"',
    image: "/placeholder.svg?height=600&width=400&text=Antonio+Martinez",
    bio: "Veteran fighter with unmatched experience and a never-say-die attitude.",
    achievements: ["Former TCS Champion", "15+ Years Experience", "Hall of Fame Inductee"],
    stats: {
      knockouts: 10,
      submissions: 4,
      decisions: 4,
      winStreak: 3,
      totalFights: 22,
      winPercentage: 82,
      koRate: 45,
    },
    specialty: "Ring IQ",
    fightingStyle: "Veteran Brawler",
    ranking: 3,
    country: "USA",
  },
  {
    id: 4,
    name: 'Jessica "Phoenix" Williams',
    nickname: "Phoenix",
    record: "14-2-0",
    weightClass: "Featherweight",
    hometown: "Dallas, TX",
    age: 27,
    height: "5'7\"",
    reach: '67"',
    image: "/placeholder.svg?height=600&width=400&text=Jessica+Williams",
    bio: "Rising from every challenge stronger than before, Phoenix embodies resilience.",
    achievements: ["TCS Featherweight Champion", "Comeback Fighter 2023", "9 Win Streak"],
    stats: {
      knockouts: 7,
      submissions: 3,
      decisions: 4,
      winStreak: 9,
      totalFights: 16,
      winPercentage: 88,
      koRate: 44,
    },
    isChampion: true,
    specialty: "Resilience",
    fightingStyle: "Complete Fighter",
    ranking: 1,
    country: "USA",
    nextFight: "Unification Bout April 2024",
  },
  {
    id: 5,
    name: 'David "Iron Fist" Johnson',
    nickname: "Iron Fist",
    record: "16-4-0",
    weightClass: "Light Heavyweight",
    hometown: "Houston, TX",
    age: 30,
    height: "6'1\"",
    reach: '74"',
    image: "/placeholder.svg?height=600&width=400&text=David+Johnson",
    bio: "Known for his iron will and devastating striking combinations.",
    achievements: ["TCS Light Heavyweight Champion", "Most Strikes Landed", "Fan Favorite 2023"],
    stats: {
      knockouts: 11,
      submissions: 1,
      decisions: 4,
      winStreak: 4,
      totalFights: 20,
      winPercentage: 80,
      koRate: 55,
    },
    specialty: "Strike Volume",
    fightingStyle: "Volume Striker",
    ranking: 2,
    country: "USA",
  },
  {
    id: 6,
    name: 'Carlos "Venom" Gutierrez',
    nickname: "Venom",
    record: "13-1-0",
    weightClass: "Welterweight",
    hometown: "El Paso, TX",
    age: 26,
    height: "5'10\"",
    reach: '70"',
    image: "/placeholder.svg?height=600&width=400&text=Carlos+Gutierrez",
    bio: "Lethal striker with venomous precision and lightning-fast combinations.",
    achievements: ["TCS Welterweight Champion", "Undefeated Streak", "Performance Bonus Winner"],
    stats: {
      knockouts: 9,
      submissions: 2,
      decisions: 2,
      winStreak: 8,
      totalFights: 14,
      winPercentage: 93,
      koRate: 64,
    },
    isChampion: true,
    specialty: "Precision",
    fightingStyle: "Technical Assassin",
    ranking: 1,
    country: "USA",
    nextFight: "Contender Series May 2024",
  },
  {
    id: 7,
    name: 'Mikhail "The Destroyer" Volkov',
    nickname: "The Destroyer",
    record: "20-1-0",
    weightClass: "Light Heavyweight",
    hometown: "Moscow, Russia",
    age: 29,
    height: "6'2\"",
    reach: '75"',
    image: "/placeholder.svg?height=600&width=400&text=Mikhail+Volkov",
    bio: "Russian powerhouse with devastating ground game and relentless pressure.",
    achievements: ["Former World Champion", "18 Finishes", "Submission Specialist"],
    stats: {
      knockouts: 8,
      submissions: 10,
      decisions: 2,
      winStreak: 6,
      totalFights: 21,
      winPercentage: 95,
      koRate: 38,
    },
    specialty: "Ground Control",
    fightingStyle: "Sambo Specialist",
    ranking: 2,
    country: "RUS",
  },
  {
    id: 8,
    name: 'Kenji "The Blade" Tanaka',
    nickname: "The Blade",
    record: "17-3-0",
    weightClass: "Featherweight",
    hometown: "Tokyo, Japan",
    age: 26,
    height: "5'8\"",
    reach: '68"',
    image: "/placeholder.svg?height=600&width=400&text=Kenji+Tanaka",
    bio: "Precision striker with surgical technique and lightning-fast combinations.",
    achievements: ["Asian Champion", "Most Technical Fighter", "14 KO Victories"],
    stats: {
      knockouts: 14,
      submissions: 1,
      decisions: 2,
      winStreak: 4,
      totalFights: 20,
      winPercentage: 85,
      koRate: 70,
    },
    specialty: "Technical Precision",
    fightingStyle: "Karate Specialist",
    ranking: 3,
    country: "JPN",
  },
]

export default function FightersPage() {
  const [spotlightFighter, setSpotlightFighter] = useState<number | null>(null)

  // Close spotlight on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSpotlightFighter(null)
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])

  const handleFighterClick = (fighterId: number) => {
    setSpotlightFighter(fighterId)
  }

  const handleBackdropClick = () => {
    setSpotlightFighter(null)
  }

  const handleCloseSpotlight = () => {
    setSpotlightFighter(null)
  }

  const spotlightedFighter = spotlightFighter ? fighters.find((f) => f.id === spotlightFighter) : null

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-gray-900/20" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <motion.div
        className="relative z-10 pt-20 pb-8 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-wider">
          FIGHTER <span className="text-red-600">COMMAND</span>
        </h1>
        <p className="text-xl text-gray-400 font-bold">SELECT TARGET • ANALYZE THREAT</p>
      </motion.div>

      {/* Fighter Wall */}
      <div className="relative z-10 px-4 md:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Fighter Grid */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {fighters.map((fighter, index) => (
              <FighterCard
                key={fighter.id}
                fighter={fighter}
                index={index}
                isSpotlighted={spotlightFighter === fighter.id}
                isDimmed={spotlightFighter !== null && spotlightFighter !== fighter.id}
                onClick={() => handleFighterClick(fighter.id)}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Spotlight Overlay */}
      <AnimatePresence>
        {spotlightFighter && spotlightedFighter && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleBackdropClick}
          >
            <SpotlightCard fighter={spotlightedFighter} onClose={handleCloseSpotlight} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Fighter Card Component
interface FighterCardProps {
  fighter: Fighter
  index: number
  isSpotlighted: boolean
  isDimmed: boolean
  onClick: () => void
}

function FighterCard({ fighter, index, isSpotlighted, isDimmed, onClick }: FighterCardProps) {
  return (
    <motion.div
      className={`relative cursor-pointer group ${index % 2 === 0 ? "mt-0" : "mt-4 md:mt-8"}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{
        opacity: isDimmed ? 0.3 : 1,
        y: 0,
        scale: isSpotlighted ? 1.05 : 1,
        filter: isDimmed ? "blur(2px)" : "blur(0px)",
      }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={{
        scale: isSpotlighted ? 1.05 : 1.02,
        transition: { duration: 0.2 },
      }}
      onClick={onClick}
    >
      {/* Fighter Image Container */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-red-900/20 to-black rounded-lg overflow-hidden border border-red-900/30 transition-all duration-300">
        <Image
          src={fighter.image || "/placeholder.svg"}
          alt={fighter.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading={index < 4 ? "eager" : "lazy"}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

        {/* Ranking Badge */}
        {fighter.ranking && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-2 py-1 rounded">
            #{fighter.ranking}
          </div>
        )}

        {/* Champion Crown */}
        {fighter.isChampion && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-1.5 rounded-full">
            <Crown className="w-3 h-3" />
          </div>
        )}

        {/* Country Flag */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
          <Flag className="w-3 h-3" />
          {fighter.country}
        </div>

        {/* Fighter Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <Badge className="bg-red-600/90 text-white text-xs font-bold mb-2">{fighter.weightClass}</Badge>
          <h3 className="text-white font-black text-sm md:text-base leading-tight mb-1">
            {fighter.name.split('"')[0].trim()}
          </h3>
          <p className="text-red-400 font-bold text-xs md:text-sm">"{fighter.nickname}"</p>
          <div className="text-white font-bold text-xs mt-1">{fighter.record}</div>
        </div>

        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "radial-gradient(circle at center, rgba(220, 38, 38, 0.2) 0%, transparent 70%)",
          }}
        />

        {/* Scan Line Effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          initial={{ y: "100%" }}
          whileHover={{ y: "-100%" }}
          transition={{ duration: 1, ease: "linear" }}
          style={{
            background: "linear-gradient(to bottom, transparent 0%, rgba(220, 38, 38, 0.3) 50%, transparent 100%)",
            height: "20%",
          }}
        />
      </div>
    </motion.div>
  )
}

// Spotlight Card Component
interface SpotlightCardProps {
  fighter: Fighter
  onClose: () => void
}

function SpotlightCard({ fighter, onClose }: SpotlightCardProps) {
  return (
    <motion.div
      className="bg-black border-2 border-red-600/50 rounded-2xl p-4 md:p-6 max-w-4xl w-full mx-4 relative max-h-[85vh] overflow-y-auto"
      initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
      animate={{ scale: 1, opacity: 1, rotateX: 0 }}
      exit={{ scale: 0.8, opacity: 0, rotateX: 15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10 p-2 hover:bg-red-600/20 rounded-full"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Glowing Border Effect - Removed for solid black background */}
      {/* <div className="absolute -inset-1 bg-gradient-to-r from-red-600/50 to-red-800/50 rounded-2xl blur opacity-75" /> */}

      <div className="relative grid md:grid-cols-2 gap-6">
        {/* Fighter Image */}
        <div className="relative">
          <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
            <Image src={fighter.image || "/placeholder.svg"} alt={fighter.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Champion Badge */}
          {fighter.isChampion && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-1 rounded-full flex items-center gap-1 font-black text-xs">
              <Crown className="w-3 h-3" />
              CHAMP
            </div>
          )}
        </div>

        {/* Fighter Details */}
        <div className="space-y-4">
          {/* Header */}
          <div>
            <Badge className="bg-red-600 text-white font-bold mb-2 text-xs">
              {fighter.weightClass} • #{fighter.ranking}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-1 leading-tight">{fighter.name}</h2>
            <p className="text-lg text-gray-200 font-bold mb-2">"{fighter.nickname}"</p>
            <div className="text-xl font-black text-white">
              <span className="text-red-500">{fighter.record}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-gray-800 rounded-lg p-2">
              <div className="text-lg font-black text-red-500">{fighter.stats.knockouts}</div>
              <div className="text-xs text-gray-400">KOs</div>
            </div>
            <div className="text-center bg-gray-800 rounded-lg p-2">
              <div className="text-lg font-black text-red-500">{fighter.stats.winStreak}</div>
              <div className="text-xs text-gray-400">Streak</div>
            </div>
            <div className="text-center bg-gray-800 rounded-lg p-2">
              <div className="text-lg font-black text-red-500">{fighter.stats.winPercentage}%</div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </div>
          </div>

          {/* Fighting Style */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
            <div className="text-xs text-gray-300 font-bold mb-1">FIGHTING STYLE</div>
            <div className="text-sm font-bold text-white">{fighter.fightingStyle}</div>
            <div className="text-xs text-gray-300">Specialty: {fighter.specialty}</div>
          </div>

          {/* Next Fight */}
          {fighter.nextFight && (
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
              <div className="text-xs text-gray-300 font-bold mb-1">NEXT FIGHT</div>
              <div className="text-sm font-bold text-white">{fighter.nextFight}</div>
            </div>
          )}

          {/* Physical Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-gray-300 mb-1">Age</div>
              <div className="text-white font-bold">{fighter.age} years</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-gray-300 mb-1">Height</div>
              <div className="text-white font-bold">{fighter.height}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-gray-300 mb-1">Reach</div>
              <div className="text-white font-bold">{fighter.reach}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-gray-300 mb-1">Country</div>
              <div className="text-white font-bold flex items-center gap-1">
                <Flag className="w-3 h-3" />
                {fighter.country}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-300 font-bold mb-2">FIGHTER BIO</div>
            <p className="text-gray-200 text-xs leading-relaxed">{fighter.bio}</p>
          </div>

          {/* Achievements */}
          <div>
            <div className="text-xs text-gray-300 font-bold mb-2 flex items-center gap-2">
              <Trophy className="w-3 h-3" />
              TOP ACHIEVEMENTS
            </div>
            <div className="space-y-1">
              {fighter.achievements.slice(0, 3).map((achievement, index) => (
                <div key={index} className="flex items-center text-gray-200 text-xs">
                  <Award className="w-2 h-2 text-red-500 mr-2 flex-shrink-0" />
                  {achievement}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
