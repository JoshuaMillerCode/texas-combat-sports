"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Zap, CheckCircle, XCircle, Loader2, Power } from "lucide-react"
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

      {/* Flash Sales Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Title</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Start</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">End</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Enabled</th>
                <th className="text-right py-3 px-4 text-xs font-medium uppercase text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    {searchTerm ? "No flash sales match your search" : "No flash sales yet"}
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale: FlashSale) => {
                  const status = getStatus(sale)
                  const now = new Date()
                  const isCurrentlyActive = sale.isActive && now >= new Date(sale.startAt) && now <= new Date(sale.endAt)
                  return (
                    <tr
                      key={sale._id}
                      className={`border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors ${isCurrentlyActive ? 'ring-1 ring-inset ring-red-500/30' : ''}`}
                    >
                      <td className="py-3 px-4 text-white font-medium">
                        <div className="flex items-center gap-2">
                          {isCurrentlyActive && <Zap className="w-3.5 h-3.5 text-red-500 fill-red-500 flex-shrink-0" />}
                          {sale.title}
                        </div>
                        {sale.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{sale.description}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${status.color} text-white border-0 text-xs`}>{status.label}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-300 whitespace-nowrap text-xs">
                        {format(new Date(sale.startAt), "MMM d, yyyy h:mm a")}
                      </td>
                      <td className="py-3 px-4 text-gray-300 whitespace-nowrap text-xs">
                        {format(new Date(sale.endAt), "MMM d, yyyy h:mm a")}
                      </td>
                      <td className="py-3 px-4">
                        {sale.isActive ? (
                          <Badge className="bg-green-700/30 text-green-400 border-0 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-gray-600 text-gray-500 text-xs">
                            <XCircle className="w-3 h-3 mr-1" />Disabled
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm" variant="ghost"
                            className={`h-7 w-7 p-0 hover:bg-gray-700 ${sale.isActive ? 'text-green-400 hover:text-red-400' : 'text-gray-500 hover:text-green-400'}`}
                            title={sale.isActive ? 'Deactivate' : 'Activate'}
                            onClick={() => handleToggleActive(sale._id, sale.isActive)}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                            title="Edit"
                            onClick={() => setEditingSale(sale)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                            title="Delete"
                            onClick={() => handleDelete(sale._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
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

