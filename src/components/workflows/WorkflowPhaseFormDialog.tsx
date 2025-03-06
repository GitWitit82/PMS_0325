"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const phaseFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  order: z.number().min(1, 'Order must be at least 1'),
  estimatedDuration: z.number().min(0, 'Duration must be non-negative').optional(),
});

interface WorkflowPhaseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  phase?: {
    id: string;
    name: string;
    description?: string;
    order: number;
    estimatedDuration?: number;
  };
  onSubmit: (data: z.infer<typeof phaseFormSchema>) => Promise<void>;
}

export default function WorkflowPhaseFormDialog({
  open,
  onOpenChange,
  workflowId,
  phase,
  onSubmit,
}: WorkflowPhaseFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof phaseFormSchema>>({
    resolver: zodResolver(phaseFormSchema),
    defaultValues: {
      name: phase?.name || '',
      description: phase?.description || '',
      order: phase?.order || 1,
      estimatedDuration: phase?.estimatedDuration || 0,
    },
  });

  const handleSubmit = async (data: z.infer<typeof phaseFormSchema>) => {
    try {
      setIsSubmitting(true);
      const url = phase
        ? `/api/workflows/${workflowId}/phases/${phase.id}`
        : `/api/workflows/${workflowId}/phases`;
      const method = phase ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save phase');
      }

      await onSubmit(data);
      onOpenChange(false);
      form.reset();
      toast({
        title: 'Success',
        description: `Phase ${phase ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error submitting phase:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save phase',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {phase ? 'Edit Phase' : 'Create New Phase'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phase name" {...field} />
                  </FormControl>
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
                      placeholder="Enter phase description"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Duration (hours)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : phase ? 'Save Changes' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 