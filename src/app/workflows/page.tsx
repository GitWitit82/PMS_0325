"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/workflows/data-table"
import { columns } from "@/components/workflows/columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import WorkflowFormDialog from '@/components/workflows/WorkflowFormDialog'
import type { WorkflowFormData } from "@/types/workflow"

export default function WorkflowsPage() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (data: WorkflowFormData) => {
    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create workflow")
      }

      toast({
        title: "Success",
        description: "Workflow created successfully",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create workflow",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Templates</h1>
          <p className="text-muted-foreground">
            Create and manage workflow templates for your projects
          </p>
        </div>
        <WorkflowFormDialog
          open={open}
          onOpenChange={setOpen}
          onSubmit={handleSubmit}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </WorkflowFormDialog>
      </div>
      <DataTable columns={columns} />
    </div>
  )
} 