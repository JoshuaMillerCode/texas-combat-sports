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
  QrCode,
  Zap,
  Play,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import EventsSection from "@/components/adminDashboard/events-section"
import FightersSection from "@/components/adminDashboard/fighters-section"
import FightsSection from "@/components/adminDashboard/fights-section"
import MerchSection from "@/components/adminDashboard/merch-section"
import TicketTiersSection from "@/components/adminDashboard/ticket-tiers-section"
import FlashSalesSection from "@/components/adminDashboard/flash-sales-section"
import VideosSection from "@/components/adminDashboard/videos-section"
import DollsSection from "@/components/adminDashboard/dolls-section"


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
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Title and subtitle */}
          <div className="mb-3 sm:mb-0 sm:flex sm:justify-between sm:items-center">
            <div className="mb-3 sm:mb-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-400">Texas Combat Sports Management</p>
            </div>
            {/* Desktop action buttons */}
            <div className="hidden sm:flex items-center space-x-2">
              <Button 
                onClick={() => window.location.href = '/admin/ticket-scan'}
                variant="outline" 
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Ticket Scanner
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Logout
              </Button>
            </div>
          </div>
          {/* Mobile action buttons */}
          <div className="flex sm:hidden gap-2">
            <Button 
              onClick={() => window.location.href = '/admin/ticket-scan'}
              variant="outline" 
              size="sm"
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Scanner
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              size="sm"
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Desktop tabs - 2x4 grid */}
          <TabsList className="hidden md:grid md:grid-cols-7 bg-gray-800 border-gray-700 h-auto">
            <TabsTrigger value="events" className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2 py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="fighters" className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2 py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm">
              <Users className="h-4 w-4" />
              Fighters
            </TabsTrigger>
            <TabsTrigger value="fights" className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2 py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm">
              <Sword className="h-4 w-4" />
              Fights
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2 py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm">
              <Ticket className="h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="flash-sales" className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2 py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm">
              <Zap className="h-4 w-4" />
              Flash Sales
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2 py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm">
              <Play className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="dolls" className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2 py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm">
              <Sparkles className="h-4 w-4" />
              Dolls
            </TabsTrigger>
          </TabsList>

          {/* Mobile/Tablet tabs - scrollable horizontal */}
          <div className="md:hidden overflow-x-auto pb-2">
            <TabsList className="inline-flex min-w-max bg-gray-800 border-gray-700 h-auto">
              <TabsTrigger value="events" className="flex items-center gap-1 px-3 py-2 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs whitespace-nowrap">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="fighters" className="flex items-center gap-1 px-3 py-2 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs whitespace-nowrap">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Fighters
              </TabsTrigger>
              <TabsTrigger value="fights" className="flex items-center gap-1 px-3 py-2 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs whitespace-nowrap">
                <Sword className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Fights
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex items-center gap-1 px-3 py-2 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs whitespace-nowrap">
                <Ticket className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Tickets
              </TabsTrigger>
              <TabsTrigger value="flash-sales" className="flex items-center gap-1 px-3 py-2 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs whitespace-nowrap">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Flash Sales
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-1 px-3 py-2 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs whitespace-nowrap">
                <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="dolls" className="flex items-center gap-1 px-3 py-2 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs whitespace-nowrap">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Dolls
              </TabsTrigger>
            </TabsList>
          </div>

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
          {/* <TabsContent value="merch">
            <MerchSection searchTerm={searchTerm} />
          </TabsContent> */}

          {/* Ticket Tiers Tab */}
          <TabsContent value="tickets">
            <TicketTiersSection searchTerm={searchTerm} />
          </TabsContent>

          {/* Flash Sales Tab */}
          <TabsContent value="flash-sales">
            <FlashSalesSection searchTerm={searchTerm} />
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <VideosSection searchTerm={searchTerm} />
          </TabsContent>

          {/* Dolls Tab */}
          <TabsContent value="dolls">
            <DollsSection searchTerm={searchTerm} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

