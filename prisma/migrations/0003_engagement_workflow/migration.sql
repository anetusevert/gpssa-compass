-- Soft PMO fields on opportunities + workshop captures
ALTER TABLE "Opportunity" ADD COLUMN "owner" TEXT,
ADD COLUMN "decisionLoggedAt" TIMESTAMP(3),
ADD COLUMN "workshopNotes" TEXT;

CREATE TABLE "EngagementCapture" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "body" TEXT NOT NULL,
    "author" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngagementCapture_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EngagementCapture_entityType_entityId_idx" ON "EngagementCapture"("entityType", "entityId");
