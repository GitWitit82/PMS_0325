"use client"

import { Component, ErrorInfo, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary component for catching and handling component errors
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive">
          <h2>Something went wrong</h2>
          <details className="mt-2 text-sm">
            <summary>Error details</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {this.state.error?.message}
            </pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * HOC to add error boundary to components
 * @param Component - Component to wrap
 * @param fallback - Optional fallback UI
 */
export function withErrorBoundary<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: T) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
} 