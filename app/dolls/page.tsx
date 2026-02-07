"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import RevealAnimation from "@/components/reveal-animation"
import { Instagram, Sparkles, Mail, UserPlus } from "lucide-react"
import RingGirlCard from "@/components/dolls/ring-girl-card"

// Sample data for ring girls
export interface RingGirl {
  id: number
  name: string
  nickname?: string
  height?: string
  hometown?: string
  bio: string
  image: string
  instagram?: string
  eventsWorked?: string[]
  favoriteFightMoment?: string
  walkoutSong?: string
  funFacts?: string[]
}

const ringGirls: RingGirl[] = [
  {
    id: 1,
    name: "Sofia Martinez",
    nickname: "The Spotlight",
    height: "5'8\"",
    hometown: "Houston, TX",
    bio: "Sofia brings elegance and energy to every fight night. With her charismatic presence and professional poise, she's become a fan favorite at Texas Combat Sports events.",
    image: "https://scontent-dfw5-1.cdninstagram.com/v/t51.82787-15/625647792_17925999996217338_2362009399620012400_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=105&ig_cache_key=MzgyMzE4NjA0MDk5OTk5MDcyNg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=1HN61EDAEdUQ7kNvwHrtjDh&_nc_oc=Adkc4XefilrG9zOfkF3ElMxbTDClCknaN0WcjNgOHxoV__PqbmpnYcoM-7MaJm1Z2gM&_nc_ad=z-m&_nc_cid=4&_nc_zt=23&_nc_ht=scontent-dfw5-1.cdninstagram.com&_nc_gid=9gI1QUSTlC526k_agtIilA&oh=00_Afvzx5Hvebj_9G3TDY99988h-MDer8_fUal7PMSx94nHpQ&oe=698C54E6",
    instagram: "@sofiamartinez",
    eventsWorked: ["Houston Showdown 2024", "Texas Title Fight", "Championship Night"],
    favoriteFightMoment: "Witnessing the main event knockout that brought the entire arena to its feet.",
    walkoutSong: "Diamonds - Rihanna",
    funFacts: ["Former competitive dancer", "Loves boxing training", "Speaks three languages"]
  },
  {
    id: 2,
    name: "Ava Thompson",
    nickname: "The Glamour",
    height: "5'7\"",
    hometown: "Dallas, TX",
    bio: "Ava's confidence and style light up the ring. Her attention to detail and professionalism make every event feel like a premium experience.",
    image: "https://scontent-dfw5-2.cdninstagram.com/v/t51.82787-15/625685183_17926000023217338_574134244926782756_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=102&ig_cache_key=MzgyMzE4NjE5NjI4OTkzOTUxOQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=h5eQc1IrIDoQ7kNvwEAgiCz&_nc_oc=AdnQyKzrWGKQd4gddHn_Q6MOkiEemoc9PqSA85SAzHsR_E7sXSGxyXVcW_zEaP0F0RM&_nc_ad=z-m&_nc_cid=4&_nc_zt=23&_nc_ht=scontent-dfw5-2.cdninstagram.com&_nc_gid=9gI1QUSTlC526k_agtIilA&oh=00_AfvfHYpzNeEfb8M3w6bCVzg0oDvdTpPxITsH-IE65FAPrg&oe=698C3AC3",
    instagram: "@avathompson",
    eventsWorked: ["Fight Night Live", "Championship Night", "Texas Title Fight"],
    favoriteFightMoment: "The emotional post-fight celebration after a title defense.",
    walkoutSong: "Flawless - Beyoncé",
    funFacts: ["Fitness enthusiast", "Fashion blogger", "Boxing fan since childhood"]
  },
  {
    id: 3,
    name: "Isabella Rodriguez",
    nickname: "The Star",
    height: "5'9\"",
    hometown: "San Antonio, TX",
    bio: "Isabella combines grace with power, bringing a dynamic presence to fight night. Her passion for combat sports shines through in every appearance.",
    image: "https://scontent-dfw5-2.cdninstagram.com/v/t51.82787-15/624725020_17926000041217338_2814042651585640391_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=104&ig_cache_key=MzgyMzE4NjI0MDU0ODIwMTAxNQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=62OIbEFMvv4Q7kNvwHOo1Ex&_nc_oc=AdlgmbdbFbhcPE6sm6osmFplDn4rSO1RhRqgTPPYYzCYl-OmLd1Ebo-UqWuagv989Ic&_nc_ad=z-m&_nc_cid=4&_nc_zt=23&_nc_ht=scontent-dfw5-2.cdninstagram.com&_nc_gid=9gI1QUSTlC526k_agtIilA&oh=00_Afuxj-y-gKgZPTJXzWNUt6TzVrJdrsylRllq8bg3f1Jmjg&oe=698C6F8A",
    instagram: "@isabellarodriguez",
    eventsWorked: ["Houston Showdown 2024", "Fight Night Live", "Main Event Series"],
    favoriteFightMoment: "Seeing a first-time champion's reaction when they won the belt.",
    walkoutSong: "Confident - Demi Lovato",
    funFacts: ["Martial arts background", "Yoga instructor", "Combat sports analyst"]
  },
  {
    id: 4,
    name: "Mia Chen",
    nickname: "The Elegance",
    height: "5'6\"",
    hometown: "Austin, TX",
    bio: "Mia brings sophistication and style to every event. Her professionalism and warm personality make her a standout presence in the ring.",
    image: "https://scontent-dfw5-1.cdninstagram.com/v/t51.82787-15/624673413_17926000032217338_2667746450130732411_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=110&ig_cache_key=MzgyMzE4NjIzNzg5NzM5MjkwMw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=aOZp0RvOVBkQ7kNvwFmUKfh&_nc_oc=Adm7i4486opOjq4IvXZ8J87Icj5VB0mzrYl_d1VhrAun5vXWd8WWVlXcdJmevcfUs60&_nc_ad=z-m&_nc_cid=4&_nc_zt=23&_nc_ht=scontent-dfw5-1.cdninstagram.com&_nc_gid=9gI1QUSTlC526k_agtIilA&oh=00_AftQI_jGmwd6dOpsFExGXd3sT4_999kz20e-DCwf6OLSVg&oe=698C4F17",
    instagram: "@miachen",
    eventsWorked: ["Championship Night", "Texas Title Fight", "Fight Night Live"],
    favoriteFightMoment: "The crowd's energy during the main event walkouts.",
    walkoutSong: "Unstoppable - Sia",
    funFacts: ["Photography hobbyist", "Loves live music", "Combat sports history buff"]
  },
  {
    id: 5,
    name: "Emma Williams",
    nickname: "The Radiance",
    height: "5'8\"",
    hometown: "Houston, TX",
    bio: "Emma's vibrant energy and positive spirit enhance every fight night. Her dedication to the sport and the fighters is evident in every appearance.",
    image: "https://scontent-dfw5-3.cdninstagram.com/v/t51.82787-15/625575577_17926000050217338_5903517006912868155_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=108&ig_cache_key=MzgyMzE4NjI4NDMxMTYwODcxOQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=BJduto9exycQ7kNvwFSM7BF&_nc_oc=AdmhlxehRO9rcnk0-bZvHBNB0T9UtUzugnkNwlsBMXd_T3-_oEWuyHTgdzelkJXiOtE&_nc_ad=z-m&_nc_cid=4&_nc_zt=23&_nc_ht=scontent-dfw5-3.cdninstagram.com&_nc_gid=9gI1QUSTlC526k_agtIilA&oh=00_Afv_XtSoOmjrxlzhNUGdczrGseKPJbbvh_1d1IvKqndc1w&oe=698C5803",
    instagram: "@emmawilliams",
    eventsWorked: ["Main Event Series", "Houston Showdown 2024", "Championship Night"],
    favoriteFightMoment: "The moment when two fighters show respect after a hard-fought battle.",
    walkoutSong: "Roar - Katy Perry",
    funFacts: ["Former cheerleader", "Boxing training", "Event planning experience"]
  },
  {
    id: 6,
    name: "Olivia Davis",
    nickname: "The Grace",
    height: "5'7\"",
    hometown: "Dallas, TX",
    bio: "Olivia's poise and elegance make her a natural in the spotlight. Her commitment to excellence elevates every Texas Combat Sports event.",
    image: "https://scontent-dfw5-1.cdninstagram.com/v/t51.82787-15/625022524_17926000098217338_7530719582348789300_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=105&ig_cache_key=MzgyMzE4NjQxOTQ2MDQ2Mzg5Mg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=o9IunkQaKw4Q7kNvwGRCMLF&_nc_oc=AdlTQGwAP8m7TfqxbSjBZb6M93Sjp2TIQbwc609za7E1uKa-1EcAMzLQocAA0n5zYAs&_nc_ad=z-m&_nc_cid=4&_nc_zt=23&_nc_ht=scontent-dfw5-1.cdninstagram.com&_nc_gid=9gI1QUSTlC526k_agtIilA&oh=00_Afsc29eWtDyqqurdqOaj5bsm8bfgdtKMTVZpTaRCO-PtAA&oe=698C6FC3",
    instagram: "@oliviadavis",
    eventsWorked: ["Texas Title Fight", "Fight Night Live", "Main Event Series"],
    favoriteFightMoment: "The championship belt presentation ceremony.",
    walkoutSong: "Stronger - Kelly Clarkson",
    funFacts: ["Dance background", "Fitness model", "Combat sports advocate"]
  }
]

