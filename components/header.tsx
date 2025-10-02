"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, Instagram, Youtube, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCurrentEvent } from "@/contexts/current-event-context"
import { useRouter } from "next/navigation"

// Simple TikTok SVG icon
const TikTokIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentEvent } = useCurrentEvent();
  const router = useRouter();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/events", label: "Events" },
    // { href: "/fighters", label: "Fighters" },
    { href: "/streaming", label: "Streaming" },
    // { href: "/merch", label: "Merch" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-red-900/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 mr-8">
            <Image 
              src="https://res.cloudinary.com/dujmomznj/image/upload/f_webp/v1755476673/helmet_ouwsr5.jpg"
              alt="Texas Combat Sports Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-2xl font-bold text-red-600">TXCS</span>
          </Link>

          {/* Desktop Navigation - Left aligned next to logo */}
          <nav className="hidden xl:flex items-center flex-1">
            <div className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white hover:text-red-500 transition-colors font-medium whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Tablet Navigation - Left aligned with fewer items */}
          <nav className="hidden lg:flex xl:hidden items-center flex-1">
            <div className="flex items-center space-x-4">
              {navItems.slice(0, 6).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white hover:text-red-500 transition-colors font-medium text-sm whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
              <button 
                className="text-white hover:text-red-500 transition-colors font-medium text-sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                More
              </button>
            </div>
          </nav>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0 ml-auto">
            {/* Social Media Icons */}
            <div className="flex items-center space-x-3">
              <Link 
                href="https://www.instagram.com/texascombatsports?igsh=OWFnZmlpZWFzdmJw" 
                className="text-gray-400 hover:text-red-500 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={20} />
              </Link>
              <Link 
                href="https://youtube.com/@texascombatsports?si=Kpiup3NV3dD-TySi" 
                className="text-gray-400 hover:text-red-500 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube size={20} />
              </Link>
              <Link 
                href="https://www.facebook.com/share/1FfXuJtAuq/?mibextid=wwXIfr" 
                className="text-gray-400 hover:text-red-500 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook size={20} />
              </Link>
              <Link 
                href="https://www.tiktok.com/@texascombatsportshtx" 
                className="text-gray-400 hover:text-red-500 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TikTokIcon size={20} />
              </Link>
            </div>
            
            {/* Buy Tickets Button */}
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4"
              onClick={() => {
                if (currentEvent) {
                  router.push(`/events/${currentEvent.slug}`);
                }
              }}
            >
              Buy Tickets
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-3 flex-shrink-0 ml-auto">
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4"
              onClick={() => {
                if (currentEvent) {
                  router.push(`/events/${currentEvent.slug}`);
                }
              }}
            >
              Buy Tickets
            </Button>
            <button className="text-white p-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Dropdown Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-red-900/30 bg-black/95">
            <div className="flex flex-col items-center space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white hover:text-red-500 transition-colors font-medium text-center py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Tablet "More" items dropdown */}
        {isMenuOpen && (
          <nav className="hidden lg:flex xl:hidden py-4 border-t border-red-900/30 bg-black/95">
            <div className="flex justify-center w-full">
              <div className="flex items-center space-x-6">
                {navItems.slice(6).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-white hover:text-red-500 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
