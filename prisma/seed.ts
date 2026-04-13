import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedBenchmarkDataset } from "../src/lib/benchmarking/seed";

const prisma = new PrismaClient();

const GPSSA_SERVICES = [
  { name: "Registration of an Insured", category: "Employer", description: "A service request to register an Emirati employee with the GPSSA.", userTypes: ["Employer"] },
  { name: "Employers Registration", category: "Employer", description: "A service request to register an employer/entity with the GPSSA.", userTypes: ["Employer"] },
  { name: "Apply for End Of Service - Civil", category: "Employer", description: "A service request to register the end-of-service of a registered insured individual.", userTypes: ["Employer"] },
  { name: "Generate Certificates", category: "General", description: "This service enables the member to obtain accredited certificates from GPSSA.", userTypes: ["Agent", "Beneficiary", "Employer", "Insured", "Pensioner"] },
  { name: "Caretaker Enrollment", category: "Caretaker", description: "A service request to become a caretaker for a registered GPSSA member.", userTypes: ["Caretaker"] },
  { name: "Beneficiary Registration", category: "Beneficiary", description: "A service request to register as a beneficiary for a GPSSA pensioner or insured member who has passed away.", userTypes: ["Agent", "Beneficiary", "Caretaker", "Guardian"] },
  { name: "Pension Advisory Service", category: "Insured", description: "This service allows customers to book a Pension Advisory session.", userTypes: ["Insured"] },
  { name: "Update Payment Schedule for Merge Service", category: "Insured", description: "This service allows the insured to extend the installment period for merge costs.", userTypes: ["Insured"] },
  { name: "Change Payment Method for Merge/Purchase", category: "Insured", description: "This service allows the member to update their payment method.", userTypes: ["Insured"] },
  { name: "Pension Entitlement Update", category: "Beneficiary", description: "A service request to update and confirm personal information for pension eligibility.", userTypes: ["Agent", "Beneficiary", "Caretaker", "Guardian", "Pensioner"] },
  { name: "Registration of GCC Nationals", category: "GCC", description: "This service allows employers to register GCC national employees working in UAE.", userTypes: ["Employer", "GCC"] },
  { name: "Submit Complaint, Inquiry, Suggestion", category: "General", description: "This service allows customers to submit inquiries, comments, or suggestions.", userTypes: ["Beneficiary", "Employer", "GCC", "Insured", "Pensioner"] },
  { name: "Registration of UAE Nationals in GCC", category: "GCC", description: "This service allows GCC employers to register UAE national employees.", userTypes: ["Employer", "GCC"] },
  { name: "Purchase of Service Years", category: "Insured", description: "A service request to purchase additional service years.", userTypes: ["Insured"] },
  { name: "Agent Enrollment", category: "Agent", description: "A service request to become an agent for a registered GPSSA member.", userTypes: ["Agent"] },
  { name: "Guardian Enrollment", category: "Guardian", description: "A service request to become an agent for a minor beneficiary.", userTypes: ["Guardian"] },
  { name: "Report a Death", category: "General", description: "A service request to report the passing of a registered GPSSA member.", userTypes: ["Agent", "Beneficiary", "Caretaker", "Employer", "Guardian", "Insured", "Pensioner"] },
  { name: "Apply for End Of Service - Military", category: "Military", description: "A service request to register the end of service of a Military individual.", userTypes: ["Employer", "Military"] },
  { name: "Merge Service Period - Civil", category: "Insured", description: "A service request to combine previous service periods with a current one.", userTypes: ["Insured"] },
  { name: "Cancel Merge/Purchase Payments", category: "Insured", description: "A service request to cancel remaining payments linked to merge or purchase.", userTypes: ["Insured"] },
  { name: "Workplace Injury Compensation", category: "Employer", description: "A service request to report a workplace injury and claim compensation.", userTypes: ["Employer", "Insured"] },
  { name: "Merge Service Period - Military", category: "Military", description: "A service request to combine a military employee's previous service periods.", userTypes: ["Employer", "Military"] },
  { name: "Employer Registration - Self Employed", category: "Self-Employer", description: "A service request to register as self-employed with the GPSSA.", userTypes: ["Self Employer"] },
  { name: "Benefit Exchange - Inward", category: "Employer", description: "A service request to register an insured individual from another pension authority.", userTypes: ["Employer"] },
  { name: "Benefit Exchange - Outward", category: "Employer", description: "A service request to transfer an insured individual to another pension authority.", userTypes: ["Employer"] },
  { name: "Service Awareness Request", category: "Employer", description: "Request GPSSA to deliver an awareness workshop about the UAE Pension Law.", userTypes: ["Employer"] },
  { name: "Work Fitness Assessment", category: "Employer", description: "Submit work fitness requests to evaluate employee health status.", userTypes: ["Employer"] },
  { name: "Shourak Payment", category: "Insured", description: "Allows insured Emiratis who opted for Shourak to request end of service benefits.", userTypes: ["Insured"] },
  { name: "End of Service of GCC Nationals", category: "GCC", description: "Register the end-of-service of a GCC national insured individual.", userTypes: ["Employer", "GCC"] },
  { name: "End of Service for UAE Nationals in GCC", category: "GCC", description: "Register the end-of-service for a UAE national working in the GCC.", userTypes: ["Employer", "GCC"] },
  { name: "Employer DeRegistration", category: "Employer", description: "A service request to de-register an employer/entity from GPSSA.", userTypes: ["Employer"] },
];