export default function DollsPage() {
  useEffect(() => {
    // Add Google Fonts
    const link1 = document.createElement('link')
    link1.rel = 'preconnect'
    link1.href = 'https://fonts.googleapis.com'
    document.head.appendChild(link1)

    const link2 = document.createElement('link')
    link2.rel = 'preconnect'
    link2.href = 'https://fonts.gstatic.com'
    link2.crossOrigin = 'anonymous'
    document.head.appendChild(link2)

    const link3 = document.createElement('link')
    link3.href = 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Bungee+Tint&family=Macondo&family=MonteCarlo&family=Parisienne&display=swap'
    link3.rel = 'stylesheet'
    document.head.appendChild(link3)

    // Add class to html and body for pink scrollbar
    document.documentElement.classList.add('dolls-page')
    document.body.classList.add('dolls-page')

    // Cleanup: remove class when component unmounts
    return () => {
      document.documentElement.classList.remove('dolls-page')
      document.body.classList.remove('dolls-page')
    }
  }, [])

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Ambient Background with Spotlight Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-pink-900/5" />

      {/* Spotlight Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.5) 1px, transparent 0)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Hero Banner Section */}
      <section className="relative pt-40 pb-4">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-3 tracking-wider">
            TEXAS COMBAT{" "}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400" style={{ fontFamily: '"MonteCarlo", cursive', fontWeight: 400, fontStyle: 'normal' }}>
              DOLLS
            </span>
          </h1>

        </div>
      </section>

      {/* Intro / Brand Copy Section
      <section className="relative z-10 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <RevealAnimation>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                ELEGANCE MEETS{" "}
                <span className="text-red-600">COMBAT</span>
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                The Texas Combat Dolls are more than ring girls—they're ambassadors of the sport,
                bringing glamour, professionalism, and energy to every fight night. These talented
                women represent the premium experience that Texas Combat Sports delivers, combining
                athletic elegance with the raw intensity of combat sports. From championship nights
                to main event showdowns, they light up the arena and enhance the spectacle that makes
                our events unforgettable.
              </p>
            </div>
          </RevealAnimation>
        </div>
      </section> */}

      {/* Ring Girl Grid Section */}
      <section className="relative z-10 py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
            MEET THE <span className="text-pink-500">DOLLS</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center">
            {ringGirls.map((girl, index) => (
              <RevealAnimation key={girl.id} delay={index * 0.1}>
                <RingGirlCard
                  ringGirl={girl}
                />
              </RevealAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <RevealAnimation>
            <div className="bg-gradient-to-br from-red-900/20 via-black to-pink-900/10 border-2 border-pink-500/30 rounded-2xl p-8 md:p-12 text-center backdrop-blur-sm">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                JOIN THE <span className="text-pink-500">TEAM</span>
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Interested in becoming a Texas Combat Doll? We're always looking for talented,
                professional individuals who want to be part of the premier combat sports experience
                in Texas.
              </p>

              <div className="mt-8 pt-8 border-t border-gray-800">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:from-pink-500 hover:to-pink-700 px-8 py-4 text-lg font-black transition-all duration-300 hover:scale-105"
                  onClick={() => window.location.href = "mailto:info@texascombatsports.com?subject=Become a Combat Doll"}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Become a Combat Doll
                </Button>
              </div>
            </div>
          </RevealAnimation>
        </div>
      </section>
    </div>
  )
}
