"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { useFightersQuery, useCreateFighterMutation, useUpdateFighterMutation, useDeleteFighterMutation } from "@/hooks/use-queries"
import { LoadingCard, ErrorCard } from "./loading-card"

interface FightersSectionProps {
  searchTerm: string
}

export default function FightersSection({ searchTerm }: FightersSectionProps) {
  const { data: fighters = [], isLoading, error } = useFightersQuery()
  const { mutate: createFighter, isPending: isCreating } = useCreateFighterMutation()
  const { mutate: updateFighter, isPending: isUpdating } = useUpdateFighterMutation()
  const { mutate: deleteFighter, isPending: isDeleting } = useDeleteFighterMutation()
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
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-red-600 text-red-400 hover:bg-red-900/20" 
                  onClick={() => deleteFighter(fighter._id)}
                  disabled={isDeleting}
                >
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

function CreateFighterForm({ onSubmit, isLoading, onClose }: { onSubmit: (data: any) => void, isLoading: boolean, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    record: '',
    age: '',
    height: '',
    reach: '',
    weight: '',
    hometown: '',
    image: '',
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
      age: parseInt(formData.age),
      height: formData.height,
      reach: formData.reach,
      weight: formData.weight,
      hometown: formData.hometown,
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
    
    // Only include image if it has a value
    if (formData.image && formData.image.trim()) {
      submitData.image = formData.image.trim()
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

      <div className="space-y-2">
        <Label htmlFor="image" className="text-gray-300">Image URL (Optional)</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="https://example.com/fighter-image.jpg"
        />
      </div>

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