const SAMPLE_INSTITUTIONS = [
  { name: "General Pension and Social Security Authority", shortName: "GPSSA", country: "United Arab Emirates", countryCode: "AE", region: "Middle East", description: "Federal entity managing retirement benefits of UAE nationals.", digitalMaturity: "Advanced", websiteUrl: "https://gpssa.gov.ae" },
  { name: "Department for Work and Pensions", shortName: "DWP", country: "United Kingdom", countryCode: "GB", region: "Europe", description: "UK government department responsible for welfare and pensions policy.", digitalMaturity: "Advanced", websiteUrl: "https://www.gov.uk/government/organisations/department-for-work-pensions" },
  { name: "Central Provident Fund Board", shortName: "CPF", country: "Singapore", countryCode: "SG", region: "Asia-Pacific", description: "Comprehensive social security system for Singapore citizens.", digitalMaturity: "Leader", websiteUrl: "https://www.cpf.gov.sg" },
  { name: "Sociale Verzekeringsbank", shortName: "SVB", country: "Netherlands", countryCode: "NL", region: "Europe", description: "Implements national insurance schemes including old age pension.", digitalMaturity: "Leader", websiteUrl: "https://www.svb.nl" },
  { name: "Australian Taxation Office - Super", shortName: "ATO Super", country: "Australia", countryCode: "AU", region: "Asia-Pacific", description: "Manages Australia's superannuation guarantee system.", digitalMaturity: "Advanced", websiteUrl: "https://www.ato.gov.au/super" },
  { name: "Deutsche Rentenversicherung", shortName: "DRV", country: "Germany", countryCode: "DE", region: "Europe", description: "German statutory pension insurance provider.", digitalMaturity: "Intermediate", websiteUrl: "https://www.deutsche-rentenversicherung.de" },
  { name: "Japan Pension Service", shortName: "JPS", country: "Japan", countryCode: "JP", region: "Asia-Pacific", description: "Operates Japan's public pension system.", digitalMaturity: "Advanced", websiteUrl: "https://www.nenkin.go.jp" },
  { name: "Canada Pension Plan", shortName: "CPP", country: "Canada", countryCode: "CA", region: "North America", description: "Contributory earnings-related social insurance program.", digitalMaturity: "Advanced", websiteUrl: "https://www.canada.ca/en/services/benefits/publicpensions/cpp.html" },
  { name: "Swedish Pensions Agency", shortName: "SPA", country: "Sweden", countryCode: "SE", region: "Europe", description: "Administers and pays out the national public pension in Sweden.", digitalMaturity: "Leader", websiteUrl: "https://www.pensionsmyndigheten.se" },
  { name: "National Pension Service", shortName: "NPS", country: "South Korea", countryCode: "KR", region: "Asia-Pacific", description: "South Korea's public pension scheme.", digitalMaturity: "Advanced", websiteUrl: "https://www.nps.or.kr" },
];

