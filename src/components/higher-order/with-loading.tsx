"use client"

import { Loader2 } from "lucide-react"

interface WithLoadingProps {
  loading?: boolean
}

/**
 * HOC to add loading state to components
 * @param Component - Component to wrap
 */
export function withLoading<T extends WithLoadingProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithLoading(props: T) {
    if (props.loading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }
} 