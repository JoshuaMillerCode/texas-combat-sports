"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ContactPage() {
  const { toast } = useToast()
  
  // Modal states
  const [isFightModalOpen, setIsFightModalOpen] = useState(false)
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false)
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false)
  
  // Form states

  const [generalForm, setGeneralForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const [fightForm, setFightForm] = useState({
    name: "",
    email: "",
    phone: "",
    weightClass: "",
    message: "",
  })

  const [venueForm, setVenueForm] = useState({
    name: "",
    email: "",
    venueName: "",
    location: "",
    message: "",
  })

  const [sponsorForm, setSponsorForm] = useState({
    name: "",
    email: "",
    companyName: "",
    sponsorshipType: "",
    message: "",
  })

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState({
    fight: false,
    venue: false,
    sponsor: false,
  })

  const handleFightSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(prev => ({ ...prev, fight: true }))

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formType: 'fight',
          ...fightForm,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your fighter inquiry has been sent successfully.",
        })
        setFightForm({
          name: "",
          email: "",
          phone: "",
          weightClass: "",
          message: "",
        })
        setIsFightModalOpen(false)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send message. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(prev => ({ ...prev, fight: false }))
    }
  }

  const handleVenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(prev => ({ ...prev, venue: true }))

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formType: 'venue',
          ...venueForm,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your venue contact has been sent successfully.",
        })
        setVenueForm({
          name: "",
          email: "",
          venueName: "",
          location: "",
          message: "",
        })
        setIsVenueModalOpen(false)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send message. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(prev => ({ ...prev, venue: false }))
    }
  }

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(prev => ({ ...prev, sponsor: true }))

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formType: 'sponsor',
          ...sponsorForm,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your sponsor contact has been sent successfully.",
        })
        setSponsorForm({
          name: "",
          email: "",
          companyName: "",
          sponsorshipType: "",
          message: "",
        })
        setIsSponsorModalOpen(false)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send message. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(prev => ({ ...prev, sponsor: false }))
    }
  }

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(prev => ({ ...prev, general: true }))

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formType: 'general',
          ...generalForm,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your message has been sent successfully.",
        })
        setGeneralForm({
          name: "",
          email: "",
          phone: "",
          message: "",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send message. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(prev => ({ ...prev, general: false }))
    }
  }

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGeneralForm({
      ...generalForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleFightChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFightForm({
      ...fightForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleVenueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setVenueForm({
      ...venueForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleSponsorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSponsorForm({
      ...sponsorForm,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            backgroundImage: `url(https://res.cloudinary.com/dujmomznj/image/upload/f_auto,q_auto:eco,w_1600,h_900,c_fill,e_sharpen:50/v1754612275/207-IMG_2557_blblcb.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">
            CONTACT <span className="text-red-600 drop-shadow-2xl">US</span>
          </h1>
          <p className="text-xl text-gray-300 drop-shadow-lg">Get in Touch with TCS</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-black/50 border border-red-900/30 rounded-lg p-8">
              <h2 className="text-3xl font-bold text-white mb-6">Send Us a Message</h2>
              <form className="space-y-6" onSubmit={handleGeneralSubmit}>
                <div>
                  <label htmlFor="name" className="block text-white font-medium mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={generalForm.name}
                    onChange={handleGeneralChange}
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
                    value={generalForm.email}
                    onChange={handleGeneralChange}
                    className="bg-black/50 border-red-900/30 text-white placeholder-gray-500"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-white font-medium mb-2">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={generalForm.phone}
                    onChange={handleGeneralChange}
                    className="bg-black/50 border-red-900/30 text-white placeholder-gray-500"
                    placeholder="(555) 123-4567"
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
                    value={generalForm.message}
                    onChange={handleGeneralChange}
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
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Interested in fighting, venue partnerships, or sponsorship opportunities? We'd love to hear from you.
          </p>
          
          {/* Business Inquiry Cards */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Want to Fight Card */}
            <div className="bg-black/50 border border-red-900/30 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🥊</div>
              <h3 className="text-2xl font-bold text-white mb-4">Want to Fight?</h3>
              <p className="text-gray-300 mb-6">
                Ready to step into the ring? Let us know about your fighting background and experience.
              </p>
              <Dialog open={isFightModalOpen} onOpenChange={setIsFightModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3">
                    Apply to Fight
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black/95 border-red-900/30">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">Fighter Application</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleFightSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="fight-name" className="block text-white font-medium mb-2">
                          Full Name
                        </label>
                        <Input
                          id="fight-name"
                          name="name"
                          type="text"
                          value={fightForm.name}
                          onChange={handleFightChange}
                          className="bg-black/50 border-red-900/30 text-white placeholder-gray-500"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="fight-email" className="block text-white font-medium mb-2">
                          Email
                        </label>
                        <Input
                          id="fight-email"
                          name="email"
                          type="email"
                          value={fightForm.email}
                          onChange={handleFightChange}
                          className="bg-black/50 border-red-900/30 text-white placeholder-gray-500"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="fight-phone" className="block text-white font-medium mb-2">
                          Phone Number
                        </label>
                        <Input
                          id="fight-phone"
                          name="phone"
                          type="tel"
                          value={fightForm.phone}
                          onChange={handleFightChange}
                          className="bg-black/50 border-red-900/30 text-white placeholder-gray-500"
                          placeholder="(555) 123-4567"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="fight-weight" className="block text-white font-medium mb-2">
                          Weight Class
                        </label>
                        <Select value={fightForm.weightClass} onValueChange={(value) => setFightForm({...fightForm, weightClass: value})}>
                          <SelectTrigger className="bg-black/50 border-red-900/30 text-white">
                            <SelectValue placeholder="Select Weight Class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flyweight">Flyweight (125 lbs)</SelectItem>
                            <SelectItem value="bantamweight">Bantamweight (135 lbs)</SelectItem>
                            <SelectItem value="featherweight">Featherweight (145 lbs)</SelectItem>
                            <SelectItem value="lightweight">Lightweight (155 lbs)</SelectItem>
                            <SelectItem value="welterweight">Welterweight (170 lbs)</SelectItem>
                            <SelectItem value="middleweight">Middleweight (185 lbs)</SelectItem>
                            <SelectItem value="light-heavyweight">Light Heavyweight (205 lbs)</SelectItem>
                            <SelectItem value="heavyweight">Heavyweight (265 lbs)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="fight-message" className="block text-white font-medium mb-2">
                        Fighting Experience & Message
                      </label>
                      <Textarea
                        id="fight-message"
                        name="message"
                        value={fightForm.message}
                        onChange={handleFightChange}
                        className="bg-black/50 border-red-900/30 text-white placeholder-gray-500 min-h-[120px]"
                        placeholder="Tell us about your fighting experience, record, training background, and why you want to fight for TCS..."
                        required
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting.fight}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                      >
                        {isSubmitting.fight ? "Sending..." : "Submit Application"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsFightModalOpen(false)}
                        className="flex-1 border-red-900/30 text-black hover:opacity-70"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Venue Contact Card */}
            <div className="bg-black/50 border border-red-900/30 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🏟️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Venue Contact</h3>
              <p className="text-gray-300 mb-6">
                Host TCS events at your premium venue in Houston. Let's discuss partnership opportunities.
              </p>
              <Dialog open={isVenueModalOpen} onOpenChange={setIsVenueModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3">
                    Contact Us
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black/95 border-red-900/30">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">Venue Partnership Inquiry</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleVenueSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="venue-name" className="block text-white font-medium mb-2">
                          Contact Name
                        </label>
                        <Input
                          id="venue-name"
                          name="name"
                          type="text"
                          value={venueForm.name}
                          onChange={handleVenueChange}
                          className="bg-black/50 border-red-900/30 text-white placeholder-gray-500"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="venue-email" className="block text-white font-medium mb-2">
                          Email
                        </label>
                        <Input
                          id="venue-email"
                          name="email"
                          type="email"
                          value={venueForm.email}
                          onChange={handleVenueChange}
                          className="bg-black/50 border-red-900/30 text-white placeholder-gray-500"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="venue-venueName" className="block text-white font-medium mb-2">
                          Venue Name
                        </label>
                        <Input
                          id="venue-venueName"
                          name="venueName"
                          type="text"
                          value={venueForm.venueName}
                          onChange={handleVenueChange}
                          className="bg-black/50 border-red-900/30 text-white placeholder-gray-500"
                          placeholder="Your venue name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="venue-location" className="block text-white font-medium mb-2">
                          Venue Location
                        </label>
                        <Input
                          id="venue-location"
                          name="location"
                          type="text"
                          value={venueForm.location}
                          onChange={handleVenueChange}
                          className="bg-black/50 border-red-900/30 text-white placeholder-gray-500"
                          placeholder="Venue address or area"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="venue-message" className="block text-white font-medium mb-2">
                        Venue Details & Message
                      </label>
                      <Textarea
                        id="venue-message"
                        name="message"
                        value={venueForm.message}
                        onChange={handleVenueChange}
                        className="bg-black/50 border-red-900/30 text-white placeholder-gray-500 min-h-[120px]"
                        placeholder="Tell us about your venue, capacity, facilities, and why you'd like to host TCS events..."
                        required
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting.venue}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                      >
                        {isSubmitting.venue ? "Sending..." : "Submit Inquiry"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsVenueModalOpen(false)}
                        className="flex-1 border-red-900/30 text-black hover:opacity-70"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Sponsor Contact Card */}
            <div className="bg-black/50 border border-red-900/30 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">💼</div>
              <h3 className="text-2xl font-bold text-white mb-4">Sponsor Contact</h3>
              <p className="text-gray-300 mb-6">
                Partner with Houston's premier combat sports promotion. Explore sponsorship opportunities.
              </p>
              <Dialog open={isSponsorModalOpen} onOpenChange={setIsSponsorModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3">
                    Partner With Us
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black/95 border-red-900/30">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">Sponsorship Partnership</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSponsorSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="sponsor-name" className="block text-white font-medium mb-2">
                          Contact Name
                        </label>
                        <Input
                          id="sponsor-name"
                          name="name"
                          type="text"
                          value={sponsorForm.name}
                          onChange={handleSponsorChange}
                          className="bg-black/50 border-red-900/30 text-white placeholder-gray-500"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="sponsor-email" className="block text-white font-medium mb-2">
                          Email
                        </label>
                        <Input
                          id="sponsor-email"
                          name="email"
                          type="email"
                          value={sponsorForm.email}
                          onChange={handleSponsorChange}
                          className="bg-black/50 border-red-900/30 text-white placeholder-gray-500"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="sponsor-company" className="block text-white font-medium mb-2">
                          Company Name
                        </label>
                        <Input
                          id="sponsor-company"
                          name="companyName"
                          type="text"
                          value={sponsorForm.companyName}
                          onChange={handleSponsorChange}
                          className="bg-black/50 border-red-900/30 text-white placeholder-gray-500"
                          placeholder="Your company name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="sponsor-type" className="block text-white font-medium mb-2">
                          Sponsorship Type
                        </label>
                        <Select value={sponsorForm.sponsorshipType} onValueChange={(value) => setSponsorForm({...sponsorForm, sponsorshipType: value})}>
                          <SelectTrigger className="bg-black/50 border-red-900/30 text-white">
                            <SelectValue placeholder="Select Sponsorship Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="event-sponsor">Event Sponsor</SelectItem>
                            <SelectItem value="ring-sponsor">Ring Sponsor</SelectItem>
                            <SelectItem value="title-sponsor">Title Sponsor</SelectItem>
                            <SelectItem value="media-sponsor">Media Sponsor</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="sponsor-message" className="block text-white font-medium mb-2">
                        Sponsorship Interest & Message
                      </label>
                      <Textarea
                        id="sponsor-message"
                        name="message"
                        value={sponsorForm.message}
                        onChange={handleSponsorChange}
                        className="bg-black/50 border-red-900/30 text-white placeholder-gray-500 min-h-[120px]"
                        placeholder="Tell us about your company, sponsorship goals, and how you'd like to partner with TCS..."
                        required
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting.sponsor}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                      >
                        {isSubmitting.sponsor ? "Sending..." : "Submit Partnership Request"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsSponsorModalOpen(false)}
                        className="flex-1 border-red-900/30 text-black hover:opacity-70"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