const SEED_DATA_SOURCES = [
  { title: "GPSSA Official Portal", url: "https://gpssa.gov.ae", publisher: "GPSSA", sourceType: "website", description: "Official GPSSA website with service catalog and institutional information.", region: "Middle East" },
  { title: "GPSSA Service Catalog", url: "https://gpssa.gov.ae/en/services", publisher: "GPSSA", sourceType: "website", description: "Complete list of GPSSA digital services available to members, employers, and beneficiaries.", region: "Middle East" },
  { title: "UAE Federal Decree-Law No. 57 of 2023 on Pensions and Social Security", url: "https://gpssa.gov.ae/en/about/legislation", publisher: "UAE Government", sourceType: "report", description: "Primary legislation governing GPSSA operations and pension benefits in the UAE.", region: "Middle East" },
  { title: "UN E-Government Survey 2024", url: "https://publicadministration.un.org/egovkb/en-us/Reports/UN-E-Government-Survey-2024", publisher: "United Nations DESA", sourceType: "report", description: "Biennial survey assessing e-government development of UN member states.", region: "Global" },
  { title: "OECD Digital Government Index 2023", url: "https://www.oecd.org/governance/digital-government/", publisher: "OECD", sourceType: "report", description: "OECD assessment of digital government policies and practices across member countries.", region: "Global" },
  { title: "World Bank GovTech Maturity Index 2022", url: "https://www.worldbank.org/en/programs/govtech/gtmi", publisher: "World Bank", sourceType: "report", description: "Index measuring government technology maturity across four focus areas.", region: "Global" },
  { title: "Singapore CPF Official Portal", url: "https://www.cpf.gov.sg", publisher: "CPF Board", sourceType: "website", description: "Central Provident Fund Board digital services and information portal.", region: "Asia-Pacific" },
  { title: "UK DWP Digital Strategy", url: "https://www.gov.uk/government/organisations/department-for-work-pensions", publisher: "UK Government", sourceType: "website", description: "Department for Work and Pensions digital transformation strategy and services.", region: "Europe" },
  { title: "Swedish Pensions Agency Annual Report 2023", url: "https://www.pensionsmyndigheten.se/", publisher: "Pensionsmyndigheten", sourceType: "report", description: "Annual report covering Swedish pension system performance and digital initiatives.", region: "Europe" },
  { title: "ISSA Guidelines on Information and Communication Technology", url: "https://www.issa.int/guidelines/ict", publisher: "International Social Security Association", sourceType: "report", description: "ISSA guidelines on ICT for social security administration.", region: "Global" },
];

async function main() {
  console.log("Seeding GPSSA Compass database...");

  const hashedPassword = await bcrypt.hash("Ayden3", 12);

  await prisma.user.upsert({
    where: { email: "utena.treves@gmail.com" },
    update: { password: hashedPassword, userType: "adl" },
    create: {
      email: "utena.treves@gmail.com",
      password: hashedPassword,
      name: "Utena Treves",
      role: "admin",
      userType: "adl",
      hasCompletedProfile: true,
    },
  });
  console.log("  Admin user seeded");

  for (const svc of GPSSA_SERVICES) {
    await prisma.gPSSAService.upsert({
      where: { id: svc.name.replace(/\s+/g, "-").toLowerCase().slice(0, 25) },
      update: {},
      create: {
        name: svc.name,
        category: svc.category,
        description: svc.description,
        userTypes: JSON.stringify(svc.userTypes),
      },
    }).catch(() => {
      return prisma.gPSSAService.create({
        data: {
          name: svc.name,
          category: svc.category,
          description: svc.description,
          userTypes: JSON.stringify(svc.userTypes),
        },
      }).catch(() => null);
    });
  }
  console.log(`  ${GPSSA_SERVICES.length} GPSSA services seeded`);

  for (const inst of SAMPLE_INSTITUTIONS) {
    await prisma.institution.upsert({
      where: { name: inst.name },
      update: {
        shortName: inst.shortName,
        country: inst.country,
        countryCode: inst.countryCode,
        region: inst.region,
        description: inst.description,
        digitalMaturity: inst.digitalMaturity,
        websiteUrl: inst.websiteUrl,
      },
      create: {
        name: inst.name,
        shortName: inst.shortName,
        country: inst.country,
        countryCode: inst.countryCode,
        region: inst.region,
        description: inst.description,
        digitalMaturity: inst.digitalMaturity,
        websiteUrl: inst.websiteUrl,
      },
    });
  }
  console.log(`  ${SAMPLE_INSTITUTIONS.length} institutions seeded`);

  const benchmarkSeed = await seedBenchmarkDataset(prisma);
  console.log(
    `  Benchmark dataset seeded (${benchmarkSeed.institutionCount} peer institutions, ${benchmarkSeed.scoreCount} scores, ${benchmarkSeed.kpiValueCount} KPI values)`
  );

  for (const src of SEED_DATA_SOURCES) {
    await prisma.dataSource.upsert({
      where: { id: src.url },
      update: {},
      create: {
        title: src.title,
        url: src.url,
        publisher: src.publisher,
        sourceType: src.sourceType,
        description: src.description,
        region: src.region,
        accessedAt: new Date(),
      },
    }).catch(() => {
      return prisma.dataSource.create({
        data: {
          title: src.title,
          url: src.url,
          publisher: src.publisher,
          sourceType: src.sourceType,
          description: src.description,
          region: src.region,
          accessedAt: new Date(),
        },
      }).catch(() => null);
    });
  }
  console.log(`  ${SEED_DATA_SOURCES.length} data sources seeded`);

  await prisma.appConfig.upsert({
    where: { key: "platform_name" },
    update: {},
    create: { key: "platform_name", value: "GPSSA Compass" },
  });
  console.log("  App config seeded");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
