"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import RevealAnimation from "@/components/reveal-animation"
import ScrollTriggeredAnimation from "@/components/scroll-triggered-animation"
import { Trophy, Zap } from "lucide-react"

interface MainEventProps {
  mainEventFight?: any
}

export default function MainEvent({ mainEventFight }: MainEventProps) {
  if (!mainEventFight) {
    return (
      <section className="py-12 lg:py-20 bg-gradient-to-b from-black to-gray-900 relative z-10">
        <div className="container mx-auto px-4">
          <RevealAnimation>
            <div className="text-center">
              <h2 className="text-4xl font-black mb-4 text-white">
                MAIN <span className="text-red-600">EVENT</span>
              </h2>
              <div className="max-w-2xl mx-auto">
                <div className="bg-black/50 border border-red-900/30 rounded-lg p-12">
                  <h3 className="text-3xl font-bold text-white mb-4">Coming Soon</h3>
                  <p className="text-gray-300 text-lg">
                    The main event fight card is being finalized. Check back soon for the announcement of our featured fighters!
                  </p>
                </div>
              </div>
            </div>
          </RevealAnimation>
        </div>
      </section>
    )
  }

  return (
    <section id="main-event" className="py-12 lg:py-20 bg-gradient-to-b from-black to-gray-900 relative z-10">
      <div className="container mx-auto px-4">
        <RevealAnimation>
          <h2 className="text-4xl font-black text-center mb-4 text-white">
            MAIN <span className="text-red-600">EVENT</span>
          </h2>
          <div className="text-center mb-12">
            <Badge className="bg-red-600/20 border border-red-600 text-red-400 font-bold text-lg px-4 py-2">
              {mainEventFight.title}
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
                      src={mainEventFight.fighter1.image || "/placeholder.svg"}
                      alt={mainEventFight.fighter1.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-red-600 text-white font-bold mb-2">
                        {mainEventFight.fighter1.record}
                      </Badge>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{mainEventFight.fighter1.name}</h3>
                <p className="text-red-500 font-bold text-lg mb-4">"{mainEventFight.fighter1.nickname}"</p>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-center lg:justify-end items-center">
                    <span className="text-gray-400 mr-2">Age:</span>
                    <span className="text-white font-bold">{mainEventFight.fighter1.age}</span>
                  </div>
                  <div className="flex justify-center lg:justify-end items-center">
                    <span className="text-gray-400 mr-2">Height:</span>
                    <span className="text-white font-bold">{mainEventFight.fighter1.height}</span>
                  </div>
                  <div className="flex justify-center lg:justify-end items-center">
                    <span className="text-gray-400 mr-2">Reach:</span>
                    <span className="text-white font-bold">{mainEventFight.fighter1.reach}</span>
                  </div>
                  <div className="flex justify-center lg:justify-end items-center">
                    <span className="text-gray-400 mr-2">Weight:</span>
                    <span className="text-white font-bold">{mainEventFight.fighter1.weight}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Zap className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-white">{mainEventFight.fighter1.stats.knockouts}</div>
                    <div className="text-xs text-gray-400">KOs</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-white">{mainEventFight.fighter1.stats.winStreak}</div>
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
                  <div className="text-white font-bold text-lg mb-2">{mainEventFight.rounds} Rounds</div>
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
                      src={mainEventFight.fighter2.image || "/placeholder.svg"}
                      alt={mainEventFight.fighter2.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-red-600 text-white font-bold mb-2">
                        {mainEventFight.fighter2.record}
                      </Badge>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{mainEventFight.fighter2.name}</h3>
                <p className="text-red-500 font-bold text-lg mb-4">"{mainEventFight.fighter2.nickname}"</p>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-center lg:justify-start items-center">
                    <span className="text-gray-400 mr-2">Age:</span>
                    <span className="text-white font-bold">{mainEventFight.fighter2.age}</span>
                  </div>
                  <div className="flex justify-center lg:justify-start items-center">
                    <span className="text-gray-400 mr-2">Height:</span>
                    <span className="text-white font-bold">{mainEventFight.fighter2.height}</span>
                  </div>
                  <div className="flex justify-center lg:justify-start items-center">
                    <span className="text-gray-400 mr-2">Reach:</span>
                    <span className="text-white font-bold">{mainEventFight.fighter2.reach}</span>
                  </div>
                  <div className="flex justify-center lg:justify-start items-center">
                    <span className="text-gray-400 mr-2">Weight:</span>
                    <span className="text-white font-bold">{mainEventFight.fighter2.weight}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Zap className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-white">{mainEventFight.fighter2.stats.knockouts}</div>
                    <div className="text-xs text-gray-400">KOs</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-white">{mainEventFight.fighter2.stats.winStreak}</div>
                    <div className="text-xs text-gray-400">Win Streak</div>
                  </div>
                </div>
              </ScrollTriggeredAnimation>
            </RevealAnimation>
          </div>
        </div>
      </div>
    </section>
  )
} 