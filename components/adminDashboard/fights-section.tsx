"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Eye, Loader2, CalendarPlus } from "lucide-react"
import { useFightsQuery, useCreateFightMutation, useUpdateFightMutation, usePatchFightMutation, useDeleteFightMutation, useEventsQuery, useFightersQuery } from "@/hooks/use-queries"
import { LoadingCard, ErrorCard } from "./loading-card"

interface FightsSectionProps {
  searchTerm: string
}

export default function FightsSection({ searchTerm }: FightsSectionProps) {
  const { data: fights = [], isLoading, error } = useFightsQuery()
  const { data: events = [] } = useEventsQuery()
  const { mutate: createFight, isPending: isCreating } = useCreateFightMutation()
  const { mutate: updateFight, isPending: isUpdating } = useUpdateFightMutation()
  const { mutate: patchFight } = usePatchFightMutation()
  const { mutate: deleteFight } = useDeleteFightMutation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedFight, setSelectedFight] = useState<any>(null)
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [assigningEventFightId, setAssigningEventFightId] = useState<string | null>(null)

  if (isLoading) return <LoadingCard />
  if (error) return <ErrorCard />

  const filteredFights = fights.filter((fight: any) => {
    const matchesSearch =
      fight.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fight.fighter1?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fight.fighter2?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fight.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEvent = eventFilter === 'all' ? true : fight.event?._id === eventFilter
    return matchesSearch && matchesEvent
  })

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

      {/* Event Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-300 h-8 w-56 text-xs">
            <SelectValue placeholder="Filter by event" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all" className="text-white text-xs">All Events</SelectItem>
            {(events as any[])
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((event: any) => (
                <SelectItem key={event._id} value={event._id} className="text-white text-xs">
                  {event.title}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <span className="text-gray-500 text-xs ml-auto">
          {filteredFights.length} fight{filteredFights.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Fights Table */}
      <div className="overflow-x-auto rounded-md border border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Matchup</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Event</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Weight Class</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Rounds</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Type</th>
              <th className="text-right py-3 px-4 text-xs font-medium uppercase text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFights.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">No fights found</td>
              </tr>
            ) : (
              filteredFights.map((fight: any) => (
                <tr key={fight._id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 px-4 text-white font-medium">
                    {fight.fighter1?.name || 'TBD'} <span className="text-gray-500 font-normal">vs</span> {fight.fighter2?.name || 'TBD'}
                  </td>
                  <td className="py-3 px-4">
                    {assigningEventFightId === fight._id ? (
                      <Select
                        onValueChange={(eventId) => {
                          patchFight({ id: fight._id, event: eventId })
                          setAssigningEventFightId(null)
                        }}
                        onOpenChange={(open) => { if (!open) setAssigningEventFightId(null) }}
                        defaultOpen
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-7 text-xs w-44">
                          <SelectValue placeholder="Pick event…" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {(events as any[])
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((e: any) => (
                              <SelectItem key={e._id} value={e._id} className="text-white text-xs">{e.title}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : fight.event?.title ? (
                      <span className="text-gray-300">{fight.event.title}</span>
                    ) : (
                      <button
                        onClick={() => setAssigningEventFightId(fight._id)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
                        title="Assign to event"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" />
                        Assign event
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{fight.weightClass || '—'}</td>
                  <td className="py-3 px-4 text-gray-300">{fight.rounds || '—'}</td>
                  <td className="py-3 px-4">
                    {fight.isMainEvent ? (
                      <Badge className="bg-red-700/40 text-red-400 border-0 text-xs">Main Event</Badge>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                        title="View"
                        onClick={() => { setSelectedFight(fight); setIsViewDialogOpen(true) }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                        title="Edit"
                        onClick={() => { setSelectedFight(fight); setIsEditDialogOpen(true) }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                        title="Delete"
                        onClick={() => {
                          if (window.confirm(`Delete this fight? This cannot be undone.`)) {
                            deleteFight(fight._id)
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
              <SelectItem value="2" className="text-white">2 Round</SelectItem>
              <SelectItem value="3" className="text-white">3 Rounds</SelectItem>
              <SelectItem value="4" className="text-white">4 Round</SelectItem>
              <SelectItem value="5" className="text-white">5 Rounds</SelectItem>
              <SelectItem value="6" className="text-white">6 Round</SelectItem>
              <SelectItem value="7" className="text-white">7 Round</SelectItem>
              <SelectItem value="8" className="text-white">8 Round</SelectItem>
              <SelectItem value="9" className="text-white">9 Round</SelectItem>
              <SelectItem value="10" className="text-white">10 Round</SelectItem>
              <SelectItem value="11" className="text-white">11 Round</SelectItem>
              <SelectItem value="12" className="text-white">12 Round</SelectItem>
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
              <SelectItem value="2" className="text-white">2 Round</SelectItem>
              <SelectItem value="3" className="text-white">3 Rounds</SelectItem>
              <SelectItem value="4" className="text-white">4 Round</SelectItem>
              <SelectItem value="5" className="text-white">5 Rounds</SelectItem>
              <SelectItem value="6" className="text-white">6 Round</SelectItem>
              <SelectItem value="7" className="text-white">7 Round</SelectItem>
              <SelectItem value="8" className="text-white">8 Round</SelectItem>
              <SelectItem value="9" className="text-white">9 Round</SelectItem>
              <SelectItem value="10" className="text-white">10 Round</SelectItem>
              <SelectItem value="11" className="text-white">11 Round</SelectItem>
              <SelectItem value="12" className="text-white">12 Round</SelectItem>
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

function FighterCard({ fighter, label }: { fighter: any; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      {fighter?.image ? (
        <img
          src={fighter.image}
          alt={fighter.name}
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
          <span className="text-3xl font-bold text-gray-500">{fighter?.name?.[0] ?? '?'}</span>
        </div>
      )}
      <div className="text-center">
        <p className="text-white font-semibold leading-tight">{fighter?.name || 'TBD'}</p>
        {fighter?.nickname && <p className="text-gray-400 text-xs italic">"{fighter.nickname}"</p>}
        {fighter?.record && <p className="text-gray-500 text-xs font-mono mt-0.5">{fighter.record}</p>}
      </div>
    </div>
  )
}

function ViewFightModal({ fight }: { fight: any }) {
  return (
    <div className="space-y-5">
      {/* Title + badge */}
      <div className="text-center">
        {fight.isMainEvent && (
          <Badge className="bg-red-600 text-white text-xs mb-1">MAIN EVENT</Badge>
        )}
        <p className="text-gray-400 text-sm">{fight.event?.title || 'No event'}</p>
      </div>

      {/* Fighter images face-off */}
      <div className="flex items-center gap-3">
        <FighterCard fighter={fight.fighter1} label="Fighter 1" />
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <span className="text-2xl font-bold text-gray-600">VS</span>
        </div>
        <FighterCard fighter={fight.fighter2} label="Fighter 2" />
      </div>

      {/* Fight details */}
      <div className="bg-gray-800/60 rounded-lg px-4 py-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Rounds</span>
          <span className="text-white">{fight.rounds || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Weight Class</span>
          <span className="text-white">{fight.weightClass || '—'}</span>
        </div>
        {fight.title && (
          <div className="flex justify-between">
            <span className="text-gray-400">Title</span>
            <span className="text-white">{fight.title}</span>
          </div>
        )}
      </div>
    </div>
  )
}
