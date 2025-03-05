'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkflowTableItem, WorkflowFormData } from '@/types/workflow';
import WorkflowTable from '@/components/workflows/WorkflowTable';
import WorkflowFormDialog from '@/components/workflows/WorkflowFormDialog';
import { useToast } from '@/components/ui/use-toast';

export const metadata: Metadata = {
  title: 'Workflow Templates',
  description: 'Manage workflow templates for projects',
};

export default function WorkflowsPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTableItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: workflows, isLoading } = useQuery<WorkflowTableItem[]>({
    queryKey: ['workflows'],
    queryFn: async () => {
      const response = await fetch('/api/workflows');
      if (!response.ok) throw new Error('Failed to fetch workflows');
      return response.json();
    },
  });

  const createWorkflow = useMutation({
    mutationFn: async (data: WorkflowFormData) => {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create workflow');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast({
        title: 'Success',
        description: 'Workflow created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create workflow',
        variant: 'destructive',
      });
    },
  });

  const updateWorkflow = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WorkflowFormData }) => {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update workflow');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast({
        title: 'Success',
        description: 'Workflow updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update workflow',
        variant: 'destructive',
      });
    },
  });

  const deleteWorkflow = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete workflow');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast({
        title: 'Success',
        description: 'Workflow deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete workflow',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (data: WorkflowFormData) => {
    if (selectedWorkflow) {
      await updateWorkflow.mutateAsync({ id: selectedWorkflow.id, data });
    } else {
      await createWorkflow.mutateAsync(data);
    }
    setIsFormOpen(false);
    setSelectedWorkflow(null);
  };

  if (isLoading) {
    return <div className="p-4">Loading workflows...</div>;
  }

  return (
    <div className="container py-6">
      <WorkflowTable
        workflows={workflows || []}
        onCreateWorkflow={() => {
          setSelectedWorkflow(null);
          setIsFormOpen(true);
        }}
        onEditWorkflow={(workflow) => {
          setSelectedWorkflow(workflow);
          setIsFormOpen(true);
        }}
        onDeleteWorkflow={(workflow) => {
          if (confirm('Are you sure you want to delete this workflow?')) {
            deleteWorkflow.mutate(workflow.id);
          }
        }}
      />

      <WorkflowFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        workflow={selectedWorkflow}
        onSubmit={handleSubmit}
      />
    </div>
  );
} 