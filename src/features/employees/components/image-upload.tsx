"use client"

import { Button } from "@/components/ui/button"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useState } from "react"
import { toast } from "sonner"
import { Upload } from "lucide-react"
import Image from "next/image"
import { Id } from "../../../../convex/_generated/dataModel"
import { PreviewImage } from "./preview-image"

interface ImageUploadProps {
    userId?: Id<"users">
    imageStorageId?: Id<"_storage">
    imageUrl?: string | null
    onUploadComplete?: (storageId: Id<"_storage">) => void
    onFileSelect?: (file: File) => void
    previewMode?: boolean
}

export function ImageUpload({
    userId,
    imageStorageId,
    imageUrl,
    onUploadComplete,
    onFileSelect,
    previewMode = false
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const generateUploadUrl = useMutation(api.users.generateUploadUrl)
    const updateProfileImage = useMutation(api.users.updateProfileImage)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (previewMode) {
            setSelectedFile(file)
            onFileSelect?.(file)
            return
        }

        try {
            setUploading(true)
            const postUrl = await generateUploadUrl()

            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            })
            const { storageId } = await result.json()

            if (userId) {
                await updateProfileImage({
                    userId,
                    storageId,
                })
                toast.success("Profile image updated successfully")
                onUploadComplete?.(storageId)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to upload image")
        } finally {
            setUploading(false)
        }
    }

    const removePreview = () => {
        setSelectedFile(null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onFileSelect?.(null as any)
    }

    const imageKey = imageUrl || imageStorageId || 'default'

    return (
        <div className="flex flex-col items-center gap-4">
            {previewMode && selectedFile ? (
                <PreviewImage file={selectedFile} onRemove={removePreview} />
            ) : (imageUrl || imageStorageId) && (
                <div className="relative w-32 h-32 rounded-full overflow-hidden">
                    <Image
                        key={imageKey}
                        src={imageUrl || `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${imageStorageId}`}
                        alt="Profile"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
            )}

            <Button
                variant="outline"
                disabled={uploading}
                className="cursor-pointer"
                asChild
            >
                <label className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload Image"}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
            </Button>
        </div>
    )
}
