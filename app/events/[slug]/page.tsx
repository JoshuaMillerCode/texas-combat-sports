"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CountdownTimer from "@/components/countdown-timer"
import HeroParallax from "@/components/hero-parallax"
import RevealAnimation from "@/components/reveal-animation"
import ScrollTriggeredAnimation from "@/components/scroll-triggered-animation"
import TicketPurchaseModal from "@/components/ticket-purchase-modal"
import { Calendar, MapPin, Clock, Users, Trophy, Zap, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import type { TicketTier } from "@/types/stripe"

// Mock data - in a real app, this would come from your API/database
const getEventData = (slug: string) => {
  return {
    id: "houston-showdown-2024",
    slug: "houston-showdown-2024",
    title: "Houston Showdown",
    subtitle: "Championship Night",
    date: "2024-07-19T19:00:00",
    location: "Toyota Center, Houston",
    address: "1510 Polk St, Houston, TX 77002",
    venue: "Toyota Center",
    city: "Houston, TX",
    capacity: "18,500",
    ticketPrice: "From $45",
    posterImage: "/placeholder.svg?height=800&width=600&text=Houston+Showdown+Poster",
    heroVideo: "/videos/events-hero.mp4",
    description:
      "The biggest fight night of the summer featuring championship bouts and rising stars. Witness history in the making as Houston's finest warriors battle for glory in the ring.",
    mainEvent: {
      fighter1: {
        id: 1,
        name: 'Marcus "The Hammer" Rodriguez',
        nickname: "The Hammer",
        record: "15-2-0",
        age: 28,
        height: "6'3\"",
        reach: '76"',
        weight: "205 lbs",
        hometown: "Houston, TX",
        image: "/placeholder.svg?height=400&width=300&text=Marcus+Rodriguez",
        stats: {
          knockouts: 12,
          submissions: 0,
          decisions: 3,
          winStreak: 5,
        },
        achievements: ["TCS Heavyweight Champion", "12 KO Victories", "Fight of the Year 2023"],
      },
      fighter2: {
        id: 2,
        name: 'Antonio "The Bull" Martinez',
        nickname: "The Bull",
        record: "18-3-1",
        age: 32,
        height: "5'11\"",
        reach: '72"',
        weight: "203 lbs",
        hometown: "San Antonio, TX",
        image: "/placeholder.svg?height=400&width=300&text=Antonio+Martinez",
        stats: {
          knockouts: 10,
          submissions: 4,
          decisions: 4,
          winStreak: 3,
        },
        achievements: ["Former TCS Champion", "15+ Years Experience", "Hall of Fame Inductee"],
      },
      title: "TCS Heavyweight Championship",
      rounds: 5,
    },
    undercard: [
      {
        id: 3,
        fighter1: {
          name: 'Sarah "Lightning" Chen',
          nickname: "Lightning",
          record: "12-1-0",
          image: "/placeholder.svg?height=300&width=250&text=Sarah+Chen",
        },
        fighter2: {
          name: 'Jessica "Phoenix" Williams',
          nickname: "Phoenix",
          record: "14-2-0",
          image: "/placeholder.svg?height=300&width=250&text=Jessica+Williams",
        },
        title: "Women's Bantamweight Title",
        rounds: 5,
      },
      {
        id: 4,
        fighter1: {
          name: 'David "Iron Fist" Johnson',
          nickname: "Iron Fist",
          record: "16-4-0",
          image: "/placeholder.svg?height=300&width=250&text=David+Johnson",
        },
        fighter2: {
          name: 'Carlos "Venom" Gutierrez',
          nickname: "Venom",
          record: "13-1-0",
          image: "/placeholder.svg?height=300&width=250&text=Carlos+Gutierrez",
        },
        title: "Light Heavyweight Bout",
        rounds: 3,
      },
    ],
    ticketTiers: [
      {
        id: "general",
        name: "General Admission",
        price: 45,
        currency: "USD",
        features: ["Upper Level Seating", "Event Program"],
        stripePriceId: "price_1Rml4CP4zC66HIIg7mEWSXI9", // Replace with actual Stripe Price ID
        maxQuantity: 8,
      },
      {
        id: "premium",
        name: "Premium",
        price: 125,
        currency: "USD",
        features: ["Lower Level Seating", "VIP Entrance", "Event Program", "Commemorative T-Shirt"],
        stripePriceId: "price_1234567891", // Replace with actual Stripe Price ID
        maxQuantity: 6,
      },
      {
        id: "ringside",
        name: "Ringside",
        price: 350,
        currency: "USD",
        features: ["Ringside Seating", "VIP Lounge Access", "Meet & Greet", "Premium Merchandise Package"],
        stripePriceId: "price_1234567892", // Replace with actual Stripe Price ID
        maxQuantity: 4,
      },
      {
        id: "vip",
        name: "VIP Experience",
        price: 750,
        currency: "USD",
        features: [
          "Front Row Seating",
          "Backstage Access",
          "Fighter Meet & Greet",
          "Premium Bar Access",
          "Exclusive Merchandise",
        ],
        stripePriceId: "price_1234567893", // Replace with actual Stripe Price ID
        maxQuantity: 2,
      },
    ] as TicketTier[],
  }
}

export default function EventDetailPage({ params }: { params: { slug: string } }) {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const event = getEventData(params.slug)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section with Event Poster */}
      <div className="relative">
        {/* Desktop Layout (>= lg) */}
        <div className="hidden lg:block">
          <HeroParallax backgroundVideo={event.heroVideo} className="relative z-0" height="100vh">
            <div className="container mx-auto px-4 h-full flex items-center justify-center">
              <div className="w-full max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Event Info */}
                  <motion.div className="text-left" variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div variants={itemVariants}>
                      <Link
                        href="/events"
                        className="inline-flex items-center text-red-500 hover:text-red-400 transition-colors mb-6 group"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Events
                      </Link>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Badge className="bg-red-600 text-white font-bold mb-4 text-sm px-3 py-1">{event.subtitle}</Badge>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl xl:text-7xl font-black text-white mb-6">
                      {event.title.split(" ").map((word, index) => (
                        <span key={index} className={index === 1 ? "block text-red-600" : "block"}>
                          {word}
                        </span>
                      ))}
                    </motion.h1>

                    <motion.div variants={itemVariants} className="space-y-4 mb-8">
                      <div className="flex items-center text-gray-300 text-lg">
                        <Calendar className="w-6 h-6 mr-4 text-red-500" />
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center text-gray-300 text-lg">
                        <Clock className="w-6 h-6 mr-4 text-red-500" />
                        {new Date(event.date).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                      <div className="flex items-center text-gray-300 text-lg">
                        <MapPin className="w-6 h-6 mr-4 text-red-500" />
                        {event.venue}, {event.city}
                      </div>
                      <div className="flex items-center text-gray-300 text-lg">
                        <Users className="w-6 h-6 mr-4 text-red-500" />
                        Capacity: {event.capacity}
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="mb-8">
                      <CountdownTimer targetDate={event.date} />
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                      <Button
                        size="lg"
                        onClick={() => setIsTicketModalOpen(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105"
                      >
                        Buy Tickets Now
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 bg-transparent"
                      >
                        Share Event
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Event Poster - Desktop */}
                  <motion.div variants={itemVariants} className="relative h-96 xl:h-[600px] group">
                    <div className="relative h-full rounded-lg overflow-hidden">
                      <Image
                        src={event.posterImage || "/placeholder.svg"}
                        alt={`${event.title} Poster`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="text-white text-center">
                          <div className="text-2xl font-bold mb-2">{event.ticketPrice}</div>
                          <div className="text-sm text-gray-300">Starting Price</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </HeroParallax>
        </div>

        {/* Mobile/Tablet Layout (< lg) with Poster Background */}
        <div
          className="lg:hidden relative min-h-screen bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${event.posterImage || "/placeholder.svg?height=800&width=600&text=Houston+Showdown+Poster"})`,
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/70 z-10"></div>

          {/* Video background overlay (optional - can be removed if not needed) */}
          <div className="absolute inset-0 z-0">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-30">
              <source src={event.heroVideo} type="video/mp4" />
            </video>
          </div>

          {/* Content */}
          <div className="relative z-20 container mx-auto px-4 min-h-screen flex items-center justify-center pt-24 pb-8">
            <div className="w-full max-w-4xl">
              <div className="flex flex-col items-center text-center space-y-6">
                <motion.div className="w-full" variants={containerVariants} initial="hidden" animate="visible">
                  <motion.div variants={itemVariants} className="mb-6">
                    <Link
                      href="/events"
                      className="inline-flex items-center text-red-500 hover:text-red-400 transition-colors group"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                      Back to Events
                    </Link>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mb-4">
                    <Badge className="bg-red-600 text-white font-bold text-sm px-3 py-1">{event.subtitle}</Badge>
                  </motion.div>

                  <motion.h1
                    variants={itemVariants}
                    className="text-4xl md:text-6xl font-black text-white mb-8 drop-shadow-2xl"
                  >
                    {event.title.split(" ").map((word, index) => (
                      <span key={index} className={index === 1 ? "block text-red-600" : "block"}>
                        {word}
                      </span>
                    ))}
                  </motion.h1>

                  <motion.div variants={itemVariants} className="space-y-4 mb-8">
                    <div className="flex items-center justify-center text-gray-100 text-base md:text-lg drop-shadow-lg">
                      <Calendar className="w-5 h-5 md:w-6 md:h-6 mr-3 text-red-500 drop-shadow-lg" />
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center justify-center text-gray-100 text-base md:text-lg drop-shadow-lg">
                      <Clock className="w-5 h-5 md:w-6 md:h-6 mr-3 text-red-500 drop-shadow-lg" />
                      {new Date(event.date).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                    <div className="flex items-center justify-center text-gray-100 text-base md:text-lg drop-shadow-lg">
                      <MapPin className="w-5 h-5 md:w-6 md:h-6 mr-3 text-red-500 drop-shadow-lg" />
                      {event.venue}, {event.city}
                    </div>
                    <div className="flex items-center justify-center text-gray-100 text-base md:text-lg drop-shadow-lg">
                      <Users className="w-5 h-5 md:w-6 md:h-6 mr-3 text-red-500 drop-shadow-lg" />
                      Capacity: {event.capacity}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mb-8">
                    <div className="drop-shadow-2xl">
                      <CountdownTimer targetDate={event.date} />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Button
                      size="lg"
                      onClick={() => setIsTicketModalOpen(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 shadow-2xl"
                    >
                      Buy Tickets Now
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 bg-black/30 backdrop-blur-sm shadow-2xl"
                    >
                      Share Event
                    </Button>
                  </motion.div>

                  {/* Ticket Price Display */}
                  <motion.div variants={itemVariants} className="text-center">
                    <div className="inline-block bg-black/50 backdrop-blur-sm rounded-lg px-6 py-4 border border-red-600/30">
                      <div className="text-2xl md:text-3xl font-bold text-white mb-1 drop-shadow-lg">
                        {event.ticketPrice}
                      </div>
                      <div className="text-sm text-gray-300 drop-shadow-lg">Starting Price</div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Event Fight Card */}
      <section className="py-12 lg:py-20 bg-gradient-to-b from-black to-gray-900 relative z-10">
        <div className="container mx-auto px-4">
          <RevealAnimation>
            <h2 className="text-4xl font-black text-center mb-4 text-white">
              MAIN <span className="text-red-600">EVENT</span>
            </h2>
            <div className="text-center mb-12">
              <Badge className="bg-red-600/20 border border-red-600 text-red-400 font-bold text-lg px-4 py-2">
                {event.mainEvent.title}
              </Badge>
            </div>
          </RevealAnimation>

          {/* Fighter Comparison */}
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              {/* Fighter 1 */}
              <RevealAnimation direction="left">
                <ScrollTriggeredAnimation scaleRange={[0.9, 1]} className="text-center lg:text-right">
                  <div className="relative mb-6">
                    <div className="relative h-80 w-64 mx-auto lg:ml-auto lg:mr-0 rounded-lg overflow-hidden group">
                      <Image
                        src={event.mainEvent.fighter1.image || "/placeholder.svg"}
                        alt={event.mainEvent.fighter1.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-red-600 text-white font-bold mb-2">
                          {event.mainEvent.fighter1.record}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{event.mainEvent.fighter1.name}</h3>
                  <p className="text-red-500 font-bold text-lg mb-4">"{event.mainEvent.fighter1.nickname}"</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-center lg:justify-end items-center">
                      <span className="text-gray-400 mr-2">Age:</span>
                      <span className="text-white font-bold">{event.mainEvent.fighter1.age}</span>
                    </div>
                    <div className="flex justify-center lg:justify-end items-center">
                      <span className="text-gray-400 mr-2">Height:</span>
                      <span className="text-white font-bold">{event.mainEvent.fighter1.height}</span>
                    </div>
                    <div className="flex justify-center lg:justify-end items-center">
                      <span className="text-gray-400 mr-2">Reach:</span>
                      <span className="text-white font-bold">{event.mainEvent.fighter1.reach}</span>
                    </div>
                    <div className="flex justify-center lg:justify-end items-center">
                      <span className="text-gray-400 mr-2">Weight:</span>
                      <span className="text-white font-bold">{event.mainEvent.fighter1.weight}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Zap className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="text-2xl font-bold text-white">{event.mainEvent.fighter1.stats.knockouts}</div>
                      <div className="text-xs text-gray-400">KOs</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Trophy className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="text-2xl font-bold text-white">{event.mainEvent.fighter1.stats.winStreak}</div>
                      <div className="text-xs text-gray-400">Win Streak</div>
                    </div>
                  </div>
                </ScrollTriggeredAnimation>
              </RevealAnimation>

              {/* VS Section */}
              <RevealAnimation delay={0.2}>
                <div className="text-center py-8">
                  <div className="relative">
                    <div className="text-6xl font-black text-red-600 mb-4">VS</div>
                    <div className="text-white font-bold text-lg mb-2">{event.mainEvent.rounds} Rounds</div>
                    <div className="text-gray-400">Championship Fight</div>
                  </div>
                </div>
              </RevealAnimation>

              {/* Fighter 2 */}
              <RevealAnimation direction="right">
                <ScrollTriggeredAnimation scaleRange={[0.9, 1]} className="text-center lg:text-left">
                  <div className="relative mb-6">
                    <div className="relative h-80 w-64 mx-auto lg:mr-auto lg:ml-0 rounded-lg overflow-hidden group">
                      <Image
                        src={event.mainEvent.fighter2.image || "/placeholder.svg"}
                        alt={event.mainEvent.fighter2.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-red-600 text-white font-bold mb-2">
                          {event.mainEvent.fighter2.record}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{event.mainEvent.fighter2.name}</h3>
                  <p className="text-red-500 font-bold text-lg mb-4">"{event.mainEvent.fighter2.nickname}"</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-center lg:justify-start items-center">
                      <span className="text-gray-400 mr-2">Age:</span>
                      <span className="text-white font-bold">{event.mainEvent.fighter2.age}</span>
                    </div>
                    <div className="flex justify-center lg:justify-start items-center">
                      <span className="text-gray-400 mr-2">Height:</span>
                      <span className="text-white font-bold">{event.mainEvent.fighter2.height}</span>
                    </div>
                    <div className="flex justify-center lg:justify-start items-center">
                      <span className="text-gray-400 mr-2">Reach:</span>
                      <span className="text-white font-bold">{event.mainEvent.fighter2.reach}</span>
                    </div>
                    <div className="flex justify-center lg:justify-start items-center">
                      <span className="text-gray-400 mr-2">Weight:</span>
                      <span className="text-white font-bold">{event.mainEvent.fighter2.weight}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Zap className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="text-2xl font-bold text-white">{event.mainEvent.fighter2.stats.knockouts}</div>
                      <div className="text-xs text-gray-400">KOs</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Trophy className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="text-2xl font-bold text-white">{event.mainEvent.fighter2.stats.winStreak}</div>
                      <div className="text-xs text-gray-400">Win Streak</div>
                    </div>
                  </div>
                </ScrollTriggeredAnimation>
              </RevealAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Undercard */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <RevealAnimation>
            <h2 className="text-4xl font-black text-center mb-16 text-white">
              FIGHT <span className="text-red-600">CARD</span>
            </h2>
          </RevealAnimation>

          <div className="max-w-4xl mx-auto space-y-8">
            {event.undercard.map((fight, index) => (
              <RevealAnimation key={fight.id} delay={index * 0.1}>
                <ScrollTriggeredAnimation
                  scaleRange={[0.95, 1]}
                  className="bg-black/50 border border-red-900/30 rounded-lg p-6 hover:border-red-600/50 transition-all duration-300"
                >
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    {/* Fighter 1 */}
                    <div className="text-center md:text-right">
                      <div className="relative h-32 w-24 mx-auto md:ml-auto md:mr-0 mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={fight.fighter1.image || "/placeholder.svg"}
                          alt={fight.fighter1.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1">{fight.fighter1.name}</h4>
                      <p className="text-red-500 text-sm mb-2">"{fight.fighter1.nickname}"</p>
                      <Badge className="bg-gray-700 text-white text-xs">{fight.fighter1.record}</Badge>
                    </div>

                    {/* VS */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 mb-2">VS</div>
                      <div className="text-white font-bold text-sm mb-1">{fight.title}</div>
                      <div className="text-gray-400 text-xs">{fight.rounds} Rounds</div>
                    </div>

                    {/* Fighter 2 */}
                    <div className="text-center md:text-left">
                      <div className="relative h-32 w-24 mx-auto md:mr-auto md:ml-0 mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={fight.fighter2.image || "/placeholder.svg"}
                          alt={fight.fighter2.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1">{fight.fighter2.name}</h4>
                      <p className="text-red-500 text-sm mb-2">"{fight.fighter2.nickname}"</p>
                      <Badge className="bg-gray-700 text-white text-xs">{fight.fighter2.record}</Badge>
                    </div>
                  </div>
                </ScrollTriggeredAnimation>
              </RevealAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4 text-center">
          <RevealAnimation>
            <h2 className="text-4xl font-black mb-8 text-white">
              DON'T MISS <span className="text-red-600">THE ACTION</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Secure your seats now for the most anticipated fight night of the year. Tickets are selling fast!
            </p>
            <Button
              size="lg"
              onClick={() => setIsTicketModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-12 py-4 text-xl font-bold transition-all duration-300 hover:scale-105"
            >
              Get Your Tickets Now
            </Button>
          </RevealAnimation>
        </div>
      </section>

      {/* Ticket Purchase Modal */}
      <TicketPurchaseModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        eventId={event.id}
        eventTitle={event.title}
        eventDate={event.date}
        eventVenue={event.venue}
        ticketTiers={event.ticketTiers}
      />
    </div>
  )
}
