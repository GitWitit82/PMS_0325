import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { WorkflowTaskTableItem } from '@/types/workflow';

type DependencyType = "FINISH_TO_START" | "START_TO_START" | "FINISH_TO_FINISH" | "START_TO_FINISH"

interface TaskDependency {
  sourceTaskId: string
  targetTaskId: string
  dependencyType: DependencyType
}

interface TaskDependencyDialogProps {
  tasks: WorkflowTaskTableItem[]
  dependencies: TaskDependency[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DEPENDENCY_TYPES = [
  { value: 'FINISH_TO_START', label: 'Finish to Start' },
  { value: 'START_TO_START', label: 'Start to Start' },
  { value: 'FINISH_TO_FINISH', label: 'Finish to Finish' },
  { value: 'START_TO_FINISH', label: 'Start to Finish' },
];

const dependencySchema = z.object({
  dependencies: z.array(z.object({
    sourceTaskId: z.string().uuid(),
    targetTaskId: z.string().uuid(),
    dependencyType: z.enum(['FINISH_TO_START', 'START_TO_START', 'FINISH_TO_FINISH', 'START_TO_FINISH']),
  })).min(1),
});

type FormData = z.infer<typeof dependencySchema>;

export function TaskDependencyDialog({
  tasks,
  dependencies,
  open,
  onOpenChange,
}: TaskDependencyDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(dependencySchema),
    defaultValues: {
      dependencies: dependencies.length > 0 ? dependencies : [{
        sourceTaskId: '',
        targetTaskId: '',
        dependencyType: 'FINISH_TO_START' as const,
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'dependencies',
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/workflows/tasks/batch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update dependencies');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-tasks'] });
      toast({
        title: 'Success',
        description: 'Task dependencies updated successfully',
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    try {
      await updateMutation.mutateAsync(data);
    } finally {
      setIsPending(false);
    }
  };

  const addDependency = () => {
    append({
      sourceTaskId: '',
      targetTaskId: '',
      dependencyType: 'FINISH_TO_START' as const,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Task Dependencies</DialogTitle>
          <DialogDescription>
            Define dependencies between tasks. Be careful to avoid circular dependencies.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[1fr,1fr,auto,auto] gap-4 items-end border rounded-lg p-4"
                >
                  <FormField
                    control={form.control}
                    name={`dependencies.${index}.sourceTaskId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source Task</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select task" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tasks.map(task => (
                              <SelectItem key={task.id} value={task.id}>
                                {task.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`dependencies.${index}.targetTaskId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Task</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select task" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tasks.map(task => (
                              <SelectItem key={task.id} value={task.id}>
                                {task.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`dependencies.${index}.dependencyType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DEPENDENCY_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mb-2"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addDependency}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Dependency
            </Button>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Updating...' : 'Update Dependencies'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 