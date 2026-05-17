"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Instagram, Youtube, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCurrentEvent } from "@/contexts/current-event-context"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

// Simple TikTok SVG icon
const TikTokIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentEvent } = useCurrentEvent();
  const router = useRouter();
  const pathname = usePathname();
  const isDollsPage = pathname?.includes('/dolls');

  // Conditional color classes based on page
  const accentColor = isDollsPage ? 'pink' : 'red';
  const borderColor = isDollsPage ? 'border-pink-900/30' : 'border-red-900/30';
  const logoColor = isDollsPage ? 'text-pink-500' : 'text-red-600';
  const hoverColor = isDollsPage ? 'hover:text-pink-500' : 'hover:text-red-500';
  const buttonBg = isDollsPage ? 'bg-pink-600 hover:bg-pink-700' : 'bg-red-600 hover:bg-red-700';
  const activeColor = isDollsPage ? 'text-pink-500' : 'text-red-500';
  const activeBg = isDollsPage ? 'bg-pink-500/10' : 'bg-red-500/10';

  // Auto-close mobile nav on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/events", label: "Events" },
    // { href: "/fighters", label: "Fighters" },
    { href: "/streaming", label: "Streaming" },
    // { href: "/merch", label: "Merch" },
    { href: "/gallery", label: "Gallery" },
    { href: "/dolls", label: "Dolls" },
    { href: "/contact", label: "Contact" },
    { href: "/my-tickets", label: "My Tickets" },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b ${borderColor}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 mr-8">
            <Image
              src="https://res.cloudinary.com/dujmomznj/image/upload/f_auto,q_auto:good,w_40,h_40/v1755476673/helmet_ouwsr5.jpg"
              alt="Texas Combat Sports Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
              loading="eager"
            />
            <span className={`text-2xl font-bold ${logoColor}`}>TXCS</span>
          </Link>

          {/* Desktop Navigation - Left aligned next to logo */}
          <nav className="hidden xl:flex items-center flex-1">
            <div className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-white ${hoverColor} transition-colors font-medium whitespace-nowrap`}
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
                  className={`text-white ${hoverColor} transition-colors font-medium text-sm whitespace-nowrap`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0 ml-auto">
            {/* Social Media Icons */}
            <div className="flex items-center space-x-3">
              <Link
                href="https://www.instagram.com/texascombatsports?igsh=OWFnZmlpZWFzdmJw"
                className={`text-gray-400 ${hoverColor} transition-colors`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={20} />
              </Link>
              <Link
                href="https://youtube.com/@texascombatsports?si=Kpiup3NV3dD-TySi"
                className={`text-gray-400 ${hoverColor} transition-colors`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube size={20} />
              </Link>
              <Link
                href="https://www.facebook.com/share/1FfXuJtAuq/?mibextid=wwXIfr"
                className={`text-gray-400 ${hoverColor} transition-colors`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook size={20} />
              </Link>
              <Link
                href="https://www.tiktok.com/@texascombatsportshtx"
                className={`text-gray-400 ${hoverColor} transition-colors`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <TikTokIcon size={20} />
              </Link>
            </div>

            {/* Buy Tickets Button */}
            {currentEvent && (
              <Button
                size="sm"
                className={`${buttonBg} text-white font-bold px-4`}
                onClick={() => router.push(`/events/${currentEvent.slug}`)}
              >
                Buy Tickets
              </Button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden flex items-center space-x-2 flex-shrink-0 ml-auto">
            {currentEvent && (
              <Button
                size="sm"
                className={`${buttonBg} text-white font-bold px-3`}
                onClick={() => router.push(`/events/${currentEvent.slug}`)}
              >
                Buy Tickets
              </Button>
            )}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="text-white p-2.5 -mr-2"
                  aria-label="Open menu"
                >
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className={cn(
                  "w-[85vw] max-w-sm sm:max-w-sm border-l p-0 gap-0 flex flex-col",
                  "bg-black/95 backdrop-blur-md",
                  borderColor
                )}
              >
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                {/* Drawer header */}
                <div className={cn("flex items-center gap-3 px-6 h-16 border-b", borderColor)}>
                  <Image
                    src="https://res.cloudinary.com/dujmomznj/image/upload/f_auto,q_auto:good,w_32,h_32/v1755476673/helmet_ouwsr5.jpg"
                    alt="Texas Combat Sports Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                  <span className={cn("text-xl font-bold", logoColor)}>TXCS</span>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto py-4">
                  <ul className="flex flex-col px-3">
                    {navItems.map((item) => {
                      const isActive =
                        item.href === "/"
                          ? pathname === "/"
                          : pathname?.startsWith(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                              "block rounded-md px-3 py-3 text-base font-medium transition-colors",
                              isActive
                                ? `${activeColor} ${activeBg}`
                                : `text-white/90 ${hoverColor} hover:bg-white/5`
                            )}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Footer: Buy Tickets + social */}
                <div className={cn("border-t px-6 py-5 space-y-4", borderColor)}>
                  {currentEvent && (
                    <Button
                      className={`${buttonBg} text-white font-bold w-full`}
                      onClick={() => router.push(`/events/${currentEvent.slug}`)}
                    >
                      Buy Tickets
                    </Button>
                  )}
                  <div className="flex items-center justify-center gap-5 pt-1">
                    <Link
                      href="https://www.instagram.com/texascombatsports?igsh=OWFnZmlpZWFzdmJw"
                      className={`text-gray-400 ${hoverColor} transition-colors`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                    >
                      <Instagram size={20} />
                    </Link>
                    <Link
                      href="https://youtube.com/@texascombatsports?si=Kpiup3NV3dD-TySi"
                      className={`text-gray-400 ${hoverColor} transition-colors`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube"
                    >
                      <Youtube size={20} />
                    </Link>
                    <Link
                      href="https://www.facebook.com/share/1FfXuJtAuq/?mibextid=wwXIfr"
                      className={`text-gray-400 ${hoverColor} transition-colors`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                    >
                      <Facebook size={20} />
                    </Link>
                    <Link
                      href="https://www.tiktok.com/@texascombatsportshtx"
                      className={`text-gray-400 ${hoverColor} transition-colors`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                    >
                      <TikTokIcon size={20} />
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
