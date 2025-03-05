-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "customerId" TEXT;

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "projects_customerId_idx" ON "projects"("customerId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
