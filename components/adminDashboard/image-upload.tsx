"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

interface ImageUploadProps {
  label: string
  value: string
  onChange: (url: string) => void
  folder?: string
  required?: boolean
  optional?: boolean
}

export function ImageUpload({ label, value, onChange, folder = 'uploads', required, optional }: ImageUploadProps) {
  const { accessToken } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Get upload signature from our API
      const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ folder }),
      })

      if (!signRes.ok) throw new Error('Failed to get upload signature')

      const { signature, timestamp, apiKey, cloudName, folder: signedFolder } = await signRes.json()

      // Upload directly to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', String(timestamp))
      formData.append('signature', signature)
      formData.append('folder', signedFolder)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      )

      if (!uploadRes.ok) throw new Error('Upload failed')

      const data = await uploadRes.json()
      onChange(data.secure_url)
    } catch (err) {
      setError('Upload failed. Please try again or paste a URL below.')
      console.error(err)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-gray-300">
        {label}
        {optional && <span className="text-gray-500 font-normal ml-1">(Optional)</span>}
      </Label>

      {/* Preview */}
      {value && (
        <div className="relative w-full h-36 rounded-md overflow-hidden border border-gray-700 bg-gray-900">
          <Image src={value} alt="Preview" fill className="object-cover" sizes="400px" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
            title="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Upload button + file input */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-shrink-0"
        >
          {isUploading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
          ) : (
            <><Upload className="h-4 w-4 mr-2" />{value ? 'Replace' : 'Upload Image'}</>
          )}
        </Button>

        {/* URL fallback input */}
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="or paste URL"
          className="bg-gray-800 border-gray-700 text-white text-sm"
          required={required && !value}
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {!value && !error && (
        <p className="text-xs text-gray-600 flex items-center gap-1">
          <ImageIcon className="h-3 w-3" /> Upload a file or paste a Cloudinary URL
        </p>
      )}
    </div>
  )
}
