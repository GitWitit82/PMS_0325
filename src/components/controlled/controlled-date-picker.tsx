"use client"

import { forwardRef } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ControlledDatePickerProps {
  id?: string
  label?: string
  value?: Date
  onChange: (date: Date | undefined) => void
  error?: string
  helperText?: string
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}

/**
 * Controlled date picker component with validation
 */
export const ControlledDatePicker = forwardRef<HTMLButtonElement, ControlledDatePickerProps>(
  ({
    id,
    label,
    value,
    onChange,
    error,
    helperText,
    placeholder = "Pick a date",
    disabled = false,
    minDate,
    maxDate,
  }, ref) => {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              id={id}
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal",
                error && "border-destructive",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "PPP") : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={onChange}
              disabled={disabled}
              fromDate={minDate}
              toDate={maxDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
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

ControlledDatePicker.displayName = "ControlledDatePicker" 