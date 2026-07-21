/**
 * Curated lifecycle episode catalog for the Service Operating Spine.
 * Dense enough that every persona has a mature set of ready episodes + journeys.
 */

export type LifecycleCategory =
  | "join"
  | "contribute"
  | "claim"
  | "end-of-service"
  | "survivor"
  | "disability"
  | "mobility"
  | "employer"
  | "family"
  | "records";

export interface LibraryEpisode {
  id: string;
  category: LifecycleCategory;
  name: string;
  description: string;
  /** Prefer matching GPSSAService.name contains / equals */
  serviceNameHint: string;
  suggestedPersonaKeys: string[];
  defaultStages: { name: string; actor: string; outcome: string }[];
}

export const LIFECYCLE_CATEGORIES: {
  id: LifecycleCategory;
  label: string;
  blurb: string;
}[] = [
  { id: "join", label: "Join & register", blurb: "First contact with GPSSA coverage" },
  { id: "contribute", label: "Contribute", blurb: "Ongoing contribution & records" },
  { id: "records", label: "Records & evidence", blurb: "Corrections, certificates, statements" },
  { id: "claim", label: "Claim benefits", blurb: "Pension and benefit claims" },
  { id: "end-of-service", label: "End of service", blurb: "EOS and leaving employment" },
  { id: "survivor", label: "Survivor", blurb: "Death-in-service and survivors" },
  { id: "disability", label: "Disability", blurb: "Disability assessment & payment" },
  { id: "mobility", label: "Mobility / GCC", blurb: "Cross-border and transfers" },
  { id: "family", label: "Family events", blurb: "Maternity, dependants, marital status" },
  { id: "employer", label: "Employer ops", blurb: "Employer registration & filings" },
];

type Stage = LibraryEpisode["defaultStages"][number];

function S(
  ...rows: [name: string, actor: Stage["actor"], outcome: string][]
): Stage[] {
  return rows.map(([name, actor, outcome]) => ({ name, actor, outcome }));
}

const ALL_WORKERS = [
  "emirati-govt-employee",
  "emirati-female-professional",
  "expat-corporate-professional",
  "gig-economy-worker",
  "gcc-cross-border-worker",
  "domestic-worker",
  "rural-agricultural-worker",
  "young-emirati-graduate",
  "self-employed-emirati",
] as const;

