"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/contact-hero.mp4" type="video/mp4" />
          <source src="/videos/contact-hero.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-black text-white mb-4">
            CONTACT <span className="text-red-600">US</span>
          </h1>
          <p className="text-xl text-gray-300">Get in Touch with TCS</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-black/50 border border-red-900/30 rounded-lg p-8">
              <h2 className="text-3xl font-bold text-white mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-white font-medium mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-black/50 border-red-900/30 text-white placeholder-gray-500"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-white font-medium mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-black/50 border-red-900/30 text-white placeholder-gray-500"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-white font-medium mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="bg-black/50 border-red-900/30 text-white placeholder-gray-500 min-h-[120px]"
                    placeholder="Tell us how we can help you..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3">
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-black/50 border border-red-900/30 rounded-lg p-8">
                <h2 className="text-3xl font-bold text-white mb-6">Get in Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-red-500 mt-1" />
                    <div>
                      <h3 className="text-white font-bold mb-1">Location</h3>
                      <p className="text-gray-300">
                        Houston, Texas
                        <br />
                        Various premium venues across the city
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-red-500 mt-1" />
                    <div>
                      <h3 className="text-white font-bold mb-1">Email</h3>
                      <p className="text-gray-300">info@texascombatsport.com</p>
                      <p className="text-gray-300">business@texascombatsport.com</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-red-500 mt-1" />
                    <div>
                      <h3 className="text-white font-bold mb-1">Phone</h3>
                      <p className="text-gray-300">(713) 555-FIGHT</p>
                      <p className="text-gray-300">(713) 555-3444</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Clock className="w-6 h-6 text-red-500 mt-1" />
                    <div>
                      <h3 className="text-white font-bold mb-1">Business Hours</h3>
                      <p className="text-gray-300">
                        Monday - Friday: 9:00 AM - 6:00 PM
                        <br />
                        Saturday: 10:00 AM - 4:00 PM
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-black/50 border border-red-900/30 rounded-lg p-8">
                <h3 className="text-white font-bold mb-4">Find Us in Houston</h3>
                <div className="bg-gray-800 h-64 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Interactive Map Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Inquiries */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-8 text-white">
            BUSINESS <span className="text-red-600">INQUIRIES</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Interested in sponsorship opportunities, venue partnerships, or media collaborations? We'd love to hear from
            you.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-black/50 border border-red-900/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Sponsorship</h3>
              <p className="text-gray-300 mb-4">Partner with Houston's premier combat sports promotion</p>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold">Learn More</Button>
            </div>
            <div className="bg-black/50 border border-red-900/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Media</h3>
              <p className="text-gray-300 mb-4">Press credentials and media partnership opportunities</p>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold">Media Kit</Button>
            </div>
            <div className="bg-black/50 border border-red-900/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Venues</h3>
              <p className="text-gray-300 mb-4">Host TCS events at your premium venue</p>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold">Contact Us</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
