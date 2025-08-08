"use client"

import StaggeredReveal from "@/components/staggered-reveal"
import ScrollTriggeredAnimation from "@/components/scroll-triggered-animation"
import { Trophy, Users, Star, Award } from "lucide-react"

export default function AchievementsSection() {
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
  )
} 