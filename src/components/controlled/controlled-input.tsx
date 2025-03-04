"use client"

import { forwardRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ControlledInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

/**
 * Controlled input component with validation
 */
export const ControlledInput = forwardRef<HTMLInputElement, ControlledInputProps>(
  ({ className, label, error, helperText, type = "text", ...props }, ref) => {
    const [focused, setFocused] = useState(false)

    return (
      <div className="space-y-2">
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <Input
          type={type}
          className={cn(
            error && "border-destructive",
            focused && "ring-2 ring-ring ring-offset-2",
            className
          )}
          ref={ref}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p
            id={`${props.id}-error`}
            className="text-sm text-destructive"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${props.id}-helper`}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

ControlledInput.displayName = "ControlledInput" 