#!/bin/bash

# Fix the files with incorrect imports
sed -i '' "s/import prisma from '@\/lib\/prisma'/import { prisma } from '@\/lib\/prisma'/" src/app/api/workflows/phases/[phaseId]/route.ts
sed -i '' "s/import prisma from '@\/lib\/prisma'/import { prisma } from '@\/lib\/prisma'/" src/app/api/workflows/batch/route.ts
sed -i '' "s/import prisma from '@\/lib\/prisma'/import { prisma } from '@\/lib\/prisma'/" src/app/api/workflows/phases/batch/route.ts
sed -i '' "s/import prisma from '@\/lib\/prisma'/import { prisma } from '@\/lib\/prisma'/" src/app/api/workflows/[workflowId]/route.ts
sed -i '' "s/import prisma from '@\/lib\/prisma'/import { prisma } from '@\/lib\/prisma'/" src/app/api/workflows/tasks/[taskId]/route.ts
sed -i '' "s/import prisma from '@\/lib\/prisma'/import { prisma } from '@\/lib\/prisma'/" src/app/api/workflows/[workflowId]/duplicate/route.ts 