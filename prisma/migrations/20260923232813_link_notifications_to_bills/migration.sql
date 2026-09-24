/*
  Warnings:

  - A unique constraint covering the columns `[billId,scheduledFor,type]` on the table `notifications` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "billId" TEXT,
ADD COLUMN     "scheduledFor" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "notifications_billId_idx" ON "notifications"("billId");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_billId_scheduledFor_type_key" ON "notifications"("billId", "scheduledFor", "type");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
