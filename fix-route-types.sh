#!/bin/bash

# Update imports
find src/app/api -name "route.ts" -type f -exec sed -i '' 's/import { NextResponse } from/import { NextRequest, NextResponse } from/g' {} +

# Update function signatures
find src/app/api -name "route.ts" -type f -exec sed -i '' 's/request: Request,/request: NextRequest,/g' {} +
find src/app/api -name "route.ts" -type f -exec sed -i '' 's/{ params }: { params:/context: { params:/g' {} +

# Update params references
find src/app/api -name "route.ts" -type f -exec sed -i '' 's/params\./context.params./g' {} + 