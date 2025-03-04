"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterConfig<T> {
  field: keyof T
  type: "text" | "select" | "number" | "date"
  label: string
  options?: { label: string; value: string }[] // For select type
}

interface WithFilteringProps<T> {
  data: T[]
  filters: FilterConfig<T>[]
}

/**
 * HOC to add filtering capabilities to data views
 * @param Component - Component to wrap
 */
export function withFiltering<T extends object, P extends WithFilteringProps<T>>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithFiltering(props: P) {
    const [filterValues, setFilterValues] = useState<Record<string, any>>({})

    const filteredData = props.data.filter(item => {
      return Object.entries(filterValues).every(([field, value]) => {
        if (!value) return true
        const itemValue = item[field as keyof T]
        
        if (typeof value === "string") {
          return String(itemValue)
            .toLowerCase()
            .includes(value.toLowerCase())
        }
        
        return itemValue === value
      })
    })

    const handleFilterChange = (field: string, value: any) => {
      setFilterValues(prev => ({
        ...prev,
        [field]: value
      }))
    }

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {props.filters.map(filter => (
            <div key={String(filter.field)} className="space-y-2">
              <Label>{filter.label}</Label>
              {filter.type === "select" ? (
                <Select
                  value={filterValues[String(filter.field)] || ""}
                  onValueChange={(value) => 
                    handleFilterChange(String(filter.field), value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options?.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={filter.type}
                  value={filterValues[String(filter.field)] || ""}
                  onChange={(e) => 
                    handleFilterChange(String(filter.field), e.target.value)
                  }
                  placeholder={`Filter by ${filter.label.toLowerCase()}...`}
                />
              )}
            </div>
          ))}
        </div>
        <WrappedComponent {...props} data={filteredData} />
      </div>
    )
  }
} 