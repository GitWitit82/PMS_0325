"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface WithPrintingProps {
  title?: string
  printStyles?: string
  onBeforePrint?: () => Promise<void>
  onAfterPrint?: () => void
}

/**
 * HOC to add print functionality to components
 * @param Component - Component to wrap
 */
export function withPrinting<T extends WithPrintingProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithPrinting(props: T) {
    const [isPrinting, setIsPrinting] = useState(false)
    const componentRef = useRef<HTMLDivElement>(null)

    const handlePrint = async () => {
      try {
        setIsPrinting(true)
        
        // Add print styles
        const style = document.createElement('style')
        style.textContent = `
          @media print {
            @page {
              size: auto;
              margin: 20mm;
            }
            body * {
              visibility: hidden;
            }
            #printable-content,
            #printable-content * {
              visibility: visible;
            }
            #printable-content {
              position: absolute;
              left: 0;
              top: 0;
            }
            ${props.printStyles || ""}
          }
        `
        document.head.appendChild(style)

        // Set document title
        const originalTitle = document.title
        if (props.title) {
          document.title = props.title
        }

        // Execute before print callback
        await props.onBeforePrint?.()

        // Print
        window.print()

        // Cleanup
        document.head.removeChild(style)
        document.title = originalTitle
        props.onAfterPrint?.()
      } catch (error) {
        console.error('Print error:', error)
      } finally {
        setIsPrinting(false)
      }
    }

    return (
      <div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={handlePrint}
          disabled={isPrinting}
        >
          <Printer className="mr-2 h-4 w-4" />
          {isPrinting ? "Printing..." : "Print"}
        </Button>
        <div ref={componentRef} id="printable-content">
          <WrappedComponent {...props} />
        </div>
      </div>
    )
  }
} 