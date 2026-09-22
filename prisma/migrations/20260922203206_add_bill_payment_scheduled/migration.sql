-- DropIndex
DROP INDEX "transactions_billId_idx";

-- CreateIndex
CREATE INDEX "transactions_billId_scheduledFor_idx" ON "transactions"("billId", "scheduledFor");
