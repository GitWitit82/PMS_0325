"use client"

import { forwardRef } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface ControlledTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  maxLength?: number
  showCount?: boolean
}

/**
 * Controlled textarea component with validation
 */
export const ControlledTextArea = forwardRef<HTMLTextAreaElement, ControlledTextAreaProps>(
  ({
    className,
    label,
    error,
    helperText,
    maxLength,
    showCount,
    value = "",
    onChange,
    ...props
  }, ref) => {
    const charCount = String(value).length
    const isOverLimit = maxLength ? charCount > maxLength : false

    return (
      <div className="space-y-2">
        {label && (
          <Label
            htmlFor={props.id}
            className={cn(error && "text-destructive")}
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Textarea
          ref={ref}
          value={value}
          onChange={onChange}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          {...props}
        />
        <div className="flex justify-between text-sm">
          {(error || helperText) && (
            <p
              id={error ? `${props.id}-error` : `${props.id}-helper`}
              className={cn(
                "text-sm",
                error ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {error || helperText}
            </p>
          )}
          {showCount && maxLength && (
            <p
              className={cn(
                "text-sm text-muted-foreground",
                isOverLimit && "text-destructive"
              )}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

ControlledTextArea.displayName = "ControlledTextArea" 