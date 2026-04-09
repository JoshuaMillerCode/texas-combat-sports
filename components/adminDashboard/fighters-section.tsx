"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Eye, Loader2, UserPlus } from "lucide-react"
import { useFightersQuery, useEventsQuery, useFightsQuery, useUpdateFightMutation, useCreateFighterMutation, useUpdateFighterMutation, useDeleteFighterMutation } from "@/hooks/use-queries"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingCard, ErrorCard } from "./loading-card"
import { ImageUpload } from "./image-upload"
import { MultiImageUpload } from "./multi-image-upload"
import Image from "next/image"

interface FightersSectionProps {
  searchTerm: string
}

export default function FightersSection({ searchTerm }: FightersSectionProps) {
  const { data: fighters = [], isLoading, error } = useFightersQuery()
  const { data: events = [] } = useEventsQuery()
  const { data: fights = [] } = useFightsQuery()
  const { mutate: createFighter, isPending: isCreating } = useCreateFighterMutation()
  const { mutate: updateFighter, isPending: isUpdating } = useUpdateFighterMutation()
  const { mutate: updateFight, isPending: isAssigning } = useUpdateFightMutation()
  const { mutate: deleteFighter } = useDeleteFighterMutation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedFighter, setSelectedFighter] = useState<any>(null)
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [assignFighter, setAssignFighter] = useState<any>(null)
  const [assignFightId, setAssignFightId] = useState('')
  const [assignSlot, setAssignSlot] = useState<'fighter1' | 'fighter2'>('fighter1')

  if (isLoading) return <LoadingCard />
  if (error) return <ErrorCard />

  // Build set of fighter IDs appearing in the selected event's fights
  const selectedEvent = events.find((e: any) => e._id === eventFilter)
  const fighterIdsInEvent = eventFilter === 'all' ? null : new Set(
    (selectedEvent?.fights || []).flatMap((f: any) => [f.fighter1?._id, f.fighter2?._id].filter(Boolean))
  )

  const filteredFighters = fighters.filter((fighter: any) => {
    const matchesSearch =
      fighter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fighter.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fighter.hometown?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEvent = fighterIdsInEvent === null ? true : fighterIdsInEvent.has(fighter._id)
    return matchesSearch && matchesEvent
  })

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
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Create New Fighter</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new fighter to the roster
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              <CreateFighterForm onSubmit={createFighter} isLoading={isCreating} onClose={() => setIsCreateDialogOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Fighter Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edit Fighter</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update the fighter details
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              {selectedFighter && (
                <EditFighterForm 
                  fighter={selectedFighter} 
                  onSubmit={(data) => {
                    const updateData = { ...data, id: selectedFighter._id }
                    updateFighter(updateData)
                    setIsEditDialogOpen(false)
                    setSelectedFighter(null)
                  }} 
                  isLoading={isUpdating} 
                  onClose={() => {
                    setIsEditDialogOpen(false)
                    setSelectedFighter(null)
                  }} 
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* View Fighter Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Fighter Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                View fighter information
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              {selectedFighter && <ViewFighterModal fighter={selectedFighter} />}
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
            <SelectItem value="all" className="text-white text-xs">All Fighters</SelectItem>
            {(events as any[])
              .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
              .map((event: any) => (
                <SelectItem key={event._id} value={event._id} className="text-white text-xs">
                  {event.title}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <span className="text-gray-500 text-xs ml-auto">
          {filteredFighters.length} fighter{filteredFighters.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Quick-assign to fight dialog */}
      <Dialog open={!!assignFighter} onOpenChange={(open) => { if (!open) { setAssignFighter(null); setAssignFightId(''); setAssignSlot('fighter1') } }}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Assign to Fight</DialogTitle>
            <DialogDescription className="text-gray-400 text-xs">
              Assign <span className="text-white font-medium">{assignFighter?.name}</span> to a fight slot
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 uppercase font-medium">Fight</label>
              <Select value={assignFightId} onValueChange={setAssignFightId}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-sm h-auto min-h-9 py-1.5">
                  <SelectValue placeholder="Select a fight…">
                    {assignFightId && (() => {
                      const f = (fights as any[]).find((x: any) => x._id === assignFightId)
                      if (!f) return null
                      const matchup = f.fighter1?.name && f.fighter2?.name
                        ? `${f.fighter1.name} vs ${f.fighter2.name}`
                        : f.title || 'Unassigned fight'
                      return <span className="text-sm">{matchup}</span>
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {(fights as any[])
                    .sort((a, b) => (a.event?.title ?? '').localeCompare(b.event?.title ?? ''))
                    .map((f: any) => {
                      const matchup = f.fighter1?.name && f.fighter2?.name
                        ? `${f.fighter1.name} vs ${f.fighter2.name}`
                        : f.fighter1?.name
                        ? `${f.fighter1.name} vs TBD`
                        : f.fighter2?.name
                        ? `TBD vs ${f.fighter2.name}`
                        : f.title || 'Unassigned fight'
                      return (
                        <SelectItem key={f._id} value={f._id} className="text-white text-xs py-2">
                          <div>
                            <div className="font-medium">{matchup}</div>
                            <div className="text-gray-400 text-[11px]">
                              {f.event?.title ?? 'No event'}{f.isMainEvent ? ' · Main Event' : ''}
                            </div>
                          </div>
                        </SelectItem>
                      )
                    })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 uppercase font-medium">Slot</label>
              <div className="flex rounded-md overflow-hidden border border-gray-700">
                {(['fighter1', 'fighter2'] as const).map((slot) => {
                  const fight = (fights as any[]).find((f: any) => f._id === assignFightId)
                  const current = fight?.[slot]?.name
                  return (
                    <button
                      key={slot}
                      onClick={() => setAssignSlot(slot)}
                      className={`flex-1 py-2 text-xs font-medium transition-colors ${assignSlot === slot ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    >
                      {slot === 'fighter1' ? 'Fighter 1' : 'Fighter 2'}
                      {current && <span className="block text-[10px] opacity-60 truncate px-1">{current}</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setAssignFighter(null)} className="border-gray-700 text-gray-300">
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!assignFightId || isAssigning || (() => {
                  const fight = (fights as any[]).find((f: any) => f._id === assignFightId)
                  const otherSlot = assignSlot === 'fighter1' ? 'fighter2' : 'fighter1'
                  return fight?.[otherSlot]?._id === assignFighter?._id
                })()}
                title={(() => {
                  const fight = (fights as any[]).find((f: any) => f._id === assignFightId)
                  const otherSlot = assignSlot === 'fighter1' ? 'fighter2' : 'fighter1'
                  return fight?.[otherSlot]?._id === assignFighter?._id ? 'Fighter is already in the other slot' : undefined
                })()}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-40"
                onClick={() => {
                  const fight = (fights as any[]).find((f: any) => f._id === assignFightId)
                  if (!fight) return
                  updateFight({
                    id: fight._id,
                    event: fight.event?._id,
                    fighter1: assignSlot === 'fighter1' ? assignFighter._id : fight.fighter1?._id,
                    fighter2: assignSlot === 'fighter2' ? assignFighter._id : fight.fighter2?._id,
                    title: fight.title,
                    rounds: fight.rounds,
                    isMainEvent: fight.isMainEvent,
                  } as any)
                  setAssignFighter(null)
                  setAssignFightId('')
                  setAssignSlot('fighter1')
                }}
              >
                {isAssigning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Assign'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fighters Table */}
      <div className="overflow-x-auto rounded-md border border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Name</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Nickname</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Record</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Weight</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Hometown</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Featured</th>
              <th className="text-right py-3 px-4 text-xs font-medium uppercase text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFighters.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">No fighters found</td>
              </tr>
            ) : (
              filteredFighters.map((fighter: any) => (
                <tr key={fighter._id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 px-4 text-white font-medium">{fighter.name}</td>
                  <td className="py-3 px-4 text-gray-400 italic">
                    {fighter.nickname ? `"${fighter.nickname}"` : '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-300 font-mono">{fighter.record || '—'}</td>
                  <td className="py-3 px-4 text-gray-300">{fighter.weight || '—'}</td>
                  <td className="py-3 px-4 text-gray-300">{fighter.hometown || '—'}</td>
                  <td className="py-3 px-4">
                    {fighter.featured ? (
                      <Badge className="bg-yellow-700/30 text-yellow-400 border-0 text-xs">Featured</Badge>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20"
                        title="Assign to fight"
                        onClick={() => { setAssignFighter(fighter); setAssignFightId(''); setAssignSlot('fighter1') }}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                        title="View"
                        onClick={() => { setSelectedFighter(fighter); setIsViewDialogOpen(true) }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                        title="Edit"
                        onClick={() => { setSelectedFighter(fighter); setIsEditDialogOpen(true) }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                        title="Delete"
                        onClick={() => {
                          if (window.confirm(`Delete "${fighter.name}"? This cannot be undone.`)) {
                            deleteFighter(fighter._id)
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

function CreateFighterForm({ onSubmit, isLoading, onClose }: { onSubmit: (data: any) => void, isLoading: boolean, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    slug: '',
    bio: '',
    record: '',
    age: '',
    height: '',
    reach: '',
    weight: '',
    hometown: '',
    image: '',
    images: [] as string[],
    featured: false,
    stats: {
      knockouts: '',
      submissions: '',
      decisions: '',
      winStreak: ''
    },
    achievements: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Transform the data to match the schema
    const submitData: any = {
      name: formData.name,
      nickname: formData.nickname,
      record: formData.record,
      age: parseInt(formData.age, 10) || 0,
      height: formData.height,
      reach: formData.reach,
      weight: formData.weight,
      hometown: formData.hometown,
      featured: formData.featured,
      stats: {
        knockouts: parseInt(formData.stats.knockouts) || 0,
        submissions: parseInt(formData.stats.submissions) || 0,
        decisions: parseInt(formData.stats.decisions) || 0,
        winStreak: parseInt(formData.stats.winStreak) || 0,
      },
      achievements: formData.achievements
        .split('\n')
        .map(achievement => achievement.trim())
        .filter(achievement => achievement.length > 0)
    }

    if (formData.slug && formData.slug.trim()) {
      submitData.slug = formData.slug.trim().toLowerCase().replace(/\s+/g, '-')
    }
    if (formData.bio && formData.bio.trim()) {
      submitData.bio = formData.bio.trim()
    }
    if (formData.image && formData.image.trim()) {
      submitData.image = formData.image.trim()
    }
    if (formData.images.length > 0) {
      submitData.images = formData.images
    }

    await onSubmit(submitData)
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

      <div className="space-y-2">
        <Label htmlFor="create-slug" className="text-gray-300">Profile Slug <span className="text-gray-500 font-normal">(optional — auto-generated from name)</span></Label>
        <Input
          id="create-slug"
          value={formData.slug}
          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
          placeholder="e.g. john-smith"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="create-bio" className="text-gray-300">Bio <span className="text-gray-500 font-normal">(optional)</span></Label>
        <Textarea
          id="create-bio"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          rows={3}
          placeholder="Short fighter biography shown on their profile page"
        />
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

      <ImageUpload
        label="Fighter Image"
        value={formData.image}
        onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
        folder="fighters"
        optional
      />

      <div className="space-y-4">
        <Label className="text-gray-300 text-base font-medium">Fight Statistics</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="knockouts" className="text-gray-300">Knockouts</Label>
            <Input
              id="knockouts"
              type="number"
              value={formData.stats.knockouts}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                stats: { ...prev.stats, knockouts: e.target.value }
              }))}
              className="bg-gray-800 border-gray-700 text-white"
              min="0"
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="submissions" className="text-gray-300">Submissions</Label>
            <Input
              id="submissions"
              type="number"
              value={formData.stats.submissions}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                stats: { ...prev.stats, submissions: e.target.value }
              }))}
              className="bg-gray-800 border-gray-700 text-white"
              min="0"
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="decisions" className="text-gray-300">Decisions</Label>
            <Input
              id="decisions"
              type="number"
              value={formData.stats.decisions}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                stats: { ...prev.stats, decisions: e.target.value }
              }))}
              className="bg-gray-800 border-gray-700 text-white"
              min="0"
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="winStreak" className="text-gray-300">Win Streak</Label>
            <Input
              id="winStreak"
              type="number"
              value={formData.stats.winStreak}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                stats: { ...prev.stats, winStreak: e.target.value }
              }))}
              className="bg-gray-800 border-gray-700 text-white"
              min="0"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, featured: !!checked }))}
          className="border-gray-600"
        />
        <Label htmlFor="featured" className="text-gray-300">Featured Fighter (display prominently on homepage)</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="achievements" className="text-gray-300">Achievements</Label>
        <Textarea
          id="achievements"
          value={formData.achievements}
          onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          rows={4}
          placeholder="Enter achievements, one per line&#10;Regional Champion&#10;Fighter of the Year 2023&#10;Knockout of the Night"
        />
        <p className="text-xs text-gray-500">Enter each achievement on a new line</p>
      </div>

      <MultiImageUpload
        label="Photo Gallery"
        values={formData.images}
        onChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
        folder="fighters"
      />

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

function EditFighterForm({ fighter, onSubmit, isLoading, onClose }: { fighter: any, onSubmit: (data: any) => void, isLoading: boolean, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: fighter.name,
    nickname: fighter.nickname,
    slug: fighter.slug ?? '',
    bio: fighter.bio ?? '',
    record: fighter.record,
    age: fighter.age,
    height: fighter.height,
    reach: fighter.reach,
    weight: fighter.weight,
    hometown: fighter.hometown,
    image: fighter.image,
    images: (fighter.images ?? []) as string[],
    featured: fighter.featured || false,
    stats: {
      knockouts: fighter.stats.knockouts,
      submissions: fighter.stats.submissions,
      decisions: fighter.stats.decisions,
      winStreak: fighter.stats.winStreak,
    },
    achievements: (fighter.achievements ?? []).join('\n')
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Transform the data to match the schema
    const submitData: any = {
      name: formData.name,
      nickname: formData.nickname,
      record: formData.record,
      age: parseInt(formData.age, 10) || 0,
      height: formData.height,
      reach: formData.reach,
      weight: formData.weight,
      hometown: formData.hometown,
      featured: formData.featured,
      stats: {
        knockouts: parseInt(formData.stats.knockouts) || 0,
        submissions: parseInt(formData.stats.submissions) || 0,
        decisions: parseInt(formData.stats.decisions) || 0,
        winStreak: parseInt(formData.stats.winStreak) || 0,
      },
      achievements: formData.achievements
        .split('\n')
        .map((achievement: string) => achievement.trim())
        .filter((achievement: string) => achievement.length > 0)
    }

    if (formData.slug && formData.slug.trim()) {
      submitData.slug = formData.slug.trim().toLowerCase().replace(/\s+/g, '-')
    }
    if (formData.bio && formData.bio.trim()) {
      submitData.bio = formData.bio.trim()
    }
    if (formData.image && formData.image.trim()) {
      submitData.image = formData.image.trim()
    }
    submitData.images = formData.images

    await onSubmit(submitData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name" className="text-gray-300">Full Name</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-nickname" className="text-gray-300">Nickname</Label>
          <Input
            id="edit-nickname"
            value={formData.nickname}
            onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-slug" className="text-gray-300">Profile Slug</Label>
        <Input
          id="edit-slug"
          value={formData.slug}
          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
          placeholder="e.g. john-smith"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-bio" className="text-gray-300">Bio <span className="text-gray-500 font-normal">(optional)</span></Label>
        <Textarea
          id="edit-bio"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          rows={3}
          placeholder="Short fighter biography shown on their profile page"
        />
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

      <ImageUpload
        label="Fighter Image"
        value={formData.image}
        onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
        folder="fighters"
        optional
      />

      <div className="space-y-4">
        <Label className="text-gray-300 text-base font-medium">Fight Statistics</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="knockouts" className="text-gray-300">Knockouts</Label>
            <Input
              id="knockouts"
              type="number"
              value={formData.stats.knockouts}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                stats: { ...prev.stats, knockouts: e.target.value }
              }))}
              className="bg-gray-800 border-gray-700 text-white"
              min="0"
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="submissions" className="text-gray-300">Submissions</Label>
            <Input
              id="submissions"
              type="number"
              value={formData.stats.submissions}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                stats: { ...prev.stats, submissions: e.target.value }
              }))}
              className="bg-gray-800 border-gray-700 text-white"
              min="0"
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="decisions" className="text-gray-300">Decisions</Label>
            <Input
              id="decisions"
              type="number"
              value={formData.stats.decisions}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                stats: { ...prev.stats, decisions: e.target.value }
              }))}
              className="bg-gray-800 border-gray-700 text-white"
              min="0"
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="winStreak" className="text-gray-300">Win Streak</Label>
            <Input
              id="winStreak"
              type="number"
              value={formData.stats.winStreak}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                stats: { ...prev.stats, winStreak: e.target.value }
              }))}
              className="bg-gray-800 border-gray-700 text-white"
              min="0"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, featured: !!checked }))}
          className="border-gray-600"
        />
        <Label htmlFor="featured" className="text-gray-300">Featured Fighter (display prominently on homepage)</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="achievements" className="text-gray-300">Achievements</Label>
        <Textarea
          id="achievements"
          value={formData.achievements}
          onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          rows={4}
          placeholder="Enter achievements, one per line&#10;Regional Champion&#10;Fighter of the Year 2023&#10;Knockout of the Night"
        />
        <p className="text-xs text-gray-500">Enter each achievement on a new line</p>
      </div>

      <MultiImageUpload
        label="Photo Gallery"
        values={formData.images}
        onChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
        folder="fighters"
      />

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
            'Update Fighter'
          )}
        </Button>
      </div>
    </form>
  )
}

function ViewFighterModal({ fighter }: { fighter: any }) {
  return (
    <div className="space-y-4">
      {fighter.image && (
        <div className="flex justify-center">
          <img
            src={fighter.image}
            alt={fighter.name}
            className="max-h-48 w-auto rounded-md border border-gray-700 object-contain"
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Name:</h3>
          <p className="text-gray-300">{fighter.name}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Nickname:</h3>
          <p className="text-gray-300">"{fighter.nickname}"</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Record:</h3>
          <p className="text-gray-300">{fighter.record}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Age:</h3>
          <p className="text-gray-300">{fighter.age}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Weight:</h3>
          <p className="text-gray-300">{fighter.weight}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Height:</h3>
          <p className="text-gray-300">{fighter.height}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Reach:</h3>
          <p className="text-gray-300">{fighter.reach}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Hometown:</h3>
          <p className="text-gray-300">{fighter.hometown}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Weight Class:</h3>
          <p className="text-gray-300">{fighter.weightClass}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Win Streak:</h3>
          <p className="text-gray-300">{fighter.stats.winStreak}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Featured:</h3>
          <p className={`font-medium ${fighter.featured ? 'text-green-400' : 'text-gray-400'}`}>
            {fighter.featured ? 'Yes (Featured on homepage)' : 'No'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Fight Statistics:</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-300">Knockouts: {fighter.stats.knockouts}</p>
          </div>
          <div>
            <p className="text-gray-300">Submissions: {fighter.stats.submissions}</p>
          </div>
          <div>
            <p className="text-gray-300">Decisions: {fighter.stats.decisions}</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Achievements:</h3>
        <ul className="list-disc list-inside text-gray-300">
          {fighter.achievements.map((achievement: string, index: number) => (
            <li key={index}>{achievement}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
