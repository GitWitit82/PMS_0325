"use client"

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  ReactNode,
} from "react"

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

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id">) => string
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

/**
 * Provider component for notifications
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substring(2)
    setNotifications((prev) => [...prev, { ...notification, id }])
    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const value = useMemo(
    () => ({
      notifications,
      addNotification,
      removeNotification,
      clearNotifications,
    }),
    [notifications, addNotification, removeNotification, clearNotifications]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

/**
 * Hook to use notifications
 */
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
} 