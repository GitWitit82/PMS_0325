import { User } from "@prisma/client";

export type WorkflowTableItem = {
  id: string;
  name: string;
  description: string | null;
  version: string;
  isActive: boolean;
  createdBy: User;
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
  requiredSkills: any[] | null;
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