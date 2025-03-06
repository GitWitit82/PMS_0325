import { Workflow as PrismaWorkflow } from "@prisma/client";
import { type BaseRecord } from "./index"

export type WorkflowTableItem = {
  id: string;
  name: string;
  description: string | null;
  version: string;
  isActive: boolean;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    phases: number;
  };
};

export type WorkflowPhaseTableItem = {
  id: string;
  name: string;
  description: string | null;
  order: number;
  estimatedDuration: number | null;
  _count?: {
    tasks: number;
  };
};

export type WorkflowTaskTableItem = {
  id: string;
  name: string;
  description: string | null;
  estimatedHours: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiredSkills: string[] | null;
};

export type WorkflowFormData = {
  name: string;
  description?: string;
  version: string;
  isActive: boolean;
};

export type WorkflowPhaseFormData = {
  name: string;
  description?: string;
  order: number;
  estimatedDuration?: number;
};

export type WorkflowTaskFormData = {
  name: string;
  description?: string;
  estimatedHours: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiredSkills?: string[];
};

export interface Workflow extends BaseRecord {
  title: string
  description: string
  status: WorkflowStatus
  startDate: Date
  endDate: Date
  progress: number
  priority: WorkflowPriority
  assignedTo: string[]
  tags: string[]
  metadata: Record<string, unknown>
}

export enum WorkflowStatus {
  DRAFT = "DRAFT",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum WorkflowPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface WorkflowPhase extends BaseRecord {
  workflowId: string
  title: string
  description: string
  order: number
  status: WorkflowStatus
  startDate: Date
  endDate: Date
  metadata: Record<string, unknown>
}

export interface WorkflowTask extends BaseRecord {
  phaseId: string
  title: string
  description: string
  order: number
  status: WorkflowStatus
  priority: WorkflowPriority
  assignedTo: string[]
  startDate: Date
  endDate: Date
  metadata: Record<string, unknown>
}

export interface WorkflowWithRelations extends PrismaWorkflow {
  phases: Array<{
    id: string;
    name: string;
    description: string | null;
    order: number;
    status: string;
    workflowId: string;
    tasks: Array<{
      id: string;
      name: string;
      description: string | null;
      status: string;
      priority: string;
      order: number;
      startDate: Date | null;
      endDate: Date | null;
      phaseId: string;
    }>;
  }>;
}

export interface WorkflowFilters {
  status?: string;
  priority?: string;
  assignee?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface WorkflowSortOptions {
  field: keyof WorkflowWithRelations;
  direction: "asc" | "desc";
}

export interface WorkflowStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  overdue: number;
}

export type WorkflowUpdateData = Partial<
  Pick<
    PrismaWorkflow,
    "name" | "description" | "version" | "isActive" | "createdAt" | "updatedAt"
  >
>; 