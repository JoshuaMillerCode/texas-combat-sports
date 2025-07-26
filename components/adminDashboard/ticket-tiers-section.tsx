"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { useTicketTiersQuery, useCreateTicketTierMutation, useEventsQuery } from "@/hooks/use-queries"
import { formatAmountForDisplay } from "@/lib/stripe"
import { LoadingCard, ErrorCard } from "./loading-card"

interface TicketTiersSectionProps {
  searchTerm: string
}

export default function TicketTiersSection({ searchTerm }: TicketTiersSectionProps) {
  const { data: ticketTiers = [], isLoading, error } = useTicketTiersQuery()
  const { mutate: createTicketTier, isPending: isCreating } = useCreateTicketTierMutation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  if (isLoading) return <LoadingCard />
  if (error) return <ErrorCard />

  const filteredTicketTiers = ticketTiers.filter((tier: any) => 
    tier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tier.event?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Ticket Tiers</h2>
          <p className="text-gray-400">Manage ticket pricing and availability</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Tier
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Create New Ticket Tier</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new ticket tier with pricing and features
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              <CreateTicketTierForm onSubmit={createTicketTier} isLoading={isCreating} onClose={() => setIsCreateDialogOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ticket Tiers List */}
      <div className="space-y-4">
        {filteredTicketTiers.map((tier: any) => (
          <Card key={tier._id} className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-white font-semibold">{tier.name}</h3>
                  <p className="text-gray-400 text-sm">{tier.event?.title || 'Event TBD'}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-300">
                      Price: <span className="text-white font-semibold">
                        {formatAmountForDisplay(tier.price * 0.01, tier.currency)}
                      </span>
                    </span>
                    <span className="text-gray-300">
                      Available: <span className="text-white">{tier.availableQuantity}/{tier.maxQuantity}</span>
                    </span>
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

function CreateTicketTierForm({ onSubmit, isLoading, onClose }: { onSubmit: (data: any) => void, isLoading: boolean, onClose: () => void }) {
  const { data: events = [] } = useEventsQuery()
  const [formData, setFormData] = useState({
    event: '',
    tierId: '',
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    features: '',
    stripePriceId: '',
    maxQuantity: '',
    availableQuantity: '',
    isActive: true,
    sortOrder: '0'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Transform the data to match the schema
    const submitData: any = {
      event: formData.event,
      tierId: formData.tierId || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, ''),
      name: formData.name,
      price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
      currency: formData.currency,
      features: formData.features.split('\n').map(feature => feature.trim()).filter(feature => feature.length > 0),
      stripePriceId: formData.stripePriceId,
      maxQuantity: parseInt(formData.maxQuantity),
      availableQuantity: parseInt(formData.availableQuantity),
      isActive: formData.isActive,
      sortOrder: parseInt(formData.sortOrder)
    }
    
    // Only include description if provided
    if (formData.description && formData.description.trim()) {
      submitData.description = formData.description.trim()
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-300">Tier Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="General Admission"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tierId" className="text-gray-300">Tier ID</Label>
          <Input
            id="tierId"
            value={formData.tierId}
            onChange={(e) => setFormData(prev => ({ ...prev, tierId: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="auto-generated-from-name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          rows={2}
          placeholder="Brief description of this ticket tier"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-gray-300">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="50.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency" className="text-gray-300">Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="USD" className="text-white">USD</SelectItem>
              <SelectItem value="CAD" className="text-white">CAD</SelectItem>
              <SelectItem value="EUR" className="text-white">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder" className="text-gray-300">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stripePriceId" className="text-gray-300">Stripe Price ID</Label>
        <Input
          id="stripePriceId"
          value={formData.stripePriceId}
          onChange={(e) => setFormData(prev => ({ ...prev, stripePriceId: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="price_xxxxxxxxxxxxx"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxQuantity" className="text-gray-300">Total Tickets</Label>
          <Input
            id="maxQuantity"
            type="number"
            value={formData.maxQuantity}
            onChange={(e) => setFormData(prev => ({ ...prev, maxQuantity: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="100"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availableQuantity" className="text-gray-300">Available Tickets</Label>
          <Input
            id="availableQuantity"
            type="number"
            value={formData.availableQuantity}
            onChange={(e) => setFormData(prev => ({ ...prev, availableQuantity: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="100"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="features" className="text-gray-300">Features & Benefits</Label>
        <Textarea
          id="features"
          value={formData.features}
          onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          rows={4}
          placeholder="General seating access&#10;Event program included&#10;Access to concessions&#10;Free parking"
        />
        <p className="text-xs text-gray-500">Enter each feature on a new line</p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
          className="border-gray-600"
        />
        <Label htmlFor="isActive" className="text-gray-300">Active (available for purchase)</Label>
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
            'Create Tier'
          )}
        </Button>
      </div>
    </form>
  )
} 