"use client"

import { forwardRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SelectOption {
  label: string
  value: string
}

interface ControlledMultiSelectProps {
  id?: string
  label?: string
  options: SelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  helperText?: string
  placeholder?: string
  disabled?: boolean
  maxItems?: number
}

/**
 * Controlled multi-select component with validation
 */
export const ControlledMultiSelect = forwardRef<HTMLButtonElement, ControlledMultiSelectProps>(
  ({
    id,
    label,
    options,
    value = [],
    onChange,
    error,
    helperText,
    placeholder = "Select options...",
    disabled = false,
    maxItems,
  }, ref) => {
    const [open, setOpen] = useState(false)

    const selected = value.map(v => 
      options.find(option => option.value === v)
    ).filter(Boolean) as SelectOption[]

    const handleSelect = (optionValue: string) => {
      const isSelected = value.includes(optionValue)
      if (isSelected) {
        onChange(value.filter(v => v !== optionValue))
      } else if (!maxItems || value.length < maxItems) {
        onChange([...value, optionValue])
      }
    }

    const handleRemove = (optionValue: string) => {
      onChange(value.filter(v => v !== optionValue))
    }

    return (
      <div className="space-y-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              id={id}
              variant="outline"
              role="combobox"
              disabled={disabled}
              className={cn(
                "w-full justify-between",
                error && "border-destructive",
                !selected.length && "text-muted-foreground"
              )}
            >
              {selected.length > 0 ? (
                <div className="flex gap-1 flex-wrap">
                  {selected.map(option => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="mr-1"
                    >
                      {option.label}
                      <button
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRemove(option.value)
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onClick={() => handleRemove(option.value)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                placeholder
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search options..." />
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {options.map(option => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        value.includes(option.value)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <span className="h-4 w-4 shrink-0 opacity-100">
                        ✓
                      </span>
                    </div>
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
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

ControlledMultiSelect.displayName = "ControlledMultiSelect" 