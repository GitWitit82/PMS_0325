"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface WithConfirmationProps {
  onConfirm?: () => void | Promise<void>
  confirmationTitle?: string
  confirmationDescription?: string
  confirmLabel?: string
  cancelLabel?: string
}

/**
 * HOC to add confirmation dialogs to actions
 * @param Component - Component to wrap
 */
export function withConfirmation<T extends WithConfirmationProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithConfirmation(props: T) {
    const [isOpen, setIsOpen] = useState(false)
    const [pendingConfirmation, setPendingConfirmation] = useState<(() => void | Promise<void>) | null>(null)

    const handleAction = (action: () => void | Promise<void>) => {
      setPendingConfirmation(() => action)
      setIsOpen(true)
    }

    const handleConfirm = async () => {
      if (pendingConfirmation) {
        await pendingConfirmation()
        setPendingConfirmation(null)
      }
      setIsOpen(false)
    }

    return (
      <>
        <WrappedComponent
          {...props}
          onConfirm={(action: () => Promise<void>) => handleAction(action)}
        />
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {props.confirmationTitle || "Are you sure?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {props.confirmationDescription || "This action cannot be undone."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {props.cancelLabel || "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                {props.confirmLabel || "Continue"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }
} 