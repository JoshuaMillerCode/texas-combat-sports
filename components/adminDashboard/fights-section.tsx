"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { useFightsQuery, useCreateFightMutation, useUpdateFightMutation, useDeleteFightMutation, useEventsQuery, useFightersQuery } from "@/hooks/use-queries"
import { LoadingCard, ErrorCard } from "./loading-card"

interface FightsSectionProps {
  searchTerm: string
}

export default function FightsSection({ searchTerm }: FightsSectionProps) {
  const { data: fights = [], isLoading, error } = useFightsQuery()
  const { mutate: createFight, isPending: isCreating } = useCreateFightMutation()
  const { mutate: updateFight, isPending: isUpdating } = useUpdateFightMutation()
  const { mutate: deleteFight, isPending: isDeleting } = useDeleteFightMutation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedFight, setSelectedFight] = useState<any>(null)

  if (isLoading) return <LoadingCard />
  if (error) return <ErrorCard />

  const filteredFights = fights.filter((fight: any) => 
    fight.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fight.fighter1?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fight.fighter2?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fight.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Fights</h2>
          <p className="text-gray-400">Manage fight cards and matchups</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Fight
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Create New Fight</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new fight to the card
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              <CreateFightForm onSubmit={createFight} isLoading={isCreating} onClose={() => setIsCreateDialogOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Fight Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edit Fight</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update the fight details
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              {selectedFight && (
                <EditFightForm 
                  fight={selectedFight} 
                  onSubmit={(data) => {
                    const updateData = { ...data, id: selectedFight._id }
                    updateFight(updateData)
                    setIsEditDialogOpen(false)
                    setSelectedFight(null)
                  }} 
                  isLoading={isUpdating} 
                  onClose={() => {
                    setIsEditDialogOpen(false)
                    setSelectedFight(null)
                  }} 
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* View Fight Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Fight Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                View fight information
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              {selectedFight && <ViewFightModal fight={selectedFight} />}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Fights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFights.map((fight: any) => (
          <Card key={fight._id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-white font-semibold">{fight.title || 'Fight Card'}</h3>
                  {fight.isMainEvent && (
                    <Badge className="bg-red-600 text-white text-xs mt-1">MAIN EVENT</Badge>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="text-white font-medium">{fight.fighter1?.name || 'TBD'}</div>
                  <div className="text-gray-400 text-sm">vs</div>
                  <div className="text-white font-medium">{fight.fighter2?.name || 'TBD'}</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Event:</span>
                    <span className="text-white">{fight.event?.title || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rounds:</span>
                    <span className="text-white">{fight.rounds || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Weight Class:</span>
                    <span className="text-white">{fight.weightClass || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => {
                      setSelectedFight(fight)
                      setIsViewDialogOpen(true)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => {
                      setSelectedFight(fight)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                    onClick={() => {
                      deleteFight(fight._id)
                    }}
                  >
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

function CreateFightForm({ onSubmit, isLoading, onClose }: { onSubmit: (data: any) => void, isLoading: boolean, onClose: () => void }) {
  const { data: events = [] } = useEventsQuery()
  const { data: fighters = [] } = useFightersQuery()
  const [formData, setFormData] = useState({
    event: '',
    fighter1: '',
    fighter2: '',
    title: '',
    rounds: '3',
    isMainEvent: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Transform the data to match the schema
    const submitData = {
      event: formData.event,
      fighter1: formData.fighter1,
      fighter2: formData.fighter2,
      title: formData.title,
      rounds: parseInt(formData.rounds),
      isMainEvent: formData.isMainEvent
    }
    
    await onSubmit(submitData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="event" className="text-gray-300">Event</Label>
        <Select value={formData.event} onValueChange={(value) => setFormData(prev => ({ ...prev, event: value }))}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {events.map((event: any) => (
              <SelectItem key={event._id} value={event._id} className="text-white">
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-300">Fight Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="Lightweight Title Fight"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fighter1" className="text-gray-300">Fighter 1</Label>
          <Select value={formData.fighter1} onValueChange={(value) => setFormData(prev => ({ ...prev, fighter1: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select fighter 1" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {fighters.map((fighter: any) => (
                <SelectItem key={fighter._id} value={fighter._id} className="text-white">
                  {fighter.name} "{fighter.nickname}"
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fighter2" className="text-gray-300">Fighter 2</Label>
          <Select value={formData.fighter2} onValueChange={(value) => setFormData(prev => ({ ...prev, fighter2: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select fighter 2" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {fighters.map((fighter: any) => (
                <SelectItem key={fighter._id} value={fighter._id} className="text-white">
                  {fighter.name} "{fighter.nickname}"
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rounds" className="text-gray-300">Number of Rounds</Label>
          <Select value={formData.rounds} onValueChange={(value) => setFormData(prev => ({ ...prev, rounds: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="1" className="text-white">1 Round</SelectItem>
              <SelectItem value="3" className="text-white">3 Rounds</SelectItem>
              <SelectItem value="5" className="text-white">5 Rounds</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Fight Type</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="mainEvent"
              checked={formData.isMainEvent}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isMainEvent: !!checked }))}
              className="border-gray-600"
            />
            <Label htmlFor="mainEvent" className="text-gray-300">Main Event</Label>
          </div>
        </div>
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
            'Create Fight'
          )}
        </Button>
      </div>
    </form>
  )
}

function EditFightForm({ fight, onSubmit, isLoading, onClose }: { fight: any, onSubmit: (data: any) => void, isLoading: boolean, onClose: () => void }) {
  const { data: events = [] } = useEventsQuery()
  const { data: fighters = [] } = useFightersQuery()
  const [formData, setFormData] = useState({
    event: fight.event?._id,
    fighter1: fight.fighter1?._id,
    fighter2: fight.fighter2?._id,
    title: fight.title,
    rounds: fight.rounds,
    isMainEvent: fight.isMainEvent
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Transform the data to match the schema
    const submitData = {
      event: formData.event,
      fighter1: formData.fighter1,
      fighter2: formData.fighter2,
      title: formData.title,
      rounds: parseInt(formData.rounds),
      isMainEvent: formData.isMainEvent
    }
    
    await onSubmit(submitData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="event" className="text-gray-300">Event</Label>
        <Select value={formData.event} onValueChange={(value) => setFormData(prev => ({ ...prev, event: value }))}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {events.map((event: any) => (
              <SelectItem key={event._id} value={event._id} className="text-white">
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-300">Fight Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="Lightweight Title Fight"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fighter1" className="text-gray-300">Fighter 1</Label>
          <Select value={formData.fighter1} onValueChange={(value) => setFormData(prev => ({ ...prev, fighter1: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select fighter 1" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {fighters.map((fighter: any) => (
                <SelectItem key={fighter._id} value={fighter._id} className="text-white">
                  {fighter.name} "{fighter.nickname}"
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fighter2" className="text-gray-300">Fighter 2</Label>
          <Select value={formData.fighter2} onValueChange={(value) => setFormData(prev => ({ ...prev, fighter2: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select fighter 2" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {fighters.map((fighter: any) => (
                <SelectItem key={fighter._id} value={fighter._id} className="text-white">
                  {fighter.name} "{fighter.nickname}"
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rounds" className="text-gray-300">Number of Rounds</Label>
          <Select value={formData.rounds} onValueChange={(value) => setFormData(prev => ({ ...prev, rounds: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="1" className="text-white">1 Round</SelectItem>
              <SelectItem value="3" className="text-white">3 Rounds</SelectItem>
              <SelectItem value="5" className="text-white">5 Rounds</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Fight Type</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="mainEvent"
              checked={formData.isMainEvent}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isMainEvent: !!checked }))}
              className="border-gray-600"
            />
            <Label htmlFor="mainEvent" className="text-gray-300">Main Event</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="border-gray-600 text-gray-300">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Fight'
          )}
        </Button>
      </div>
    </form>
  )
}

function ViewFightModal({ fight }: { fight: any }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-white font-semibold">{fight.title || 'Fight Card'}</h3>
        {fight.isMainEvent && (
          <Badge className="bg-red-600 text-white text-xs mt-1">MAIN EVENT</Badge>
        )}
      </div>
      
      <div className="text-center">
        <div className="text-white font-medium">{fight.fighter1?.name || 'TBD'}</div>
        <div className="text-gray-400 text-sm">vs</div>
        <div className="text-white font-medium">{fight.fighter2?.name || 'TBD'}</div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Event:</span>
          <span className="text-white">{fight.event?.title || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Rounds:</span>
          <span className="text-white">{fight.rounds || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Weight Class:</span>
          <span className="text-white">{fight.weightClass || 'N/A'}</span>
        </div>
      </div>
    </div>
  )
}
