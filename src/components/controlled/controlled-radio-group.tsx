"use client"

import { forwardRef } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

interface RadioOption {
  label: string
  value: string
  disabled?: boolean
}

interface ControlledRadioGroupProps {
  id?: string
  label?: string
  options: RadioOption[]
  value?: string
  onChange: (value: string) => void
  error?: string
  helperText?: string
  disabled?: boolean
  required?: boolean
  orientation?: "horizontal" | "vertical"
  className?: string
}

/**
 * Controlled radio group component with validation
 */
export const ControlledRadioGroup = forwardRef<HTMLDivElement, ControlledRadioGroupProps>(
  ({
    id,
    label,
    options,
    value,
    onChange,
    error,
    helperText,
    disabled = false,
    required = false,
    orientation = "vertical",
    className,
  }, ref) => {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label
            className={cn(error && "text-destructive")}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <RadioGroup
          ref={ref}
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          required={required}
          className={cn(
            orientation === "horizontal" ? "flex space-x-4" : "space-y-2"
          )}
        >
          {options.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option.value}
                id={`${id}-${option.value}`}
                disabled={option.disabled || disabled}
                aria-describedby={
                  error
                    ? `${id}-error`
                    : helperText
                    ? `${id}-helper`
                    : undefined
                }
              />
              <Label
                htmlFor={`${id}-${option.value}`}
                className="text-sm font-normal"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
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

ControlledRadioGroup.displayName = "ControlledRadioGroup" 