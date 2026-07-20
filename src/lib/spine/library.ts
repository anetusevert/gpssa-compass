/**
 * Curated lifecycle episode catalog for the Service Operating Spine.
 * Organized by life-event category; each entry suggests service + persona.
 */

export type LifecycleCategory =
  | "join"
  | "contribute"
  | "claim"
  | "end-of-service"
  | "survivor"
  | "disability"
  | "mobility"
  | "employer";

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
  { id: "claim", label: "Claim benefits", blurb: "Pension and benefit claims" },
  { id: "end-of-service", label: "End of service", blurb: "EOS and leaving employment" },
  { id: "survivor", label: "Survivor", blurb: "Death-in-service and survivors" },
  { id: "disability", label: "Disability", blurb: "Disability assessment & payment" },
  { id: "mobility", label: "Mobility / GCC", blurb: "Cross-border and transfers" },
  { id: "employer", label: "Employer ops", blurb: "Employer registration & filings" },
];

export const EPISODE_LIBRARY: LibraryEpisode[] = [
  {
    id: "lib-eos-civil",
    category: "end-of-service",
    name: "Member claims end-of-service benefits (Civil)",
    description:
      "Employer initiates EOS for a civil insured; member expects correct entitlement and timely payment.",
    serviceNameHint: "Apply for End Of Service - Civil",
    suggestedPersonaKeys: ["emirati-govt-employee", "emirati-female-professional"],
    defaultStages: [
      { name: "Apply / intake", actor: "customer", outcome: "Case created" },
      { name: "Document completeness", actor: "agent", outcome: "Pack validated" },
      { name: "Manual entitlement review", actor: "agent", outcome: "Decision drafted" },
      { name: "Approve / reject", actor: "agent", outcome: "Decision recorded" },
      { name: "Payment & notify", actor: "system", outcome: "Paid / notified" },
    ],
  },
  {
    id: "lib-eos-private",
    category: "end-of-service",
    name: "Private-sector EOS settlement",
    description: "Employee leaves private employer; EOS dues calculated and paid.",
    serviceNameHint: "End of Service",
    suggestedPersonaKeys: ["expat-corporate-professional", "gig-economy-worker"],
    defaultStages: [
      { name: "Employer files EOS", actor: "customer", outcome: "Request lodged" },
      { name: "Service period check", actor: "agent", outcome: "History confirmed" },
      { name: "Calculate dues", actor: "agent", outcome: "Amount set" },
      { name: "Pay & close", actor: "system", outcome: "Settled" },
    ],
  },
  {
    id: "lib-register-insured",
    category: "join",
    name: "Register new insured person",
    description: "First registration of an Emirati or covered worker into GPSSA.",
    serviceNameHint: "Register",
    suggestedPersonaKeys: ["young-emirati-graduate", "emirati-govt-employee"],
    defaultStages: [
      { name: "Submit registration", actor: "customer", outcome: "Application in" },
      { name: "Identity verify", actor: "agent", outcome: "ID confirmed" },
      { name: "Create account", actor: "system", outcome: "Insured created" },
      { name: "Confirm to parties", actor: "system", outcome: "Notified" },
    ],
  },
  {
    id: "lib-employer-register",
    category: "employer",
    name: "Register employer establishment",
    description: "New employer onboards to remit contributions.",
    serviceNameHint: "Employer",
    suggestedPersonaKeys: ["emirati-govt-employee", "expat-corporate-professional"],
    defaultStages: [
      { name: "Employer application", actor: "customer", outcome: "Filed" },
      { name: "Entity validation", actor: "agent", outcome: "Validated" },
      { name: "Activate remittance", actor: "system", outcome: "Live" },
    ],
  },
  {
    id: "lib-pension-claim",
    category: "claim",
    name: "Claim retirement pension",
    description: "Retiree initiates pension claim with contribution history check.",
    serviceNameHint: "Pension",
    suggestedPersonaKeys: ["emirati-retiree", "emirati-govt-employee"],
    defaultStages: [
      { name: "Submit claim", actor: "customer", outcome: "Claim opened" },
      { name: "Eligibility review", actor: "agent", outcome: "Eligible / not" },
      { name: "Award calculation", actor: "agent", outcome: "Award set" },
      { name: "First payment", actor: "system", outcome: "In pay" },
    ],
  },
  {
    id: "lib-disability",
    category: "disability",
    name: "Disability benefit assessment",
    description: "Medical and contribution assessment for disability entitlement.",
    serviceNameHint: "Disability",
    suggestedPersonaKeys: ["emirati-govt-employee", "expat-corporate-professional"],
    defaultStages: [
      { name: "File disability claim", actor: "customer", outcome: "Opened" },
      { name: "Medical board", actor: "agent", outcome: "Assessment" },
      { name: "Entitlement decision", actor: "agent", outcome: "Decided" },
      { name: "Payment setup", actor: "system", outcome: "Paid" },
    ],
  },
  {
    id: "lib-survivor",
    category: "survivor",
    name: "Survivor benefit after death-in-service",
    description: "Family claims survivor entitlements with evidence pack.",
    serviceNameHint: "Survivor",
    suggestedPersonaKeys: ["emirati-female-professional", "emirati-retiree"],
    defaultStages: [
      { name: "Notify death", actor: "customer", outcome: "Case opened" },
      { name: "Evidence & heirs", actor: "agent", outcome: "Pack complete" },
      { name: "Award survivors", actor: "agent", outcome: "Awarded" },
      { name: "Pay & close", actor: "system", outcome: "Closed" },
    ],
  },
  {
    id: "lib-gcc-transfer",
    category: "mobility",
    name: "GCC cross-border contribution transfer",
    description: "Worker moves across GCC; contribution history coordination.",
    serviceNameHint: "GCC",
    suggestedPersonaKeys: ["gcc-cross-border-worker"],
    defaultStages: [
      { name: "Request transfer", actor: "customer", outcome: "Request in" },
      { name: "Peer authority exchange", actor: "agent", outcome: "Data received" },
      { name: "Reconcile history", actor: "agent", outcome: "Reconciled" },
      { name: "Update record", actor: "system", outcome: "Updated" },
    ],
  },
  {
    id: "lib-contribution-correct",
    category: "contribute",
    name: "Correct contribution record",
    description: "Employer or insured disputes or corrects remittance history.",
    serviceNameHint: "Contribution",
    suggestedPersonaKeys: ["emirati-govt-employee", "self-employed-emirati"],
    defaultStages: [
      { name: "Raise correction", actor: "customer", outcome: "Ticket" },
      { name: "Reconcile remittances", actor: "agent", outcome: "Variance known" },
      { name: "Post adjustment", actor: "system", outcome: "Corrected" },
    ],
  },
  {
    id: "lib-self-employed",
    category: "join",
    name: "Self-employed voluntary registration",
    description: "Self-employed Emirati opts into voluntary coverage.",
    serviceNameHint: "Self",
    suggestedPersonaKeys: ["self-employed-emirati", "gig-economy-worker"],
    defaultStages: [
      { name: "Apply voluntary cover", actor: "customer", outcome: "Applied" },
      { name: "Assess eligibility", actor: "agent", outcome: "Approved" },
      { name: "Set contribution plan", actor: "system", outcome: "Plan active" },
    ],
  },
];

export function libraryByCategory(category: LifecycleCategory) {
  return EPISODE_LIBRARY.filter((e) => e.category === category);
}

export function getLibraryEpisode(id: string) {
  return EPISODE_LIBRARY.find((e) => e.id === id);
}
