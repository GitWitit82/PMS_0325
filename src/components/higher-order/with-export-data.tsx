"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download } from "lucide-react"

interface WithExportDataProps<T> {
  data: T[]
  filename?: string
}

/**
 * HOC to add export capabilities to data views
 * @param Component - Component to wrap
 */
export function withExportData<T extends object, P extends WithExportDataProps<T>>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithExportData(props: P) {
    const exportToCSV = () => {
      const headers = Object.keys(props.data[0] || {}).join(",")
      const rows = props.data.map(item => 
        Object.values(item).map(value => 
          typeof value === "string" ? `"${value}"` : value
        ).join(",")
      )
      const csv = [headers, ...rows].join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${props.filename || "export"}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    const exportToJSON = () => {
      const json = JSON.stringify(props.data, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${props.filename || "export"}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    return (
      <div>
        <div className="flex justify-end mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToCSV}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToJSON}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <WrappedComponent {...props} />
      </div>
    )
  }
} 