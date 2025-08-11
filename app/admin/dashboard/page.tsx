"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Calendar, 
  Users, 
  Sword, 
  ShoppingCart, 
  Ticket,
  Loader2,
  QrCode
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import EventsSection from "@/components/adminDashboard/events-section"
import FightersSection from "@/components/adminDashboard/fighters-section"
import FightsSection from "@/components/adminDashboard/fights-section"
import MerchSection from "@/components/adminDashboard/merch-section"
import TicketTiersSection from "@/components/adminDashboard/ticket-tiers-section"


export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("events")
  const [searchTerm, setSearchTerm] = useState("")
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth()

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/admin/login'
    }
  }, [isAuthenticated, authLoading])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/admin/login'
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="text-white">Loading...</span>
        </div>
      </div>
    )
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Texas Combat Sports Management</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => window.location.href = '/admin/ticket-scan'}
              variant="outline" 
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Ticket Scanner
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search across all sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 border-gray-700">
            <TabsTrigger value="events" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="fighters" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              Fighters
            </TabsTrigger>
            <TabsTrigger value="fights" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Sword className="h-4 w-4" />
              Fights
            </TabsTrigger>
            <TabsTrigger value="merch" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <ShoppingCart className="h-4 w-4" />
              Merch
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Ticket className="h-4 w-4" />
              Tickets
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events">
            <EventsSection searchTerm={searchTerm} />
          </TabsContent>

          {/* Fighters Tab */}
          <TabsContent value="fighters">
            <FightersSection searchTerm={searchTerm} />
          </TabsContent>

          {/* Fights Tab */}
          <TabsContent value="fights">
            <FightsSection searchTerm={searchTerm} />
          </TabsContent>

          {/* Merch Tab */}
          <TabsContent value="merch">
            <MerchSection searchTerm={searchTerm} />
          </TabsContent>

          {/* Ticket Tiers Tab */}
          <TabsContent value="tickets">
            <TicketTiersSection searchTerm={searchTerm} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

