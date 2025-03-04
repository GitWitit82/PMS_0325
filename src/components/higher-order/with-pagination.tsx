"use client"

import { useState } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface WithPaginationProps<T> {
  data: T[]
  itemsPerPage?: number
}

/**
 * HOC to add pagination to components
 * @param Component - Component to wrap
 * @param itemsPerPage - Number of items per page
 */
export function withPagination<T, P extends WithPaginationProps<T>>(
  WrappedComponent: React.ComponentType<P>,
  defaultItemsPerPage = 10
) {
  return function WithPagination(props: P) {
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = props.itemsPerPage || defaultItemsPerPage
    const totalPages = Math.ceil(props.data.length / itemsPerPage)

    const paginatedData = props.data.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )

    return (
      <div>
        <WrappedComponent {...props} data={paginatedData} />
        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    )
  }
} 