export const EPISODE_LIBRARY: LibraryEpisode[] = [
  // ── End of service ──────────────────────────────────────────
  {
    id: "lib-eos-civil",
    category: "end-of-service",
    name: "Member claims end-of-service benefits (Civil)",
    description:
      "Employer initiates EOS for a civil insured; member expects correct entitlement and timely payment.",
    serviceNameHint: "Apply for End Of Service - Civil",
    suggestedPersonaKeys: ["emirati-govt-employee", "emirati-female-professional", "young-emirati-graduate"],
    defaultStages: S(
      ["Apply / intake", "customer", "Case created"],
      ["Document completeness", "agent", "Pack validated"],
      ["Manual entitlement review", "agent", "Decision drafted"],
      ["Approve / reject", "agent", "Decision recorded"],
      ["Payment & notify", "system", "Paid / notified"]
    ),
  },
  {
    id: "lib-eos-private",
    category: "end-of-service",
    name: "Private-sector EOS settlement",
    description: "Employee leaves private employer; EOS dues calculated and paid.",
    serviceNameHint: "End of Service",
    suggestedPersonaKeys: [
      "expat-corporate-professional",
      "gig-economy-worker",
      "emirati-female-professional",
      "domestic-worker",
    ],
    defaultStages: S(
      ["Employer files EOS", "customer", "Request lodged"],
      ["Service period check", "agent", "History confirmed"],
      ["Calculate dues", "agent", "Amount set"],
      ["Pay & close", "system", "Settled"]
    ),
  },
  {
    id: "lib-eos-resignation",
    category: "end-of-service",
    name: "Voluntary resignation EOS path",
    description: "Insured resigns; service period and contribution continuity verified before settlement.",
    serviceNameHint: "End of Service",
    suggestedPersonaKeys: [
      "emirati-govt-employee",
      "emirati-female-professional",
      "expat-corporate-professional",
      "young-emirati-graduate",
    ],
    defaultStages: S(
      ["Resignation notice logged", "customer", "Case opened"],
      ["Contribution continuity check", "agent", "Gaps flagged"],
      ["Entitlement calculation", "agent", "Amount drafted"],
      ["Member confirmation", "customer", "Accepted"],
      ["Settlement payment", "system", "Paid"]
    ),
  },
  {
    id: "lib-eos-redundancy",
    category: "end-of-service",
    name: "Redundancy / restructuring EOS",
    description: "Employer-led exit; bulk or individual EOS with accelerated review.",
    serviceNameHint: "End of Service",
    suggestedPersonaKeys: ["emirati-govt-employee", "expat-corporate-professional", "emirati-female-professional"],
    defaultStages: S(
      ["Employer bulk notification", "customer", "Batch lodged"],
      ["Per-member eligibility", "agent", "List validated"],
      ["Calculate & approve", "agent", "Awards set"],
      ["Batch payment", "system", "Settled"]
    ),
  },

  // ── Join & register ─────────────────────────────────────────
  {
    id: "lib-register-insured",
    category: "join",
    name: "Register new insured person",
    description: "First registration of an Emirati or covered worker into GPSSA.",
    serviceNameHint: "Register",
    suggestedPersonaKeys: [
      "young-emirati-graduate",
      "emirati-govt-employee",
      "emirati-female-professional",
      "expat-corporate-professional",
    ],
    defaultStages: S(
      ["Submit registration", "customer", "Application in"],
      ["Identity verify", "agent", "ID confirmed"],
      ["Create account", "system", "Insured created"],
      ["Confirm to parties", "system", "Notified"]
    ),
  },
  {
    id: "lib-first-job-onboard",
    category: "join",
    name: "First-job GPSSA onboarding",
    description: "Graduate or new entrant joins workforce; employer files Day-1 registration.",
    serviceNameHint: "Register",
    suggestedPersonaKeys: ["young-emirati-graduate", "emirati-female-professional", "emirati-govt-employee"],
    defaultStages: S(
      ["Employer Day-1 filing", "customer", "Filed"],
      ["Insured number issued", "system", "Number live"],
      ["Welcome pack & portal access", "system", "Activated"],
      ["Contribution schedule confirmed", "agent", "Schedule set"]
    ),
  },
  {
    id: "lib-self-employed",
    category: "join",
    name: "Self-employed voluntary registration",
    description: "Self-employed Emirati opts into voluntary coverage.",
    serviceNameHint: "Self",
    suggestedPersonaKeys: ["self-employed-emirati", "gig-economy-worker"],
    defaultStages: S(
      ["Apply voluntary cover", "customer", "Applied"],
      ["Assess eligibility", "agent", "Approved"],
      ["Set contribution plan", "system", "Plan active"]
    ),
  },
  {
    id: "lib-domestic-register",
    category: "join",
    name: "Domestic worker coverage registration",
    description: "Household employer registers domestic worker for social insurance coverage.",
    serviceNameHint: "Register",
    suggestedPersonaKeys: ["domestic-worker", "emirati-govt-employee"],
    defaultStages: S(
      ["Household employer applies", "customer", "Application in"],
      ["Worker identity verify", "agent", "ID confirmed"],
      ["Coverage activated", "system", "Live"],
      ["Remittance instructions", "system", "Sent"]
    ),
  },
  {
    id: "lib-agricultural-register",
    category: "join",
    name: "Rural / agricultural worker registration",
    description: "Seasonal or rural worker brought into GPSSA coverage via employer or scheme.",
    serviceNameHint: "Register",
    suggestedPersonaKeys: ["rural-agricultural-worker", "self-employed-emirati"],
    defaultStages: S(
      ["Scheme application", "customer", "Filed"],
      ["Eligibility & sector check", "agent", "Eligible"],
      ["Account created", "system", "Insured live"]
    ),
  },

  // ── Contribute ──────────────────────────────────────────────
  {
    id: "lib-contribution-correct",
    category: "contribute",
    name: "Correct contribution record",
    description: "Employer or insured disputes or corrects remittance history.",
    serviceNameHint: "Contribution",
    suggestedPersonaKeys: [
      "emirati-govt-employee",
      "emirati-female-professional",
      "self-employed-emirati",
      "expat-corporate-professional",
    ],
    defaultStages: S(
      ["Raise correction", "customer", "Ticket"],
      ["Reconcile remittances", "agent", "Variance known"],
      ["Post adjustment", "system", "Corrected"]
    ),
  },
  {
    id: "lib-contribution-gap-purchase",
    category: "contribute",
    name: "Purchase contribution gap (career break)",
    description: "Member buys back non-contributory periods (e.g. maternity / childcare).",
    serviceNameHint: "Contribution",
    suggestedPersonaKeys: ["emirati-female-professional", "emirati-govt-employee", "young-emirati-graduate"],
    defaultStages: S(
      ["Request gap quote", "customer", "Quote requested"],
      ["Service gap assessment", "agent", "Eligible years set"],
      ["Cost calculation", "agent", "Amount quoted"],
      ["Payment & credit years", "system", "Years credited"]
    ),
  },
  {
    id: "lib-late-remittance",
    category: "contribute",
    name: "Late employer remittance recovery",
    description: "Employer missed contribution filing; arrears assessed and recovered.",
    serviceNameHint: "Contribution",
    suggestedPersonaKeys: [
      "emirati-govt-employee",
      "expat-corporate-professional",
      "self-employed-emirati",
      "gig-economy-worker",
    ],
    defaultStages: S(
      ["Arrears detected", "system", "Flag raised"],
      ["Employer notified", "agent", "Notice sent"],
      ["Payment plan / settle", "customer", "Agreed"],
      ["Post remittance", "system", "Record updated"]
    ),
  },
  {
    id: "lib-salary-change",
    category: "contribute",
    name: "Pensionable salary change update",
    description: "Promotion, demotion, or part-time shift updates pensionable salary.",
    serviceNameHint: "Contribution",
    suggestedPersonaKeys: [
      "emirati-female-professional",
      "emirati-govt-employee",
      "expat-corporate-professional",
      "young-emirati-graduate",
    ],
    defaultStages: S(
      ["Employer salary filing", "customer", "Change filed"],
      ["Validate pensionable base", "agent", "Validated"],
      ["Update contribution base", "system", "Base live"]
    ),
  },
  {
    id: "lib-voluntary-topup",
    category: "contribute",
    name: "Voluntary contribution top-up",
    description: "Member elects additional voluntary contributions to strengthen entitlement.",
    serviceNameHint: "Contribution",
    suggestedPersonaKeys: ["self-employed-emirati", "emirati-female-professional", "emirati-govt-employee"],
    defaultStages: S(
      ["Elect top-up plan", "customer", "Elected"],
      ["Affordability check", "agent", "Approved"],
      ["Activate schedule", "system", "Collecting"]
    ),
  },

  // ── Records ─────────────────────────────────────────────────
  {
    id: "lib-statement-request",
    category: "records",
    name: "Request contribution / service statement",
    description: "Member requests official statement of service years and contributions.",
    serviceNameHint: "Statement",
    suggestedPersonaKeys: [...ALL_WORKERS, "emirati-retiree"],
    defaultStages: S(
      ["Request statement", "customer", "Requested"],
      ["Compile history", "system", "Draft ready"],
      ["Agent QC", "agent", "Cleared"],
      ["Issue statement", "system", "Issued"]
    ),
  },
  {
    id: "lib-certificate-insurance",
    category: "records",
    name: "Issue insurance / membership certificate",
    description: "Official certificate of GPSSA membership for banks, visas, or employers.",
    serviceNameHint: "Certificate",
    suggestedPersonaKeys: [...ALL_WORKERS],
    defaultStages: S(
      ["Request certificate", "customer", "Requested"],
      ["Verify active cover", "agent", "Verified"],
      ["Generate & stamp", "system", "Issued"]
    ),
  },
  {
    id: "lib-update-personal-data",
    category: "records",
    name: "Update personal / contact data",
    description: "Name, Emirates ID, address, or bank details change on the insured record.",
    serviceNameHint: "Update",
    suggestedPersonaKeys: [...ALL_WORKERS, "emirati-retiree"],
    defaultStages: S(
      ["Submit change", "customer", "Submitted"],
      ["Evidence check", "agent", "Validated"],
      ["Update core record", "system", "Updated"]
    ),
  },
  {
    id: "lib-beneficiary-update",
    category: "records",
    name: "Update beneficiaries & dependants",
    description: "Marriage, divorce, or children trigger beneficiary register updates.",
    serviceNameHint: "Beneficiary",
    suggestedPersonaKeys: [
      "emirati-female-professional",
      "emirati-govt-employee",
      "emirati-retiree",
      "expat-corporate-professional",
    ],
    defaultStages: S(
      ["Submit beneficiary change", "customer", "Filed"],
      ["Evidence of life event", "agent", "Pack OK"],
      ["Update register", "system", "Register live"]
    ),
  },

  // ── Family ──────────────────────────────────────────────────
  {
    id: "lib-maternity-continuity",
    category: "family",
    name: "Maternity leave contribution continuity",
    description: "Ensure contributions continue correctly through paid (and optional unpaid) maternity leave.",
    serviceNameHint: "Maternity",
    suggestedPersonaKeys: ["emirati-female-professional", "expat-corporate-professional", "young-emirati-graduate"],
    defaultStages: S(
      ["Notify maternity leave", "customer", "Leave logged"],
      ["Confirm paid leave period", "agent", "Period set"],
      ["Contribution continuity check", "agent", "Gaps known"],
      ["Post / schedule remittance", "system", "Continuity OK"]
    ),
  },
  {
    id: "lib-return-parttime",
    category: "family",
    name: "Return-to-work part-time contribution adjust",
    description: "Post-maternity part-time arrangement updates pensionable salary and remittance.",
    serviceNameHint: "Contribution",
    suggestedPersonaKeys: ["emirati-female-professional", "expat-corporate-professional"],
    defaultStages: S(
      ["File new work pattern", "customer", "Pattern filed"],
      ["Recalculate pensionable base", "agent", "Base set"],
      ["Update remittance", "system", "Collecting"]
    ),
  },
  {
    id: "lib-divorce-pension-split",
    category: "family",
    name: "Divorce-related pension / beneficiary split",
    description: "Court or policy-driven update to survivors and dependant shares after divorce.",
    serviceNameHint: "Beneficiary",
    suggestedPersonaKeys: ["emirati-female-professional", "emirati-govt-employee", "emirati-retiree"],
    defaultStages: S(
      ["Lodge court / decree pack", "customer", "Pack in"],
      ["Legal review", "agent", "Ruling interpreted"],
      ["Update awards / beneficiaries", "agent", "Updated"],
      ["Notify parties", "system", "Notified"]
    ),
  },

  // ── Claims ──────────────────────────────────────────────────
  {
    id: "lib-pension-claim",
    category: "claim",
    name: "Claim retirement pension",
    description: "Retiree initiates pension claim with contribution history check.",
    serviceNameHint: "Pension",
    suggestedPersonaKeys: [
      "emirati-retiree",
      "emirati-govt-employee",
      "emirati-female-professional",
    ],
    defaultStages: S(
      ["Submit claim", "customer", "Claim opened"],
      ["Eligibility review", "agent", "Eligible / not"],
      ["Award calculation", "agent", "Award set"],
      ["First payment", "system", "In pay"]
    ),
  },
  {
    id: "lib-early-retirement-female",
    category: "claim",
    name: "Early retirement claim (female eligibility)",
    description: "Age-50 / service-year path for Emirati women under GPSSA early-eligibility rules.",
    serviceNameHint: "Pension",
    suggestedPersonaKeys: ["emirati-female-professional", "emirati-govt-employee", "emirati-retiree"],
    defaultStages: S(
      ["File early retirement claim", "customer", "Opened"],
      ["Service years & age check", "agent", "Threshold met"],
      ["Award under female path", "agent", "Awarded"],
      ["Payment setup", "system", "In pay"]
    ),
  },
  {
    id: "lib-pension-recalc",
    category: "claim",
    name: "Pension award recalculation",
    description: "Retiree disputes award; history re-run and award adjusted if warranted.",
    serviceNameHint: "Pension",
    suggestedPersonaKeys: ["emirati-retiree", "emirati-govt-employee", "emirati-female-professional"],
    defaultStages: S(
      ["Dispute award", "customer", "Dispute open"],
      ["Re-run entitlement", "agent", "Recalculated"],
      ["Approve adjustment", "agent", "Approved"],
      ["Post corrected payment", "system", "Corrected"]
    ),
  },
  {
    id: "lib-reemployment-pension",
    category: "claim",
    name: "Re-employment while in receipt of pension",
    description: "Pensioner re-enters work; rules for continued payment and reporting applied.",
    serviceNameHint: "Pension",
    suggestedPersonaKeys: ["emirati-retiree", "emirati-female-professional"],
    defaultStages: S(
      ["Declare re-employment", "customer", "Declared"],
      ["Apply re-employment rules", "agent", "Rules applied"],
      ["Adjust / continue payment", "system", "Payment set"]
    ),
  },

  // ── Disability ──────────────────────────────────────────────
  {
    id: "lib-disability",
    category: "disability",
    name: "Disability benefit assessment",
    description: "Medical and contribution assessment for disability entitlement.",
    serviceNameHint: "Disability",
    suggestedPersonaKeys: [
      "emirati-govt-employee",
      "emirati-female-professional",
      "expat-corporate-professional",
      "rural-agricultural-worker",
      "domestic-worker",
    ],
    defaultStages: S(
      ["File disability claim", "customer", "Opened"],
      ["Medical board", "agent", "Assessment"],
      ["Entitlement decision", "agent", "Decided"],
      ["Payment setup", "system", "Paid"]
    ),
  },
  {
    id: "lib-disability-review",
    category: "disability",
    name: "Periodic disability review",
    description: "Scheduled medical review to confirm ongoing disability entitlement.",
    serviceNameHint: "Disability",
    suggestedPersonaKeys: ["emirati-govt-employee", "emirati-female-professional", "expat-corporate-professional"],
    defaultStages: S(
      ["Schedule review", "system", "Scheduled"],
      ["Medical reassessment", "agent", "Assessed"],
      ["Continue / revise / cease", "agent", "Decision"],
      ["Update payment", "system", "Updated"]
    ),
  },

  // ── Survivor ────────────────────────────────────────────────
  {
    id: "lib-survivor",
    category: "survivor",
    name: "Survivor benefit after death-in-service",
    description: "Family claims survivor entitlements with evidence pack.",
    serviceNameHint: "Survivor",
    suggestedPersonaKeys: [
      "emirati-female-professional",
      "emirati-retiree",
      "emirati-govt-employee",
      "domestic-worker",
    ],
    defaultStages: S(
      ["Notify death", "customer", "Case opened"],
      ["Evidence & heirs", "agent", "Pack complete"],
      ["Award survivors", "agent", "Awarded"],
      ["Pay & close", "system", "Closed"]
    ),
  },
  {
    id: "lib-survivor-pensioner",
    category: "survivor",
    name: "Survivor claim after pensioner death",
    description: "Dependants claim continuation / survivors’ share when a pensioner dies.",
    serviceNameHint: "Survivor",
    suggestedPersonaKeys: ["emirati-retiree", "emirati-female-professional", "emirati-govt-employee"],
    defaultStages: S(
      ["Death notification", "customer", "Opened"],
      ["Dependant eligibility", "agent", "Eligible set"],
      ["Split awards", "agent", "Awards set"],
      ["First survivor payment", "system", "In pay"]
    ),
  },

  // ── Mobility ────────────────────────────────────────────────
  {
    id: "lib-gcc-transfer",
    category: "mobility",
    name: "GCC cross-border contribution transfer",
    description: "Worker moves across GCC; contribution history coordination.",
    serviceNameHint: "GCC",
    suggestedPersonaKeys: ["gcc-cross-border-worker", "expat-corporate-professional", "emirati-govt-employee"],
    defaultStages: S(
      ["Request transfer", "customer", "Request in"],
      ["Peer authority exchange", "agent", "Data received"],
      ["Reconcile history", "agent", "Reconciled"],
      ["Update record", "system", "Updated"]
    ),
  },
  {
    id: "lib-gcc-inbound",
    category: "mobility",
    name: "Inbound GCC service recognition",
    description: "Prior GCC service recognised toward UAE entitlement.",
    serviceNameHint: "GCC",
    suggestedPersonaKeys: ["gcc-cross-border-worker", "emirati-govt-employee", "emirati-female-professional"],
    defaultStages: S(
      ["Submit prior-service pack", "customer", "Pack in"],
      ["Peer verification", "agent", "Verified"],
      ["Credit service years", "system", "Credited"]
    ),
  },
  {
    id: "lib-outbound-exit",
    category: "mobility",
    name: "Expat exit / final settlement coordination",
    description: "Non-national leaves UAE; EOS and contribution closure coordinated.",
    serviceNameHint: "End of Service",
    suggestedPersonaKeys: ["expat-corporate-professional", "gig-economy-worker", "domestic-worker"],
    defaultStages: S(
      ["Exit intent filed", "customer", "Filed"],
      ["Clear contributions", "agent", "Cleared"],
      ["Final settlement", "agent", "Settled"],
      ["Close cover", "system", "Closed"]
    ),
  },

  // ── Employer ────────────────────────────────────────────────
  {
    id: "lib-employer-register",
    category: "employer",
    name: "Register employer establishment",
    description: "New employer onboards to remit contributions.",
    serviceNameHint: "Employer",
    suggestedPersonaKeys: ["emirati-govt-employee", "expat-corporate-professional", "self-employed-emirati"],
    defaultStages: S(
      ["Employer application", "customer", "Filed"],
      ["Entity validation", "agent", "Validated"],
      ["Activate remittance", "system", "Live"]
    ),
  },
  {
    id: "lib-employer-staff-change",
    category: "employer",
    name: "Employer staff join / leave filing",
    description: "Employer files insured joins and leavers for the remittance period.",
    serviceNameHint: "Employer",
    suggestedPersonaKeys: ["emirati-govt-employee", "expat-corporate-professional"],
    defaultStages: S(
      ["Submit join/leave file", "customer", "File in"],
      ["Validate insured list", "agent", "Validated"],
      ["Update payroll link", "system", "Synced"]
    ),
  },
  {
    id: "lib-gig-platform-remit",
    category: "employer",
    name: "Platform / gig remittance filing",
    description: "Platform intermediary remits for gig workers under scheme rules.",
    serviceNameHint: "Employer",
    suggestedPersonaKeys: ["gig-economy-worker", "self-employed-emirati"],
    defaultStages: S(
      ["Platform period file", "customer", "Filed"],
      ["Match worker accounts", "agent", "Matched"],
      ["Post remittances", "system", "Posted"]
    ),
  },
  {
    id: "lib-gig-multi-platform",
    category: "contribute",
    name: "Multi-platform gig contribution merge",
    description: "Worker earns across platforms; remittances reconciled into one insured record.",
    serviceNameHint: "Contribution",
    suggestedPersonaKeys: ["gig-economy-worker", "self-employed-emirati"],
    defaultStages: S(
      ["Declare platforms", "customer", "Listed"],
      ["Match remittance feeds", "agent", "Matched"],
      ["Merge contribution year", "system", "Merged"]
    ),
  },
  {
    id: "lib-gig-pause-cover",
    category: "contribute",
    name: "Pause / resume gig coverage",
    description: "Seasonal gig worker pauses voluntary cover then resumes without losing history.",
    serviceNameHint: "Contribution",
    suggestedPersonaKeys: ["gig-economy-worker", "self-employed-emirati", "rural-agricultural-worker"],
    defaultStages: S(
      ["Request pause", "customer", "Requested"],
      ["Confirm gap rules", "agent", "Rules set"],
      ["Pause / resume schedule", "system", "Updated"]
    ),
  },
  {
    id: "lib-domestic-transfer-employer",
    category: "employer",
    name: "Domestic worker change of household",
    description: "Coverage moves from one household employer to another without breaking service.",
    serviceNameHint: "Employer",
    suggestedPersonaKeys: ["domestic-worker"],
    defaultStages: S(
      ["New household filing", "customer", "Filed"],
      ["Close prior employer link", "agent", "Closed"],
      ["Activate new remittance", "system", "Live"]
    ),
  },
  {
    id: "lib-domestic-wage-dispute",
    category: "contribute",
    name: "Domestic wage / contribution dispute",
    description: "Worker or household disputes reported wage used for contributions.",
    serviceNameHint: "Contribution",
    suggestedPersonaKeys: ["domestic-worker", "emirati-govt-employee"],
    defaultStages: S(
      ["Raise dispute", "customer", "Opened"],
      ["Evidence of wage", "agent", "Assessed"],
      ["Adjust remittance base", "system", "Adjusted"]
    ),
  },
  {
    id: "lib-gcc-dual-cover",
    category: "mobility",
    name: "Dual GCC coverage conflict resolution",
    description: "Worker appears covered in two GCC schemes; authorities coordinate primacy.",
    serviceNameHint: "GCC",
    suggestedPersonaKeys: ["gcc-cross-border-worker", "expat-corporate-professional"],
    defaultStages: S(
      ["Flag dual cover", "system", "Flagged"],
      ["Peer authority consult", "agent", "Ruling"],
      ["Apply primacy", "system", "Resolved"]
    ),
  },
  {
    id: "lib-gcc-family-dependants",
    category: "family",
    name: "GCC family dependant portability",
    description: "Dependant status follows the worker across a GCC move.",
    serviceNameHint: "GCC",
    suggestedPersonaKeys: ["gcc-cross-border-worker", "emirati-female-professional"],
    defaultStages: S(
      ["File dependant pack", "customer", "Filed"],
      ["Cross-border verify", "agent", "Verified"],
      ["Update dependants", "system", "Updated"]
    ),
  },
  {
    id: "lib-rural-seasonal-claim",
    category: "claim",
    name: "Seasonal worker benefit eligibility check",
    description: "Seasonal agricultural worker checks whether service years qualify for a claim.",
    serviceNameHint: "Pension",
    suggestedPersonaKeys: ["rural-agricultural-worker", "self-employed-emirati"],
    defaultStages: S(
      ["Request eligibility check", "customer", "Requested"],
      ["Seasonal service compile", "agent", "Years set"],
      ["Advise claim path", "agent", "Advised"]
    ),
  },
  {
    id: "lib-rural-employer-coop",
    category: "employer",
    name: "Agricultural co-op employer filing",
    description: "Co-operative files remittances for multiple rural workers in one period.",
    serviceNameHint: "Employer",
    suggestedPersonaKeys: ["rural-agricultural-worker", "self-employed-emirati"],
    defaultStages: S(
      ["Co-op period file", "customer", "Filed"],
      ["Validate worker list", "agent", "Validated"],
      ["Post batch remittance", "system", "Posted"]
    ),
  },
  {
    id: "lib-young-scholarship-gap",
    category: "contribute",
    name: "Study / scholarship contribution gap advice",
    description: "Graduate with study gap receives advice on when and how to purchase years.",
    serviceNameHint: "Contribution",
    suggestedPersonaKeys: ["young-emirati-graduate", "emirati-female-professional"],
    defaultStages: S(
      ["Request gap advice", "customer", "Requested"],
      ["Map study periods", "agent", "Mapped"],
      ["Quote purchase options", "agent", "Quoted"]
    ),
  },
];

export function libraryByCategory(category: LifecycleCategory) {
  return EPISODE_LIBRARY.filter((e) => e.category === category);
}

export function getLibraryEpisode(id: string) {
  return EPISODE_LIBRARY.find((e) => e.id === id);
}

/** Catalogue episodes suggested for a persona (many-to-many). */
export function libraryForPersona(personaKey: string | null | undefined) {
  if (!personaKey) return EPISODE_LIBRARY;
  return EPISODE_LIBRARY.filter((e) => e.suggestedPersonaKeys.includes(personaKey));
}
