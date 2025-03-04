"use client"

import { useState } from "react"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WithSortingProps<T> {
  data: T[]
  sortKey?: keyof T
}

type SortDirection = "asc" | "desc"

/**
 * HOC to add sorting capabilities to components
 * @param Component - Component to wrap
 */
export function withSorting<T extends object, P extends WithSortingProps<T>>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithSorting(props: P) {
    const [sortConfig, setSortConfig] = useState<{
      key: keyof T
      direction: SortDirection
    } | null>(null)

    const sortedData = [...props.data].sort((a, b) => {
      if (!sortConfig) return 0

      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })

    const requestSort = (key: keyof T) => {
      let direction: SortDirection = "asc"
      if (sortConfig?.key === key && sortConfig.direction === "asc") {
        direction = "desc"
      }
      setSortConfig({ key, direction })
    }

    return (
      <div>
        {props.sortKey && (
          <Button
            variant="ghost"
            onClick={() => requestSort(props.sortKey as keyof T)}
            className="mb-4"
          >
            Sort by {String(props.sortKey)}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )}
        <WrappedComponent {...props} data={sortedData} />
      </div>
    )
  }
} 