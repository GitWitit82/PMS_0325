"use client"

import { ComponentType, useState, useMemo, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export interface WithFilteringProps<T> {
  data: T[]
  filterableFields?: (keyof T)[]
  onFilterChange?: (filteredData: T[]) => void
}

/**
 * HOC to add filtering capabilities to data views
 * @param Component - Component to wrap
 */
export function withFiltering<T extends Record<string, unknown>>(
  WrappedComponent: ComponentType<{ data: T[] }>
) {
  return function WithFilteringComponent({
    data,
    filterableFields = [],
    onFilterChange,
    ...props
  }: WithFilteringProps<T>) {
    const [filters, setFilters] = useState<Record<string, string>>({})
    const [searchTerm, setSearchTerm] = useState("")

    const handleFilterChange = (field: keyof T, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

    const handleSearchChange = (value: string) => {
      setSearchTerm(value)
    }

    const filteredData = useMemo(() => {
      return data.filter((item) => {
        // Apply field-specific filters
        const passesFieldFilters = Object.entries(filters).every(
          ([field, filterValue]) => {
            if (!filterValue) return true
            const itemValue = String(item[field]).toLowerCase()
            return itemValue.includes(filterValue.toLowerCase())
          }
        )

        // Apply global search
        const passesSearch = searchTerm
          ? Object.values(item).some(
              (val) =>
                val &&
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
          : true

        return passesFieldFilters && passesSearch
      })
    }, [data, filters, searchTerm])

    useEffect(() => {
      onFilterChange?.(filteredData)
    }, [filteredData, onFilterChange])

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full md:w-auto"
          />
          {filterableFields.map((field) => (
            <Select
              key={String(field)}
              onValueChange={(value) => handleFilterChange(field, value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={`Filter by ${String(field)}`} />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  new Set(data.map((item) => String(item[field])))
                ).map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          {Object.keys(filters).length > 0 && (
            <Button
              variant="outline"
              onClick={() => setFilters({})}
              className="w-full md:w-auto"
            >
              Clear Filters
            </Button>
          )}
        </div>
        <WrappedComponent data={filteredData} {...props} />
      </div>
    )
  }
} 