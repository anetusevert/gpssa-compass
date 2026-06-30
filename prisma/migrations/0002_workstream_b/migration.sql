-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "riceScore" DOUBLE PRECISION,
ADD COLUMN     "wsjfScore" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "RoadmapPhase" ADD COLUMN     "workstream" TEXT;

-- AlterTable
ALTER TABLE "KPI" ADD COLUMN     "direction" TEXT NOT NULL DEFAULT 'higher-better',
ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'kpi',
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "perspective" TEXT,
ADD COLUMN     "tier" TEXT,
ADD COLUMN     "timing" TEXT;

-- CreateTable
CREATE TABLE "QualityDimension" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "definition" TEXT,
    "category" TEXT NOT NULL DEFAULT 'accuracy',
    "copcFamily" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityDimension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QAScorecard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "serviceScope" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QAScorecard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QAScorecardCriterion" (
    "id" TEXT NOT NULL,
    "scorecardId" TEXT NOT NULL,
    "dimensionId" TEXT,
    "text" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "critical" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QAScorecardCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QASamplingPlan" (
    "id" TEXT NOT NULL,
    "scorecardId" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'hybrid',
    "populationSize" INTEGER NOT NULL DEFAULT 0,
    "confidenceLevel" DOUBLE PRECISION NOT NULL DEFAULT 95,
    "marginError" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "riskWeighting" TEXT,
    "cadence" TEXT NOT NULL DEFAULT 'monthly',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QASamplingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QAReview" (
    "id" TEXT NOT NULL,
    "scorecardId" TEXT NOT NULL,
    "serviceName" TEXT,
    "caseRef" TEXT NOT NULL,
    "reviewer" TEXT,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerAccuracy" BOOLEAN NOT NULL DEFAULT true,
    "businessAccuracy" BOOLEAN NOT NULL DEFAULT true,
    "complianceAccuracy" BOOLEAN NOT NULL DEFAULT true,
    "autoFailTriggered" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QAReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QAReviewItem" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT true,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "note" TEXT,

    CONSTRAINT "QAReviewItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QACalibrationSession" (
    "id" TEXT NOT NULL,
    "scorecardId" TEXT NOT NULL,
    "caseRef" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluatorCount" INTEGER NOT NULL DEFAULT 0,
    "irrScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "driftNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QACalibrationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QACalibrationScore" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "evaluator" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "QACalibrationScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorTaxonomyNode" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'major',
    "category" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ErrorTaxonomyNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Defect" (
    "id" TEXT NOT NULL,
    "taxonomyNodeId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'qa',
    "serviceName" TEXT,
    "caseRef" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'major',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Defect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectiveAction" (
    "id" TEXT NOT NULL,
    "defectId" TEXT,
    "clusterLabel" TEXT,
    "title" TEXT NOT NULL,
    "rootCauseMethod" TEXT NOT NULL DEFAULT '5why',
    "rootCause" TEXT,
    "actionType" TEXT NOT NULL DEFAULT 'corrective',
    "owner" TEXT,
    "dueDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "effectivenessCheck" TEXT,
    "cycle" TEXT NOT NULL DEFAULT 'pdca',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorrectiveAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QAScorecardSourceCitation" (
    "id" TEXT NOT NULL,
    "scorecardId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "citation" TEXT,
    "evidenceNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QAScorecardSourceCitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SLADefinition" (
    "id" TEXT NOT NULL,
    "serviceName" TEXT,
    "name" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'standard',
    "type" TEXT NOT NULL DEFAULT 'sla',
    "targetHours" INTEGER NOT NULL DEFAULT 24,
    "underpinsSlaId" TEXT,
    "direction" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SLADefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCase" (
    "id" TEXT NOT NULL,
    "serviceName" TEXT,
    "caseRef" TEXT NOT NULL,
    "segment" TEXT NOT NULL DEFAULT 'manual-review',
    "impact" TEXT NOT NULL DEFAULT 'medium',
    "urgency" TEXT NOT NULL DEFAULT 'medium',
    "priority" TEXT NOT NULL DEFAULT 'P3',
    "status" TEXT NOT NULL DEFAULT 'open',
    "owner" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slaId" TEXT,
    "dueAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "breached" BOOLEAN NOT NULL DEFAULT false,
    "breachRiskLevel" TEXT NOT NULL DEFAULT 'green',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Breach" (
    "id" TEXT NOT NULL,
    "caseId" TEXT,
    "slaId" TEXT,
    "breachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hoursOver" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "escalationType" TEXT NOT NULL DEFAULT 'functional',
    "defectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Breach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FulfilmentSnapshot" (
    "id" TEXT NOT NULL,
    "serviceName" TEXT,
    "period" TEXT NOT NULL,
    "avgTatHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "firstTimeRightPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reworkPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "backlogCount" INTEGER NOT NULL DEFAULT 0,
    "wipOver30" INTEGER NOT NULL DEFAULT 0,
    "pcePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dpmo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FulfilmentSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiMeasurement" (
    "id" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "target" DOUBLE PRECISION,
    "comparator" TEXT NOT NULL DEFAULT 'GPSSA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KpiMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CxMeasurement" (
    "id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "serviceName" TEXT,
    "channel" TEXT,
    "period" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "sampleSize" INTEGER,
    "driver" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CxMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintTheme" (
    "id" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "sentiment" TEXT NOT NULL DEFAULT 'negative',
    "serviceName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComputedKqi" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'avg',
    "scope" TEXT NOT NULL DEFAULT 'global',
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT,
    "formula" TEXT,
    "asOfDate" TIMESTAMP(3),
    "payload" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComputedKqi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenefitsRealisation" (
    "id" TEXT NOT NULL,
    "initiativeId" TEXT,
    "title" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "baseline" DOUBLE PRECISION NOT NULL,
    "target" DOUBLE PRECISION NOT NULL,
    "actual" DOUBLE PRECISION,
    "unit" TEXT,
    "status" TEXT NOT NULL DEFAULT 'on-track',
    "validatedBy" TEXT,
    "validatedAt" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BenefitsRealisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernanceForum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "cadence" TEXT NOT NULL DEFAULT 'daily',
    "purpose" TEXT,
    "attendees" TEXT,
    "owner" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernanceForum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaciEntry" (
    "id" TEXT NOT NULL,
    "processArea" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'R',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RaciEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapabilityTransferItem" (
    "id" TEXT NOT NULL,
    "phase" TEXT,
    "item" TEXT NOT NULL,
    "mechanism" TEXT NOT NULL DEFAULT 'train-the-trainer',
    "owner" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "sustainmentMetric" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CapabilityTransferItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QAScorecardCriterion_scorecardId_idx" ON "QAScorecardCriterion"("scorecardId");

-- CreateIndex
CREATE INDEX "QASamplingPlan_scorecardId_idx" ON "QASamplingPlan"("scorecardId");

-- CreateIndex
CREATE INDEX "QAReview_scorecardId_idx" ON "QAReview"("scorecardId");

-- CreateIndex
CREATE INDEX "QAReviewItem_reviewId_idx" ON "QAReviewItem"("reviewId");

-- CreateIndex
CREATE INDEX "QACalibrationSession_scorecardId_idx" ON "QACalibrationSession"("scorecardId");

-- CreateIndex
CREATE INDEX "QACalibrationScore_sessionId_idx" ON "QACalibrationScore"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorTaxonomyNode_code_key" ON "ErrorTaxonomyNode"("code");

-- CreateIndex
CREATE INDEX "ErrorTaxonomyNode_parentId_idx" ON "ErrorTaxonomyNode"("parentId");

-- CreateIndex
CREATE INDEX "Defect_taxonomyNodeId_idx" ON "Defect"("taxonomyNodeId");

-- CreateIndex
CREATE INDEX "CorrectiveAction_defectId_idx" ON "CorrectiveAction"("defectId");

-- CreateIndex
CREATE INDEX "QAScorecardSourceCitation_sourceId_idx" ON "QAScorecardSourceCitation"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "QAScorecardSourceCitation_scorecardId_sourceId_key" ON "QAScorecardSourceCitation"("scorecardId", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCase_caseRef_key" ON "ServiceCase"("caseRef");

-- CreateIndex
CREATE INDEX "ServiceCase_slaId_idx" ON "ServiceCase"("slaId");

-- CreateIndex
CREATE INDEX "Breach_caseId_idx" ON "Breach"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "FulfilmentSnapshot_serviceName_period_key" ON "FulfilmentSnapshot"("serviceName", "period");

-- CreateIndex
CREATE INDEX "KpiMeasurement_kpiId_idx" ON "KpiMeasurement"("kpiId");

-- CreateIndex
CREATE UNIQUE INDEX "KpiMeasurement_kpiId_period_comparator_key" ON "KpiMeasurement"("kpiId", "period", "comparator");

-- CreateIndex
CREATE INDEX "CxMeasurement_metric_idx" ON "CxMeasurement"("metric");

-- CreateIndex
CREATE UNIQUE INDEX "ComputedKqi_slug_key" ON "ComputedKqi"("slug");

-- CreateIndex
CREATE INDEX "BenefitsRealisation_initiativeId_idx" ON "BenefitsRealisation"("initiativeId");

-- CreateIndex
CREATE INDEX "RaciEntry_processArea_idx" ON "RaciEntry"("processArea");

-- CreateIndex
CREATE INDEX "KPI_parentId_idx" ON "KPI"("parentId");

-- AddForeignKey
ALTER TABLE "KPI" ADD CONSTRAINT "KPI_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "KPI"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QAScorecardCriterion" ADD CONSTRAINT "QAScorecardCriterion_scorecardId_fkey" FOREIGN KEY ("scorecardId") REFERENCES "QAScorecard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QAScorecardCriterion" ADD CONSTRAINT "QAScorecardCriterion_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "QualityDimension"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QASamplingPlan" ADD CONSTRAINT "QASamplingPlan_scorecardId_fkey" FOREIGN KEY ("scorecardId") REFERENCES "QAScorecard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QAReview" ADD CONSTRAINT "QAReview_scorecardId_fkey" FOREIGN KEY ("scorecardId") REFERENCES "QAScorecard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QAReviewItem" ADD CONSTRAINT "QAReviewItem_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "QAReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QAReviewItem" ADD CONSTRAINT "QAReviewItem_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "QAScorecardCriterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QACalibrationSession" ADD CONSTRAINT "QACalibrationSession_scorecardId_fkey" FOREIGN KEY ("scorecardId") REFERENCES "QAScorecard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QACalibrationScore" ADD CONSTRAINT "QACalibrationScore_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "QACalibrationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorTaxonomyNode" ADD CONSTRAINT "ErrorTaxonomyNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ErrorTaxonomyNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Defect" ADD CONSTRAINT "Defect_taxonomyNodeId_fkey" FOREIGN KEY ("taxonomyNodeId") REFERENCES "ErrorTaxonomyNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_defectId_fkey" FOREIGN KEY ("defectId") REFERENCES "Defect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QAScorecardSourceCitation" ADD CONSTRAINT "QAScorecardSourceCitation_scorecardId_fkey" FOREIGN KEY ("scorecardId") REFERENCES "QAScorecard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QAScorecardSourceCitation" ADD CONSTRAINT "QAScorecardSourceCitation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLADefinition" ADD CONSTRAINT "SLADefinition_underpinsSlaId_fkey" FOREIGN KEY ("underpinsSlaId") REFERENCES "SLADefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCase" ADD CONSTRAINT "ServiceCase_slaId_fkey" FOREIGN KEY ("slaId") REFERENCES "SLADefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Breach" ADD CONSTRAINT "Breach_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ServiceCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Breach" ADD CONSTRAINT "Breach_slaId_fkey" FOREIGN KEY ("slaId") REFERENCES "SLADefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Breach" ADD CONSTRAINT "Breach_defectId_fkey" FOREIGN KEY ("defectId") REFERENCES "Defect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiMeasurement" ADD CONSTRAINT "KpiMeasurement_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenefitsRealisation" ADD CONSTRAINT "BenefitsRealisation_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "RoadmapInitiative"("id") ON DELETE SET NULL ON UPDATE CASCADE;

