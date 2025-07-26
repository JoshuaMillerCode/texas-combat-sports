"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import RevealAnimation from "@/components/reveal-animation"
import { X, Linkedin, Twitter, Instagram } from "lucide-react"

interface TeamMember {
  id: number
  name: string
  title: string
  image: string
  shortDescription: string
  fullBio: string
  role: string
  experience: string
  achievements: string[]
  social: {
    linkedin?: string
    twitter?: string
    instagram?: string
  }
}

export default function TeamSection() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Marcus Rodriguez",
      title: "Founder & CEO",
      image: "/placeholder.svg?height=400&width=300",
      shortDescription: "Visionary leader with 15+ years in combat sports promotion",
      fullBio:
        "Marcus founded Texas Combat Sport with a vision to elevate Houston's combat sports scene. His passion for authentic competition and fighter development has made TCS the premier promotion in Texas.",
      role: "Chief Executive Officer & Founder",
      experience: "15+ years in combat sports promotion and event management",
      achievements: [
        "Founded TCS in 2020",
        "Promoted 50+ successful events",
        "Developed 100+ professional fighters",
        "Texas Sports Promoter of the Year 2023",
      ],
      social: {
        linkedin: "#",
        twitter: "#",
        instagram: "#",
      },
    },
    {
      id: 2,
      name: "Sarah Chen",
      title: "Head of Operations",
      image: "/placeholder.svg?height=400&width=300",
      shortDescription: "Operations expert ensuring flawless event execution",
      fullBio:
        "Sarah brings military precision to every TCS event. Her background in logistics and operations management ensures that every fight night runs seamlessly from start to finish.",
      role: "Head of Operations & Event Management",
      experience: "12+ years in operations and logistics management",
      achievements: [
        "Zero event cancellations under her leadership",
        "Streamlined operations reducing costs by 30%",
        "Former US Army logistics officer",
        "MBA in Operations Management",
      ],
      social: {
        linkedin: "#",
        instagram: "#",
      },
    },
    {
      id: 3,
      name: "Antonio Martinez",
      title: "Fighter Relations Director",
      image: "/placeholder.svg?height=400&width=300",
      shortDescription: "Former champion connecting with today's fighters",
      fullBio:
        "As a former professional fighter, Antonio understands what it takes to compete at the highest level. He works closely with our roster to ensure they have everything needed to succeed.",
      role: "Fighter Relations & Development Director",
      experience: "20+ years as fighter and 8+ years in fighter management",
      achievements: [
        "Former WBC Regional Champion",
        "Managed 25+ professional fighters",
        "Developed 3 world champions",
        "Texas Boxing Hall of Fame Inductee",
      ],
      social: {
        twitter: "#",
        instagram: "#",
      },
    },
    {
      id: 4,
      name: "Jessica Williams",
      title: "Marketing Director",
      image: "/placeholder.svg?height=400&width=300",
      shortDescription: "Creative force behind TCS's bold brand presence",
      fullBio:
        "Jessica's innovative marketing strategies have transformed TCS into a household name in Texas. Her campaigns consistently sell out venues and build lasting fan engagement.",
      role: "Marketing & Brand Director",
      experience: "10+ years in sports marketing and brand development",
      achievements: [
        "Increased ticket sales by 200%",
        "Built TCS social media following to 500K+",
        "Award-winning campaign designer",
        "Former ESPN marketing executive",
      ],
      social: {
        linkedin: "#",
        twitter: "#",
        instagram: "#",
      },
    },
    {
      id: 5,
      name: "David Johnson",
      title: "Head of Security",
      image: "/placeholder.svg?height=400&width=300",
      shortDescription: "Ensuring safety and security at every TCS event",
      fullBio:
        "David's extensive background in law enforcement and private security ensures that every TCS event maintains the highest safety standards for fighters, staff, and fans alike.",
      role: "Head of Security & Safety Operations",
      experience: "18+ years in law enforcement and private security",
      achievements: [
        "Former Houston Police Department Detective",
        "Certified in crowd control management",
        "Zero security incidents in 4 years",
        "Expert in venue safety protocols",
      ],
      social: {
        linkedin: "#",
      },
    },
    {
      id: 6,
      name: "Maria Gutierrez",
      title: "Finance Director",
      image: "/placeholder.svg?height=400&width=300",
      shortDescription: "Financial strategist driving TCS's growth and stability",
      fullBio:
        "Maria's financial expertise has been instrumental in TCS's rapid growth. Her strategic planning and budget management have enabled the company to expand while maintaining profitability.",
      role: "Chief Financial Officer",
      experience: "14+ years in corporate finance and accounting",
      achievements: [
        "CPA with sports industry specialization",
        "Managed $50M+ in event budgets",
        "Secured major sponsorship deals",
        "Former CFO at major sports venue",
      ],
      social: {
        linkedin: "#",
        twitter: "#",
      },
    },
  ]

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member)
  }

  const handleCloseModal = () => {
    setSelectedMember(null)
  }

  // Animation variants for quick, smooth fade-in
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Quick stagger between cards
        delayChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3, // Exactly 300ms
        ease: [0.25, 0.46, 0.45, 0.94], // Smooth easing
      },
    },
  }

  return (
    <>
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <RevealAnimation>
              <h2 className="text-4xl font-black mb-4 text-white">
                MEET THE <span className="text-red-600">TEAM</span>
              </h2>
            </RevealAnimation>

            <RevealAnimation delay={0.2}>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                The powerhouse team behind Texas Combat Sport's success. Each member brings unique expertise and
                unwavering dedication to delivering world-class combat sports entertainment.
              </p>
            </RevealAnimation>
          </div>

          {/* Team Grid - Responsive & Centered */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto justify-items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {teamMembers.map((member) => (
              <motion.div
                key={member.id}
                variants={cardVariants}
                className="group w-full max-w-sm"
                whileHover={{
                  scale: 1.03,
                  transition: { duration: 0.2 },
                }}
              >
                <div
                  className="relative bg-black/50 border border-red-900/30 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:border-red-600/50 hover:shadow-2xl hover:shadow-red-600/20"
                  onClick={() => handleMemberClick(member)}
                >
                  {/* Team Member Image */}
                  <div className="relative h-80 overflow-hidden">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Hover Overlay with Role & Bio */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <motion.div
                          initial={{ y: 30, opacity: 0 }}
                          whileHover={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="text-white"
                        >
                          <h4 className="text-lg font-bold mb-2 text-red-400">{member.role}</h4>
                          <p className="text-sm text-gray-300 mb-3 leading-relaxed">{member.experience}</p>
                          <p className="text-xs text-gray-400 leading-relaxed mb-3">{member.fullBio}</p>
                          <div className="text-xs text-red-400 font-semibold flex items-center">
                            Click to learn more
                            <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Gradient overlay for better text readability */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  {/* Team Member Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <div className="text-red-500 font-bold text-sm mb-3">{member.title}</div>
                    <p className="text-gray-300 text-sm leading-relaxed">{member.shortDescription}</p>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-600/30 rounded-lg transition-colors duration-300 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modal Popup */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-gray-900 border border-red-900/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors z-10 p-2 rounded-full hover:bg-red-600/10"
                onClick={handleCloseModal}
              >
                <X size={24} />
              </button>

              <div className="grid md:grid-cols-2 gap-8 p-8">
                {/* Image Section */}
                <div className="relative">
                  <div className="relative h-96 rounded-lg overflow-hidden">
                    <Image
                      src={selectedMember.image || "/placeholder.svg"}
                      alt={selectedMember.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  {/* Social Links */}
                  <div className="flex space-x-4 mt-6 justify-center">
                    {selectedMember.social.linkedin && (
                      <a
                        href={selectedMember.social.linkedin}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-600/10"
                      >
                        <Linkedin size={24} />
                      </a>
                    )}
                    {selectedMember.social.twitter && (
                      <a
                        href={selectedMember.social.twitter}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-600/10"
                      >
                        <Twitter size={24} />
                      </a>
                    )}
                    {selectedMember.social.instagram && (
                      <a
                        href={selectedMember.social.instagram}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-600/10"
                      >
                        <Instagram size={24} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-black text-white mb-2">{selectedMember.name}</h3>
                    <div className="text-red-500 font-bold text-lg mb-4">{selectedMember.title}</div>
                  </div>

                  <div>
                    <h4 className="text-white font-bold mb-2">Role & Responsibilities</h4>
                    <p className="text-gray-300 mb-4">{selectedMember.role}</p>
                  </div>

                  <div>
                    <h4 className="text-white font-bold mb-2">Experience</h4>
                    <p className="text-gray-300 mb-4">{selectedMember.experience}</p>
                  </div>

                  <div>
                    <h4 className="text-white font-bold mb-2">About</h4>
                    <p className="text-gray-300 mb-6 leading-relaxed">{selectedMember.fullBio}</p>
                  </div>

                  <div>
                    <h4 className="text-white font-bold mb-3">Key Achievements</h4>
                    <ul className="space-y-2">
                      {selectedMember.achievements.map((achievement, index) => (
                        <li key={index} className="text-gray-300 flex items-start">
                          <span className="text-red-500 mr-2 mt-1 font-bold">•</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
