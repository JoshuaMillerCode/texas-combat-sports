import Link from "next/link"
import { Instagram, Youtube, Music } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black border-t border-red-900/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-2xl font-bold text-red-600 mb-2">Texas Combat Sport</h3>
            <p className="text-gray-400">Real Fights. Real Houston.</p>
          </div>

          <div className="flex space-x-6">
            <Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">
              <Instagram size={24} />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">
              <Youtube size={24} />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">
              <Music size={24} />
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-red-900/30 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Texas Combat Sport. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
