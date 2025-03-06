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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { type WorkflowTaskTableItem } from "@/types/workflow";

const taskSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(255).trim(),
  description: z.string().max(1000).trim().optional(),
  estimatedHours: z.number().min(0).max(1000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  requiredSkills: z.array(z.string()).optional(),
});

const formSchema = z.object({
  tasks: z.array(taskSchema).min(1),
});

type FormData = z.infer<typeof formSchema>;

interface TaskBatchUpdateDialogProps {
  tasks: WorkflowTaskTableItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskBatchUpdateDialog({
  tasks,
  open,
  onOpenChange,
}: TaskBatchUpdateDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tasks: tasks.map(task => ({
        id: task.id,
        name: task.name,
        description: task.description || '',
        estimatedHours: task.estimatedHours,
        priority: task.priority,
        requiredSkills: task.requiredSkills || [],
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'tasks',
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/workflows/tasks/batch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update tasks');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-tasks'] });
      toast({
        title: 'Success',
        description: 'Tasks updated successfully',
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

  const handleSkillAdd = (index: number, skill: string) => {
    const currentSkills = form.getValues(`tasks.${index}.requiredSkills`) || [];
    if (!currentSkills.includes(skill)) {
      form.setValue(`tasks.${index}.requiredSkills`, [...currentSkills, skill]);
    }
  };

  const handleSkillRemove = (index: number, skill: string) => {
    const currentSkills = form.getValues(`tasks.${index}.requiredSkills`) || [];
    form.setValue(
      `tasks.${index}.requiredSkills`,
      currentSkills.filter(s => s !== skill)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Update Tasks</DialogTitle>
          <DialogDescription>
            Update multiple tasks simultaneously. Changes will be applied to all selected tasks.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-8">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border rounded-lg space-y-4"
                >
                  <h4 className="font-medium">Task {index + 1}</h4>
                  
                  <FormField
                    control={form.control}
                    name={`tasks.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter task name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tasks.${index}.description`}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`tasks.${index}.estimatedHours`}
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`tasks.${index}.priority`}
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`tasks.${index}.requiredSkills`}
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
                                  onClick={() => handleSkillRemove(index, skill)}
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
                                  e.preventDefault();
                                  const input = e.currentTarget;
                                  const value = input.value.trim();
                                  if (value) {
                                    handleSkillAdd(index, value);
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Updating...' : 'Update Tasks'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 