/*
  Warnings:

  - A unique constraint covering the columns `[billId,scheduledFor]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "transactions_billId_scheduledFor_idx";

-- CreateIndex
CREATE INDEX "transactions_billId_idx" ON "transactions"("billId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_billId_scheduledFor_key" ON "transactions"("billId", "scheduledFor");
