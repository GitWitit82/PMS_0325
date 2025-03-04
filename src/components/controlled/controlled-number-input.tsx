"use client"

import { forwardRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface ControlledNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  label?: string
  value?: number
  onChange: (value: number) => void
  error?: string
  helperText?: string
  min?: number
  max?: number
  step?: number
  showControls?: boolean
  formatValue?: (value: number) => string
  parseValue?: (value: string) => number
}

/**
 * Controlled number input component with validation
 */
export const ControlledNumberInput = forwardRef<HTMLInputElement, ControlledNumberInputProps>(
  ({
    className,
    label,
    value,
    onChange,
    error,
    helperText,
    min,
    max,
    step = 1,
    showControls = false,
    disabled = false,
    required = false,
    formatValue = (v: number) => v.toString(),
    parseValue = (v: string) => parseFloat(v),
    ...props
  }, ref) => {
    const [localValue, setLocalValue] = useState(value?.toString() ?? "")
    const [isFocused, setIsFocused] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)

      if (newValue === "") {
        onChange(0)
        return
      }

      const parsedValue = parseValue(newValue)
      if (!isNaN(parsedValue)) {
        if (min !== undefined && parsedValue < min) return
        if (max !== undefined && parsedValue > max) return
        onChange(parsedValue)
      }
    }

    const handleBlur = () => {
      setIsFocused(false)
      if (localValue === "") {
        setLocalValue(formatValue(value ?? 0))
        return
      }

      const parsedValue = parseValue(localValue)
      if (isNaN(parsedValue)) {
        setLocalValue(formatValue(value ?? 0))
      } else {
        let finalValue = parsedValue
        if (min !== undefined) finalValue = Math.max(min, finalValue)
        if (max !== undefined) finalValue = Math.min(max, finalValue)
        setLocalValue(formatValue(finalValue))
        onChange(finalValue)
      }
    }

    const increment = () => {
      const newValue = (value ?? 0) + step
      if (max !== undefined && newValue > max) return
      onChange(newValue)
      setLocalValue(formatValue(newValue))
    }

    const decrement = () => {
      const newValue = (value ?? 0) - step
      if (min !== undefined && newValue < min) return
      onChange(newValue)
      setLocalValue(formatValue(newValue))
    }

    return (
      <div className="space-y-2">
        {label && (
          <Label
            htmlFor={props.id}
            className={cn(error && "text-destructive")}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <div className="flex items-center space-x-2">
          {showControls && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled || (min !== undefined && (value ?? 0) <= min)}
              onClick={decrement}
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
          <Input
            ref={ref}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={isFocused ? localValue : formatValue(value ?? 0)}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            disabled={disabled}
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
          {showControls && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled || (max !== undefined && (value ?? 0) >= max)}
              onClick={increment}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
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

ControlledNumberInput.displayName = "ControlledNumberInput" 