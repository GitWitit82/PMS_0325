#!/bin/bash

# Find all route.ts files
find src/app/api -name "route.ts" -type f -exec sed -i '' 's/export async function \(.*\)(request: NextRequest, { params }: { params: { [^}]*} })/export async function \1(request: NextRequest)/g' {} +

# Update all route handlers to extract params from URL
find src/app/api -name "route.ts" -type f -exec sed -i '' '/const session = await getServerSession/i\
    const url = new URL(request.url);\
    const params = {};\
    const pathParts = url.pathname.split("/");\
    if (pathParts.includes("workflows")) {\
      const workflowId = pathParts[pathParts.indexOf("workflows") + 1];\
      if (workflowId && workflowId !== "batch") params.workflowId = workflowId;\
    }\
    if (pathParts.includes("phases")) {\
      const phaseId = pathParts[pathParts.indexOf("phases") + 1];\
      if (phaseId && phaseId !== "batch") params.phaseId = phaseId;\
    }\
    if (pathParts.includes("tasks")) {\
      const taskId = pathParts[pathParts.indexOf("tasks") + 1];\
      if (taskId && taskId !== "batch") params.taskId = taskId;\
    }\
' {} + 