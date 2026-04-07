import { useState } from "react"
import { useEventsQuery, useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation } from "@/hooks/use-queries"
import { LoadingCard, ErrorCard } from "./loading-card"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Power } from "lucide-react"
import { CreateEventForm, EditEventForm, ViewEventModal } from "./events"

export default function EventsSection({ searchTerm }: { searchTerm: string }) {
  const { data: events = [], isLoading, error } = useEventsQuery()
  const { mutate: createEvent, isPending: isCreating } = useCreateEventMutation()
  const { mutate: updateEvent, isPending: isUpdating } = useUpdateEventMutation()
  const { mutate: deleteEvent } = useDeleteEventMutation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'past'>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')

  if (isLoading) return <LoadingCard />
  if (error) return <ErrorCard />

  const years = [...new Set(events.map((e: any) => new Date(e.date).getFullYear().toString()))]
    .sort((a, b) => Number(b) - Number(a))

  const filteredEvents = events
    .filter((event: any) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' ? true :
        statusFilter === 'active' ? event.isActive && !event.isPastEvent :
        event.isPastEvent
      const matchesYear =
        yearFilter === 'all' ? true :
        new Date(event.date).getFullYear().toString() === yearFilter
      return matchesSearch && matchesStatus && matchesYear
    })
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-4">
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
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new combat sports event to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              <CreateEventForm onSubmit={createEvent} isLoading={isCreating} onClose={() => setIsCreateDialogOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Event Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription className="text-gray-400">Update the event details</DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              {selectedEvent && (
                <EditEventForm
                  event={selectedEvent}
                  onSubmit={(data) => {
                    console.log('data:', data)
                    const updateData = { ...data, id: selectedEvent._id }
                    updateEvent(updateData)
                    setIsEditDialogOpen(false)
                    setSelectedEvent(null)
                  }}
                  isLoading={isUpdating}
                  onClose={() => {
                    setIsEditDialogOpen(false)
                    setSelectedEvent(null)
                  }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* View Event Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Event Details</DialogTitle>
              <DialogDescription className="text-gray-400">View event information</DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              {selectedEvent && <ViewEventModal event={selectedEvent} />}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-md overflow-hidden border border-gray-700">
          {(['all', 'active', 'past'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                statusFilter === f
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {years.length > 0 && (
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-300 h-8 w-28 text-xs">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all" className="text-white text-xs">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year} className="text-white text-xs">{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <span className="text-gray-500 text-xs ml-auto">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto rounded-md border border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Title</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Date</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">City</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Status</th>
              <th className="text-right py-3 px-4 text-xs font-medium uppercase text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">No events found</td>
              </tr>
            ) : (
              filteredEvents.map((event: any) => (
                <tr key={event._id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 px-4 text-white font-medium">{event.title}</td>
                  <td className="py-3 px-4 text-gray-300 whitespace-nowrap">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{event.city || event.location || '—'}</td>
                  <td className="py-3 px-4">
                    {event.isPastEvent ? (
                      <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">Past</Badge>
                    ) : event.isActive ? (
                      <Badge className="bg-green-700/30 text-green-400 border-0 text-xs">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="border-yellow-700 text-yellow-500 text-xs">Inactive</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                        title="View"
                        onClick={() => { setSelectedEvent(event); setIsViewDialogOpen(true) }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                        title="Edit"
                        onClick={() => { setSelectedEvent(event); setIsEditDialogOpen(true) }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-7 w-7 p-0 hover:bg-gray-700 ${
                          event.isActive ? 'text-green-400 hover:text-red-400' : 'text-gray-500 hover:text-green-400'
                        }`}
                        title={event.isActive ? 'Deactivate' : 'Activate'}
                        onClick={() => updateEvent({ id: event._id, isActive: !event.isActive })}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                        title="Delete"
                        onClick={() => {
                          if (window.confirm(`Delete "${event.title}"? This cannot be undone.`)) {
                            deleteEvent(event._id)
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
