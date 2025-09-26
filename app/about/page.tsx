import Image from "next/image"
import HeroParallax from "@/components/hero-parallax"
import SmoothParallax from "@/components/smooth-parallax"
import RevealAnimation from "@/components/reveal-animation"
import StaggeredReveal from "@/components/staggered-reveal"
import ScrollTriggeredAnimation from "@/components/scroll-triggered-animation"
import { Trophy, Target, Users, Zap } from "lucide-react"
import TeamSection from "@/components/team-section"

export default function AboutPage() {
  const features = [
    {
      icon: <Trophy className="w-10 h-10 text-red-500" />,
      title: "Elite Standards",
      description: "We maintain the highest standards in fighter selection, venue quality, and event production.",
    },
    {
      icon: <Target className="w-10 h-10 text-red-500" />,
      title: "Local Focus",
      description: "Dedicated to showcasing Texas talent and building the local combat sports community.",
    },
    {
      icon: <Users className="w-10 h-10 text-red-500" />,
      title: "Fan Experience",
      description: "Creating unforgettable experiences that bring fans closer to the action than ever before.",
    },
    {
      icon: <Zap className="w-10 h-10 text-red-500" />,
      title: "Pure Intensity",
      description: "Every event delivers the raw energy and excitement that combat sports fans crave.",
    },
  ]

  const timeline = [
    {
      year: "2020",
      title: "The Beginning",
      description: "Texas Combat Sport was founded with a vision to bring world-class combat sports to Houston.",
    },
    {
      year: "2021",
      title: "First Event",
      description: "Our inaugural event sold out, establishing TCS as a major player in Texas combat sports.",
    },
    {
      year: "2022",
      title: "Expansion",
      description: "Expanded to premium venues across Houston, hosting monthly events with top-tier fighters.",
    },
    {
      year: "2024",
      title: "Today",
      description:
        "Now Houston's premier combat sports promotion, featuring the best fighters and biggest events in Texas.",
    },
  ]

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <HeroParallax backgroundImage="https://res.cloudinary.com/dujmomznj/image/upload/f_webp,q_auto/v1754612339/59-DSC05643_ime0qx.jpg" height="60vh">
        <div className="text-center">
          <RevealAnimation>
            <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">
              ABOUT <span className="text-red-600 drop-shadow-2xl">TCS</span>
            </h1>
          </RevealAnimation>
          <RevealAnimation delay={0.2}>
            <p className="text-xl text-gray-300 drop-shadow-lg">The Heart of Houston Combat Sports</p>
          </RevealAnimation>
        </div>
      </HeroParallax>

      {/* Our Story */}
      <SmoothParallax className="py-20 bg-gradient-to-b from-black to-gray-900" speed={0.3}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <RevealAnimation direction="left">
              <div>
                <h2 className="text-4xl font-black mb-6 text-white">
                  OUR <span className="text-red-600">STORY</span>
                </h2>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  Founded in the heart of Houston, Texas Combat Sport emerged from a passion for authentic combat sports
                  and a vision to showcase the incredible talent that calls Texas home.
                </p>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  We believe that combat sports represent the purest form of competition - where skill, determination,
                  and heart determine victory. Our events bring together fighters from across the Lone Star State to
                  compete at the highest level.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  From our first event to becoming Houston's premier combat sports promotion, we've remained committed
                  to delivering unforgettable experiences for fighters and fans alike.
                </p>
              </div>
            </RevealAnimation>

            <RevealAnimation direction="right" delay={0.2}>
              <ScrollTriggeredAnimation scaleRange={[0.8, 1]} className="relative h-96">
                <Image
                  src="https://res.cloudinary.com/dujmomznj/image/upload/f_webp,q_auto/v1755403315/txcs_logo_toiioe.png"
                  alt="Texas Combat Sport History"
                  fill
                  className="object-contain rounded-lg"
                />
              </ScrollTriggeredAnimation>
            </RevealAnimation>
          </div>
        </div>
      </SmoothParallax>

      {/* What Sets Us Apart */}
      <SmoothParallax 
        className="py-20" 
        backgroundImage="https://res.cloudinary.com/dujmomznj/image/upload/f_webp,q_auto/v1754612278/202-IMG_2552_ve2via.jpg"
        speed={0.4}
        overlayOpacity={0.75}
      >
        <div className="container mx-auto px-4">
          <RevealAnimation>
            <h2 className="text-4xl font-black text-center mb-16 text-white">
              WHAT SETS US <span className="text-red-600">APART</span>
            </h2>
          </RevealAnimation>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <ScrollTriggeredAnimation
                  scaleRange={[0.5, 1]}
                  className="bg-red-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-600/30 transition-all duration-500 hover:scale-110"
                >
                  {feature.icon}
                </ScrollTriggeredAnimation>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </SmoothParallax>

      {/* Meet the Team */}
      {/* <TeamSection /> */}

      {/* Evolution Timeline
      <SmoothParallax
        className="py-20"
        backgroundImage="https://res.cloudinary.com/dujmomznj/image/upload/f_webp,q_auto/v1754612318/157-DSC07636_vuhcsq.jpg"
        speed={0.5}
        overlayOpacity={0.6}
      >
        <div className="container mx-auto px-4">
          <RevealAnimation>
            <h2 className="text-4xl font-black text-center mb-16 text-white">
              FROM DAY ONE TO <span className="text-red-600">NOW</span>
            </h2>
          </RevealAnimation>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              <StaggeredReveal staggerDelay={0.2}>
                {timeline.map((item, index) => (
                  <div key={index} className="flex items-center gap-8">
                    <ScrollTriggeredAnimation
                      scaleRange={[0.5, 1]}
                      className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg min-w-[100px] text-center transition-transform duration-300 hover:scale-110"
                    >
                      {item.year}
                    </ScrollTriggeredAnimation>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-300">{item.description}</p>
                    </div>
                  </div>
                ))}
              </StaggeredReveal>
            </div>
          </div>
        </div>
      </SmoothParallax> */}
    </div>
  )
}
