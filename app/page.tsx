"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import HeroParallax from "@/components/hero-parallax"
import SmoothParallax from "@/components/smooth-parallax"
import RevealAnimation from "@/components/reveal-animation"
import StaggeredReveal from "@/components/staggered-reveal"
import ScrollTriggeredAnimation from "@/components/scroll-triggered-animation"
import CountdownTimer from "@/components/countdown-timer"
import { Calendar, MapPin, Users, Trophy, Star, Award } from "lucide-react"
import { useUpcomingEventsQuery, usePastEventsQuery } from "@/hooks/use-queries"
import { format } from "date-fns"
import type { IEvent } from "@/lib/models/Event"

export default function HomePage() {
  const [email, setEmail] = useState("")

  // Fetch real events from database
  const { data: upcomingEvents, isLoading: isLoadingUpcoming } = useUpcomingEventsQuery()
  const { data: pastEvents, isLoading: isLoadingPast } = usePastEventsQuery()

  const featuredFighters = [
    {
      id: 1,
      name: 'Marcus "The Hammer" Rodriguez',
      record: "15-2-0",
      image: "/placeholder.svg?height=300&width=250",
      bio: "Houston native with devastating knockout power",
    },
    {
      id: 2,
      name: 'Sarah "Lightning" Chen',
      record: "12-1-0",
      image: "/placeholder.svg?height=300&width=250",
      bio: "Speed and precision define this rising star",
    },
    {
      id: 3,
      name: 'Antonio "The Bull" Martinez',
      record: "18-3-1",
      image: "/placeholder.svg?height=300&width=250",
      bio: "Veteran fighter with unmatched experience",
    },
  ]

  const achievements = [
    {
      icon: <Trophy className="w-8 h-8 text-red-500" />,
      number: "50+",
      label: "Championship Fights",
    },
    {
      icon: <Users className="w-8 h-8 text-red-500" />,
      number: "100K+",
      label: "Fans Served",
    },
    {
      icon: <Star className="w-8 h-8 text-red-500" />,
      number: "25+",
      label: "Elite Fighters",
    },
    {
      icon: <Award className="w-8 h-8 text-red-500" />,
      number: "4",
      label: "Years Strong",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section with Smooth Parallax */}
      <HeroParallax backgroundVideo="/videos/hero-fight.mp4" className="relative">
        <div className="text-center px-4 max-w-6xl mx-auto">
          <RevealAnimation delay={0.2}>
            <h1 className="text-6xl md:text-8xl font-black mb-6 text-white">
              TEXAS
              <span className="block text-red-600">COMBAT</span>
              <span className="block text-4xl md:text-6xl">SPORT</span>
            </h1>
          </RevealAnimation>

          <RevealAnimation delay={0.4}>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 font-bold">Real Fights. Real Houston.</p>
          </RevealAnimation>

          <RevealAnimation delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105"
              >
                Buy Tickets
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 bg-transparent"
              >
                See Fight Card
              </Button>
            </div>
          </RevealAnimation>
        </div>
      </HeroParallax>

      {/* Achievements Section with Staggered Animation */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <StaggeredReveal staggerDelay={0.15}>
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center group">
                <ScrollTriggeredAnimation
                  scaleRange={[0.8, 1]}
                  opacityRange={[0, 1]}
                  className="transition-transform duration-300 hover:scale-110"
                >
                  <div className="flex justify-center mb-4">{achievement.icon}</div>
                  <div className="text-4xl font-black text-white mb-2">{achievement.number}</div>
                  <div className="text-gray-400 font-medium">{achievement.label}</div>
                </ScrollTriggeredAnimation>
              </div>
            ))}
          </StaggeredReveal>
        </div>
      </section>

      {/* Upcoming Events with Smooth Parallax */}
      <SmoothParallax className="py-20 bg-gradient-to-b from-gray-900 to-black" speed={0.3} direction="up">
        <div className="container mx-auto px-4">
          <RevealAnimation>
            <h2 className="text-5xl font-black text-center mb-16 text-white">
              UPCOMING <span className="text-red-600">EVENTS</span>
            </h2>
          </RevealAnimation>

          {isLoadingUpcoming ? (
            <div className="flex justify-center">
              <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-black/50 border border-red-900/30 rounded-lg overflow-hidden animate-pulse">
                    <div className="h-64 bg-gray-800" />
                    <div className="p-6">
                      <div className="h-6 bg-gray-700 rounded mb-2" />
                      <div className="h-4 bg-gray-700 rounded mb-4" />
                      <div className="h-4 bg-gray-700 rounded mb-4" />
                      <div className="h-10 bg-gray-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="flex justify-center">
              <div className={`grid gap-8 ${upcomingEvents.length === 1 ? 'md:grid-cols-1 max-w-5xl' : 'md:grid-cols-2 max-w-6xl'} w-full`}>
                {upcomingEvents.map((event: IEvent, index: number) => (
              <RevealAnimation key={event._id.toString()} delay={index * 0.2}>
                <ScrollTriggeredAnimation
                  scaleRange={[0.95, 1]}
                  className="bg-black/50 border border-red-900/30 rounded-lg overflow-hidden group hover:border-red-600/50 transition-all duration-500 hover:scale-105"
                >
                  <div className="relative h-64">
                    <Image
                      src={event.posterImage || "/placeholder.svg"}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                      <div className="flex items-center text-gray-300 mb-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        {event.date ? format(new Date(event.date), 'MMM dd, yyyy') : 'TBD'}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.venue}, {event.city}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {event.date && <CountdownTimer targetDate={event.date.toString()} />}
                    <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-300 hover:scale-105">
                      Get Tickets
                    </Button>
                  </div>
                </ScrollTriggeredAnimation>
              </RevealAnimation>
            ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="text-center py-12 max-w-2xl">
                <p className="text-gray-400 text-lg">No upcoming events at the moment.</p>
              </div>
            </div>
          )}
        </div>
      </SmoothParallax>

      {/* Featured Fighters with Enhanced Animations */}
      <SmoothParallax className="py-20 bg-gradient-to-b from-black to-gray-900" speed={0.4} direction="down">
        <div className="container mx-auto px-4">
          <RevealAnimation>
            <h2 className="text-5xl font-black text-center mb-16 text-white">
              FEATURED <span className="text-red-600">FIGHTERS</span>
            </h2>
          </RevealAnimation>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredFighters.map((fighter, index) => (
              <RevealAnimation key={fighter.id} delay={index * 0.15}>
                <ScrollTriggeredAnimation
                  scaleRange={[0.9, 1]}
                  yRange={[50, 0]}
                  className="bg-black/50 border border-red-900/30 rounded-lg overflow-hidden group hover:border-red-600/50 transition-all duration-500 hover:scale-105"
                >
                  <div className="relative h-80">
                    <Image
                      src={fighter.image || "/placeholder.svg"}
                      alt={fighter.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{fighter.name}</h3>
                    <div className="text-red-500 font-bold mb-3">Record: {fighter.record}</div>
                    <p className="text-gray-300">{fighter.bio}</p>
                  </div>
                </ScrollTriggeredAnimation>
              </RevealAnimation>
            ))}
          </div>
        </div>
      </SmoothParallax>

      {/* Past Events Gallery */}
      <SmoothParallax className="py-20 bg-gradient-to-b from-gray-900 to-black" speed={0.2}>
        <div className="container mx-auto px-4">
          <RevealAnimation>
            <h2 className="text-5xl font-black text-center mb-16 text-white">
              PAST <span className="text-red-600">EVENTS</span>
            </h2>
          </RevealAnimation>

          {isLoadingPast ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="relative h-64 bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : pastEvents && pastEvents.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pastEvents.slice(0, 8).map((event: IEvent, index: number) => (
              <RevealAnimation key={event._id.toString()} delay={index * 0.05}>
                <ScrollTriggeredAnimation
                  scaleRange={[0.95, 1]}
                  opacityRange={[0.7, 1]}
                  className="relative h-64 group overflow-hidden rounded-lg cursor-pointer"
                >
                  <Image
                    src={event.posterImage || `/placeholder.svg?height=300&width=300`}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-125"
                  />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-500" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h4 className="text-sm font-bold text-white truncate">{event.title}</h4>
                    <p className="text-xs text-gray-300">
                      {event.date ? format(new Date(event.date), 'MMM dd, yyyy') : 'TBD'}
                    </p>
                  </div>
                </ScrollTriggeredAnimation>
              </RevealAnimation>
            ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No past events available.</p>
            </div>
          )}
        </div>
      </SmoothParallax>

      {/* Why Texas Combat Sport with Background Parallax */}
      <SmoothParallax
        className="py-20"
        backgroundImage="/placeholder.svg?height=800&width=1920"
        speed={0.6}
        overlayOpacity={0.8}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <RevealAnimation>
              <h2 className="text-5xl font-black mb-8 text-white">
                WHY <span className="text-red-600">TEXAS COMBAT SPORT?</span>
              </h2>
            </RevealAnimation>

            <RevealAnimation delay={0.2}>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                We bring the raw intensity and authentic spirit of combat sports to Houston. Our events showcase the
                finest fighters in Texas, delivering unforgettable nights of pure adrenaline and championship-level
                competition.
              </p>
            </RevealAnimation>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <StaggeredReveal staggerDelay={0.2}>
                <div className="text-center">
                  <ScrollTriggeredAnimation
                    scaleRange={[0.5, 1]}
                    className="transition-transform duration-300 hover:scale-110"
                  >
                    <Trophy className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Elite Competition</h3>
                    <p className="text-gray-400">Top-tier fighters from across Texas</p>
                  </ScrollTriggeredAnimation>
                </div>
                <div className="text-center">
                  <ScrollTriggeredAnimation
                    scaleRange={[0.5, 1]}
                    className="transition-transform duration-300 hover:scale-110"
                  >
                    <Users className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Houston Pride</h3>
                    <p className="text-gray-400">Supporting local talent and community</p>
                  </ScrollTriggeredAnimation>
                </div>
                <div className="text-center">
                  <ScrollTriggeredAnimation
                    scaleRange={[0.5, 1]}
                    className="transition-transform duration-300 hover:scale-110"
                  >
                    <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Premium Venues</h3>
                    <p className="text-gray-400">World-class facilities for every event</p>
                  </ScrollTriggeredAnimation>
                </div>
              </StaggeredReveal>
            </div>
          </div>
        </div>
      </SmoothParallax>

      {/* Newsletter Signup */}
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
    </div>
  )
}
