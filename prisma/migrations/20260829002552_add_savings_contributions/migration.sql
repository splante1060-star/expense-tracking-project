-- CreateTable
CREATE TABLE "savingsContributions" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "userId" TEXT NOT NULL,
    "savingsGoalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savingsContributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "savingsContributions_userId_idx" ON "savingsContributions"("userId");

-- CreateIndex
CREATE INDEX "savingsContributions_savingsGoalId_idx" ON "savingsContributions"("savingsGoalId");

-- CreateIndex
CREATE INDEX "savingsContributions_date_idx" ON "savingsContributions"("date");

-- AddForeignKey
ALTER TABLE "savingsContributions" ADD CONSTRAINT "savingsContributions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savingsContributions" ADD CONSTRAINT "savingsContributions_savingsGoalId_fkey" FOREIGN KEY ("savingsGoalId") REFERENCES "savingsGoals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
