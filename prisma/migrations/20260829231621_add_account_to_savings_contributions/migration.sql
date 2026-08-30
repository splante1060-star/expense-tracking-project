-- AlterTable
ALTER TABLE "savingsContributions" ADD COLUMN     "accountId" TEXT;

-- CreateIndex
CREATE INDEX "savingsContributions_accountId_idx" ON "savingsContributions"("accountId");

-- AddForeignKey
ALTER TABLE "savingsContributions" ADD CONSTRAINT "savingsContributions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
