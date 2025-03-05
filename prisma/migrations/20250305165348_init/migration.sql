-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMINISTRATOR', 'MANAGER', 'SUPERVISOR', 'TEAM_MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'PARTIALLY_AVAILABLE', 'UNAVAILABLE', 'TIME_OFF');

-- CreateEnum
CREATE TYPE "DependencyType" AS ENUM ('FINISH_TO_START', 'START_TO_START', 'FINISH_TO_FINISH', 'START_TO_FINISH');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PhaseStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ChecklistStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PERSON', 'MACHINE', 'OTHER');

-- CreateEnum
CREATE TYPE "AllocationType" AS ENUM ('PERCENTAGE', 'HOURS', 'ROLE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('RESOURCE_OVERALLOCATION', 'DEPARTMENT_CAPACITY', 'SCHEDULE_VARIANCE', 'DEPENDENCY_RISK', 'BUDGET_IMPACT', 'DEADLINE_APPROACHING', 'TASK_STATUS_CHANGE', 'FORM_SUBMISSION', 'SYSTEM_NOTIFICATION');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'TEAM_MEMBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "skills" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "departmentId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "managerId" TEXT,
    "parentDepartmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAvailability" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AvailabilityStatus" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowPhase" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "estimatedDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTask" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "estimatedHours" DOUBLE PRECISION NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "requiredSkills" JSONB,
    "formTemplateJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "id" TEXT NOT NULL,
    "sourceTaskId" TEXT NOT NULL,
    "targetTaskId" TEXT NOT NULL,
    "dependencyType" "DependencyType" NOT NULL DEFAULT 'FINISH_TO_START',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" TEXT NOT NULL,
    "departmentId" TEXT,
    "createdById" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPhase" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "workflowPhaseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "status" "PhaseStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "actualStartDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTask" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "estimatedHours" DOUBLE PRECISION NOT NULL,
    "actualHours" DOUBLE PRECISION,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectPhaseId" TEXT NOT NULL,
    "workflowTaskId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "assignedToId" TEXT,

    CONSTRAINT "ProjectTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schemaJson" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "responseJson" JSONB NOT NULL,
    "submittedById" TEXT NOT NULL,
    "status" "FormStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checklist" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ChecklistStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "departmentId" TEXT,
    "capacity" DOUBLE PRECISION NOT NULL,
    "skills" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceAvailability" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "AvailabilityStatus" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceAllocation" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskId" TEXT,
    "userId" TEXT,
    "allocationType" "AllocationType" NOT NULL,
    "percentage" DOUBLE PRECISION,
    "hours" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceUtilization" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "availableHours" DOUBLE PRECISION NOT NULL,
    "allocatedHours" DOUBLE PRECISION NOT NULL,
    "utilizedPercentage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceUtilization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "severity" "NotificationSeverity" NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" "NotificationType" NOT NULL,
    "receiveEmail" BOOLEAN NOT NULL DEFAULT true,
    "receiveInApp" BOOLEAN NOT NULL DEFAULT true,
    "receiveSms" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsData" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_departmentId_idx" ON "users"("departmentId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "Department_managerId_idx" ON "Department"("managerId");

-- CreateIndex
CREATE INDEX "Department_parentDepartmentId_idx" ON "Department"("parentDepartmentId");

-- CreateIndex
CREATE INDEX "UserAvailability_userId_idx" ON "UserAvailability"("userId");

-- CreateIndex
CREATE INDEX "UserAvailability_startDate_endDate_idx" ON "UserAvailability"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Workflow_createdById_idx" ON "Workflow"("createdById");

-- CreateIndex
CREATE INDEX "WorkflowPhase_workflowId_idx" ON "WorkflowPhase"("workflowId");

-- CreateIndex
CREATE INDEX "WorkflowPhase_workflowId_order_idx" ON "WorkflowPhase"("workflowId", "order");

-- CreateIndex
CREATE INDEX "WorkflowTask_phaseId_idx" ON "WorkflowTask"("phaseId");

-- CreateIndex
CREATE INDEX "TaskDependency_sourceTaskId_idx" ON "TaskDependency"("sourceTaskId");

-- CreateIndex
CREATE INDEX "TaskDependency_targetTaskId_idx" ON "TaskDependency"("targetTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDependency_sourceTaskId_targetTaskId_key" ON "TaskDependency"("sourceTaskId", "targetTaskId");

-- CreateIndex
CREATE INDEX "projects_workflowId_idx" ON "projects"("workflowId");

-- CreateIndex
CREATE INDEX "projects_departmentId_idx" ON "projects"("departmentId");

-- CreateIndex
CREATE INDEX "projects_createdById_idx" ON "projects"("createdById");

-- CreateIndex
CREATE INDEX "projects_managerId_idx" ON "projects"("managerId");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "ProjectPhase_projectId_idx" ON "ProjectPhase"("projectId");

-- CreateIndex
CREATE INDEX "ProjectPhase_workflowPhaseId_idx" ON "ProjectPhase"("workflowPhaseId");

-- CreateIndex
CREATE INDEX "ProjectPhase_projectId_order_idx" ON "ProjectPhase"("projectId", "order");

-- CreateIndex
CREATE INDEX "ProjectTask_projectPhaseId_idx" ON "ProjectTask"("projectPhaseId");

-- CreateIndex
CREATE INDEX "ProjectTask_workflowTaskId_idx" ON "ProjectTask"("workflowTaskId");

-- CreateIndex
CREATE INDEX "ProjectTask_assignedToId_idx" ON "ProjectTask"("assignedToId");

-- CreateIndex
CREATE INDEX "ProjectTask_status_idx" ON "ProjectTask"("status");

-- CreateIndex
CREATE INDEX "ProjectTask_scheduledStart_scheduledEnd_idx" ON "ProjectTask"("scheduledStart", "scheduledEnd");

-- CreateIndex
CREATE INDEX "FormTemplate_createdById_idx" ON "FormTemplate"("createdById");

-- CreateIndex
CREATE INDEX "FormSubmission_taskId_idx" ON "FormSubmission"("taskId");

-- CreateIndex
CREATE INDEX "FormSubmission_templateId_idx" ON "FormSubmission"("templateId");

-- CreateIndex
CREATE INDEX "FormSubmission_submittedById_idx" ON "FormSubmission"("submittedById");

-- CreateIndex
CREATE INDEX "FormSubmission_status_idx" ON "FormSubmission"("status");

-- CreateIndex
CREATE INDEX "Checklist_taskId_idx" ON "Checklist"("taskId");

-- CreateIndex
CREATE INDEX "Checklist_status_idx" ON "Checklist"("status");

-- CreateIndex
CREATE INDEX "ChecklistItem_checklistId_idx" ON "ChecklistItem"("checklistId");

-- CreateIndex
CREATE INDEX "ChecklistItem_completedById_idx" ON "ChecklistItem"("completedById");

-- CreateIndex
CREATE INDEX "ChecklistItem_checklistId_order_idx" ON "ChecklistItem"("checklistId", "order");

-- CreateIndex
CREATE INDEX "Resource_departmentId_idx" ON "Resource"("departmentId");

-- CreateIndex
CREATE INDEX "Resource_type_idx" ON "Resource"("type");

-- CreateIndex
CREATE INDEX "ResourceAvailability_resourceId_idx" ON "ResourceAvailability"("resourceId");

-- CreateIndex
CREATE INDEX "ResourceAvailability_startDate_endDate_idx" ON "ResourceAvailability"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "ResourceAllocation_resourceId_idx" ON "ResourceAllocation"("resourceId");

-- CreateIndex
CREATE INDEX "ResourceAllocation_projectId_idx" ON "ResourceAllocation"("projectId");

-- CreateIndex
CREATE INDEX "ResourceAllocation_taskId_idx" ON "ResourceAllocation"("taskId");

-- CreateIndex
CREATE INDEX "ResourceAllocation_userId_idx" ON "ResourceAllocation"("userId");

-- CreateIndex
CREATE INDEX "ResourceAllocation_startDate_endDate_idx" ON "ResourceAllocation"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "ResourceUtilization_resourceId_idx" ON "ResourceUtilization"("resourceId");

-- CreateIndex
CREATE INDEX "ResourceUtilization_date_idx" ON "ResourceUtilization"("date");

-- CreateIndex
CREATE INDEX "ResourceUtilization_resourceId_date_idx" ON "ResourceUtilization"("resourceId", "date");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_receiverId_idx" ON "notifications"("receiverId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_severity_idx" ON "notifications"("severity");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_notificationType_key" ON "NotificationPreference"("userId", "notificationType");

-- CreateIndex
CREATE INDEX "AnalyticsData_entityType_entityId_idx" ON "AnalyticsData"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AnalyticsData_metricType_idx" ON "AnalyticsData"("metricType");

-- CreateIndex
CREATE INDEX "AnalyticsData_date_idx" ON "AnalyticsData"("date");

-- CreateIndex
CREATE INDEX "AnalyticsData_entityType_metricType_date_idx" ON "AnalyticsData"("entityType", "metricType", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_parentDepartmentId_fkey" FOREIGN KEY ("parentDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAvailability" ADD CONSTRAINT "UserAvailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowPhase" ADD CONSTRAINT "WorkflowPhase_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTask" ADD CONSTRAINT "WorkflowTask_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "WorkflowPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_sourceTaskId_fkey" FOREIGN KEY ("sourceTaskId") REFERENCES "WorkflowTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_targetTaskId_fkey" FOREIGN KEY ("targetTaskId") REFERENCES "WorkflowTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPhase" ADD CONSTRAINT "ProjectPhase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPhase" ADD CONSTRAINT "ProjectPhase_workflowPhaseId_fkey" FOREIGN KEY ("workflowPhaseId") REFERENCES "WorkflowPhase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_projectPhaseId_fkey" FOREIGN KEY ("projectPhaseId") REFERENCES "ProjectPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_workflowTaskId_fkey" FOREIGN KEY ("workflowTaskId") REFERENCES "WorkflowTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormTemplate" ADD CONSTRAINT "FormTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceAvailability" ADD CONSTRAINT "ResourceAvailability_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceAllocation" ADD CONSTRAINT "ResourceAllocation_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceAllocation" ADD CONSTRAINT "ResourceAllocation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceAllocation" ADD CONSTRAINT "ResourceAllocation_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceAllocation" ADD CONSTRAINT "ResourceAllocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceUtilization" ADD CONSTRAINT "ResourceUtilization_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
