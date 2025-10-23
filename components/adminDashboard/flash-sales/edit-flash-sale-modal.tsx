"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useTicketTiersQuery, useUpdateFlashSaleMutation } from "@/hooks/use-queries"

interface FlashSale {
  _id: string
  title: string
  description?: string
  startAt: string
  endAt: string
  targetTicketTypes: string[]
  stripePriceId: string
  originalStripePriceId: string
  isActive: boolean
}

interface EditFlashSaleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  flashSale: FlashSale
}

export default function EditFlashSaleModal({
  isOpen,
  onClose,
  onSuccess,
  flashSale,
}: EditFlashSaleModalProps) {
  const { toast } = useToast()
  const { data: ticketTiersData, isLoading: loadingTiers } = useTicketTiersQuery()
  const updateFlashSale = useUpdateFlashSaleMutation()

  const [formData, setFormData] = useState({
    title: flashSale.title,
    description: flashSale.description || "",
    startAt: format(new Date(flashSale.startAt), "yyyy-MM-dd'T'HH:mm"),
    endAt: format(new Date(flashSale.endAt), "yyyy-MM-dd'T'HH:mm"),
    targetTicketTypes: flashSale.targetTicketTypes,
    stripePriceId: flashSale.stripePriceId,
    originalStripePriceId: flashSale.originalStripePriceId,
    isActive: flashSale.isActive,
  })

  const ticketTiers = ticketTiersData?.ticketTiers || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateFlashSale.mutateAsync({
        id: flashSale._id,
        ...formData,
        startAt: new Date(formData.startAt),
        endAt: new Date(formData.endAt),
      })

      toast({
        title: "Success",
        description: "Flash sale updated successfully",
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error updating flash sale:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update flash sale",
        variant: "destructive",
      })
    }
  }

  const toggleTicketType = (tierId: string) => {
    setFormData((prev) => ({
      ...prev,
      targetTicketTypes: prev.targetTicketTypes.includes(tierId)
        ? prev.targetTicketTypes.filter((id) => id !== tierId)
        : [...prev.targetTicketTypes, tierId],
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Flash Sale</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update flash sale details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-white">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startAt" className="text-white">
                Start Date & Time *
              </Label>
              <Input
                id="startAt"
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="endAt" className="text-white">
                End Date & Time *
              </Label>
              <Input
                id="endAt"
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          {/* Target Ticket Types */}
          <div>
            <Label className="text-white mb-3 block">Target Ticket Types *</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-700 rounded-lg p-3">
              {loadingTiers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-gray-400 text-sm ml-2">Loading ticket tiers...</span>
                </div>
              ) : ticketTiers.length === 0 ? (
                <p className="text-gray-400 text-sm">No ticket tiers available</p>
              ) : (
                ticketTiers.map((tier: any) => (
                  <label
                    key={tier._id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.targetTicketTypes.includes(tier._id)}
                      onChange={() => toggleTicketType(tier._id)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">{tier.name}</p>
                      <p className="text-gray-400 text-sm">{tier.tierId}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Stripe Price IDs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="originalStripePriceId" className="text-white">
                Original Stripe Price ID *
              </Label>
              <Input
                id="originalStripePriceId"
                value={formData.originalStripePriceId}
                onChange={(e) =>
                  setFormData({ ...formData, originalStripePriceId: e.target.value })
                }
                required
                className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="stripePriceId" className="text-white">
                Sale Stripe Price ID *
              </Label>
              <Input
                id="stripePriceId"
                value={formData.stripePriceId}
                onChange={(e) => setFormData({ ...formData, stripePriceId: e.target.value })}
                required
                className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="isActive" className="text-white cursor-pointer">
              Active
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateFlashSale.isPending}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateFlashSale.isPending || formData.targetTicketTypes.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {updateFlashSale.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Flash Sale"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

