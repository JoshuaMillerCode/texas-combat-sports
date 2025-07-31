import { useState } from "react"
import { useFightsQuery, useTicketTiersQuery } from "@/hooks/use-queries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"

interface CreateEventFormProps {
  onSubmit: (data: any) => void
  isLoading: boolean
  onClose: () => void
}

export function CreateEventForm({ onSubmit, isLoading, onClose }: CreateEventFormProps) {
  const { data: fights = [] } = useFightsQuery()
  const { data: ticketTiers = [] } = useTicketTiersQuery()
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    subtitle: '',
    date: '',
    isPastEvent: false,
    isActive: true,
    location: '',
    address: '',
    venue: '',
    city: '',
    capacity: '',
    ticketPrice: '',
    posterImage: '',
    heroVideo: '',
    description: '',
    mainEventFight: '',
    fights: [] as string[],
    ticketTiers: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Transform the data to match the schema
    const submitData: any = {
      slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, ''),
      title: formData.title,
      subtitle: formData.subtitle,
      date: formData.date,
      isPastEvent: formData.isPastEvent,
      isActive: formData.isActive,
      location: formData.location,
      address: formData.address,
      venue: formData.venue,
      city: formData.city,
      capacity: formData.capacity,
      ticketPrice: formData.ticketPrice,
      description: formData.description,
      fights: [...new Set(formData.fights)], // Remove duplicates
      ticketTiers: [...new Set(formData.ticketTiers)] // Remove duplicates
    }
    
    // Only include mainEventFight if selected
    if (formData.mainEventFight) {
      submitData.mainEventFight = formData.mainEventFight
    }
    
    // Only include optional images/videos if provided
    if (formData.posterImage && formData.posterImage.trim()) {
      submitData.posterImage = formData.posterImage.trim()
    }
    if (formData.heroVideo && formData.heroVideo.trim()) {
      submitData.heroVideo = formData.heroVideo.trim()
    }
    
    await onSubmit(submitData)
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
          <Label htmlFor="slug" className="text-gray-300">Slug (URL)</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="auto-generated-from-title"
          />
        </div>
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
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-gray-300">Date & Time</Label>
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
            placeholder="1000"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="venue" className="text-gray-300">Venue</Label>
          <Input
            id="venue"
            value={formData.venue}
            onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="Toyota Center"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city" className="text-gray-300">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="Houston"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-gray-300">Location (General)</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="Houston, Texas"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-gray-300">Full Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="1510 Polk St, Houston, TX 77002"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ticketPrice" className="text-gray-300">Starting Ticket Price</Label>
        <Input
          id="ticketPrice"
          value={formData.ticketPrice}
          onChange={(e) => setFormData(prev => ({ ...prev, ticketPrice: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="$50"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="posterImage" className="text-gray-300">Poster Image URL (Optional)</Label>
          <Input
            id="posterImage"
            value={formData.posterImage}
            onChange={(e) => setFormData(prev => ({ ...prev, posterImage: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="https://example.com/poster.jpg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="heroVideo" className="text-gray-300">Hero Video URL (Optional)</Label>
          <Input
            id="heroVideo"
            value={formData.heroVideo}
            onChange={(e) => setFormData(prev => ({ ...prev, heroVideo: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="https://example.com/video.mp4"
          />
        </div>
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

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isPastEvent"
            checked={formData.isPastEvent}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPastEvent: checked as boolean }))}
            className="border-gray-600"
          />
          <Label htmlFor="isPastEvent" className="text-gray-300">Past Event</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked as boolean }))}
            className="border-gray-600"
          />
          <Label htmlFor="isActive" className="text-gray-300">Active Event</Label>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-gray-300 text-base font-medium">Fight Card</Label>
        
        <div className="space-y-2">
          <Label htmlFor="mainEventFight" className="text-gray-300">Main Event Fight (Optional)</Label>
          <Select value={formData.mainEventFight || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, mainEventFight: value === 'none' ? '' : value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select main event fight" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="none" className="text-white">None</SelectItem>
              {fights.map((fight: any) => (
                <SelectItem key={fight._id} value={fight._id} className="text-white">
                  {fight.fighter1?.name || 'TBD'} vs {fight.fighter2?.name || 'TBD'} - {fight.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Fight Card (Select all fights for this event)</Label>
          <div className="max-h-40 overflow-y-auto border border-gray-700 rounded-md p-2 bg-gray-800">
            {fights.length > 0 ? fights.map((fight: any) => (
              <div key={fight._id} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={`fight-${fight._id}`}
                  checked={formData.fights.includes(fight._id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData(prev => ({ 
                        ...prev, 
                        fights: prev.fights.includes(fight._id) 
                          ? prev.fights 
                          : [...prev.fights, fight._id] 
                      }))
                    } else {
                      setFormData(prev => ({ ...prev, fights: prev.fights.filter((id: string) => id !== fight._id) }))
                    }
                  }}
                  className="border-gray-600"
                />
                <Label htmlFor={`fight-${fight._id}`} className="text-gray-300 text-sm">
                  {fight.fighter1?.name || 'TBD'} vs {fight.fighter2?.name || 'TBD'} - {fight.title}
                  {fight.isMainEvent && <span className="text-red-400 ml-2">(Main Event)</span>}
                </Label>
              </div>
            )) : (
              <p className="text-gray-500 text-sm">No fights available. Create fights first.</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-gray-300 text-base font-medium">Ticket Tiers</Label>
        
        <div className="space-y-2">
          <Label className="text-gray-300">Available Ticket Tiers (Select all tiers for this event)</Label>
          <div className="max-h-40 overflow-y-auto border border-gray-700 rounded-md p-2 bg-gray-800">
            {ticketTiers.length > 0 ? ticketTiers.map((tier: any) => (
              <div key={tier._id} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={`tier-${tier._id}`}
                  checked={formData.ticketTiers.includes(tier._id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData(prev => ({ 
                        ...prev, 
                        ticketTiers: prev.ticketTiers.includes(tier._id) 
                          ? prev.ticketTiers 
                          : [...prev.ticketTiers, tier._id] 
                      }))
                    } else {
                      setFormData(prev => ({ ...prev, ticketTiers: prev.ticketTiers.filter((id: string) => id !== tier._id) }))
                    }
                  }}
                  className="border-gray-600"
                />
                <Label htmlFor={`tier-${tier._id}`} className="text-gray-300 text-sm">
                  {tier.name} - ${(tier.price / 100).toFixed(2)} ({tier.availableQuantity}/{tier.maxQuantity} available)
                </Label>
              </div>
            )) : (
              <p className="text-gray-500 text-sm">No ticket tiers available. Create ticket tiers first.</p>
            )}
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
            'Create Event'
          )}
        </Button>
      </div>
    </form>
  )
} 