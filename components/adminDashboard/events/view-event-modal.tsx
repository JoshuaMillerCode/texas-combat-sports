import { Label } from "@/components/ui/label"

interface ViewEventModalProps {
  event: any
}

export function ViewEventModal({ event }: ViewEventModalProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Event Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-400 text-sm">Title</Label>
            <p className="text-white font-medium">{event.title}</p>
          </div>
          <div>
            <Label className="text-gray-400 text-sm">Subtitle</Label>
            <p className="text-white font-medium">{event.subtitle || 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-400 text-sm">Date & Time</Label>
            <p className="text-white font-medium">
              {event.date ? new Date(event.date).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) : 'N/A'}
            </p>
          </div>
          <div>
            <Label className="text-gray-400 text-sm">Capacity</Label>
            <p className="text-white font-medium">{event.capacity || 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-400 text-sm">Venue</Label>
            <p className="text-white font-medium">{event.venue || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-gray-400 text-sm">City</Label>
            <p className="text-white font-medium">{event.city || 'N/A'}</p>
          </div>
        </div>

        <div>
          <Label className="text-gray-400 text-sm">Location</Label>
          <p className="text-white font-medium">{event.location || 'N/A'}</p>
        </div>

        <div>
          <Label className="text-gray-400 text-sm">Address</Label>
          <p className="text-white font-medium">{event.address || 'N/A'}</p>
        </div>

        <div>
          <Label className="text-gray-400 text-sm">Description</Label>
          <p className="text-white font-medium">{event.description || 'N/A'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-400 text-sm">Starting Ticket Price</Label>
            <p className="text-white font-medium">{event.ticketPrice || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-gray-400 text-sm">Slug</Label>
            <p className="text-white font-medium">{event.slug || 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-400 text-sm">Status</Label>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                event.isPastEvent ? 'bg-gray-600 text-gray-300' : 'bg-green-600 text-white'
              }`}>
                {event.isPastEvent ? 'Past Event' : 'Upcoming Event'}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                event.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {event.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Media URLs */}
      {(event.posterImage || event.heroVideo) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Media</h3>
          
          {event.posterImage && (
            <div>
              <Label className="text-gray-400 text-sm">Poster Image URL</Label>
              <p className="text-white font-medium break-all">{event.posterImage}</p>
            </div>
          )}
          
          {event.heroVideo && (
            <div>
              <Label className="text-gray-400 text-sm">Hero Video URL</Label>
              <p className="text-white font-medium break-all">{event.heroVideo}</p>
            </div>
          )}
        </div>
      )}

      {/* Fight Card */}
      {event.fights && event.fights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Fight Card</h3>
          <div className="space-y-2">
            {event.fights.map((fight: any, index: number) => (
              <div key={fight._id} className="p-3 bg-gray-800 rounded border border-gray-700">
                <p className="text-white font-medium">Fight {index + 1}: {fight.title}</p>
                {fight._id === event.mainEventFight?._id && (
                  <span className="text-red-400 text-sm">(Main Event)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Tiers */}
      {event.ticketTiers && event.ticketTiers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Ticket Tiers</h3>
          <div className="space-y-2">
            {event.ticketTiers.map((tier: any, index: number) => (
              <div key={tier._id} className="p-3 bg-gray-800 rounded border border-gray-700">
                <p className="text-white font-medium">Tier {index + 1}: {tier.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 