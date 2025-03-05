import { useState } from 'react';
import { WorkflowTableItem } from '@/types/workflow';
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
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import WorkflowPhaseList from './WorkflowPhaseList';

interface WorkflowTableProps {
  workflows: WorkflowTableItem[];
  onCreateWorkflow: () => void;
  onEditWorkflow: (workflow: WorkflowTableItem) => void;
  onDeleteWorkflow: (workflow: WorkflowTableItem) => void;
}

export default function WorkflowTable({
  workflows,
  onCreateWorkflow,
  onEditWorkflow,
  onDeleteWorkflow,
}: WorkflowTableProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTableItem | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workflow Templates</h2>
        <Button onClick={onCreateWorkflow}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Workflow
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Phases</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.map((workflow) => (
              <>
                <TableRow
                  key={workflow.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedWorkflow(selectedWorkflow?.id === workflow.id ? null : workflow)}
                >
                  <TableCell className="font-medium">{workflow.name}</TableCell>
                  <TableCell>{workflow.version}</TableCell>
                  <TableCell>
                    <Badge variant={workflow.isActive ? "success" : "secondary"}>
                      {workflow.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{workflow._count?.phases || 0} phases</TableCell>
                  <TableCell>{workflow.createdBy.name}</TableCell>
                  <TableCell>{formatDate(workflow.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditWorkflow(workflow);
                        }}
                      >
                        <Pencil2Icon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteWorkflow(workflow);
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {selectedWorkflow?.id === workflow.id && (
                  <TableRow>
                    <TableCell colSpan={7} className="p-0">
                      <div className="p-4 bg-muted/30">
                        <WorkflowPhaseList workflowId={workflow.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 