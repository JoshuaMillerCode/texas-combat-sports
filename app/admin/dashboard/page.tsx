"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Calendar, 
  Users, 
  Sword, 
  ShoppingCart, 
  Ticket,
  Eye,
  AlertCircle,
  // CheckCircle,
  Loader2
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  useEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useFightersQuery,
  useCreateFighterMutation,
  useUpdateFighterMutation,
  useDeleteFighterMutation,
  useFightsQuery,
  useCreateFightMutation,
  useUpdateFightMutation,
  useDeleteFightMutation,
  useMerchQuery,
  useCreateMerchMutation,
  useUpdateMerchMutation,
  useDeleteMerchMutation,
  useTicketTiersQuery,
  useCreateTicketTierMutation,
  useUpdateTicketTierMutation,
  useDeleteTicketTierMutation,
} from "@/hooks/use-queries"
import { formatAmountForDisplay } from "@/lib/stripe"

  // Real TanStack Query hooks are now imported from @/hooks/use-queries

// ==================== MAIN COMPONENT ====================

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
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Logout
          </Button>
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

// ==================== SECTION COMPONENTS ====================

function EventsSection({ searchTerm }: { searchTerm: string }) {
  const { data: events = [], isLoading, error } = useEventsQuery()
  const { mutate: createEvent, isPending: isCreating } = useCreateEventMutation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  if (isLoading) return <LoadingCard />
  if (error) return <ErrorCard />

  const filteredEvents = events.filter((event: any) => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Events</h2>
          <p className="text-gray-400">Manage combat sports events</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new combat sports event to the platform
              </DialogDescription>
            </DialogHeader>
            <CreateEventForm onSubmit={createEvent} isLoading={isCreating} onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event: any) => (
          <Card key={event._id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
            <CardHeader>
              <CardTitle className="text-white">{event.title}</CardTitle>
              <CardDescription className="text-gray-400">{event.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Date:</span>
                  <span className="text-white">{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Capacity:</span>
                  <span className="text-white">{event.capacity}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/20">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function FightersSection({ searchTerm }: { searchTerm: string }) {
  const { data: fighters = [], isLoading, error } = useFightersQuery()
  const { mutate: createFighter, isPending: isCreating } = useCreateFighterMutation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  if (isLoading) return <LoadingCard />
  if (error) return <ErrorCard />

  const filteredFighters = fighters.filter((fighter: any) => 
    fighter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fighter.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fighter.hometown.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Fighters</h2>
          <p className="text-gray-400">Manage fighter profiles and records</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Fighter
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Fighter</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new fighter to the roster
              </DialogDescription>
            </DialogHeader>
            <CreateFighterForm onSubmit={createFighter} isLoading={isCreating} onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Fighters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFighters.map((fighter: any) => (
          <Card key={fighter._id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
            <CardHeader>
              <CardTitle className="text-white">{fighter.name}</CardTitle>
              <CardDescription className="text-gray-400">"{fighter.nickname}"</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Record:</span>
                  <Badge variant="secondary" className="bg-green-900/30 text-green-400">{fighter.record}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Weight:</span>
                  <span className="text-white">{fighter.weight}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Hometown:</span>
                  <span className="text-white">{fighter.hometown}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/20">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function FightsSection({ searchTerm }: { searchTerm: string }) {
  const { data: fights = [], isLoading, error } = useFightsQuery()

  if (isLoading) return <LoadingCard />
  if (error) return <ErrorCard />

  const filteredFights = fights.filter((fight: any) => 
    fight.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fight.fighter1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fight.fighter2.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Fights</h2>
          <p className="text-gray-400">Manage fight cards and matchups</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Fight
        </Button>
      </div>

      {/* Fights List */}
      <div className="space-y-4">
        {filteredFights.map((fight: any) => (
          <Card key={fight._id} className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {fight.isMainEvent && (
                    <Badge className="bg-red-600 text-white">Main Event</Badge>
                  )}
                  <div>
                    <h3 className="text-white font-semibold">{fight.fighter1.name} vs {fight.fighter2.name}</h3>
                    <p className="text-gray-400 text-sm">{fight.event.title} • {fight.title}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function MerchSection({ searchTerm }: { searchTerm: string }) {
  const { data: merch = [], isLoading, error } = useMerchQuery()

  if (isLoading) return <LoadingCard />
  if (error) return <ErrorCard />

  const filteredMerch = merch.filter((item: any) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Merchandise</h2>
          <p className="text-gray-400">Manage products and inventory</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Merch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMerch.map((item: any) => (
          <Card key={item._id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
            <CardHeader>
              <CardTitle className="text-white">{item.name}</CardTitle>
              <CardDescription className="text-gray-400">{item.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Price:</span>
                  <span className="text-white font-semibold">${item.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Available:</span>
                  <span className={`font-medium ${item.inventory.available > 10 ? 'text-green-400' : 'text-orange-400'}`}>
                    {item.inventory.available}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Status:</span>
                  <Badge variant={item.isActive ? "default" : "secondary"} className={item.isActive ? "bg-green-900/30 text-green-400" : ""}>
                    {item.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/20">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function TicketTiersSection({ searchTerm }: { searchTerm: string }) {
  const { data: ticketTiers = [], isLoading, error } = useTicketTiersQuery()

  if (isLoading) return <LoadingCard />
  if (error) return <ErrorCard />

  const filteredTicketTiers = ticketTiers.filter((tier: any) => 
    tier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tier.event.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Ticket Tiers</h2>
          <p className="text-gray-400">Manage ticket pricing and availability</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Tier
        </Button>
      </div>

      {/* Ticket Tiers List */}
      <div className="space-y-4">
        {filteredTicketTiers.map((tier: any) => (
          <Card key={tier._id} className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-white font-semibold">{tier.name}</h3>
                  <p className="text-gray-400 text-sm">{tier.event.title}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-300">Price: <span className="text-white font-semibold">{formatAmountForDisplay(tier.price * .01, tier.currency)}</span></span>
                    <span className="text-gray-300">Available: <span className="text-white">{tier.availableQuantity}/{tier.maxQuantity}</span></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ==================== FORM COMPONENTS ====================

function CreateEventForm({ onSubmit, isLoading, onClose }: { onSubmit: (data: any) => void, isLoading: boolean, onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    date: '',
    location: '',
    venue: '',
    capacity: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-gray-300">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle" className="text-gray-300">Subtitle</Label>
          <Input
            id="subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-gray-300">Date</Label>
          <Input
            id="date"
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity" className="text-gray-300">Capacity</Label>
          <Input
            id="capacity"
            value={formData.capacity}
            onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-gray-300">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue" className="text-gray-300">Venue</Label>
        <Input
          id="venue"
          value={formData.venue}
          onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-300">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          rows={3}
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="border-gray-600 text-gray-300">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Event'
          )}
        </Button>
      </div>
    </form>
  )
}

function CreateFighterForm({ onSubmit, isLoading, onClose }: { onSubmit: (data: any) => void, isLoading: boolean, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    record: '',
    age: '',
    height: '',
    reach: '',
    weight: '',
    hometown: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-300">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nickname" className="text-gray-300">Nickname</Label>
          <Input
            id="nickname"
            value={formData.nickname}
            onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="record" className="text-gray-300">Record (W-L-D)</Label>
          <Input
            id="record"
            value={formData.record}
            onChange={(e) => setFormData(prev => ({ ...prev, record: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="15-2-0"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age" className="text-gray-300">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight" className="text-gray-300">Weight</Label>
          <Input
            id="weight"
            value={formData.weight}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="155 lbs"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height" className="text-gray-300">Height</Label>
          <Input
            id="height"
            value={formData.height}
            onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="5'10&quot;"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reach" className="text-gray-300">Reach</Label>
          <Input
            id="reach"
            value={formData.reach}
            onChange={(e) => setFormData(prev => ({ ...prev, reach: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="72&quot;"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hometown" className="text-gray-300">Hometown</Label>
        <Input
          id="hometown"
          value={formData.hometown}
          onChange={(e) => setFormData(prev => ({ ...prev, hometown: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="border-gray-600 text-gray-300">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Fighter'
          )}
        </Button>
      </div>
    </form>
  )
}

// ==================== UTILITY COMPONENTS ====================

function LoadingCard() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Loading...</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ErrorCard() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="pt-6">
        <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading data. Please try again later.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
} 