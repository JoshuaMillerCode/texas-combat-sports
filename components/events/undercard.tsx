"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import RevealAnimation from "@/components/reveal-animation"
import ScrollTriggeredAnimation from "@/components/scroll-triggered-animation"

interface UndercardProps {
  fights?: any[]
  isPastEvent: boolean
}

export default function Undercard({ fights, isPastEvent }: UndercardProps) {
  const undercardFights = fights?.filter((f: any) => f.isMainEvent == false)
  if (!undercardFights || undercardFights.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <RevealAnimation>
            <div className="text-center">
              <h2 className="text-4xl font-black mb-16 text-white">
                FIGHT <span className="text-red-600">CARD</span>
              </h2>
              <div className="max-w-2xl mx-auto">
                <div className="bg-black/50 border border-red-900/30 rounded-lg p-12">
                  <h3 className="text-3xl font-bold text-white mb-4">{isPastEvent ? "Information Not Available" : "Coming Soon"}</h3>
                  <p className="text-gray-300 text-lg">
                    {isPastEvent ? "The complete fight card is not available." : "The complete fight card is being assembled. We're working on bringing you the most exciting matchups!"}
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
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <RevealAnimation>
          <h2 className="text-4xl font-black text-center mb-16 text-white">
            FIGHT <span className="text-red-600">CARD</span>
          </h2>
        </RevealAnimation>

        <div className="max-w-4xl mx-auto space-y-8">
          {undercardFights.map((fight: any, index: number) => (
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
  )
} 