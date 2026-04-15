/**
 * GPSSA Intelligence Platform
 * Social Insurance Personas
 *
 * Research-backed persona definitions representing key segments
 * of the UAE / GCC workforce from a GPSSA social-insurance perspective.
 */

import {
  Briefcase,
  Users,
  Globe2,
  Store,
  Building2,
  Home,
  GraduationCap,
  Smartphone,
  Armchair,
  Tractor,
  type LucideIcon,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export interface PersonaSource {
  title: string;
  url: string;
  type: "official" | "academic" | "news";
  date: string;
}

export interface PersonaJourneyStep {
  title: string;
  description: string;
  duration: string;
  icon: string;
}

export interface PersonaDemographics {
  populationShare: number;
  registrationRate: number;
  keyAgeGroup: string;
  primarySectors: string[];
}

export interface PersonaCoverage {
  pension: boolean;
  endOfService: boolean;
  disabilityBenefit: boolean;
  deathBenefit: boolean;
  contributionRate: string;
  payer: "employer" | "shared" | "self" | "none";
  gaps: string[];
}

export interface PersonaGPSSAJourney {
  steps: PersonaJourneyStep[];
  totalDuration: string;
  outcome: string;
}

export interface PersonaResearch {
  keyNeeds: string[];
  challenges: string[];
  recentChanges: string[];
  sources: PersonaSource[];
}

export interface Persona {
  id: string;
  name: string;
  arabicName: string;
  tagline: string;
  description: string;
  avatarUrl: string;
  color: string;
  gradient: string;
  icon: LucideIcon;
  demographics: PersonaDemographics;
  coverage: PersonaCoverage;
  gpssaJourney: PersonaGPSSAJourney;
  research: PersonaResearch;
}

// ============================================================================
// PERSONA DEFINITIONS
// ============================================================================

export const personas: Persona[] = [
  // ── 1. Emirati Government Employee ──────────────────────────────────────
  {
    id: "emirati-govt-employee",
    name: "Emirati Government Employee",
    arabicName: "الموظف الحكومي الإماراتي",
    tagline: "The Backbone of Public Service",
    description:
      "Full-time UAE national employed in a federal or local government entity. Represents the largest GPSSA-registered segment with mandatory pension, disability, and death-in-service coverage funded through shared employer-employee contributions.",
    avatarUrl: "/personas/emirati-govt-employee.png",
    color: "purple",
    gradient: "from-purple-500/20 to-violet-600/20",
    icon: Briefcase,
    demographics: {
      populationShare: 28,
      registrationRate: 99,
      keyAgeGroup: "30–50",
      primarySectors: ["Federal Government", "Local Government", "Defence", "Education", "Healthcare"],
    },
    coverage: {
      pension: true,
      endOfService: true,
      disabilityBenefit: true,
      deathBenefit: true,
      contributionRate: "20% (5% employee + 15% employer)",
      payer: "shared",
      gaps: [
        "Pension adequacy for late-career joiners",
        "Coordination with private-sector service years",
      ],
    },
    gpssaJourney: {
      steps: [
        {
          title: "Employment & Registration",
          description:
            "POSITIVE: Employer automatically registers the employee with GPSSA on Day 1 of service. Digital registration via the employer portal ensures instant creation of the insured file. BENEFIT: Employee receives a GPSSA insured number and can track status through the Ma'ashi app from the start. CHALLENGE: Some employees are unaware of their registration details until they need a service.",
          duration: "Day 1",
          icon: "UserPlus",
        },
        {
          title: "Monthly Contributions",
          description:
            "POSITIVE: Contributions deducted automatically from payroll — 5% from the employee's pensionable salary and 15% from the employer. Government covers 2.5% of the employer share. INSIGHT: Contributions accrue toward both pension entitlement and disability/death coverage simultaneously. CHALLENGE: Employees on special allowances sometimes find that only base salary is pensionable, leading to adequacy surprises at retirement.",
          duration: "Ongoing",
          icon: "Wallet",
        },
        {
          title: "Service Accumulation",
          description:
            "POSITIVE: Each month of contribution adds to the qualifying period. 20 years of service qualifies for a full pension; 15 years for a reduced pension. BENEFIT: GPSSA allows purchase of additional service years in certain circumstances. INSIGHT: Employees who move between federal and local government retain continuity. CHALLENGE: Breaks in service (unpaid leave, secondment abroad) can create gaps that reduce the final pension calculation.",
          duration: "15–35 years",
          icon: "Clock",
        },
        {
          title: "Life Events",
          description:
            "POSITIVE: Marriage, children, and disability trigger automatic benefit adjustments. Death-in-service provides survivors a pension equal to the deceased's entitlement. BENEFIT: Disability pension covers both work-related and non-work-related incapacity. CHALLENGE: Documentation requirements for dependants can cause delays, especially for family members abroad.",
          duration: "As they occur",
          icon: "HeartPulse",
        },
        {
          title: "Pension Claim & Retirement",
          description:
            "POSITIVE: Retirement application submitted online via GPSSA portal or Ma'ashi app. Processing typically completed within 30 days. EXCELLENT: Pension paid monthly, indexed to last salary, with provisions for annual review. BENEFIT: Retirees retain healthcare card eligibility. CHALLENGE: Early retirement (before age 49 for men, 49 for women) incurs actuarial reduction unless 20+ years served.",
          duration: "30–60 days",
          icon: "FileCheck",
        },
        {
          title: "Post-Retirement",
          description:
            "POSITIVE: Monthly pension deposited automatically. Survivors' pension transfers seamlessly upon death. BENEFIT: Pensioners can re-enter the workforce in the private sector while continuing to receive pension. INSIGHT: GPSSA provides annual pension statements and allows online updates to bank details and beneficiaries. CHALLENGE: Inflation erosion over long retirement periods remains a concern.",
          duration: "Lifetime",
          icon: "Armchair",
        },
      ],
      totalDuration: "20–35 years of service + lifetime pension",
      outcome: "Comprehensive lifetime pension with disability and survivors' coverage",
    },
    research: {
      keyNeeds: [
        "Clear pension projections before retirement",
        "Easy online management of beneficiaries",
        "Coordination when transferring between government entities",
        "Inflation protection for long retirements",
      ],
      challenges: [
        "Low awareness of pensionable salary vs. total compensation",
        "Complexity of purchasing additional service years",
        "Late-career joiners face adequacy gaps",
        "Paper-based processes for some life-event claims",
      ],
      recentChanges: [
        "Ma'ashi mobile app launch for self-service",
        "Digital pension certificate issuance",
        "Enhanced disability assessment framework (2024)",
        "Inter-emirate service portability improvements",
      ],
      sources: [
        { title: "GPSSA Official Portal – Insured Services", url: "https://www.gpssa.gov.ae", type: "official", date: "2025" },
        { title: "UAE Federal Law No. 7 of 1999 (Pensions & Social Security)", url: "https://www.gpssa.gov.ae/en/laws", type: "official", date: "2024" },
        { title: "GPSSA Annual Statistical Report 2024", url: "https://www.gpssa.gov.ae/en/statistics", type: "official", date: "2024" },
      ],
    },
  },

  // ── 2. Emirati Female Professional ──────────────────────────────────────
  {
    id: "emirati-female-professional",
    name: "Emirati Female Professional",
    arabicName: "المهنية الإماراتية",
    tagline: "Driving Economic Diversification",
    description:
      "UAE national women entering the private and public sectors at growing rates. GPSSA provides equal pension entitlements with additional maternity-related provisions and earlier retirement eligibility at age 50 with 10 years of service.",
    avatarUrl: "/personas/emirati-female-professional.png",
    color: "cyan",
    gradient: "from-cyan-500/20 to-teal-600/20",
    icon: Users,
    demographics: {
      populationShare: 18,
      registrationRate: 92,
      keyAgeGroup: "25–45",
      primarySectors: ["Education", "Healthcare", "Finance", "Government", "Media & Communications"],
    },
    coverage: {
      pension: true,
      endOfService: true,
      disabilityBenefit: true,
      deathBenefit: true,
      contributionRate: "20% (5% employee + 15% employer)",
      payer: "shared",
      gaps: [
        "Maternity leave impact on pensionable salary continuity",
        "Part-time work provisions still developing",
        "Childcare cost not reflected in benefit design",
      ],
    },
    gpssaJourney: {
      steps: [
        {
          title: "Registration & Onboarding",
          description:
            "POSITIVE: Same registration process as male counterparts — employer files on Day 1. GPSSA insured number issued immediately. BENEFIT: Women have equal contribution rates and accrue identical pension rights from the start. INSIGHT: Federal law mandates no gender-based discrimination in pension entitlements.",
          duration: "Day 1",
          icon: "UserPlus",
        },
        {
          title: "Contributions & Maternity",
          description:
            "POSITIVE: Contributions continue during paid maternity leave (60 days federal law, often extended to 90 days by policy). IMPORTANT: Unpaid extensions beyond statutory leave suspend contributions — employee may purchase the gap. BENEFIT: Employers cannot reduce pensionable salary due to pregnancy. CHALLENGE: Women returning part-time after maternity may see lower pensionable salary affecting long-term adequacy.",
          duration: "Ongoing",
          icon: "Wallet",
        },
        {
          title: "Career Breaks",
          description:
            "CHALLENGE: Extended career breaks for childcare create contribution gaps. GPSSA allows purchase of up to 3 years of non-contributory service but at full cost (employee + employer share). POSITIVE: Recent policy discussions propose subsidised gap-filling for mothers. INSIGHT: Women who re-enter the workforce retain their prior service record — no loss of accrued rights.",
          duration: "Variable",
          icon: "Clock",
        },
        {
          title: "Family & Dependent Events",
          description:
            "POSITIVE: Marriage, divorce, and children trigger beneficiary updates processed digitally. Widowed or divorced women receive a share of the deceased/former spouse's pension. BENEFIT: Children of insured women are eligible dependant beneficiaries. CHALLENGE: Cross-border marriages may complicate survivors' pension if spouse is non-GCC.",
          duration: "As they occur",
          icon: "HeartPulse",
        },
        {
          title: "Retirement Eligibility",
          description:
            "EXCELLENT: Women qualify for pension at age 50 with 10 years of service — five years earlier than the male threshold. Full pension at age 50 with 20+ years of service. BENEFIT: Early retirement option available at any age with 20 years of service. INSIGHT: This earlier eligibility acknowledges career breaks and caregiving responsibilities. CHALLENGE: Earlier retirement may mean longer payout periods, raising adequacy questions for very long retirements.",
          duration: "Age 50 / 20 years",
          icon: "FileCheck",
        },
        {
          title: "Post-Retirement Support",
          description:
            "POSITIVE: Full pension with monthly deposit and annual statement. Healthcare eligibility retained. BENEFIT: Pension continues even if the retiree re-enters the private-sector workforce. INSIGHT: Survivors' pension protections extend to children and dependants upon the pensioner's death. CHALLENGE: Inflation and rising cost of living in the UAE may erode purchasing power over 30+ year retirements.",
          duration: "Lifetime",
          icon: "Armchair",
        },
      ],
      totalDuration: "10–30 years of service + lifetime pension",
      outcome: "Equal pension rights with maternity protections and earlier eligibility",
    },
    research: {
      keyNeeds: [
        "Pension gap calculators reflecting career breaks",
        "Subsidised purchase of maternity-related gaps",
        "Part-time contribution frameworks",
        "Clear guidance on divorce-related pension splitting",
      ],
      challenges: [
        "Career breaks reducing total pensionable service",
        "Part-time work not always registered with GPSSA",
        "Low awareness of gap-purchase options",
        "Longer retirement periods challenging adequacy",
      ],
      recentChanges: [
        "Extended maternity leave to 90 days in many entities",
        "Digital beneficiary management via Ma'ashi",
        "Policy proposals for subsidised gap-filling",
        "Increased female participation rate to 57% (2024)",
      ],
      sources: [
        { title: "GPSSA Guide for Female Insured Persons", url: "https://www.gpssa.gov.ae", type: "official", date: "2025" },
        { title: "UAE Gender Balance Council – Workforce Reports", url: "https://www.gbc.gov.ae", type: "official", date: "2024" },
        { title: "ILO — Social Protection for Women in the GCC", url: "https://www.ilo.org", type: "academic", date: "2024" },
      ],
    },
  },

  // ── 3. GCC Cross-Border Worker ──────────────────────────────────────────
  {
    id: "gcc-cross-border-worker",
    name: "GCC Cross-Border Worker",
    arabicName: "العامل الخليجي العابر للحدود",
    tagline: "Portability Across Borders",
    description:
      "GCC national (Bahraini, Omani, Saudi, Kuwaiti, Qatari) working in the UAE. Covered under the GCC Social Insurance Coordination Agreement which allows pension portability and aggregation of service across member states.",
    avatarUrl: "/personas/gcc-cross-border-worker.png",
    color: "blue",
    gradient: "from-blue-500/20 to-indigo-600/20",
    icon: Globe2,
    demographics: {
      populationShare: 6,
      registrationRate: 85,
      keyAgeGroup: "30–50",
      primarySectors: ["Finance & Banking", "Oil & Gas", "Professional Services", "Government", "Healthcare"],
    },
    coverage: {
      pension: true,
      endOfService: true,
      disabilityBenefit: true,
      deathBenefit: true,
      contributionRate: "20% (applied at host-country rate)",
      payer: "shared",
      gaps: [
        "Delays in inter-country data reconciliation",
        "Currency conversion on pension transfers",
        "Different vesting periods across GCC states",
        "Limited real-time portability visibility",
      ],
    },
    gpssaJourney: {
      steps: [
        {
          title: "Cross-Border Registration",
          description:
            "POSITIVE: GCC Coordination Agreement requires the host-country employer to register the GCC national with GPSSA as if they were a UAE national. Same contribution rates apply. BENEFIT: Home-country pension fund is notified and service continuity is maintained. CHALLENGE: Registration can be delayed if employer is unfamiliar with GCC-national obligations. INSIGHT: GPSSA issues a dedicated insured number for cross-border workers.",
          duration: "1–2 weeks",
          icon: "Globe",
        },
        {
          title: "Dual-Country Contributions",
          description:
            "POSITIVE: Contributions paid to GPSSA in the UAE are recognised by the home-country fund for pension calculation. IMPORTANT: The home country applies its own formula — contribution amounts are transferred, not pension entitlements directly. CHALLENGE: Exchange rate fluctuations between currencies can affect the transferred value. INSIGHT: Workers should verify both GPSSA and home-fund statements annually to ensure alignment.",
          duration: "Ongoing",
          icon: "Wallet",
        },
        {
          title: "Service Aggregation",
          description:
            "POSITIVE: Service years in the UAE aggregate with home-country service for meeting minimum vesting thresholds. EXCELLENT: A Bahraini with 10 years in Bahrain and 10 in the UAE qualifies for pensions in both countries. CHALLENGE: Different retirement ages and vesting rules across GCC states create complexity. INSIGHT: GPSSA's coordination unit handles the aggregation calculations.",
          duration: "Career span",
          icon: "Link",
        },
        {
          title: "Claim & Portability",
          description:
            "POSITIVE: Upon leaving the UAE, the worker files a portability claim with GPSSA. Accrued contributions are transferred to the home-country fund within 90 days. BENEFIT: No loss of accrued rights — the full employer and employee shares transfer. CHALLENGE: Administrative bottlenecks between national funds can extend timelines beyond 90 days. INSIGHT: Workers can track transfer status via GPSSA portal.",
          duration: "60–120 days",
          icon: "Send",
        },
        {
          title: "Home-Country Retirement",
          description:
            "POSITIVE: Combined service across GCC states counts toward the home pension. The worker applies to their home fund citing UAE service. BENEFIT: GPSSA provides certified service statements digitally. CHALLENGE: Workers who served in 3+ GCC countries face complex multi-fund coordination. INSIGHT: GCC Secretariat mediates disputes between national funds if they arise.",
          duration: "Standard home process",
          icon: "FileCheck",
        },
      ],
      totalDuration: "Variable — depends on cross-border career span",
      outcome: "Full pension portability across GCC with aggregated service recognition",
    },
    research: {
      keyNeeds: [
        "Real-time pension portability tracking dashboard",
        "Harmonised service statements across GCC",
        "Currency-neutral contribution reporting",
        "Single point of contact for multi-country claims",
      ],
      challenges: [
        "Inter-fund data exchange delays",
        "Varying retirement ages across GCC states",
        "Exchange rate impact on transferred contributions",
        "Low awareness of coordination agreement rights",
      ],
      recentChanges: [
        "GCC Coordination Agreement amendment (2023)",
        "Digital service certificates via GPSSA portal",
        "Bilateral reconciliation automation pilot",
        "Unified GCC insured-person ID proposal",
      ],
      sources: [
        { title: "GCC Social Insurance Coordination Agreement", url: "https://www.gcc-sg.org", type: "official", date: "2023" },
        { title: "GPSSA Cross-Border Workers Guide", url: "https://www.gpssa.gov.ae", type: "official", date: "2025" },
        { title: "ILO — Social Security Coordination in the Gulf", url: "https://www.ilo.org", type: "academic", date: "2024" },
      ],
    },
  },

  // ── 4. Self-Employed Emirati ────────────────────────────────────────────
  {
    id: "self-employed-emirati",
    name: "Self-Employed Emirati",
    arabicName: "الإماراتي العامل لحسابه",
    tagline: "Voluntary Coverage, Real Gaps",
    description:
      "UAE national running a small business, freelancing, or working independently. Eligible for voluntary GPSSA coverage but must shoulder both employee and employer contribution shares, creating affordability barriers.",
    avatarUrl: "/personas/self-employed-emirati.png",
    color: "amber",
    gradient: "from-amber-500/20 to-orange-600/20",
    icon: Store,
    demographics: {
      populationShare: 8,
      registrationRate: 35,
      keyAgeGroup: "30–55",
      primarySectors: ["Retail & Trade", "Real Estate", "Consulting", "Agriculture", "Creative Industries"],
    },
    coverage: {
      pension: true,
      endOfService: false,
      disabilityBenefit: true,
      deathBenefit: true,
      contributionRate: "20% (self-funded, government may subsidise 2.5%)",
      payer: "self",
      gaps: [
        "Full 20% contribution burden on individual",
        "Irregular income makes consistent contributions difficult",
        "No employer share — affordability barrier",
        "Low awareness of voluntary scheme existence",
      ],
    },
    gpssaJourney: {
      steps: [
        {
          title: "Voluntary Registration",
          description:
            "CHALLENGE: Unlike employed nationals, self-employed individuals must proactively register with GPSSA. The process requires trade licence or freelance permit documentation. POSITIVE: Registration is available online through the GPSSA portal. INSIGHT: Many self-employed Emiratis are unaware they can voluntarily join. Government outreach campaigns have increased awareness since 2023.",
          duration: "1–2 weeks",
          icon: "UserPlus",
        },
        {
          title: "Self-Funded Contributions",
          description:
            "CHALLENGE: The self-employed person pays the full 20% — both the employee (5%) and employer (15%) portions. On a pensionable salary of AED 20,000, that is AED 4,000 per month. POSITIVE: The government subsidises 2.5% for eligible categories, reducing the burden to 17.5%. INSIGHT: Contributions can be based on a declared income, but GPSSA audits declarations. CHALLENGE: Irregular business income makes consistent monthly contributions difficult.",
          duration: "Monthly",
          icon: "Wallet",
        },
        {
          title: "Contribution Gaps & Catch-Up",
          description:
            "CHALLENGE: Missed contributions during low-revenue months create service gaps. GPSSA does not automatically suspend — arrears accumulate. POSITIVE: Arrears can be paid retroactively within 12 months without penalty. After 12 months, a 2% monthly surcharge applies. INSIGHT: A dedicated payment plan option was introduced in 2024 for entrepreneurs facing temporary cash-flow issues.",
          duration: "As needed",
          icon: "AlertTriangle",
        },
        {
          title: "Benefit Accrual",
          description:
            "POSITIVE: Service years accrue identically to employed nationals — 20 years for full pension. Disability and death-in-service coverage are active as long as contributions are current. IMPORTANT: If contributions lapse for more than 6 consecutive months, disability and death coverage suspend until arrears are cleared. CHALLENGE: Many self-employed workers don't realise coverage suspends.",
          duration: "15–35 years",
          icon: "Clock",
        },
        {
          title: "Retirement Claim",
          description:
            "POSITIVE: Same pension formula as employed nationals — 2.5% of average pensionable salary per year of service, capped at 100%. BENEFIT: No employer approval needed — the self-employed individual files directly. CHALLENGE: Declared pensionable salary may be lower than actual income, resulting in an inadequate pension. INSIGHT: GPSSA pension counsellors offer pre-retirement adequacy reviews.",
          duration: "30–60 days",
          icon: "FileCheck",
        },
      ],
      totalDuration: "15–35 years of voluntary contributions + lifetime pension",
      outcome: "Full pension if contributions maintained, but affordability is the key barrier",
    },
    research: {
      keyNeeds: [
        "Flexible contribution schedules tied to revenue cycles",
        "Government subsidy expansion for the full employer share",
        "Simplified mobile-first registration",
        "Pension adequacy projections for variable incomes",
      ],
      challenges: [
        "Full 20% contribution burden discourages registration",
        "Irregular income leads to contribution gaps",
        "Low awareness of the voluntary scheme",
        "Penalty structure for arrears feels punitive",
      ],
      recentChanges: [
        "2.5% government subsidy for eligible self-employed (2023)",
        "Payment plan option for contribution arrears (2024)",
        "Outreach campaign targeting freelancers",
        "Freelance permit integration with GPSSA registration",
      ],
      sources: [
        { title: "GPSSA Voluntary Insurance Guide", url: "https://www.gpssa.gov.ae", type: "official", date: "2025" },
        { title: "UAE Ministry of Economy — SME & Freelance Report", url: "https://www.moec.gov.ae", type: "official", date: "2024" },
        { title: "World Bank — Extending Social Protection to Self-Employed", url: "https://www.worldbank.org", type: "academic", date: "2024" },
      ],
    },
  },

  // ── 5. Expat Corporate Professional ─────────────────────────────────────
  {
    id: "expat-corporate-professional",
    name: "Expat Corporate Professional",
    arabicName: "المهني المقيم",
    tagline: "End-of-Service, Not Pension",
    description:
      "Long-tenure expatriate working in a UAE private-sector corporation. Not eligible for GPSSA pension — relies on end-of-service gratuity under UAE Labour Law. Represents the majority of the UAE workforce but sits outside the social insurance system.",
    avatarUrl: "/personas/expat-corporate-professional.png",
    color: "indigo",
    gradient: "from-indigo-500/20 to-blue-600/20",
    icon: Building2,
    demographics: {
      populationShare: 65,
      registrationRate: 0,
      keyAgeGroup: "25–55",
      primarySectors: ["Finance", "Technology", "Construction Management", "Professional Services", "Hospitality"],
    },
    coverage: {
      pension: false,
      endOfService: true,
      disabilityBenefit: false,
      deathBenefit: false,
      contributionRate: "None (end-of-service gratuity only)",
      payer: "employer",
      gaps: [
        "No pension — only lump-sum gratuity",
        "Gratuity not portable across employers",
        "No disability or death-in-service insurance via GPSSA",
        "Gratuity often inadequate for retirement",
        "No inflation protection on gratuity",
      ],
    },
    gpssaJourney: {
      steps: [
        {
          title: "Employment Start",
          description:
            "CRITICAL: Expatriate workers are NOT registered with GPSSA. They fall entirely outside the social insurance system. REALITY: End-of-service gratuity under UAE Labour Law is the only statutory retirement-adjacent benefit. INSIGHT: Some employers offer voluntary savings plans (DEWS) but adoption remains limited. CHALLENGE: New employees often assume pension coverage exists.",
          duration: "Day 1",
          icon: "UserPlus",
        },
        {
          title: "Gratuity Accrual",
          description:
            "PARTIAL: End-of-service gratuity accrues at 21 days' salary per year for the first 5 years and 30 days per year thereafter. CHALLENGE: Calculated on basic salary only — housing, transport, and other allowances excluded. IMPORTANT: The maximum gratuity is capped at 2 years' total salary regardless of tenure. INSIGHT: A 20-year employee may receive the same gratuity as a 10-year employee due to the cap.",
          duration: "Per year of service",
          icon: "Wallet",
        },
        {
          title: "DEWS Alternative",
          description:
            "POSITIVE: The DIFC Employee Workplace Savings (DEWS) scheme — introduced in DIFC — replaces gratuity with a funded, portable savings plan. BENEFIT: Contributions are invested and belong to the employee. INSIGHT: Proposals exist to extend DEWS-like models UAE-wide. CHALLENGE: Currently limited to DIFC-registered entities. Most expats have no access.",
          duration: "DIFC employees only",
          icon: "Building2",
        },
        {
          title: "Termination & Payout",
          description:
            "CHALLENGE: Gratuity is paid as a lump sum upon termination — no ongoing pension. CRITICAL: If the employee resigns before 1 year, no gratuity is owed. Between 1–5 years, only a fraction is payable. POSITIVE: Full gratuity is payable after 5 years. REALITY: Many expats cycle through multiple employers, resetting the accrual each time. CHALLENGE: Employer insolvency can jeopardise gratuity payment.",
          duration: "Upon termination",
          icon: "FileCheck",
        },
        {
          title: "Post-UAE — No Safety Net",
          description:
            "CRITICAL: Upon leaving the UAE, the expat has no ongoing income from the UAE system. Lump-sum gratuity must fund retirement independently. CHALLENGE: No survivors' benefit for family if the expat dies post-departure. REALITY: Many long-tenure expats leave after 20+ years with savings inadequate for retirement. INSIGHT: Financial literacy and private pension uptake are the only mitigations available.",
          duration: "Post-departure",
          icon: "Plane",
        },
      ],
      totalDuration: "Employer-dependent — no lifetime coverage",
      outcome: "Lump-sum gratuity only — no ongoing pension or insurance",
    },
    research: {
      keyNeeds: [
        "Portable savings scheme accessible to all expats",
        "Employer-funded pension alternative to gratuity",
        "Financial literacy programs for retirement planning",
        "Survivors' protection for families of long-tenure expats",
      ],
      challenges: [
        "Complete exclusion from GPSSA",
        "Gratuity cap limits retirement adequacy",
        "No portability across employers",
        "Low private pension penetration",
        "Employer insolvency risk",
      ],
      recentChanges: [
        "DEWS scheme operational in DIFC (2020+)",
        "UAE Labour Law reform — new gratuity rules (2022)",
        "Discussion of national savings scheme for expats",
        "Mandatory employer-provided medical insurance expansion",
      ],
      sources: [
        { title: "UAE Labour Law — End of Service Benefits", url: "https://www.mohre.gov.ae", type: "official", date: "2024" },
        { title: "DIFC Employee Workplace Savings (DEWS)", url: "https://www.difc.ae", type: "official", date: "2024" },
        { title: "World Bank — Migrant Workers and Social Protection in the GCC", url: "https://www.worldbank.org", type: "academic", date: "2023" },
      ],
    },
  },

  // ── 6. Domestic Worker ──────────────────────────────────────────────────
  {
    id: "domestic-worker",
    name: "Domestic Worker",
    arabicName: "العامل المنزلي",
    tagline: "The Invisible Workforce",
    description:
      "Housemaids, nannies, drivers, and gardeners working in private households. Excluded from both GPSSA and standard Labour Law coverage. The most vulnerable segment, reliant on employer goodwill and evolving regulatory protections.",
    avatarUrl: "/personas/domestic-worker.png",
    color: "rose",
    gradient: "from-rose-500/20 to-pink-600/20",
    icon: Home,
    demographics: {
      populationShare: 12,
      registrationRate: 0,
      keyAgeGroup: "25–50",
      primarySectors: ["Private Households"],
    },
    coverage: {
      pension: false,
      endOfService: false,
      disabilityBenefit: false,
      deathBenefit: false,
      contributionRate: "None",
      payer: "none",
      gaps: [
        "Completely excluded from GPSSA",
        "No pension or retirement benefits",
        "No disability coverage",
        "No death-in-service benefit",
        "End-of-service gratuity not always enforced",
        "Healthcare dependent on employer",
      ],
    },
    gpssaJourney: {
      steps: [
        {
          title: "Arrival & Employment",
          description:
            "CRITICAL: Domestic workers are NOT registered with GPSSA. They arrive on employer-sponsored visas with contracts governed by Federal Decree-Law No. 9 of 2022, separate from the standard Labour Law. POSITIVE: The 2022 law established basic rights including rest days, annual leave, and notice periods. CHALLENGE: Enforcement depends heavily on employer compliance. Many workers are unaware of their legal rights.",
          duration: "Upon arrival",
          icon: "Plane",
        },
        {
          title: "Working Conditions",
          description:
            "CHALLENGE: Live-in arrangements blur the boundary between work and rest. POSITIVE: The 2022 law mandates 12 hours of rest per day including 8 consecutive hours. REALITY: Working hours are difficult to monitor in private households. INSIGHT: The Tadbeer system introduced standardised contracts and regulated recruitment agencies. CHALLENGE: Passport confiscation remains illegal but still reported.",
          duration: "Contract duration",
          icon: "Home",
        },
        {
          title: "Injury or Illness",
          description:
            "CRITICAL: No occupational injury coverage through any social insurance system. Medical costs fall on the employer under the contract. CHALLENGE: If the employer refuses to pay, the worker has limited recourse. POSITIVE: Mandatory health insurance in Abu Dhabi and Dubai covers basic medical care. DANGER: Serious injuries in the household are often unreported. INSIGHT: MOHRE hotline (600 590000) is available in multiple languages.",
          duration: "As occurs",
          icon: "Stethoscope",
        },
        {
          title: "End of Contract",
          description:
            "PARTIAL: The 2022 law provides for 14 days' salary per year of service as end-of-service gratuity. CHALLENGE: This is significantly less than the standard Labour Law gratuity (21 days/year). CRITICAL: Many workers leave without receiving gratuity due to informal termination or absconding situations. POSITIVE: Tadbeer centres mediate disputes. INSIGHT: Workers who complete 5+ years rarely exist in practice due to 2-year contract cycles.",
          duration: "Upon contract end",
          icon: "FileCheck",
        },
        {
          title: "Return to Home Country",
          description:
            "CRITICAL: No pension, no ongoing benefit, no survivors' coverage. The domestic worker returns home with whatever savings and gratuity they managed to accumulate. REALITY: Remittances during employment are often the primary financial planning mechanism. CHALLENGE: Workers who become disabled during service may be repatriated with no long-term support. INSIGHT: Some bilateral agreements between sending and receiving countries provide limited protections.",
          duration: "Post-departure",
          icon: "HelpCircle",
        },
      ],
      totalDuration: "Typically 2–4 year contract cycles",
      outcome: "No formal social insurance protections — highest vulnerability",
    },
    research: {
      keyNeeds: [
        "Inclusion in any form of social insurance",
        "Mandatory occupational injury coverage",
        "Enforceable end-of-service payments",
        "Access to dispute resolution in native languages",
        "Financial literacy before departure",
      ],
      challenges: [
        "Complete exclusion from social insurance",
        "Isolated working conditions",
        "Language barriers",
        "Power imbalance with employer/sponsor",
        "Informal termination and lost entitlements",
        "Cultural and legal barriers to reporting abuse",
      ],
      recentChanges: [
        "Federal Decree-Law No. 9 of 2022 for domestic workers",
        "Tadbeer system for regulated recruitment",
        "Mandatory health insurance expansion",
        "MOHRE multilingual hotline launch",
      ],
      sources: [
        { title: "Federal Decree-Law No. 9 of 2022 on Domestic Workers", url: "https://www.mohre.gov.ae", type: "official", date: "2022" },
        { title: "Tadbeer – Domestic Worker Services", url: "https://www.mohre.gov.ae", type: "official", date: "2024" },
        { title: "ILO — Decent Work for Domestic Workers in the GCC", url: "https://www.ilo.org", type: "academic", date: "2023" },
      ],
    },
  },

  // ── 7. Young Emirati Graduate ───────────────────────────────────────────
  {
    id: "young-emirati-graduate",
    name: "Young Emirati Graduate",
    arabicName: "الخريج الإماراتي الشاب",
    tagline: "Tomorrow's Insured",
    description:
      "Recent university graduate entering the workforce for the first time. First encounter with GPSSA — critical onboarding moment that shapes lifetime engagement with the social insurance system.",
    avatarUrl: "/personas/young-emirati-graduate.png",
    color: "emerald",
    gradient: "from-emerald-500/20 to-green-600/20",
    icon: GraduationCap,
    demographics: {
      populationShare: 10,
      registrationRate: 88,
      keyAgeGroup: "21–28",
      primarySectors: ["Government", "Banking", "Technology", "Retail", "Energy"],
    },
    coverage: {
      pension: true,
      endOfService: true,
      disabilityBenefit: true,
      deathBenefit: true,
      contributionRate: "20% (5% employee + 15% employer)",
      payer: "shared",
      gaps: [
        "Low awareness of GPSSA at career start",
        "Job-hopping may create registration gaps",
        "Pension feels irrelevant at age 22",
        "National service period coordination unclear",
      ],
    },
    gpssaJourney: {
      steps: [
        {
          title: "First Job Registration",
          description:
            "POSITIVE: Employer registers the graduate with GPSSA on first day of employment. Insured number issued and visible in Ma'ashi app. CHALLENGE: Many graduates don't know what GPSSA is or what it provides. Onboarding materials from employers rarely cover pension. INSIGHT: National Service completers may have prior GPSSA registration — coordination needed. OPPORTUNITY: This is the highest-impact moment for GPSSA engagement and financial literacy.",
          duration: "Day 1",
          icon: "UserPlus",
        },
        {
          title: "First Contributions",
          description:
            "POSITIVE: 5% deducted from first paycheck — small enough to be manageable. Employer contributes 15% on top. CHALLENGE: Graduates often see the 5% deduction as a 'tax' with no immediate benefit. Pension feels 30+ years away. INSIGHT: Framing contributions as 'future salary' rather than 'deduction' improves acceptance. OPPORTUNITY: Ma'ashi app could show accumulated balance in real-time to build engagement.",
          duration: "Monthly from Day 1",
          icon: "Wallet",
        },
        {
          title: "Job Changes",
          description:
            "CHALLENGE: Young Emiratis change jobs more frequently — average 2–3 jobs in first 5 years. Each transition requires new employer registration. POSITIVE: GPSSA service continuity is maintained across employers — no loss of accrued rights. IMPORTANT: Gaps between jobs (even a few weeks) technically suspend disability/death coverage. INSIGHT: A grace period proposal is under discussion.",
          duration: "First 5 years",
          icon: "Building2",
        },
        {
          title: "Early Life Events",
          description:
            "POSITIVE: Marriage triggers beneficiary registration. First child adds a dependant to the GPSSA record. BENEFIT: Death-in-service coverage now protects the young family. INSIGHT: This is when pension becomes personally relevant for the first time. CHALLENGE: Many young workers delay beneficiary registration due to administrative friction.",
          duration: "Age 25–35",
          icon: "HeartPulse",
        },
        {
          title: "Long-Term Accumulation",
          description:
            "POSITIVE: By age 30, the graduate has 8+ years of contributions and a meaningful projected pension. BENEFIT: Ma'ashi app provides estimated pension at retirement. INSIGHT: Compound growth of contributions over decades is the most powerful wealth-building mechanism available. OPPORTUNITY: GPSSA engagement at this stage builds lifetime trust and compliance.",
          duration: "Ongoing",
          icon: "TrendingUp",
        },
      ],
      totalDuration: "Career start to pension — 25+ years ahead",
      outcome: "Full GPSSA coverage from Day 1 — engagement at this stage shapes lifetime behaviour",
    },
    research: {
      keyNeeds: [
        "Clear, jargon-free GPSSA onboarding at first job",
        "Mobile-first engagement through Ma'ashi app",
        "Pension projection tools showing compound growth",
        "Grace period for job transitions",
      ],
      challenges: [
        "Pension irrelevance at young age",
        "5% deduction seen as loss, not investment",
        "Job-hopping creates administrative friction",
        "Low financial literacy on pension mechanics",
      ],
      recentChanges: [
        "Ma'ashi app with pension projections",
        "GPSSA campus outreach programmes (2024)",
        "National Service–GPSSA coordination improvements",
        "Emiratisation driving higher registration rates",
      ],
      sources: [
        { title: "GPSSA — New Insured Persons Guide", url: "https://www.gpssa.gov.ae", type: "official", date: "2025" },
        { title: "FCSA — UAE Youth Employment Statistics", url: "https://www.fcsa.gov.ae", type: "official", date: "2024" },
        { title: "Mercer — Youth Pension Engagement in Emerging Markets", url: "https://www.mercer.com", type: "academic", date: "2024" },
      ],
    },
  },

  // ── 8. Gig Economy Worker ───────────────────────────────────────────────
  {
    id: "gig-economy-worker",
    name: "Gig Economy Worker",
    arabicName: "عامل الاقتصاد المرن",
    tagline: "Connected but Uncovered",
    description:
      "App-based driver, delivery rider, or freelance platform worker. May be Emirati or expatriate. Falls through the cracks of both GPSSA (if non-national or not registered) and Labour Law (classified as independent contractor). The fastest-growing uncovered segment.",
    avatarUrl: "/personas/gig-economy-worker.png",
    color: "orange",
    gradient: "from-orange-500/20 to-amber-600/20",
    icon: Smartphone,
    demographics: {
      populationShare: 7,
      registrationRate: 5,
      keyAgeGroup: "22–40",
      primarySectors: ["Ride-Hailing", "Food Delivery", "Freelance Services", "E-Commerce Logistics", "Content Creation"],
    },
    coverage: {
      pension: false,
      endOfService: false,
      disabilityBenefit: false,
      deathBenefit: false,
      contributionRate: "None (unless voluntarily registered Emirati)",
      payer: "none",
      gaps: [
        "Not classified as employees — no employer obligations",
        "No automatic GPSSA registration",
        "No occupational injury coverage",
        "No end-of-service or pension accrual",
        "Platform companies disclaim employer responsibility",
      ],
    },
    gpssaJourney: {
      steps: [
        {
          title: "Platform Onboarding",
          description:
            "CRITICAL: Gig workers onboard via the platform app — not through an employer. No GPSSA registration occurs. The worker is classified as an independent contractor. CHALLENGE: Workers often don't realise they have zero social insurance coverage. POSITIVE: If the worker is a UAE national, they can voluntarily register with GPSSA as self-employed. REALITY: Fewer than 5% of eligible gig workers are registered.",
          duration: "Day 1",
          icon: "Smartphone",
        },
        {
          title: "Daily Operations",
          description:
            "CHALLENGE: Income is variable — based on trips, deliveries, or tasks completed. No pensionable salary exists. CRITICAL: An injury during a delivery or ride has no occupational coverage. The worker bears all medical costs. INSIGHT: Some platforms offer voluntary accident insurance but it covers only platform-active hours. REALITY: Most gig workers are one serious accident away from financial catastrophe.",
          duration: "Ongoing",
          icon: "Car",
        },
        {
          title: "Voluntary Registration (If Emirati)",
          description:
            "POSITIVE: Emirati gig workers can register with GPSSA as self-employed and pay the 20% contribution. CHALLENGE: On variable income averaging AED 6,000/month, the AED 1,200 monthly contribution is burdensome. INSIGHT: Government subsidy of 2.5% reduces this slightly. REALITY: Contribution compliance is inconsistent due to income volatility. CHALLENGE: Expat gig workers have NO path to GPSSA registration.",
          duration: "If registered",
          icon: "UserPlus",
        },
        {
          title: "Injury or Platform Exit",
          description:
            "CRITICAL: No severance, no gratuity, no pension — the worker simply stops receiving trip offers. CHALLENGE: Platform deactivation can happen without notice, leaving the worker with zero safety net. POSITIVE: Abu Dhabi has piloted a mandatory accident insurance scheme for delivery riders. INSIGHT: Global trends toward gig worker classification as employees have not yet reached UAE law.",
          duration: "Upon exit",
          icon: "AlertTriangle",
        },
        {
          title: "Retirement — The Gap",
          description:
            "CRITICAL: Unless voluntarily registered (Emirati only), the gig worker has no retirement income from the UAE system. REALITY: Years of platform work contribute nothing to any pension. CHALLENGE: Financial planning falls entirely on the individual with no institutional support. INSIGHT: Policy proposals for a portable gig-worker savings scheme are in early discussion but not yet legislated.",
          duration: "Post-career",
          icon: "HelpCircle",
        },
      ],
      totalDuration: "No defined timeline — coverage absent",
      outcome: "Near-zero social insurance coverage — the largest emerging protection gap",
    },
    research: {
      keyNeeds: [
        "Mandatory platform-funded accident insurance",
        "Portable savings scheme for gig workers",
        "Simplified GPSSA registration for Emirati gig workers",
        "Income-smoothing contribution models",
        "Clear legal classification of platform workers",
      ],
      challenges: [
        "Independent contractor classification avoids obligations",
        "Variable income prevents consistent contributions",
        "Platforms disclaim employer responsibility",
        "Expat gig workers have no GPSSA path",
        "Rapid sector growth outpacing regulation",
      ],
      recentChanges: [
        "Abu Dhabi mandatory delivery rider insurance pilot (2024)",
        "Federal freelance permit expansion",
        "GPSSA voluntary registration for self-employed Emiratis",
        "Gig economy regulatory framework discussions (2025)",
      ],
      sources: [
        { title: "UAE Ministry of Human Resources — Gig Economy Framework", url: "https://www.mohre.gov.ae", type: "official", date: "2025" },
        { title: "Abu Dhabi Department of Economic Development — Rider Insurance", url: "https://www.added.gov.ae", type: "official", date: "2024" },
        { title: "ILO — Platform Work and Social Protection", url: "https://www.ilo.org", type: "academic", date: "2024" },
      ],
    },
  },

  // ── 9. Emirati Retiree ──────────────────────────────────────────────────
  {
    id: "emirati-retiree",
    name: "Emirati Retiree",
    arabicName: "المتقاعد الإماراتي",
    tagline: "Lifetime Pension, Evolving Needs",
    description:
      "Retired UAE national receiving a monthly GPSSA pension. Represents the system's fulfilment of its core promise — but faces challenges around adequacy, inflation, healthcare continuity, and managing complex life events in later years.",
    avatarUrl: "/personas/emirati-retiree.png",
    color: "slate",
    gradient: "from-slate-500/20 to-gray-600/20",
    icon: Armchair,
    demographics: {
      populationShare: 5,
      registrationRate: 100,
      keyAgeGroup: "50–80+",
      primarySectors: ["Retired — formerly Government", "Military", "Education", "Oil & Gas"],
    },
    coverage: {
      pension: true,
      endOfService: true,
      disabilityBenefit: true,
      deathBenefit: true,
      contributionRate: "N/A (pension in payment)",
      payer: "shared",
      gaps: [
        "Inflation erosion over 20–30 year retirements",
        "Healthcare cost not fully covered by pension",
        "Complex beneficiary changes (deaths, divorces)",
        "Digital channel accessibility for elderly retirees",
      ],
    },
    gpssaJourney: {
      steps: [
        {
          title: "Pension Commencement",
          description:
            "POSITIVE: Monthly pension begins within 30 days of approved retirement. Deposited directly to bank account. BENEFIT: Pension calculated at 2.5% of final average salary per year of service — a 30-year employee receives 75% of salary. EXCELLENT: GPSSA issues a pension certificate and annual statement. INSIGHT: First pension payment is a milestone moment — GPSSA provides concierge support.",
          duration: "Month 1",
          icon: "Wallet",
        },
        {
          title: "Ongoing Pension Management",
          description:
            "POSITIVE: Bank details, beneficiary information, and certificates managed via Ma'ashi app or GPSSA portal. Annual pension statements issued. BENEFIT: Pensioners receive cost-of-living adjustments when government approves. CHALLENGE: Adjustments are not automatic or indexed — they are discretionary. INSIGHT: Many retirees rely on family members to navigate digital channels.",
          duration: "Monthly",
          icon: "FileCheck",
        },
        {
          title: "Healthcare Continuity",
          description:
            "POSITIVE: Retirees retain healthcare card eligibility through government health programmes. CHALLENGE: Pension does not include a healthcare component — separate government schemes provide coverage. INSIGHT: Out-of-pocket costs for specialist care, dental, and vision can be significant. CHALLENGE: Retirees living outside major cities face access gaps. POSITIVE: Thiqa (Abu Dhabi) and similar schemes provide comprehensive coverage for nationals.",
          duration: "Lifetime",
          icon: "Stethoscope",
        },
        {
          title: "Life Events in Retirement",
          description:
            "CHALLENGE: Death of a spouse, divorce, or disability in retirement requires GPSSA notification and benefit recalculation. POSITIVE: Survivors' pension transfers automatically to eligible dependants. BENEFIT: Pension continues for widows/widowers and eligible children. CHALLENGE: Elderly retirees may struggle with documentation requirements. INSIGHT: GPSSA has introduced assisted service at Emirates Post offices for in-person support.",
          duration: "As they occur",
          icon: "HeartPulse",
        },
        {
          title: "Survivors' Pension Transition",
          description:
            "POSITIVE: Upon the pensioner's death, eligible dependants receive a proportionate survivors' pension — distributed among spouse(s), children, and parents. BENEFIT: Survivors' pension continues for children until marriage (daughters) or age 21/completion of education (sons). CHALLENGE: Complex family structures (multiple marriages, stepchildren) require careful adjudication. INSIGHT: GPSSA has a dedicated survivors' team for compassionate case management.",
          duration: "Upon death",
          icon: "Users",
        },
      ],
      totalDuration: "Lifetime pension — 20–35 years in retirement",
      outcome: "Monthly pension with survivors' protections — adequacy and accessibility are key concerns",
    },
    research: {
      keyNeeds: [
        "Automatic inflation indexation of pensions",
        "Integrated healthcare coverage with pension",
        "Simplified life-event reporting for elderly",
        "Clear survivors' pension guidance for families",
      ],
      challenges: [
        "Inflation eroding purchasing power over decades",
        "Healthcare costs not embedded in pension",
        "Digital literacy barriers for elderly pensioners",
        "Complex beneficiary adjudication",
      ],
      recentChanges: [
        "Ma'ashi app accessibility improvements (2024)",
        "Emirates Post assisted-service partnerships",
        "Survivors' pension processing time reduced to 15 days",
        "Annual pension adequacy review framework",
      ],
      sources: [
        { title: "GPSSA — Pensioner Services Guide", url: "https://www.gpssa.gov.ae", type: "official", date: "2025" },
        { title: "UAE National Human Resource Development Report", url: "https://www.fahr.gov.ae", type: "official", date: "2024" },
        { title: "OECD — Pension Adequacy in Non-OECD Economies", url: "https://www.oecd.org", type: "academic", date: "2024" },
      ],
    },
  },

  // ── 10. Rural / Agricultural Worker ─────────────────────────────────────
  {
    id: "rural-agricultural-worker",
    name: "Rural Agricultural Worker",
    arabicName: "العامل الزراعي",
    tagline: "Remote and Unregistered",
    description:
      "Farm labourer, fisherman, or date-palm worker operating in rural areas of the UAE. Typically expatriate with minimal contract formality. Among the least visible segments with the lowest social insurance registration rates and the most precarious employment conditions.",
    avatarUrl: "/personas/rural-agricultural-worker.png",
    color: "lime",
    gradient: "from-lime-600/20 to-green-700/20",
    icon: Tractor,
    demographics: {
      populationShare: 4,
      registrationRate: 8,
      keyAgeGroup: "25–55",
      primarySectors: ["Agriculture", "Fishing", "Animal Husbandry", "Date Palm Farming"],
    },
    coverage: {
      pension: false,
      endOfService: false,
      disabilityBenefit: false,
      deathBenefit: false,
      contributionRate: "None",
      payer: "none",
      gaps: [
        "Often employed informally without written contracts",
        "No GPSSA or Labour Law registration",
        "No occupational injury or health coverage",
        "Geographic isolation from service centres",
        "Language barriers — many speak only Urdu, Hindi, or Bengali",
        "Heat-related illness risks with no protection framework",
      ],
    },
    gpssaJourney: {
      steps: [
        {
          title: "Arrival & Informal Employment",
          description:
            "CRITICAL: Many agricultural workers arrive on farming visas with minimal contractual terms. Registration with any social insurance system is non-existent. CHALLENGE: Farm owners in remote areas often operate outside regulatory oversight. POSITIVE: MOHRE inspections have increased but rural areas remain under-resourced. REALITY: Workers may live on-farm with no separation between work and living space.",
          duration: "Upon arrival",
          icon: "Plane",
        },
        {
          title: "Working Conditions",
          description:
            "CHALLENGE: Extreme heat exposure during UAE summers (45°C+) with no consistent enforcement of midday work bans in agriculture. CRITICAL: No occupational injury insurance — a serious farm injury means the worker pays or goes without treatment. POSITIVE: Mandatory health insurance in Abu Dhabi provides basic coverage. REALITY: Many rural workers are excluded from insurance due to informal employment. INSIGHT: Heat-related illness is the leading occupational risk.",
          duration: "Contract duration",
          icon: "Sun",
        },
        {
          title: "Injury or Illness",
          description:
            "CRITICAL: No social insurance coverage of any kind. Medical costs fall entirely on the employer — if the employer acknowledges responsibility. CHALLENGE: Remote locations mean long travel to hospitals. Emergency services may be delayed. DANGER: Untreated injuries lead to disability with no compensation framework. POSITIVE: Al Ain hospital and rural health clinics have expanded capacity. INSIGHT: Workers often self-medicate or rely on peer networks.",
          duration: "As occurs",
          icon: "Stethoscope",
        },
        {
          title: "End of Employment",
          description:
            "CHALLENGE: No formal end-of-service gratuity in practice — many workers leave with only final salary payment. CRITICAL: If the farm closes or the employer defaults, the worker has no legal safety net. POSITIVE: MOHRE complaints system is available but requires awareness and language access. REALITY: Most workers simply accept the situation and return home.",
          duration: "Upon termination",
          icon: "FileCheck",
        },
        {
          title: "Return Home — Zero Safety Net",
          description:
            "CRITICAL: No pension, no gratuity, no disability support. The worker returns to their home country with whatever cash savings they managed. REALITY: Years of physically demanding work contribute nothing to any retirement system. CHALLENGE: Workers who develop chronic conditions (respiratory, musculoskeletal) from farm work bear costs in their home country. INSIGHT: Bilateral labour agreements between UAE and sending countries are the only potential avenue for improvement.",
          duration: "Post-departure",
          icon: "HelpCircle",
        },
      ],
      totalDuration: "Typically 2–5 year stays with zero coverage",
      outcome: "No social insurance protections — among the most vulnerable in the UAE workforce",
    },
    research: {
      keyNeeds: [
        "Mandatory employer-funded accident insurance",
        "Enforceable heat-exposure work bans",
        "Formalised employment contracts for farm workers",
        "Mobile health clinics for remote agricultural areas",
        "Basic end-of-service guarantee enforcement",
      ],
      challenges: [
        "Complete exclusion from all social insurance",
        "Informal employment with no contracts",
        "Geographic isolation from regulatory oversight",
        "Language barriers — no Arabic or English",
        "Heat exposure without adequate protections",
        "Employer dependency for all basic needs",
      ],
      recentChanges: [
        "Expanded MOHRE inspections to agricultural areas (2024)",
        "Mandatory health insurance in Abu Dhabi covering some farm workers",
        "Midday work ban enforcement improvements",
        "Mobile ID system for tracking informal workers",
      ],
      sources: [
        { title: "UAE Ministry of Climate Change — Agricultural Worker Safety", url: "https://www.moccae.gov.ae", type: "official", date: "2024" },
        { title: "MOHRE — Informal Employment Task Force Report", url: "https://www.mohre.gov.ae", type: "official", date: "2024" },
        { title: "ILO — Agricultural Workers and Social Protection", url: "https://www.ilo.org", type: "academic", date: "2023" },
      ],
    },
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPersonaById(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}

export function getPersonaColor(color: string): string {
  const colorMap: Record<string, string> = {
    purple: "#a855f7",
    cyan: "#06b6d4",
    blue: "#3b82f6",
    amber: "#f59e0b",
    indigo: "#6366f1",
    rose: "#f43f5e",
    emerald: "#10b981",
    orange: "#f97316",
    slate: "#64748b",
    lime: "#84cc16",
  };
  return colorMap[color] || "#2DD4BF";
}

export function getCoverageStatus(persona: Persona): "full" | "partial" | "none" {
  if (persona.coverage.pension && persona.coverage.disabilityBenefit && persona.coverage.deathBenefit) {
    return "full";
  } else if (persona.coverage.pension || persona.coverage.endOfService) {
    return "partial";
  }
  return "none";
}

export function getCoverageLabel(status: "full" | "partial" | "none"): string {
  const labels = {
    full: "Full GPSSA Coverage",
    partial: "Partial Coverage",
    none: "No Coverage",
  };
  return labels[status];
}
