"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Loader2, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

interface MultiImageUploadProps {
  label: string
  values: string[]
  onChange: (urls: string[]) => void
  folder?: string
}

export function MultiImageUpload({ label, values, onChange, folder = 'uploads' }: MultiImageUploadProps) {
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
      const signController = new AbortController()
      const signTimeout = setTimeout(() => signController.abort(), 10000)
      const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ folder }),
        signal: signController.signal,
      })
      clearTimeout(signTimeout)

      if (!signRes.ok) throw new Error('Failed to get upload signature')

      const { signature, timestamp, apiKey, cloudName, folder: signedFolder } = await signRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', String(timestamp))
      formData.append('signature', signature)
      formData.append('folder', signedFolder)

      const uploadController = new AbortController()
      const uploadTimeout = setTimeout(() => uploadController.abort(), 30000)
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData, signal: uploadController.signal }
      )
      clearTimeout(uploadTimeout)

      if (!uploadRes.ok) throw new Error('Upload failed')

      const data = await uploadRes.json()
      if (!data.secure_url) throw new Error('No URL in upload response')

      onChange([...values, data.secure_url])
    } catch (err: any) {
      setError('Upload failed. Please try again.')
      console.error(err)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <Label className="text-gray-300">
        {label}
        <span className="text-gray-500 font-normal ml-1">(Optional)</span>
      </Label>

      {values.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {values.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-gray-700 bg-gray-900 group">
              <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="150px" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/70 hover:bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
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
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          {isUploading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
          ) : (
            <><Plus className="h-4 w-4 mr-2" />Add Photo</>
          )}
        </Button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
