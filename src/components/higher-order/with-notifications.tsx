"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

type NotificationVariant = "default" | "success" | "error" | "warning" | "info"

interface Notification {
  id: string
  title: string
  message: string
  variant?: NotificationVariant
  action?: {
    label: string
    onClick: () => void
  }
  autoClose?: boolean
  duration?: number
}

interface WithNotificationsProps {
  notifications?: Notification[]
  onNotificationDismiss?: (id: string) => void
  onNotificationAction?: (id: string) => void
}

/**
 * HOC to add notification capabilities to components
 * @param Component - Component to wrap
 */
export function withNotifications<T extends WithNotificationsProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithNotifications(props: T) {
    const { toast } = useToast()
    const [activeNotifications, setActiveNotifications] = useState<Set<string>>(new Set())

    useEffect(() => {
      if (!props.notifications?.length) return

      props.notifications.forEach((notification) => {
        if (activeNotifications.has(notification.id)) return

        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.variant === "error" ? "destructive" : "default",
          action: notification.action && (
            <ToastAction
              altText={notification.action.label}
              onClick={() => {
                notification.action?.onClick()
                props.onNotificationAction?.(notification.id)
              }}
            >
              {notification.action.label}
            </ToastAction>
          ),
          duration: notification.autoClose === false ? Infinity : notification.duration || 5000,
          onOpenChange: (open) => {
            if (!open) {
              setActiveNotifications((prev) => {
                const next = new Set(prev)
                next.delete(notification.id)
                return next
              })
              props.onNotificationDismiss?.(notification.id)
            }
          },
        })

        setActiveNotifications((prev) => new Set([...prev, notification.id]))
      })
    }, [props.notifications, activeNotifications, toast])

    return <WrappedComponent {...props} />
  }
} 