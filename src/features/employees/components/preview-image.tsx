"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PreviewImageProps {
  file: File
  onRemove: () => void
}

export function PreviewImage({ file, onRemove }: PreviewImageProps) {
  const previewUrl = URL.createObjectURL(file)

  return (
    <div className="relative w-32 h-32">
      <Image
        src={previewUrl}
        alt="Preview"
        fill
        className="rounded-full object-cover"
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
} 