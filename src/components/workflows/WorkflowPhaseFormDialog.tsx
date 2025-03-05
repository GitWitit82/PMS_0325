import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { WorkflowPhaseFormData, WorkflowPhaseTableItem } from '@/types/workflow';
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

const phaseFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  order: z.number().min(1, 'Order must be at least 1'),
  estimatedDuration: z.number().min(0).optional(),
});

interface WorkflowPhaseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  phase?: WorkflowPhaseTableItem;
  onSubmit: (data: WorkflowPhaseFormData) => Promise<void>;
}

export default function WorkflowPhaseFormDialog({
  open,
  onOpenChange,
  workflowId,
  phase,
  onSubmit,
}: WorkflowPhaseFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkflowPhaseFormData>({
    resolver: zodResolver(phaseFormSchema),
    defaultValues: {
      name: phase?.name || '',
      description: phase?.description || '',
      order: phase?.order || 1,
      estimatedDuration: phase?.estimatedDuration || undefined,
    },
  });

  const handleSubmit = async (data: WorkflowPhaseFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error submitting phase:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {phase ? 'Edit Phase' : 'Add New Phase'}
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

            <div className="grid grid-cols-2 gap-4">
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
                    <FormLabel>Est. Duration (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Optional"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : phase ? 'Save Changes' : 'Add Phase'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 