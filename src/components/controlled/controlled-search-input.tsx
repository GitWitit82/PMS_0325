"use client"

import { forwardRef, useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"

interface SearchSuggestion {
  id: string
  label: string
  value: string
}

interface ControlledSearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string
  error?: string
  helperText?: string
  suggestions?: SearchSuggestion[]
  isLoading?: boolean
  onSearch: (value: string) => void | Promise<void>
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
  debounceMs?: number
}

/**
 * Controlled search input component with suggestions
 */
export const ControlledSearchInput = forwardRef<HTMLInputElement, ControlledSearchInputProps>(
  ({
    className,
    label,
    error,
    helperText,
    suggestions = [],
    isLoading = false,
    onSearch,
    onSuggestionSelect,
    debounceMs = 300,
    disabled = false,
    required = false,
    ...props
  }, ref) => {
    const [value, setValue] = useState("")
    const [isFocused, setIsFocused] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const debouncedValue = useDebounce(value, debounceMs)

    useEffect(() => {
      if (debouncedValue) {
        onSearch(debouncedValue)
      }
    }, [debouncedValue, onSearch])

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setShowSuggestions(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
      setShowSuggestions(true)
    }

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
      setValue(suggestion.label)
      setShowSuggestions(false)
      onSuggestionSelect?.(suggestion)
    }

    const handleClear = () => {
      setValue("")
      setShowSuggestions(false)
      onSearch("")
    }

    return (
      <div ref={wrapperRef} className="space-y-2">
        {label && (
          <Label
            htmlFor={props.id}
            className={cn(error && "text-destructive")}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={ref}
              type="search"
              value={value}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              disabled={disabled}
              className={cn(
                "pl-8 pr-8",
                error && "border-destructive focus-visible:ring-destructive",
                className
              )}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
              }
              {...props}
            />
            {isLoading ? (
              <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin" />
            ) : value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md">
              <ul className="py-1">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    className="px-3 py-2 hover:bg-accent cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.label}
                  </li>
                ))}
              </ul>
            </div>
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

ControlledSearchInput.displayName = "ControlledSearchInput" 