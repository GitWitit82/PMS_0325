"use client"

import { forwardRef, useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ControlledFileUploadProps {
  id?: string
  label?: string
  accept?: string
  maxSize?: number // in bytes
  multiple?: boolean
  error?: string
  helperText?: string
  disabled?: boolean
  required?: boolean
  className?: string
  onFilesChange: (files: File[]) => void
}

/**
 * Controlled file upload component with validation
 */
export const ControlledFileUpload = forwardRef<HTMLInputElement, ControlledFileUploadProps>(
  ({
    id,
    label,
    accept,
    maxSize,
    multiple = false,
    error,
    helperText,
    disabled = false,
    required = false,
    className,
    onFilesChange,
  }, ref) => {
    const [files, setFiles] = useState<File[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (selectedFiles: FileList | null) => {
      if (!selectedFiles) return

      const newFiles = Array.from(selectedFiles).filter(file => {
        if (maxSize && file.size > maxSize) {
          console.warn(`File ${file.name} exceeds maximum size`)
          return false
        }
        return true
      })

      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles
      setFiles(updatedFiles)
      onFilesChange(updatedFiles)
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = () => {
      setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFileSelect(e.dataTransfer.files)
    }

    const handleRemoveFile = (index: number) => {
      const updatedFiles = files.filter((_, i) => i !== index)
      setFiles(updatedFiles)
      onFilesChange(updatedFiles)
    }

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return "0 Bytes"
      const k = 1024
      const sizes = ["Bytes", "KB", "MB", "GB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
    }

    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label
            htmlFor={id}
            className={cn(error && "text-destructive")}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center",
            isDragging && "border-primary bg-primary/10",
            error && "border-destructive",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={ref || inputRef}
            type="file"
            id={id}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            required={required}
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            {isDragging ? "Drop files here" : "or drag and drop files here"}
          </p>
          {maxSize && (
            <p className="text-xs text-muted-foreground">
              Maximum file size: {formatFileSize(maxSize)}
            </p>
          )}
        </div>
        {files.length > 0 && (
          <ul className="mt-4 space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

ControlledFileUpload.displayName = "ControlledFileUpload" 