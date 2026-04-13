import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

const GPSSA_SERVICES = [
  { name: "Registration of an Insured", category: "Employer" },
  { name: "Employers Registration", category: "Employer" },
  { name: "Apply for End Of Service - Civil", category: "Employer" },
  { name: "Generate Certificates", category: "General" },
  { name: "Caretaker Enrollment", category: "Caretaker" },
  { name: "Beneficiary Registration", category: "Beneficiary" },
  { name: "Pension Advisory Service", category: "Insured" },
  { name: "Update Payment Schedule Modification for Merge Service", category: "Insured" },
  { name: "Change Payment Method for Merge/Purchase Service", category: "Insured" },
  { name: "Pension Entitlement Update", category: "Beneficiary" },
  { name: "Registration of GCC nationals", category: "GCC" },
  { name: "Submit Complaint/Inquiry/Suggestion", category: "General" },
  { name: "Registration of UAE nationals in GCC", category: "GCC" },
  { name: "Purchase of Service Years", category: "Insured" },
  { name: "Agent Enrollment", category: "Agent" },
  { name: "Guardian Enrollment", category: "Guardian" },
  { name: "Report a Death", category: "General" },
  { name: "Apply for End Of Service - Military", category: "Military" },
  { name: "Merge Service Period - Civil", category: "Insured" },
  { name: "Cancel Merge/Purchase Payments", category: "Insured" },
  { name: "Workplace Injury Compensation", category: "Employer" },
  { name: "Merge Service Period - Military", category: "Military" },
  { name: "Employer Registration - Self Employed", category: "Self-Employer" },
  { name: "Benefit Exchange - Inward", category: "Employer" },
  { name: "Benefit Exchange - Outward", category: "Employer" },
  { name: "Service Awareness Request", category: "Employer" },
  { name: "Work Fitness Assessment", category: "Employer" },
  { name: "Shourak Payment", category: "Insured" },
  { name: "End of Service of GCC Nationals", category: "GCC" },
  { name: "End of Service for UAE Nationals in GCC", category: "GCC" },
  { name: "Employer DeRegistration", category: "Employer" },
];

export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    let created = 0;
    let skipped = 0;

    for (const svc of GPSSA_SERVICES) {
      const existing = await prisma.gPSSAService.findFirst({
        where: { name: svc.name },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.gPSSAService.create({
        data: {
          name: svc.name,
          category: svc.category,
          userTypes: JSON.stringify([svc.category]),
        },
      });
      created++;
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total: GPSSA_SERVICES.length,
    });
  } catch (err) {
    console.error("Failed to seed services:", err);
    return NextResponse.json(
      { error: "Failed to seed services" },
      { status: 500 }
    );
  }
}
