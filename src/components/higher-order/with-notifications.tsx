"use client"

import { useEffect, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

type NotificationHandler = (message: string) => void

interface WithNotificationsProps {
  onSuccess?: (handler: NotificationHandler) => void
  onError?: (handler: NotificationHandler) => void
  onWarning?: (handler: NotificationHandler) => void
  onInfo?: (handler: NotificationHandler) => void
}

export function withNotifications<T extends WithNotificationsProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithNotificationsComponent(props: T) {
    const { onSuccess, onError, onWarning, onInfo, ...rest } = props

    const handleSuccess = useCallback((message: string) => {
      toast({
        title: "Success",
        description: message,
        variant: "default",
      })
    }, [])

    const handleError = useCallback((message: string) => {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }, [])

    const handleWarning = useCallback((message: string) => {
      toast({
        title: "Warning",
        description: message,
        variant: "default",
      })
    }, [])

    const handleInfo = useCallback((message: string) => {
      toast({
        title: "Info",
        description: message,
        variant: "default",
      })
    }, [])

    useEffect(() => {
      if (onSuccess) {
        onSuccess(handleSuccess)
      }
      if (onError) {
        onError(handleError)
      }
      if (onWarning) {
        onWarning(handleWarning)
      }
      if (onInfo) {
        onInfo(handleInfo)
      }
    }, [onSuccess, onError, onWarning, onInfo, handleSuccess, handleError, handleWarning, handleInfo])

    return <WrappedComponent {...(rest as T)} />
  }
} 