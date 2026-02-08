"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { useDollsQuery, useCreateDollMutation, useUpdateDollMutation, useDeleteDollMutation } from "@/hooks/use-queries"
import { LoadingCard, ErrorCard } from "./loading-card"
import Image from "next/image"

interface DollsSectionProps {
  searchTerm: string
}

export default function DollsSection({ searchTerm }: DollsSectionProps) {
  const { data: dolls = [], isLoading, error } = useDollsQuery()
  const { mutate: createDoll, isPending: isCreating } = useCreateDollMutation()
  const { mutate: updateDoll, isPending: isUpdating } = useUpdateDollMutation()
  const { mutate: deleteDoll, isPending: isDeleting } = useDeleteDollMutation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedDoll, setSelectedDoll] = useState<any>(null)

  if (isLoading) return <LoadingCard />
  if (error) return <ErrorCard />

  const filteredDolls = dolls.filter((doll: any) => 
    doll.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doll.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doll.instagram.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Dolls</h2>
          <p className="text-gray-400">Manage ring girl profiles</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Doll
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Create New Doll</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new ring girl to the roster
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              <CreateDollForm onSubmit={createDoll} isLoading={isCreating} onClose={() => setIsCreateDialogOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Doll Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edit Doll</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update the doll details
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              {selectedDoll && (
                <EditDollForm 
                  doll={selectedDoll} 
                  onSubmit={(data) => {
                    const updateData = { ...data, id: selectedDoll._id }
                    updateDoll(updateData)
                    setIsEditDialogOpen(false)
                    setSelectedDoll(null)
                  }} 
                  isLoading={isUpdating} 
                  onClose={() => {
                    setIsEditDialogOpen(false)
                    setSelectedDoll(null)
                  }} 
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* View Doll Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Doll Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                View doll information
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              {selectedDoll && <ViewDollModal doll={selectedDoll} />}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dolls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDolls.map((doll: any) => (
          <Card key={doll._id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
            <CardHeader>
              <CardTitle className="text-white">{doll.name}</CardTitle>
              <CardDescription className="text-gray-400">
                {doll.instagram}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {doll.image && (
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={doll.image}
                    alt={doll.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-gray-300 line-clamp-3">{doll.bio}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => {
                    setSelectedDoll(doll)
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
                    setSelectedDoll(doll)
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
                    if (confirm(`Are you sure you want to delete ${doll.name}?`)) {
                      deleteDoll(doll._id)
                    }
                  }}
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

function CreateDollForm({ onSubmit, isLoading, onClose }: { onSubmit: (data: any) => void, isLoading: boolean, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    bio: '',
    instagram: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData: any = {
      name: formData.name.trim(),
      image: formData.image.trim(),
      bio: formData.bio.trim(),
      instagram: formData.instagram.trim()
    }
    
    await onSubmit(submitData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-300">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image" className="text-gray-300">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="https://example.com/image.jpg"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-gray-300">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagram" className="text-gray-300">Instagram Handle</Label>
        <Input
          id="instagram"
          value={formData.instagram}
          onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="@username"
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
            'Create Doll'
          )}
        </Button>
      </div>
    </form>
  )
}

function EditDollForm({ doll, onSubmit, isLoading, onClose }: { doll: any, onSubmit: (data: any) => void, isLoading: boolean, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: doll.name || '',
    image: doll.image || '',
    bio: doll.bio || '',
    instagram: doll.instagram || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData: any = {
      name: formData.name.trim(),
      image: formData.image.trim(),
      bio: formData.bio.trim(),
      instagram: formData.instagram.trim()
    }
    
    await onSubmit(submitData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-300">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image" className="text-gray-300">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="https://example.com/image.jpg"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-gray-300">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagram" className="text-gray-300">Instagram Handle</Label>
        <Input
          id="instagram"
          value={formData.instagram}
          onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="@username"
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
              Updating...
            </>
          ) : (
            'Update Doll'
          )}
        </Button>
      </div>
    </form>
  )
}

function ViewDollModal({ doll }: { doll: any }) {
  return (
    <div className="space-y-4">
      {doll.image && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden">
          <Image
            src={doll.image}
            alt={doll.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-white">Name:</h3>
        <p className="text-gray-300">{doll.name}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">Instagram:</h3>
        <p className="text-gray-300">{doll.instagram}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">Bio:</h3>
        <p className="text-gray-300">{doll.bio}</p>
      </div>
    </div>
  )
}
