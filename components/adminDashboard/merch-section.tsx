"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { useMerchQuery, useCreateMerchMutation } from "@/hooks/use-queries"
import { LoadingCard, ErrorCard } from "./loading-card"

interface MerchSectionProps {
  searchTerm: string
}

export default function MerchSection({ searchTerm }: MerchSectionProps) {
  const { data: merch = [], isLoading, error } = useMerchQuery()
  const { mutate: createMerch, isPending: isCreating } = useCreateMerchMutation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  if (isLoading) return <LoadingCard />
  if (error) return <ErrorCard />

  const filteredMerch = merch.filter((item: any) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Merchandise</h2>
          <p className="text-gray-400">Manage products and inventory</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new merchandise item to the store
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              <CreateMerchForm onSubmit={createMerch} isLoading={isCreating} onClose={() => setIsCreateDialogOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Merch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMerch.map((item: any) => (
          <Card key={item._id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
            <CardHeader>
              <CardTitle className="text-white">{item.name}</CardTitle>
              <CardDescription className="text-gray-400">{item.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Price:</span>
                  <span className="text-white font-semibold">${item.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Available:</span>
                  <span className={`font-medium ${item.inventory.available > 10 ? 'text-green-400' : 'text-orange-400'}`}>
                    {item.inventory.available}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Status:</span>
                  <Badge variant={item.isActive ? "default" : "secondary"} className={item.isActive ? "bg-green-900/30 text-green-400" : ""}>
                    {item.isActive ? "Active" : "Inactive"}
                  </Badge>
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
                <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/20">
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

function CreateMerchForm({ onSubmit, isLoading, onClose }: { onSubmit: (data: any) => void, isLoading: boolean, onClose: () => void }) {
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    stripePriceId: '',
    images: '',
    category: '',
    isNewArrival: false,
    isFeatured: false,
    isActive: true,
    inventory: {
      total: '',
      available: '',
      reserved: '0',
      lowStockThreshold: '10'
    },
    tags: '',
    weight: '',
    sortOrder: '0'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Transform the data to match the schema
    const submitData: any = {
      productId: formData.productId || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, ''),
      name: formData.name,
      price: parseFloat(formData.price),
      currency: formData.currency,
      stripePriceId: formData.stripePriceId,
      images: formData.images.split('\n').map(img => img.trim()).filter(img => img.length > 0),
      category: formData.category,
      isNewArrival: formData.isNewArrival,
      isFeatured: formData.isFeatured,
      isActive: formData.isActive,
      inventory: {
        total: parseInt(formData.inventory.total),
        available: parseInt(formData.inventory.available),
        reserved: parseInt(formData.inventory.reserved),
        lowStockThreshold: parseInt(formData.inventory.lowStockThreshold)
      },
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      sortOrder: parseInt(formData.sortOrder)
    }
    
    // Only include optional fields if provided
    if (formData.description && formData.description.trim()) {
      submitData.description = formData.description.trim()
    }
    if (formData.weight && formData.weight.trim()) {
      submitData.weight = parseFloat(formData.weight)
    }
    
    await onSubmit(submitData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-300">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="productId" className="text-gray-300">Product ID</Label>
          <Input
            id="productId"
            value={formData.productId}
            onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
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
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-gray-300">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
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
          <Label htmlFor="category" className="text-gray-300">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="Apparel, Accessories, etc."
            required
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

      <div className="space-y-2">
        <Label htmlFor="images" className="text-gray-300">Image URLs</Label>
        <Textarea
          id="images"
          value={formData.images}
          onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
          rows={3}
          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
          required
        />
        <p className="text-xs text-gray-500">Enter each image URL on a new line</p>
      </div>

      <div className="space-y-4">
        <Label className="text-gray-300 text-base font-medium">Inventory</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total" className="text-gray-300">Total Quantity</Label>
            <Input
              id="total"
              type="number"
              value={formData.inventory.total}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                inventory: { ...prev.inventory, total: e.target.value }
              }))}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="available" className="text-gray-300">Available</Label>
            <Input
              id="available"
              type="number"
              value={formData.inventory.available}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                inventory: { ...prev.inventory, available: e.target.value }
              }))}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reserved" className="text-gray-300">Reserved</Label>
            <Input
              id="reserved"
              type="number"
              value={formData.inventory.reserved}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                inventory: { ...prev.inventory, reserved: e.target.value }
              }))}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold" className="text-gray-300">Low Stock Alert</Label>
            <Input
              id="lowStockThreshold"
              type="number"
              value={formData.inventory.lowStockThreshold}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                inventory: { ...prev.inventory, lowStockThreshold: e.target.value }
              }))}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tags" className="text-gray-300">Tags</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="premium, limited-edition, sale"
          />
          <p className="text-xs text-gray-500">Separate tags with commas</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight" className="text-gray-300">Weight (grams, optional)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-gray-300 text-base font-medium">Product Settings</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
              className="border-gray-600"
            />
            <Label htmlFor="isActive" className="text-gray-300">Active</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: !!checked }))}
              className="border-gray-600"
            />
            <Label htmlFor="isFeatured" className="text-gray-300">Featured</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNewArrival"
              checked={formData.isNewArrival}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNewArrival: !!checked }))}
              className="border-gray-600"
            />
            <Label htmlFor="isNewArrival" className="text-gray-300">New Arrival</Label>
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
            'Create Product'
          )}
        </Button>
      </div>
    </form>
  )
}
