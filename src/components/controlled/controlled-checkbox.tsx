"use client"

import { forwardRef } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ControlledCheckboxProps {
  id?: string
  label?: string
  checked?: boolean
  onChange: (checked: boolean) => void
  error?: string
  helperText?: string
  disabled?: boolean
  indeterminate?: boolean
  required?: boolean
  className?: string
}

/**
 * Controlled checkbox component with validation
 */
export const ControlledCheckbox = forwardRef<HTMLButtonElement, ControlledCheckboxProps>(
  ({
    id,
    label,
    checked,
    onChange,
    error,
    helperText,
    disabled = false,
    indeterminate = false,
    required = false,
    className,
  }, ref) => {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center space-x-2">
          <Checkbox
            ref={ref}
            id={id}
            checked={checked}
            onCheckedChange={onChange}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${id}-error` : helperText ? `${id}-helper` : undefined
            }
            required={required}
            data-state={indeterminate ? "indeterminate" : checked ? "checked" : "unchecked"}
          />
          {label && (
            <Label
              htmlFor={id}
              className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                error && "text-destructive"
              )}
            >
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
        </div>
        {error && (
          <p
            id={`${id}-error`}
            className="text-sm text-destructive"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${id}-helper`}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

ControlledCheckbox.displayName = "ControlledCheckbox" 