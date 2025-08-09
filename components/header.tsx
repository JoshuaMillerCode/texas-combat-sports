"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCurrentEvent } from "@/contexts/current-event-context"
import { useRouter } from "next/navigation"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentEvent } = useCurrentEvent();
  const router = useRouter();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/events", label: "Events" },
    { href: "/fighters", label: "Fighters" },
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
          <Link href="/" className="text-2xl font-bold text-red-600 flex-shrink-0 mr-8">
            TXCS
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
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0 ml-auto">
            {/* <CartIcon /> */}
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
