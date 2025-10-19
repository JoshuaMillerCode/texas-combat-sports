import Link from "next/link"
import Image from "next/image"
import { Instagram, Youtube, Facebook } from "lucide-react"

// Simple TikTok SVG icon
const TikTokIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
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

export default function Footer() {
  return (
    <footer className="bg-black border-t border-red-900/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-2">
              <Image 
                src="https://res.cloudinary.com/dujmomznj/image/upload/f_auto,q_auto:good,w_40,h_40/v1755476673/helmet_ouwsr5.jpg"
                alt="Texas Combat Sports Logo"
                width={40}
                height={40}
                className="object-contain"
                loading="lazy"
              />
              <h3 className="text-2xl font-bold text-red-600">Texas Combat Sports</h3>
            </div>
            <p className="text-gray-400">Real Fights. Real Houston.</p>
          </div>

          <div className="flex space-x-6">
            <Link href="https://www.instagram.com/texascombatsports?igsh=OWFnZmlpZWFzdmJw" className="text-gray-400 hover:text-red-500 transition-colors">
              <Instagram size={24} />
            </Link>
            <Link href="https://youtube.com/@texascombatsports?si=Kpiup3NV3dD-TySi" className="text-gray-400 hover:text-red-500 transition-colors">
              <Youtube size={24} />
            </Link>
            <Link href="https://www.facebook.com/share/1FfXuJtAuq/?mibextid=wwXIfr" className="text-gray-400 hover:text-red-500 transition-colors">
              <Facebook size={24} />
            </Link>
            <Link href="https://www.tiktok.com/@texascombatsportshtx" className="text-gray-400 hover:text-red-500 transition-colors">
              <TikTokIcon size={24} />
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-red-900/30 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Texas Combat Sports. All rights reserved.</p>
          <p>Designed & developed by Joshua Miller | millerjoshua737@gmail.com</p>
        </div>
      </div>
    </footer>
  )
}
