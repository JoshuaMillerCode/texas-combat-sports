"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Clock, Bell } from "lucide-react"

interface ComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-black border border-red-600/30 rounded-2xl p-8 mx-4 max-w-md w-full shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Content */}
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/20 rounded-full mb-4">
                  <Clock className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Coming Soon!
                </h2>
                <p className="text-gray-300 text-lg">
                  Ticket sales are launching very soon. Stay tuned for updates!
                </p>
              </div>

              <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Bell className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-400 font-semibold">Get Notified</span>
                </div>
                <p className="text-sm text-gray-300">
                  We'll notify you as soon as tickets become available for purchase.
                </p>
              </div>

              <Button
                onClick={onClose}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-lg"
              >
                Got it!
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
