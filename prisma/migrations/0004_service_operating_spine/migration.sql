-- AlterTable
ALTER TABLE "QAScorecard" ADD COLUMN "serviceId" TEXT;

-- AlterTable
ALTER TABLE "QAReview" ADD COLUMN "caseId" TEXT;

-- AlterTable
ALTER TABLE "Defect" ADD COLUMN "serviceId" TEXT;

-- AlterTable
ALTER TABLE "SLADefinition" ADD COLUMN "serviceId" TEXT;

-- AlterTable
ALTER TABLE "ServiceCase" ADD COLUMN "serviceId" TEXT;

-- CreateTable
CREATE TABLE "CustomerEpisode" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyStage" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "episodeId" TEXT,
    "name" TEXT NOT NULL,
    "actor" TEXT NOT NULL DEFAULT 'agent',
    "outcome" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatingProcess" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerHint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperatingProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SopDocument" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SopDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SopStep" (
    "id" TEXT NOT NULL,
    "sopId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "instruction" TEXT,
    "qaCheckpoint" BOOLEAN NOT NULL DEFAULT false,
    "checkpointNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SopStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackofficeSystem" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'core',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackofficeSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessSystemLink" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'system-of-record',

    CONSTRAINT "ProcessSystemLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageProcessLink" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "processId" TEXT NOT NULL,

    CONSTRAINT "StageProcessLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BackofficeSystem_code_key" ON "BackofficeSystem"("code");
CREATE INDEX "CustomerEpisode_serviceId_idx" ON "CustomerEpisode"("serviceId");
CREATE INDEX "JourneyStage_serviceId_idx" ON "JourneyStage"("serviceId");
CREATE INDEX "JourneyStage_episodeId_idx" ON "JourneyStage"("episodeId");
CREATE INDEX "OperatingProcess_serviceId_idx" ON "OperatingProcess"("serviceId");
CREATE INDEX "SopDocument_processId_idx" ON "SopDocument"("processId");
CREATE INDEX "SopStep_sopId_idx" ON "SopStep"("sopId");
CREATE UNIQUE INDEX "ProcessSystemLink_processId_systemId_key" ON "ProcessSystemLink"("processId", "systemId");
CREATE INDEX "ProcessSystemLink_systemId_idx" ON "ProcessSystemLink"("systemId");
CREATE UNIQUE INDEX "StageProcessLink_stageId_processId_key" ON "StageProcessLink"("stageId", "processId");
CREATE INDEX "StageProcessLink_processId_idx" ON "StageProcessLink"("processId");
CREATE INDEX "QAScorecard_serviceId_idx" ON "QAScorecard"("serviceId");
CREATE INDEX "QAReview_caseId_idx" ON "QAReview"("caseId");
CREATE INDEX "Defect_serviceId_idx" ON "Defect"("serviceId");
CREATE INDEX "SLADefinition_serviceId_idx" ON "SLADefinition"("serviceId");
CREATE INDEX "ServiceCase_serviceId_idx" ON "ServiceCase"("serviceId");

-- AddForeignKey
ALTER TABLE "QAScorecard" ADD CONSTRAINT "QAScorecard_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "GPSSAService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "QAReview" ADD CONSTRAINT "QAReview_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ServiceCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Defect" ADD CONSTRAINT "Defect_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "GPSSAService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SLADefinition" ADD CONSTRAINT "SLADefinition_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "GPSSAService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ServiceCase" ADD CONSTRAINT "ServiceCase_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "GPSSAService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CustomerEpisode" ADD CONSTRAINT "CustomerEpisode_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "GPSSAService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JourneyStage" ADD CONSTRAINT "JourneyStage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "GPSSAService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JourneyStage" ADD CONSTRAINT "JourneyStage_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "CustomerEpisode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OperatingProcess" ADD CONSTRAINT "OperatingProcess_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "GPSSAService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SopDocument" ADD CONSTRAINT "SopDocument_processId_fkey" FOREIGN KEY ("processId") REFERENCES "OperatingProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SopStep" ADD CONSTRAINT "SopStep_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "SopDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProcessSystemLink" ADD CONSTRAINT "ProcessSystemLink_processId_fkey" FOREIGN KEY ("processId") REFERENCES "OperatingProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProcessSystemLink" ADD CONSTRAINT "ProcessSystemLink_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "BackofficeSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StageProcessLink" ADD CONSTRAINT "StageProcessLink_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "JourneyStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StageProcessLink" ADD CONSTRAINT "StageProcessLink_processId_fkey" FOREIGN KEY ("processId") REFERENCES "OperatingProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
