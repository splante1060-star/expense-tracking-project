/*
  Warnings:

  - A unique constraint covering the columns `[recurringTransactionId,scheduledFor]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "scheduledFor" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_recurringTransactionId_scheduledFor_key" ON "transactions"("recurringTransactionId", "scheduledFor");
