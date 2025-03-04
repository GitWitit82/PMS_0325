"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { useReactToPrint } from "react-to-print"

interface WithPrintingProps {
  title?: string
  showPrintButton?: boolean
  printStyles?: string
  onBeforePrint?: () => void | Promise<void>
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
    const componentRef = useRef<HTMLDivElement>(null)
    const [isPrinting, setIsPrinting] = useState(false)

    const handlePrint = useReactToPrint({
      content: () => componentRef.current,
      documentTitle: props.title || "Print Document",
      onBeforeGetContent: async () => {
        setIsPrinting(true)
        await props.onBeforePrint?.()
      },
      onAfterPrint: () => {
        setIsPrinting(false)
        props.onAfterPrint?.()
      },
      pageStyle: `
        @media print {
          @page {
            size: auto;
            margin: 20mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          ${props.printStyles || ""}
        }
      `,
    })

    return (
      <div>
        {props.showPrintButton !== false && (
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={isPrinting}
            >
              <Printer className="h-4 w-4 mr-2" />
              {isPrinting ? "Preparing..." : "Print"}
            </Button>
          </div>
        )}
        <div ref={componentRef}>
          <WrappedComponent {...props} />
        </div>
      </div>
    )
  }
} 