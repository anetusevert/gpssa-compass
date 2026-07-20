-- AlterTable
ALTER TABLE "CustomerEpisode" ADD COLUMN "lifecycleCategory" TEXT;
ALTER TABLE "CustomerEpisode" ADD COLUMN "personaKey" TEXT;
ALTER TABLE "CustomerEpisode" ADD COLUMN "libraryId" TEXT;
ALTER TABLE "CustomerEpisode" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CustomerEpisode" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'custom';

-- AlterTable
ALTER TABLE "JourneyStage" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'gold';

-- CreateTable
CREATE TABLE "SpineConfig" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "activeEpisodeId" TEXT,
    "activePersonaKey" TEXT,
    "activeJourneySource" TEXT,
    "draftJson" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpineConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SpineConfig_serviceId_key" ON "SpineConfig"("serviceId");

ALTER TABLE "SpineConfig" ADD CONSTRAINT "SpineConfig_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "GPSSAService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
