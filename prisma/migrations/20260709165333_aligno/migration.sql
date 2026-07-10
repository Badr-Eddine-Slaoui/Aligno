-- CreateIndex
CREATE INDEX "daily_schedules_userId_date_idx" ON "daily_schedules"("userId", "date");

-- CreateIndex
CREATE INDEX "time_blocks_userId_idx" ON "time_blocks"("userId");

-- CreateIndex
CREATE INDEX "time_blocks_scheduleId_idx" ON "time_blocks"("scheduleId");

-- CreateIndex
CREATE INDEX "time_blocks_templateId_idx" ON "time_blocks"("templateId");
