"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Zap, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import CreateFlashSaleModal from "./flash-sales/create-flash-sale-modal"
import EditFlashSaleModal from "./flash-sales/edit-flash-sale-modal"
import { useToast } from "@/hooks/use-toast"
import { useFlashSalesQuery, useDeleteFlashSaleMutation, useUpdateFlashSaleMutation } from "@/hooks/use-queries"

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
  createdAt: string
  updatedAt: string
}

interface FlashSalesSectionProps {
  searchTerm: string
}

export default function FlashSalesSection({ searchTerm }: FlashSalesSectionProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "upcoming" | "past">("all")
  const { toast } = useToast()
  
  const { data: flashSalesData, isLoading, refetch } = useFlashSalesQuery(statusFilter)
  const deleteFlashSale = useDeleteFlashSaleMutation()
  const updateFlashSale = useUpdateFlashSaleMutation()

  const flashSales = flashSalesData?.flashSales || []

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flash sale?")) return

    try {
      await deleteFlashSale.mutateAsync(id)

      toast({
        title: "Success",
        description: "Flash sale deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting flash sale:", error)
      toast({
        title: "Error",
        description: "Failed to delete flash sale",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateFlashSale.mutateAsync({
        id,
        isActive: !currentStatus,
      })

      toast({
        title: "Success",
        description: `Flash sale ${!currentStatus ? "activated" : "deactivated"}`,
      })
    } catch (error) {
      console.error("Error toggling flash sale:", error)
      toast({
        title: "Error",
        description: "Failed to update flash sale status",
        variant: "destructive",
      })
    }
  }

  const getStatus = (sale: FlashSale) => {
    const now = new Date()
    const start = new Date(sale.startAt)
    const end = new Date(sale.endAt)

    if (!sale.isActive) return { label: "Inactive", color: "bg-gray-500" }
    if (now < start) return { label: "Upcoming", color: "bg-blue-500" }
    if (now > end) return { label: "Ended", color: "bg-gray-500" }
    return { label: "Active", color: "bg-green-500" }
  }

  const filteredSales = flashSales.filter(
    (sale: FlashSale) =>
      sale.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Zap className="w-8 h-8 text-red-500" />
            Flash Sales
          </h2>
          <p className="text-gray-400 mt-1">
            Manage limited-time ticket sales
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Flash Sale
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {(["all", "active", "upcoming", "past"] as const).map((status) => (
          <Button
            key={status}
            onClick={() => setStatusFilter(status)}
            variant={statusFilter === status ? "default" : "outline"}
            className={
              statusFilter === status
                ? "bg-red-600 hover:bg-red-700"
                : "border-gray-700 text-gray-300 hover:bg-gray-800"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : filteredSales.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="py-12">
            <p className="text-center text-gray-400">
              {searchTerm
                ? "No flash sales match your search"
                : "No flash sales yet. Create your first one!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSales.map((sale: FlashSale) => {
            const status = getStatus(sale)
            const now = new Date()
            const start = new Date(sale.startAt)
            const end = new Date(sale.endAt)
            const isCurrentlyActive = sale.isActive && now >= start && now <= end

            return (
              <Card
                key={sale._id}
                className={`bg-gray-800 border-gray-700 ${
                  isCurrentlyActive ? "ring-2 ring-red-500" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                          {isCurrentlyActive && <Zap className="w-5 h-5 text-red-500 fill-red-500" />}
                          {sale.title}
                        </CardTitle>
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            sale.isActive
                              ? "border-green-500 text-green-500"
                              : "border-gray-500 text-gray-500"
                          }
                        >
                          {sale.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Enabled
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Disabled
                            </>
                          )}
                        </Badge>
                      </div>
                      {sale.description && (
                        <CardDescription className="text-gray-400">
                          {sale.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {/* Time Information */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Start: {format(new Date(sale.startAt), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>End: {format(new Date(sale.endAt), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                    </div>

                    {/* Ticket Types */}
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Target Ticket Types:</p>
                      <div className="flex flex-wrap gap-2">
                        {sale.targetTicketTypes.map((typeId: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300">
                            {typeId}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Stripe Price IDs */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Sale Price ID:</p>
                        <code className="text-xs text-green-400 bg-gray-900 px-2 py-1 rounded">
                          {sale.stripePriceId}
                        </code>
                      </div>
                      <div>
                        <p className="text-gray-400">Original Price ID:</p>
                        <code className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded">
                          {sale.originalStripePriceId}
                        </code>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-700">
                      <Button
                        onClick={() => handleToggleActive(sale._id, sale.isActive)}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        {sale.isActive ? (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setEditingSale(sale)}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(sale._id)}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-400 hover:bg-red-600/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <CreateFlashSaleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />
      {editingSale && (
        <EditFlashSaleModal
          isOpen={!!editingSale}
          onClose={() => setEditingSale(null)}
          onSuccess={() => refetch()}
          flashSale={editingSale}
        />
      )}
    </div>
  )
}

