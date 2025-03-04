"use client"

import { forwardRef } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectOption {
  label: string
  value: string
}

interface ControlledSelectProps {
  id?: string
  label?: string
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  error?: string
  helperText?: string
  placeholder?: string
  disabled?: boolean
}

/**
 * Controlled select component with validation
 */
export const ControlledSelect = forwardRef<HTMLButtonElement, ControlledSelectProps>(
  ({ 
    id,
    label,
    options,
    value,
    onChange,
    error,
    helperText,
    placeholder = "Select an option",
    disabled = false,
  }, ref) => {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <Select
          value={value}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger
            ref={ref}
            id={id}
            className={error ? "border-destructive" : undefined}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

ControlledSelect.displayName = "ControlledSelect" 