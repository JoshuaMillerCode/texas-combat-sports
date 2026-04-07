"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Eye, Loader2, Tag, PlusCircle } from "lucide-react"
import { useTicketTiersQuery, useCreateTicketTierMutation, useUpdateTicketTierMutation, useDeleteTicketTierMutation, useEventsQuery, useStripePricesQuery } from "@/hooks/use-queries"
import { formatAmountForDisplay } from "@/lib/stripe"
import { LoadingCard, ErrorCard } from "./loading-card"

interface TicketTiersSectionProps {
  searchTerm: string
}

export default function TicketTiersSection({ searchTerm }: TicketTiersSectionProps) {
  const { data: ticketTiers = [], isLoading, error } = useTicketTiersQuery()
  const { mutate: createTicketTier, isPending: isCreating } = useCreateTicketTierMutation()
  const { mutate: updateTicketTier, isPending: isUpdating } = useUpdateTicketTierMutation()
  const { mutate: deleteTicketTier, isPending: isDeleting } = useDeleteTicketTierMutation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<any>(null)

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
                Add a new ticket tier for events
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              <CreateTicketTierForm onSubmit={createTicketTier} isLoading={isCreating} onClose={() => setIsCreateDialogOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Ticket Tier Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edit Ticket Tier</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update the ticket tier details
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              {selectedTier && (
                <EditTicketTierForm 
                  tier={selectedTier} 
                  onSubmit={(data: any) => {
                    const updateData = { ...data, id: selectedTier._id }
                    updateTicketTier(updateData)
                    setIsEditDialogOpen(false)
                    setSelectedTier(null)
                  }} 
                  isLoading={isUpdating} 
                  onClose={() => {
                    setIsEditDialogOpen(false)
                    setSelectedTier(null)
                  }} 
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* View Ticket Tier Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Ticket Tier Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                View ticket tier information
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              {selectedTier && <ViewTicketTierModal tier={selectedTier} />}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ticket Tiers Table */}
      <div className="overflow-x-auto rounded-md border border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Name</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Event</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Price</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Available</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Sort</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Status</th>
              <th className="text-right py-3 px-4 text-xs font-medium uppercase text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTicketTiers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">No ticket tiers found</td>
              </tr>
            ) : (
              filteredTicketTiers.map((tier: any) => (
                <tr key={tier._id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 px-4 text-white font-medium">{tier.name}</td>
                  <td className="py-3 px-4 text-gray-300">{tier.event?.title || <span className="text-gray-600">—</span>}</td>
                  <td className="py-3 px-4 text-gray-300 font-mono">{formatAmountForDisplay(tier.price, 'USD')}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {tier.availableQuantity ?? tier.quantity ?? '—'}
                    {tier.maxQuantity ? <span className="text-gray-600"> / {tier.maxQuantity}</span> : ''}
                  </td>
                  <td className="py-3 px-4 text-gray-500">{tier.sortOrder ?? '—'}</td>
                  <td className="py-3 px-4">
                    {tier.isActive ? (
                      <Badge className="bg-green-700/30 text-green-400 border-0 text-xs">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-600 text-gray-500 text-xs">Inactive</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                        title="View"
                        onClick={() => { setSelectedTier(tier); setIsViewDialogOpen(true) }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                        title="Edit"
                        onClick={() => { setSelectedTier(tier); setIsEditDialogOpen(true) }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                        title="Delete"
                        onClick={() => {
                          if (window.confirm(`Delete tier "${tier.name}"? This cannot be undone.`)) {
                            deleteTicketTier(tier._id)
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
      price: parseFloat(formData.price), // Store price as entered
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

function EditTicketTierForm({ tier, onSubmit, isLoading, onClose }: { tier: any, onSubmit: (data: any) => void, isLoading: boolean, onClose: () => void }) {
  const { data: events = [] } = useEventsQuery()
  const { data: stripePricesData, isLoading: isLoadingPrices, isError: isPricesError } = useStripePricesQuery(tier._id)

  // 'existing' = pick from list, 'new' = enter custom amount
  const [priceMode, setPriceMode] = useState<'existing' | 'new'>('existing')
  const [selectedPriceId, setSelectedPriceId] = useState<string>(tier.stripePriceId || '')
  const [newPriceAmount, setNewPriceAmount] = useState('')

  const [formData, setFormData] = useState({
    event: tier.event?._id || '',
    name: tier.name || '',
    description: tier.description || '',
    quantity: tier.quantity?.toString() || '',
    features: Array.isArray(tier.features) ? tier.features.join('\n') : '',
    isActive: tier.isActive !== undefined ? tier.isActive : true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const base: any = {
      event: formData.event,
      name: formData.name,
      description: formData.description,
      quantity: parseInt(formData.quantity, 10),
      features: formData.features
        .split('\n')
        .map((f: string) => f.trim())
        .filter((f: string) => f.length > 0),
      isActive: formData.isActive,
    }

    if (priceMode === 'new') {
      const amount = parseFloat(newPriceAmount)
      if (isNaN(amount) || amount <= 0) return
      base.newPriceAmount = amount
    } else {
      base.stripePriceId = selectedPriceId
    }

    await onSubmit(base)
  }

  const prices: any[] = stripePricesData?.prices ?? []

  const formatPrice = (unitAmount: number, currency: string) => {
    const dollars = unitAmount / 100
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(dollars)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-gray-300">Event</Label>
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
        <Label className="text-gray-300">Tier Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          required
        />
      </div>

      {/* Price section */}
      <div className="space-y-3 rounded-md border border-gray-700 p-4 bg-gray-800/40">
        <div className="flex items-center justify-between">
          <Label className="text-gray-300 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" /> Price
          </Label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPriceMode('existing')}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                priceMode === 'existing'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              Existing
            </button>
            <button
              type="button"
              onClick={() => setPriceMode('new')}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                priceMode === 'new'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              <PlusCircle className="h-3 w-3" /> New
            </button>
          </div>
        </div>

        {priceMode === 'existing' ? (
          <div className="space-y-1.5">
            {isLoadingPrices ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm py-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading prices from Stripe…
              </div>
            ) : isPricesError ? (
              <p className="text-xs text-red-400">Failed to load prices from Stripe. Use "New" to create one or try reopening.</p>
            ) : prices.length === 0 ? (
              <p className="text-xs text-gray-500">No active prices found in Stripe. Use "New" to create one.</p>
            ) : (
              prices.map((p: any) => {
                const isCurrent = p.id === (stripePricesData?.currentPriceId ?? tier.stripePriceId)
                const isSelected = p.id === selectedPriceId
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-red-500 bg-red-900/20'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="stripePrice"
                      value={p.id}
                      checked={isSelected}
                      onChange={() => setSelectedPriceId(p.id)}
                      className="accent-red-500"
                    />
                    <span className="flex-1 text-white font-medium">
                      {formatPrice(p.unit_amount, p.currency)}
                    </span>
                    <span className="font-mono text-xs text-gray-500">{p.id}</span>
                    {isCurrent && (
                      <span className="text-xs bg-green-700/30 text-green-400 px-1.5 py-0.5 rounded">current</span>
                    )}
                  </label>
                )
              })
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="text-xs text-gray-400">
              A new Stripe price will be created and the current one archived.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">$</span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={newPriceAmount}
                onChange={(e) => setNewPriceAmount(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="50.00"
                required={priceMode === 'new'}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Description</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Available Quantity</Label>
        <Input
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Features & Benefits</Label>
        <Textarea
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
              Updating…
            </>
          ) : (
            'Update Tier'
          )}
        </Button>
      </div>
    </form>
  )
}

function ViewTicketTierModal({ tier }: { tier: any }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Tier Information</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-400 text-sm">Name</Label>
          <p className="text-white font-medium">{tier.name}</p>
        </div>
        <div>
          <Label className="text-gray-400 text-sm">Event</Label>
          <p className="text-white font-medium">{tier.event?.title || 'No event assigned'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-400 text-sm">Price</Label>
          <p className="text-white font-medium">{formatAmountForDisplay(tier.price, 'USD')}</p>
        </div>
        <div>
          <Label className="text-gray-400 text-sm">Available Quantity</Label>
          <p className="text-white font-medium">{tier.quantity}</p>
        </div>
      </div>

      <div>
        <Label className="text-gray-400 text-sm">Status</Label>
        <p className={`font-medium ${tier.isActive ? 'text-green-400' : 'text-red-400'}`}>
          {tier.isActive ? 'Active' : 'Inactive'}
        </p>
      </div>

      <div>
        <Label className="text-gray-400 text-sm">Description</Label>
        <p className="text-white font-medium">{tier.description || 'No description'}</p>
      </div>

      <div>
        <Label className="text-gray-400 text-sm">Features & Benefits</Label>
        <ul className="list-disc list-inside text-white mt-2">
          {tier.features && tier.features.length > 0 ? (
            tier.features.map((feature: string, index: number) => (
              <li key={index}>{feature}</li>
            ))
          ) : (
            <p className="text-gray-400">No features listed</p>
          )}
        </ul>
      </div>
    </div>
  )
} 