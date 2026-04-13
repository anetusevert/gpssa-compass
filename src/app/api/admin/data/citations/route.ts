import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { dataService } from "@/lib/services";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const { entityType, entityId, sourceId, citation, evidenceNote } = body;

    if (!entityType || !entityId || !sourceId) {
      return NextResponse.json(
        { error: "entityType, entityId, and sourceId are required" },
        { status: 400 }
      );
    }

    let result;
    switch (entityType) {
      case "service":
        result = await dataService.linkServiceSource(entityId, sourceId, citation, evidenceNote);
        break;
      case "institution":
        result = await dataService.linkInstitutionSource(entityId, sourceId, citation, evidenceNote);
        break;
      case "opportunity":
        result = await dataService.linkOpportunitySource(entityId, sourceId, citation, evidenceNote);
        break;
      case "requirement":
        result = await dataService.linkRequirementSource(entityId, sourceId, citation, evidenceNote);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid entityType. Use: service, institution, opportunity, requirement" },
          { status: 400 }
        );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("Failed to link citation:", err);
    return NextResponse.json(
      { error: "Failed to link citation" },
      { status: 500 }
    );
  }
}
