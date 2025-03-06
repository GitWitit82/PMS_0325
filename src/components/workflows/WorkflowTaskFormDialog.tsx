"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { type WorkflowTaskFormData, type WorkflowTaskTableItem } from '@/types/workflow'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).trim(),
  description: z.string().max(1000).trim().optional(),
  estimatedHours: z.number().min(0).max(1000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  requiredSkills: z.array(z.string()).optional(),
})

interface WorkflowTaskFormDialogProps {
  phaseId: string
  task?: WorkflowTaskTableItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: WorkflowTaskFormData) => Promise<void>
}

export default function WorkflowTaskFormDialog({
  phaseId,
  task,
  open,
  onOpenChange,
  onSubmit,
}: WorkflowTaskFormDialogProps) {
  const [isPending, setIsPending] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<WorkflowTaskFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: task?.name ?? '',
      description: task?.description ?? '',
      estimatedHours: task?.estimatedHours ?? 0,
      priority: task?.priority ?? 'MEDIUM',
      requiredSkills: task?.requiredSkills ?? [],
    },
  })

  const taskMutation = useMutation({
    mutationFn: async (data: WorkflowTaskFormData) => {
      const url = task
        ? `/api/workflows/phases/${phaseId}/tasks/${task.id}`
        : `/api/workflows/phases/${phaseId}/tasks`
      const method = task ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save task')
      }

      return response.json()
    },
    onSuccess: async (data) => {
      await onSubmit(data)
      queryClient.invalidateQueries({ queryKey: ['workflow-tasks'] })
      toast({
        title: 'Success',
        description: `Task ${task ? 'updated' : 'created'} successfully`,
      })
      onOpenChange(false)
      form.reset()
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = async (data: WorkflowTaskFormData) => {
    setIsPending(true)
    try {
      await taskMutation.mutateAsync(data)
    } finally {
      setIsPending(false)
    }
  }

  const handleSkillAdd = (skill: string) => {
    const currentSkills = form.getValues('requiredSkills') || []
    if (!currentSkills.includes(skill)) {
      form.setValue('requiredSkills', [...currentSkills, skill])
    }
  }

  const handleSkillRemove = (skill: string) => {
    const currentSkills = form.getValues('requiredSkills') || []
    form.setValue(
      'requiredSkills',
      currentSkills.filter(s => s !== skill)
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <DialogDescription>
            {task
              ? 'Update the task details below.'
              : 'Add a new task to this phase.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter task name" />
                  </FormControl>
                  <FormDescription>
                    A clear and concise name for the task
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter task description"
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed description of what needs to be done
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        max={1000}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Expected time to complete
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Task importance level</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requiredSkills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Skills</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(field.value || []).map(skill => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleSkillRemove(skill)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill"
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const input = e.currentTarget
                            const value = input.value.trim()
                            if (value) {
                              handleSkillAdd(value)
                              input.value = ''
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  <FormDescription>
                    Skills needed to complete this task
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? task
                    ? 'Updating...'
                    : 'Creating...'
                  : task
                  ? 'Update Task'
                  : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 