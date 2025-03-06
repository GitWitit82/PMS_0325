import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkflowPhaseTableItem, WorkflowTaskTableItem, WorkflowPhaseFormData, WorkflowTaskFormData } from '@/types/workflow';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusIcon, Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import WorkflowPhaseFormDialog from './WorkflowPhaseFormDialog';
import WorkflowTaskFormDialog from './WorkflowTaskFormDialog';

interface WorkflowPhaseListProps {
  workflowId: string;
}

export default function WorkflowPhaseList({ workflowId }: WorkflowPhaseListProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<WorkflowPhaseTableItem | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<WorkflowTaskTableItem | undefined>(undefined);
  const [isPhaseFormOpen, setIsPhaseFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch phases
  const { data: phases, isLoading: isPhasesLoading } = useQuery<WorkflowPhaseTableItem[]>({
    queryKey: ['workflow-phases', workflowId],
    queryFn: async () => {
      const response = await fetch(`/api/workflows/${workflowId}/phases`);
      if (!response.ok) throw new Error('Failed to fetch phases');
      return response.json();
    },
  });

  // Fetch tasks for expanded phase
  const { data: tasks, isLoading: isTasksLoading } = useQuery<WorkflowTaskTableItem[]>({
    queryKey: ['workflow-tasks', expandedPhase],
    queryFn: async () => {
      if (!expandedPhase) return [];
      const response = await fetch(`/api/workflows/phases/${expandedPhase}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
    enabled: !!expandedPhase,
  });

  // Phase mutations
  const createPhase = useMutation({
    mutationFn: async (data: WorkflowPhaseFormData) => {
      const response = await fetch(`/api/workflows/${workflowId}/phases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create phase');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-phases', workflowId] });
      toast({
        title: 'Success',
        description: 'Phase created successfully',
      });
    },
  });

  const updatePhase = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WorkflowPhaseFormData }) => {
      const response = await fetch(`/api/workflows/phases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update phase');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-phases', workflowId] });
      toast({
        title: 'Success',
        description: 'Phase updated successfully',
      });
    },
  });

  const deletePhase = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/workflows/phases/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete phase');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-phases', workflowId] });
      toast({
        title: 'Success',
        description: 'Phase deleted successfully',
      });
    },
  });

  // Task mutations
  const createTask = useMutation({
    mutationFn: async ({ phaseId, data }: { phaseId: string; data: WorkflowTaskFormData }) => {
      const response = await fetch(`/api/workflows/phases/${phaseId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-tasks', expandedPhase] });
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WorkflowTaskFormData }) => {
      const response = await fetch(`/api/workflows/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-tasks', expandedPhase] });
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/workflows/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-tasks', expandedPhase] });
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
    },
  });

  const handlePhaseSubmit = async (data: WorkflowPhaseFormData) => {
    if (selectedPhase) {
      await updatePhase.mutateAsync({ id: selectedPhase.id, data });
    } else {
      await createPhase.mutateAsync(data);
    }
    setIsPhaseFormOpen(false);
    setSelectedPhase(undefined);
  };

  const handleTaskSubmit = async (data: WorkflowTaskFormData) => {
    if (selectedTask) {
      await updateTask.mutateAsync({ id: selectedTask.id, data });
    } else {
      await createTask.mutateAsync({ phaseId: expandedPhase!, data });
    }
    setIsTaskFormOpen(false);
    setSelectedTask(undefined);
  };

  const transformedPhase = selectedPhase ? {
    id: selectedPhase.id,
    name: selectedPhase.name,
    description: selectedPhase.description || undefined,
    order: selectedPhase.order,
    estimatedDuration: selectedPhase.estimatedDuration || undefined,
  } : undefined

  if (isPhasesLoading) {
    return <div className="p-4 text-center">Loading phases...</div>;
  }

  if (!phases?.length) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground mb-4">No phases defined for this workflow</p>
        <Button onClick={() => {
          setSelectedPhase(undefined);
          setIsPhaseFormOpen(true);
        }}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Phase
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Phases</h2>
        <Button onClick={() => {
          setSelectedPhase(undefined);
          setIsPhaseFormOpen(true);
        }}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Phase
        </Button>
      </div>

      <Accordion
        type="single"
        value={expandedPhase || undefined}
        onValueChange={setExpandedPhase}
        className="space-y-2"
      >
        {phases.map((phase) => (
          <AccordionItem key={phase.id} value={phase.id} className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{phase.name}</span>
                  <Badge variant="outline">{phase._count?.tasks || 0} tasks</Badge>
                  {phase.estimatedDuration && (
                    <Badge variant="secondary">{phase.estimatedDuration} days</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhase(phase);
                      setIsPhaseFormOpen(true);
                    }}
                  >
                    <Pencil2Icon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this phase?')) {
                        deletePhase.mutate(phase.id);
                      }
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="py-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Tasks</h4>
                  <Button onClick={() => setIsTaskFormOpen(true)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </div>

                {isTasksLoading ? (
                  <div className="text-center py-4">Loading tasks...</div>
                ) : !tasks?.length ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No tasks defined for this phase
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task Name</TableHead>
                        <TableHead>Est. Hours</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Required Skills</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.name}</TableCell>
                          <TableCell>{task.estimatedHours}h</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                task.priority === 'CRITICAL'
                                  ? 'destructive'
                                  : task.priority === 'HIGH'
                                  ? 'default'
                                  : task.priority === 'MEDIUM'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {task.requiredSkills?.map((skill: string) => (
                              <Badge key={skill} variant="outline" className="mr-1">
                                {skill}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsTaskFormOpen(true);
                                }}
                              >
                                <Pencil2Icon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this task?')) {
                                    deleteTask.mutate(task.id);
                                  }
                                }}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <WorkflowPhaseFormDialog
        open={isPhaseFormOpen}
        onOpenChange={setIsPhaseFormOpen}
        workflowId={workflowId}
        phase={transformedPhase}
        onSubmit={handlePhaseSubmit}
      />

      <WorkflowTaskFormDialog
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        phaseId={expandedPhase!}
        task={selectedTask}
        onSubmit={handleTaskSubmit}
      />
    </div>
  );
} 