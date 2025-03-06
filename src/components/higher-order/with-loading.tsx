"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface WithLoadingProps {
  isLoading?: boolean
  loadingText?: string
}

/**
 * HOC to add loading state to components
 * @param Component - Component to wrap
 */
export function withLoading<T extends WithLoadingProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithLoadingComponent(props: T) {
    const { isLoading = false, loadingText = "Loading...", ...rest } = props
    const [showLoader, setShowLoader] = useState(false)

    useEffect(() => {
      let timeoutId: NodeJS.Timeout

      if (isLoading) {
        timeoutId = setTimeout(() => {
          setShowLoader(true)
        }, 300) // Show loader after 300ms to prevent flashing
      } else {
        setShowLoader(false)
      }

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }, [isLoading])

    if (showLoader) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">{loadingText}</span>
        </div>
      )
    }

    return <WrappedComponent {...(rest as T)} />
  }
} 