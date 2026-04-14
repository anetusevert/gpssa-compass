export interface ContributionRates {
  employee: string;
  employer: string;
  government: string;
}

export interface RetirementAge {
  male: string;
  female: string;
  early: string;
}

export interface InternationalRankings {
  mercerIndex: string | null;
  oecdAdequacy: string | null;
  worldBankCoverage: string | null;
}

export interface DataSourceRef {
  title: string;
  url: string;
  year: string;
}

export interface CountryProfile {
  iso3: string;
  name: string;
  flag: string;
  region: string;
  institution: string;
  maturityScore: number;
  maturityLabel: "Leader" | "Advanced" | "Developing" | "Emerging";
  coverageRate: number;
  replacementRate: number;
  sustainability: number;
  systemType: string;
  yearEstablished: number;
  digitalLevel: string;
  keyFeatures: string[];
  challenges: string[];
  insights: string[];
  legislativeFramework?: string;
  contributionRates?: ContributionRates;
  retirementAge?: RetirementAge;
  benefitTypes?: string[];
  fundManagement?: string;
  recentReforms?: string[];
  internationalRankings?: InternationalRankings;
  iloConventionsRatified?: string;
  populationCovered?: string;
  socialProtectionExpenditure?: string;
  dependencyRatio?: string;
  pensionFundAssets?: string;
  benefitCalculation?: string;
  indexationMechanism?: string;
  vestingPeriod?: string;
  governanceQuality?: string;
  dataSources?: DataSourceRef[];
}

export type MetricKey = "maturityScore" | "coverageRate" | "replacementRate" | "sustainability";

export interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  ranges: { value: number; color: string; label: string }[];
}

export const METRICS: Record<MetricKey, MetricConfig> = {
  maturityScore: {
    key: "maturityScore", label: "Digital Maturity", unit: "1-4",
    ranges: [
      { value: 3.5, color: "#00C896", label: "3.5-4.0 - Leader" },
      { value: 2.5, color: "#4A9EFF", label: "2.5-3.4 - Advanced" },
      { value: 1.5, color: "#C5A572", label: "1.5-2.4 - Developing" },
      { value: 0,   color: "#EF4444", label: "1.0-1.4 - Emerging" },
    ],
  },
  coverageRate: {
    key: "coverageRate", label: "Coverage Rate", unit: "%",
    ranges: [
      { value: 85, color: "#00C896", label: ">=85% - Universal" },
      { value: 60, color: "#4A9EFF", label: "60-84% - Broad" },
      { value: 35, color: "#C5A572", label: "35-59% - Developing" },
      { value: 0,  color: "#EF4444", label: "<35% - Limited" },
    ],
  },
  replacementRate: {
    key: "replacementRate", label: "Replacement Rate", unit: "%",
    ranges: [
      { value: 75, color: "#00C896", label: ">=75% - Excellent" },
      { value: 55, color: "#4A9EFF", label: "55-74% - Adequate" },
      { value: 40, color: "#C5A572", label: "40-54% - Below Target" },
      { value: 0,  color: "#EF4444", label: "<40% - Inadequate" },
    ],
  },
  sustainability: {
    key: "sustainability", label: "Sustainability Score", unit: "1-4",
    ranges: [
      { value: 3.5, color: "#00C896", label: "3.5-4.0 - Robust" },
      { value: 2.5, color: "#4A9EFF", label: "2.5-3.4 - Stable" },
      { value: 1.5, color: "#C5A572", label: "1.5-2.4 - At Risk" },
      { value: 0,   color: "#EF4444", label: "1.0-1.4 - Critical" },
    ],
  },
};

export function maturityBadgeColor(label: string): string {
  if (label === "Leader")     return "#00C896";
  if (label === "Advanced")   return "#4A9EFF";
  if (label === "Developing") return "#C5A572";
  return "#EF4444";
}

export function getMetricColor(profile: CountryProfile, metricKey: MetricKey): string {
  const val = profile[metricKey] as number;
  const ranges = METRICS[metricKey].ranges;
  for (const r of ranges) {
    if (val >= r.value) return r.color;
  }
  return ranges[ranges.length - 1].color;
}

export function formatMetricValue(profile: CountryProfile, key: MetricKey): string {
  const v = profile[key] as number;
  if (key === "maturityScore" || key === "sustainability") return v.toFixed(1);
  return `${v}%`;
}

export function parseJsonArr(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function parseJsonObj<T>(raw: string | null | undefined): T | undefined {
  if (!raw) return undefined;
  try { return JSON.parse(raw) as T; } catch { return undefined; }
}

export function dbRowToProfile(c: Record<string, unknown>): CountryProfile {
  return {
    iso3: c.iso3 as string,
    name: c.name as string,
    flag: (c.flag as string) ?? "",
    region: c.region as string,
    institution: (c.institution as string) ?? "Unknown",
    maturityScore: (c.maturityScore as number) ?? 0,
    maturityLabel: ((c.maturityLabel as string) ?? "Emerging") as CountryProfile["maturityLabel"],
    coverageRate: (c.coverageRate as number) ?? 0,
    replacementRate: (c.replacementRate as number) ?? 0,
    sustainability: (c.sustainability as number) ?? 0,
    systemType: (c.systemType as string) ?? "Unknown",
    yearEstablished: (c.yearEstablished as number) ?? 0,
    digitalLevel: (c.digitalLevel as string) ?? "Unknown",
    keyFeatures: parseJsonArr(c.keyFeatures as string),
    challenges: parseJsonArr(c.challenges as string),
    insights: parseJsonArr(c.insights as string),
    legislativeFramework: (c.legislativeFramework as string) ?? undefined,
    contributionRates: parseJsonObj<ContributionRates>(c.contributionRates as string),
    retirementAge: parseJsonObj<RetirementAge>(c.retirementAge as string),
    benefitTypes: parseJsonArr(c.benefitTypes as string),
    fundManagement: (c.fundManagement as string) ?? undefined,
    recentReforms: parseJsonArr(c.recentReforms as string),
    internationalRankings: parseJsonObj<InternationalRankings>(c.internationalRankings as string),
    iloConventionsRatified: (c.iloConventionsRatified as string) ?? undefined,
    populationCovered: (c.populationCovered as string) ?? undefined,
    dataSources: parseJsonObj<DataSourceRef[]>(c.dataSources as string) ?? undefined,
  };
}

export const GPSSA_REF: CountryProfile = {
  iso3: "ARE", name: "United Arab Emirates", flag: "\u{1F1E6}\u{1F1EA}", region: "Middle East",
  institution: "GPSSA + DEWS", maturityScore: 3.1, maturityLabel: "Advanced",
  coverageRate: 78, replacementRate: 65, sustainability: 3.2,
  systemType: "Defined Benefit + DEWS", yearEstablished: 1999, digitalLevel: "Partially Digital",
  keyFeatures: ["Federal pension for UAE nationals", "DEWS for expat end-of-service", "Digital member portal", "Multi-employer coverage"],
  challenges: ["Limited expat pension portability", "Aging liability growth", "Manual document processing"],
  insights: ["First GCC authority to launch mobile member portal", "Expanding employer self-service", "AI pilot for claims processing underway"],
};

export const COUNTRIES: Record<string, CountryProfile> = {
  ARE: GPSSA_REF,
  SAU: { iso3:"SAU", name:"Saudi Arabia", flag:"\u{1F1F8}\u{1F1E6}", region:"Middle East", institution:"GOSI", maturityScore:2.7, maturityLabel:"Developing", coverageRate:72, replacementRate:58, sustainability:2.8, systemType:"Defined Benefit", yearEstablished:1969, digitalLevel:"Partially Digital", keyFeatures:["Vision 2030 pension reform","Mandatory employee + employer contributions","Work injury coverage","Digital Wage Protection System"], challenges:["High dependence on oil revenue","Low private sector Saudi coverage","Lengthy claim processing"], insights:["Najm platform for digital injury reporting","Integration with national ID (Absher)","Expanding to gig economy workers"] },
  QAT: { iso3:"QAT", name:"Qatar", flag:"\u{1F1F6}\u{1F1E6}", region:"Middle East", institution:"PFIO", maturityScore:2.6, maturityLabel:"Developing", coverageRate:62, replacementRate:60, sustainability:2.7, systemType:"Defined Benefit", yearEstablished:1993, digitalLevel:"Transitioning", keyFeatures:["Nationals-only pension scheme","Sovereign wealth fund backing","Housing allowances integrated","World Cup legacy digital reforms"], challenges:["Expat workforce not covered","Small citizen beneficiary base","Manual claim workflows"], insights:["Metrash2 app integration for government services","Expanded eligibility ahead of 2022 reforms","PFIO digital portal launched 2023"] },
  KWT: { iso3:"KWT", name:"Kuwait", flag:"\u{1F1F0}\u{1F1FC}", region:"Middle East", institution:"PIFSS", maturityScore:2.3, maturityLabel:"Developing", coverageRate:55, replacementRate:62, sustainability:2.4, systemType:"Defined Benefit", yearEstablished:1976, digitalLevel:"Transitioning", keyFeatures:["Generous replacement rates","Government-backed guarantees","Civil + private sector funds","Survivors and disability coverage"], challenges:["Fiscal sustainability concerns","No expat pension portability","Limited digital channels"], insights:["Digital services expansion via Civil ID integration","e-Pension portal launched","Actuarial reforms underway"] },
  BHR: { iso3:"BHR", name:"Bahrain", flag:"\u{1F1E7}\u{1F1ED}", region:"Middle East", institution:"Social Insurance Organization", maturityScore:2.5, maturityLabel:"Developing", coverageRate:65, replacementRate:60, sustainability:2.5, systemType:"Defined Benefit", yearEstablished:1975, digitalLevel:"Transitioning", keyFeatures:["Covers both nationals and expatriates","Unemployment insurance scheme","Work injury protection","Bahrain.bh digital integration"], challenges:["Sustainability pressure from aging nationals","Expat contribution portability","Manual verification bottlenecks"], insights:["SIO eServices portal","National labour fund (Tamkeen) partnership","Parametric reform adopted 2022"] },
  OMN: { iso3:"OMN", name:"Oman", flag:"\u{1F1F4}\u{1F1F2}", region:"Middle East", institution:"PASI", maturityScore:2.2, maturityLabel:"Developing", coverageRate:52, replacementRate:55, sustainability:2.3, systemType:"Defined Benefit", yearEstablished:1991, digitalLevel:"Manual", keyFeatures:["Omanization policy linked to benefits","Injury and disability protection","Civil and military separate funds"], challenges:["Very low expat coverage","Oman Vision 2040 reform pending","High reliance on manual processes"], insights:["Digital services piloted via app","Actuarial review underway","Expanding to private sector SMEs"] },
  JOR: { iso3:"JOR", name:"Jordan", flag:"\u{1F1EF}\u{1F1F4}", region:"Middle East", institution:"Social Security Corporation", maturityScore:2.0, maturityLabel:"Developing", coverageRate:48, replacementRate:50, sustainability:2.0, systemType:"Defined Benefit", yearEstablished:1978, digitalLevel:"Manual", keyFeatures:["Old-age, disability, death coverage","Work injury insurance","Unemployment insurance","National ID integration"], challenges:["Low coverage in informal sector","Fiscal sustainability concerns","Limited digital access outside cities"], insights:["e-SSC portal launched","SMS notifications for beneficiaries","Mobile top-up for contributions piloted"] },
  EGY: { iso3:"EGY", name:"Egypt", flag:"\u{1F1EA}\u{1F1EC}", region:"Middle East", institution:"National Social Insurance Authority", maturityScore:1.8, maturityLabel:"Emerging", coverageRate:35, replacementRate:45, sustainability:1.8, systemType:"Defined Benefit", yearEstablished:1975, digitalLevel:"Manual", keyFeatures:["Old-age pension + lump sum","Survivor and disability benefits","Egypt 2030 Vision reform agenda"], challenges:["Very low informal sector coverage","High administrative costs","Fragmented system across ministries"], insights:["Digital pension card pilot","Fintech partnerships for contribution collection","New Social Protection Act 2019"] },
  NLD: { iso3:"NLD", name:"Netherlands", flag:"\u{1F1F3}\u{1F1F1}", region:"Europe", institution:"SVB / APG", maturityScore:4.0, maturityLabel:"Leader", coverageRate:98, replacementRate:88, sustainability:3.8, systemType:"Three-Pillar (DB + DC + Private)", yearEstablished:1901, digitalLevel:"Digital-First", keyFeatures:["World's #1 ranked pension system","Quasi-mandatory occupational pensions","MijnSVB digital portal","Automatic life-event triggers"], challenges:["Transition to new DC-based system","Rising life expectancy pressure","Communication complexity"], insights:["New pension law (Wtp) 2023 \u2014 full DC transition","Open pension data API","Personalized pension dashboard for all citizens"] },
  DNK: { iso3:"DNK", name:"Denmark", flag:"\u{1F1E9}\u{1F1F0}", region:"Europe", institution:"ATP / Udbetaling Danmark", maturityScore:3.9, maturityLabel:"Leader", coverageRate:97, replacementRate:85, sustainability:4.0, systemType:"Multi-Pillar (NDC + Occupational + Voluntary)", yearEstablished:1891, digitalLevel:"Digital-First", keyFeatures:["Consistently #1 Mercer Global Index","ATP mandatory savings","Fully automated benefit payments","Digital.gov.dk integration"], challenges:["Means-testing complexity","Cross-border EU pension coordination"], insights:["MitID single sign-on for all pension services","Life expectancy automatic adjustments","Green investment mandate for pension funds"] },
  SWE: { iso3:"SWE", name:"Sweden", flag:"\u{1F1F8}\u{1F1EA}", region:"Europe", institution:"Pensionsmyndigheten", maturityScore:3.8, maturityLabel:"Leader", coverageRate:99, replacementRate:80, sustainability:4.0, systemType:"NDC + Premium Pension", yearEstablished:1913, digitalLevel:"Digital-First", keyFeatures:["Notional Defined Contribution system","Automatic financial stabiliser","minPension.se aggregation platform","Orange Envelope annual statement"], challenges:["Premium pension fund complexity","Aging population management"], insights:["Open pension data API","Aggregated multi-fund view for citizens","Robot-advisor integration for premium pension"] },
  NOR: { iso3:"NOR", name:"Norway", flag:"\u{1F1F3}\u{1F1F4}", region:"Europe", institution:"NAV / NBIM", maturityScore:3.9, maturityLabel:"Leader", coverageRate:99, replacementRate:83, sustainability:4.0, systemType:"NDC + Government Pension Fund Global", yearEstablished:1936, digitalLevel:"Digital-First", keyFeatures:["$1.7T sovereign wealth fund","Full digital self-service","Flexible retirement from 62","Integration with Altinn digital platform"], challenges:["Oil fund dependency risk","Immigration-related coverage gaps"], insights:["Altinn: world's leading digital government platform","Pension projections visible in online banking","Gender pension gap proactive alerts"] },
  CHE: { iso3:"CHE", name:"Switzerland", flag:"\u{1F1E8}\u{1F1ED}", region:"Europe", institution:"AHV / SUVA", maturityScore:3.8, maturityLabel:"Leader", coverageRate:98, replacementRate:85, sustainability:3.7, systemType:"Three-Pillar (AHV + BVG + Private)", yearEstablished:1948, digitalLevel:"Digital-First", keyFeatures:["Mandatory three-pillar architecture","BVG occupational pension mandatory","Federal supplement minimum income","High-quality actuarial governance"], challenges:["AHV 21 reform political resistance","Pension gap for part-time (female) workers"], insights:["AHV app for simulation","BVG reform 2023: expanded part-time coverage","Digital pension certificate e-AHV"] },
  FIN: { iso3:"FIN", name:"Finland", flag:"\u{1F1EB}\u{1F1EE}", region:"Europe", institution:"Keva / ETK", maturityScore:3.7, maturityLabel:"Leader", coverageRate:98, replacementRate:82, sustainability:3.8, systemType:"Earnings-Related (DB)", yearEstablished:1937, digitalLevel:"Digital-First", keyFeatures:["Fully earnings-related system","Strong actuarial funding","Life expectancy coefficient adjustments","Omakanta health + pension integration"], challenges:["Lowest birth rate pressure","Public sector underfunding"], insights:["Machine learning for pension fraud detection","Seamless Kela + ETK data sharing","API-first benefit calculation engine"] },
  DEU: { iso3:"DEU", name:"Germany", flag:"\u{1F1E9}\u{1F1EA}", region:"Europe", institution:"Deutsche Rentenversicherung", maturityScore:3.3, maturityLabel:"Advanced", coverageRate:90, replacementRate:70, sustainability:3.0, systemType:"Pay-As-You-Go (DB)", yearEstablished:1889, digitalLevel:"Partially Digital", keyFeatures:["Bismarck's legacy \u2014 world's first pension","57M insured persons","eAntrag online applications","EU cross-border interoperability"], challenges:["Rapidly aging population","East-West pension disparities","Slow digitization of legacy systems"], insights:["Rentenauskunft online pension statement","Interoperability with EU Social Security Coordination","Riester-Rente private supplement reform 2024"] },
  GBR: { iso3:"GBR", name:"United Kingdom", flag:"\u{1F1EC}\u{1F1E7}", region:"Europe", institution:"DWP / Nest", maturityScore:3.4, maturityLabel:"Advanced", coverageRate:92, replacementRate:68, sustainability:3.2, systemType:"State Pension + Auto-Enrolment DC", yearEstablished:1908, digitalLevel:"Partially Digital", keyFeatures:["Flat-rate New State Pension","Nest auto-enrolment workplace DC","Universal Credit integration","Pension Wise guidance service"], challenges:["Gender pension gap","Adequacy concerns for self-employed","Legacy admin systems"], insights:["Open Finance pension dashboard","Pension Tracing Service digitized","Lifetime provider model consultation underway"] },
  FRA: { iso3:"FRA", name:"France", flag:"\u{1F1EB}\u{1F1F7}", region:"Europe", institution:"CNAV / AGIRC-ARRCO", maturityScore:3.1, maturityLabel:"Advanced", coverageRate:95, replacementRate:74, sustainability:2.8, systemType:"Pay-As-You-Go (Multi-Fund)", yearEstablished:1910, digitalLevel:"Partially Digital", keyFeatures:["Multiple occupational funds","Info-retraite.fr aggregation portal","2023 reform: retirement age to 64","Comprehensive disability coverage"], challenges:["Political pension reform instability","Complex multi-fund architecture","Fiscal sustainability"], insights:["Mon compte retraite \u2014 single digital account","AI claims pre-processing","Mobile pension projections"] },
  ITA: { iso3:"ITA", name:"Italy", flag:"\u{1F1EE}\u{1F1F9}", region:"Europe", institution:"INPS", maturityScore:3.0, maturityLabel:"Advanced", coverageRate:88, replacementRate:72, sustainability:2.7, systemType:"NDC (Notional DC)", yearEstablished:1919, digitalLevel:"Partially Digital", keyFeatures:["NDC system since 1995","INPS online portal (largest in EU)","Quota 100/102/103 reform experiments","Disability and survivor benefits"], challenges:["Aging demographics \u2014 EU's oldest","High pension-to-GDP ratio","Early retirement political pressure"], insights:["SPID digital identity for all INPS services","Machine learning for fraud detection","Busta Arancione online pension statement"] },
  ESP: { iso3:"ESP", name:"Spain", flag:"\u{1F1EA}\u{1F1F8}", region:"Europe", institution:"Seguridad Social", maturityScore:2.9, maturityLabel:"Advanced", coverageRate:88, replacementRate:72, sustainability:2.6, systemType:"Pay-As-You-Go (DB)", yearEstablished:1908, digitalLevel:"Partially Digital", keyFeatures:["High replacement rate","Digital Tu Seguridad Social app","Intergenerational Equity Fund","2023 reform: contribution base expansion"], challenges:["Demographic decline","Unemployment volatility impact","Pension sustainability deficit"], insights:["Tu Seguridad Social digital app","Pension simulation tool online","Toledo Pact for cross-party reform"] },
  POL: { iso3:"POL", name:"Poland", flag:"\u{1F1F5}\u{1F1F1}", region:"Europe", institution:"ZUS / OFE", maturityScore:2.8, maturityLabel:"Advanced", coverageRate:85, replacementRate:60, sustainability:2.7, systemType:"NDC + DC (OFE)", yearEstablished:1919, digitalLevel:"Partially Digital", keyFeatures:["Multi-pillar post-1999 reform","ZUS e-ZUS portal","PPK workplace savings (2019)","Citizens' pension reform track record"], challenges:["OFE (private fund) political reversals","Low replacement rates","Brain drain reducing contributions"], insights:["ZUS digital statement","PPK (Employee Capital Plans) 2.5M workers enrolled","API for employer contributions"] },
  AUT: { iso3:"AUT", name:"Austria", flag:"\u{1F1E6}\u{1F1F9}", region:"Europe", institution:"PVA / SVS", maturityScore:3.2, maturityLabel:"Advanced", coverageRate:92, replacementRate:80, sustainability:3.0, systemType:"Pay-As-You-Go (DB)", yearEstablished:1887, digitalLevel:"Partially Digital", keyFeatures:["High replacement rate","Account-based individual tracking","Pension accounts since 2005","Compulsory occupational pensions"], challenges:["Aging population \u2014 fiscal pressure","High contribution rates","Self-employed gaps"], insights:["FinanzOnline integration","Digital pension account view","Actuarial modernization 2023"] },
  BEL: { iso3:"BEL", name:"Belgium", flag:"\u{1F1E7}\u{1F1EA}", region:"Europe", institution:"ONP / PDOS", maturityScore:3.2, maturityLabel:"Advanced", coverageRate:92, replacementRate:70, sustainability:3.0, systemType:"Pay-As-You-Go (Multi-sector)", yearEstablished:1900, digitalLevel:"Partially Digital", keyFeatures:["Sector-based pension system","MyPension.be digital portal","Flexi-job pension credits","Pension reform 2025 underway"], challenges:["Complexity of multiple regimes","Low first-pillar adequacy","Long-term sustainability"], insights:["MyPension.be: 4.5M active users","Pension simulation in 3 clicks","Automated cross-sector consolidation"] },
  IRL: { iso3:"IRL", name:"Ireland", flag:"\u{1F1EE}\u{1F1EA}", region:"Europe", institution:"DSP / PRSA", maturityScore:3.2, maturityLabel:"Advanced", coverageRate:82, replacementRate:65, sustainability:3.1, systemType:"State Pension + DC (PRSA)", yearEstablished:1908, digitalLevel:"Partially Digital", keyFeatures:["Auto-enrolment launching 2024","MyWelfare.ie portal","Flat-rate State Pension","PRSA personal retirement accounts"], challenges:["Low occupational pension coverage","Auto-enrolment delayed repeatedly","Gender pension gap"], insights:["Automatic enrolment scheme 2024 \u2014 750K workers","MyGovID for pension services","PRSA online account aggregation"] },
  ISR: { iso3:"ISR", name:"Israel", flag:"\u{1F1EE}\u{1F1F1}", region:"Middle East", institution:"NII / Pension Clearing House", maturityScore:3.0, maturityLabel:"Advanced", coverageRate:88, replacementRate:65, sustainability:3.1, systemType:"Mandatory DC + DB for old workers", yearEstablished:1953, digitalLevel:"Partially Digital", keyFeatures:["Mandatory comprehensive pension since 2008","Pension Clearing House (aggregator)","High coverage post-reform","Multiple fund choice"], challenges:["Old DB schemes unfunded liability","Self-employed compliance gaps","Palestinian worker coverage gaps"], insights:["Pension Clearing House \u2014 digital fund aggregation","Annual pension report (letter)","Online employer reporting portal"] },
  EST: { iso3:"EST", name:"Estonia", flag:"\u{1F1EA}\u{1F1EA}", region:"Europe", institution:"Social Insurance Board", maturityScore:2.9, maturityLabel:"Advanced", coverageRate:94, replacementRate:60, sustainability:3.0, systemType:"NDC + Mandatory DC + Voluntary", yearEstablished:1991, digitalLevel:"Digital-First", keyFeatures:["e-Estonia: world's most digital government","Online pension account management","X-Road data exchange","Third-pillar tax incentives"], challenges:["Low replacement rate concerns","Small population base","Aging demographics"], insights:["X-Road: blockchain-secured data sharing","Pension management fully online","AI-driven occupational pension advice"] },
  CZE: { iso3:"CZE", name:"Czech Republic", flag:"\u{1F1E8}\u{1F1FF}", region:"Europe", institution:"\u010CSSZ / DPS", maturityScore:2.7, maturityLabel:"Developing", coverageRate:90, replacementRate:58, sustainability:2.8, systemType:"PAYG + Voluntary DC", yearEstablished:1906, digitalLevel:"Transitioning", keyFeatures:["ePortal social insurance","Third pillar voluntary savings","EU cross-border portability","Family care pension credits"], challenges:["Low replacement rate","Pension indexation disputes","Sustainability reform backlog"], insights:["\u010CSSZ ePortal redesign 2023","Online employer reporting","Pension saving app integration"] },
  HRV: { iso3:"HRV", name:"Croatia", flag:"\u{1F1ED}\u{1F1F7}", region:"Europe", institution:"HZMO / REGOS", maturityScore:2.7, maturityLabel:"Developing", coverageRate:85, replacementRate:55, sustainability:2.5, systemType:"NDC + Mandatory DC", yearEstablished:1998, digitalLevel:"Transitioning", keyFeatures:["Post-1999 multi-pillar reform","REGOS capital fund management","EU integration since 2013","e-Gra\u0111ani (eCitizen) portal"], challenges:["Brain drain reducing contributions","Low private pension adequacy","Administrative fragmentation"], insights:["eGra\u0111ani: 1.5M digital pension users","REGOS online portfolio view","Pension transfer digital streamlining"] },
  ROU: { iso3:"ROU", name:"Romania", flag:"\u{1F1F7}\u{1F1F4}", region:"Europe", institution:"CNPP / ASF", maturityScore:2.0, maturityLabel:"Developing", coverageRate:78, replacementRate:50, sustainability:1.9, systemType:"PAYG + Pillar II DC", yearEstablished:1912, digitalLevel:"Manual", keyFeatures:["Mandatory Pillar II (partially reversed)","High political pension reform volatility","EU minimum pension guarantee","e-Romania portal"], challenges:["Political instability in pension law","Brain drain depleting contributions","High informal employment"], insights:["e-Pensie online account","Digital employer reporting","ANAF-CNPP data integration"] },
  RUS: { iso3:"RUS", name:"Russia", flag:"\u{1F1F7}\u{1F1FA}", region:"Europe", institution:"Social Fund of Russia (SFR)", maturityScore:2.1, maturityLabel:"Developing", coverageRate:82, replacementRate:40, sustainability:2.0, systemType:"NDC + Frozen DC", yearEstablished:1990, digitalLevel:"Transitioning", keyFeatures:["Gosuslugi (digital gov) integration","Pension fund merged with SSF 2023","Pension reform 2018: age raised","Maternal capital linked to pension"], challenges:["Sanctions impact on fund assets","Low replacement rate","Frozen DC accumulations"], insights:["Gosuslugi: 80M registered users for pension services","Online pension statement","Maternity capital digital claims"] },
  UKR: { iso3:"UKR", name:"Ukraine", flag:"\u{1F1FA}\u{1F1E6}", region:"Europe", institution:"Pension Fund of Ukraine", maturityScore:1.8, maturityLabel:"Emerging", coverageRate:70, replacementRate:38, sustainability:1.7, systemType:"PAYG (DB)", yearEstablished:1991, digitalLevel:"Transitioning", keyFeatures:["Diia digital app \u2014 pension integration","Wartime emergency payments","EU accession reform alignment","IDP pension portability"], challenges:["War-time displacement","Fund deficit structural issue","Very low replacement rate"], insights:["Diia app: pension certificates mobile","IDP pension access digital expansion","EU integration reform 2024"] },
  SGP: { iso3:"SGP", name:"Singapore", flag:"\u{1F1F8}\u{1F1EC}", region:"Asia Pacific", institution:"CPF Board", maturityScore:4.0, maturityLabel:"Leader", coverageRate:100, replacementRate:92, sustainability:4.0, systemType:"Fully-Funded DC (CPF)", yearEstablished:1955, digitalLevel:"Digital-First", keyFeatures:["Global gold standard \u2014 #1 globally","Covers retirement + health + housing","CPF mobile app with full self-service","AI retirement projections","Integrated with national ID (SingPass)"], challenges:["Rising healthcare cost draw on Medisave","Adequacy for lower-wage workers","Increasing self-employed inclusion"], insights:["SingPass integration: 4M users","AI-powered retirement planning chatbot","CPF LIFE \u2014 longevity insurance annuity","Fully digital onboarding \u2014 zero paper"] },
  AUS: { iso3:"AUS", name:"Australia", flag:"\u{1F1E6}\u{1F1FA}", region:"Asia Pacific", institution:"ATO Superannuation / APRA", maturityScore:3.7, maturityLabel:"Leader", coverageRate:96, replacementRate:75, sustainability:3.8, systemType:"Mandatory DC (Superannuation)", yearEstablished:1992, digitalLevel:"Digital-First", keyFeatures:["SuperStream electronic standard","MyGov integration","11% mandatory employer contribution","Lost super recovery service"], challenges:["Gender gap in super balances","Early withdrawal COVID legacy","Advice affordability gap"], insights:["ATO Super Hotline digital bot","SuperStream: $700B+ annually processed electronically","YourSuper comparison tool","Super stapling \u2014 one fund for life"] },
  NZL: { iso3:"NZL", name:"New Zealand", flag:"\u{1F1F3}\u{1F1FF}", region:"Asia Pacific", institution:"MSD / KiwiSaver", maturityScore:3.6, maturityLabel:"Leader", coverageRate:92, replacementRate:70, sustainability:3.7, systemType:"Voluntary DC (KiwiSaver) + NZS", yearEstablished:2007, digitalLevel:"Digital-First", keyFeatures:["KiwiSaver: automatic opt-in","NZ Superannuation (flat-rate universal)","Digital myKiwiSaver portal","Government employer contribution match"], challenges:["NZS affordability long-term","Low KiwiSaver default rates","Gender retirement savings gap"], insights:["Smart investor comparison tool","KiwiSaver auto-escalation pilot","M\u0101ori pension access digital expansion"] },
  JPN: { iso3:"JPN", name:"Japan", flag:"\u{1F1EF}\u{1F1F5}", region:"Asia Pacific", institution:"Japan Pension Service / GPIF", maturityScore:3.0, maturityLabel:"Advanced", coverageRate:90, replacementRate:62, sustainability:2.5, systemType:"NDC (NP + EPI)", yearEstablished:1942, digitalLevel:"Partially Digital", keyFeatures:["World's 2nd largest pension fund (GPIF)","My Number integration","Pension simulation tools","iDeCo personal pension scheme"], challenges:["Severe aging \u2014 29% over 65","30% contribution evasion self-employed","Pension adequacy reform urgency"], insights:["My Number Card pension integration","iDeCo digital account management","GPIF ESG investment mandate 2023"] },
  KOR: { iso3:"KOR", name:"South Korea", flag:"\u{1F1F0}\u{1F1F7}", region:"Asia Pacific", institution:"National Pension Service (NPS)", maturityScore:3.3, maturityLabel:"Advanced", coverageRate:92, replacementRate:63, sustainability:2.8, systemType:"Defined Benefit (NDC-like)", yearEstablished:1988, digitalLevel:"Partially Digital", keyFeatures:["World's 3rd largest pension fund ($800B)","NPS mobile app","AI customer service chatbot","Biometric authentication"], challenges:["Projected fund depletion by 2055","Low birth rate impact","Adequacy reform needed"], insights:["NPS reform 2024: contribution increase","Biometric app login","AI pension advisor launched 2023"] },
  MYS: { iso3:"MYS", name:"Malaysia", flag:"\u{1F1F2}\u{1F1FE}", region:"Asia Pacific", institution:"EPF (KWSP)", maturityScore:3.2, maturityLabel:"Advanced", coverageRate:80, replacementRate:70, sustainability:3.3, systemType:"Fully-Funded DC (EPF)", yearEstablished:1951, digitalLevel:"Digital-First", keyFeatures:["EPF i-Akaun digital platform","Shariah-compliant investment option","Multi-fund choice for members","COVID hardship withdrawal legacy"], challenges:["COVID-era withdrawals depleted savings","Informal sector coverage gaps","Adequacy for low-wage workers"], insights:["i-Akaun: 14M digital users","EPF Simpanan Shariah \u2014 halal portfolio","Digital contribution automation for gig workers"] },
  THA: { iso3:"THA", name:"Thailand", flag:"\u{1F1F9}\u{1F1ED}", region:"Asia Pacific", institution:"Social Security Office (SSO)", maturityScore:2.1, maturityLabel:"Developing", coverageRate:58, replacementRate:45, sustainability:2.2, systemType:"DB + Voluntary DC (PVD)", yearEstablished:1990, digitalLevel:"Transitioning", keyFeatures:["National Social Security Scheme","eSSO portal","PVD voluntary provident fund","Government pension fund (GPF) for civil servants"], challenges:["Low informal sector coverage","Low contribution rates","Aging society pressure"], insights:["e-SSO app launched 2022","Digital claims for sickness benefit","National Savings Fund expansion"] },
  IDN: { iso3:"IDN", name:"Indonesia", flag:"\u{1F1EE}\u{1F1E9}", region:"Asia Pacific", institution:"BPJS Ketenagakerjaan", maturityScore:2.2, maturityLabel:"Developing", coverageRate:52, replacementRate:40, sustainability:2.3, systemType:"DB + DC (JHT + JP)", yearEstablished:2014, digitalLevel:"Transitioning", keyFeatures:["JKK, JKM, JHT, JP programmes","BPJSTK mobile app","Digital claims 1-hour SLA (2022)","National Health Insurance (JKN) linked"], challenges:["Large informal sector exclusion","Low contribution compliance","Rural digital access"], insights:["BPJSTK mobile: 15M+ downloads","Digital claim in under 1 hour","Big data to detect non-compliance"] },
  PHL: { iso3:"PHL", name:"Philippines", flag:"\u{1F1F5}\u{1F1ED}", region:"Asia Pacific", institution:"SSS / GSIS", maturityScore:2.0, maturityLabel:"Developing", coverageRate:45, replacementRate:40, sustainability:2.0, systemType:"DB (SSS + GSIS)", yearEstablished:1954, digitalLevel:"Transitioning", keyFeatures:["SSS for private, GSIS for government","My.SSS portal","Flexi-fund voluntary savings","OFW overseas worker coverage"], challenges:["OFW portability complexity","Low formal sector coverage","IT legacy infrastructure"], insights:["My.SSS digital \u2014 real-time transactions","SSS chatbot launches","Unified ID for faster benefit release"] },
  IND: { iso3:"IND", name:"India", flag:"\u{1F1EE}\u{1F1F3}", region:"Asia Pacific", institution:"EPFO / NPS Trust", maturityScore:2.0, maturityLabel:"Developing", coverageRate:30, replacementRate:40, sustainability:2.1, systemType:"DB (EPF) + DC (NPS)", yearEstablished:1952, digitalLevel:"Transitioning", keyFeatures:["EPFO: 250M+ subscribers (world's largest)","NPS for government + voluntary","Aadhaar-linked digital onboarding","UMANG mobile app"], challenges:["Only 30% of workforce covered","Fragmented ESIC / EPFO split","Rural and gig worker exclusion"], insights:["EPFO digital claim settlement 72hrs","Aadhaar-based employer compliance","NPS 3-click account opening via DigiLocker"] },
  CHN: { iso3:"CHN", name:"China", flag:"\u{1F1E8}\u{1F1F3}", region:"Asia Pacific", institution:"National Social Insurance Fund (NSIF)", maturityScore:2.4, maturityLabel:"Developing", coverageRate:72, replacementRate:55, sustainability:2.5, systemType:"DB + DC (Three Pillars)", yearEstablished:1951, digitalLevel:"Partially Digital", keyFeatures:["World's largest pension population","Social Credit integration","Alipay pension contribution module","Provincial fund consolidation underway"], challenges:["Urban-rural pension disparity","Aging faster than any major economy","Provincial fund solvency variance"], insights:["National Pension Bureau established 2023","Alipay/WeChat Pay contribution micro-payments","Personal pension scheme (Pillar 3) launched 2022"] },
  CAN: { iso3:"CAN", name:"Canada", flag:"\u{1F1E8}\u{1F1E6}", region:"Americas", institution:"CPPIB / Service Canada", maturityScore:3.7, maturityLabel:"Leader", coverageRate:97, replacementRate:78, sustainability:4.0, systemType:"DB (CPP) + OAS + DC (RRSP)", yearEstablished:1927, digitalLevel:"Digital-First", keyFeatures:["CPP Investment Board (world-class)","My Service Canada Account","My Retirement income estimator","OAS universal payment at 65"], challenges:["Quebec QPP divergence complexity","Low-income adequacy \u2014 GIS reliance","Long-term CPP adequacy debate"], insights:["MSCA digital \u2014 11M users","CPP2 enhanced contributions 2024","MyBenefits mobile app for OAS/CPP"] },
  USA: { iso3:"USA", name:"United States", flag:"\u{1F1FA}\u{1F1F8}", region:"Americas", institution:"Social Security Administration (SSA)", maturityScore:3.3, maturityLabel:"Advanced", coverageRate:94, replacementRate:57, sustainability:2.9, systemType:"DB (OASDI) + DC (401k/IRA)", yearEstablished:1935, digitalLevel:"Partially Digital", keyFeatures:["SSA.gov with 175M accounts","my Social Security online portal","SECURE 2.0 Act (2022) reforms","Medicare integration"], challenges:["Trust Fund depletion projected 2035","Low replacement rate for high-earners","401k coverage gaps in small businesses"], insights:["My Social Security: e-Statement","SECURE 2.0: auto-enrollment mandate","Retirement Savings Lost & Found database 2024"] },
  BRA: { iso3:"BRA", name:"Brazil", flag:"\u{1F1E7}\u{1F1F7}", region:"Americas", institution:"INSS / Previc", maturityScore:2.4, maturityLabel:"Developing", coverageRate:68, replacementRate:60, sustainability:2.3, systemType:"DB (PAYG) + DC (EFPC)", yearEstablished:1923, digitalLevel:"Transitioning", keyFeatures:["Meu INSS digital app","2019 landmark pension reform","Means-tested BPC benefit","Private Closed Pension Funds (EFPC)"], challenges:["Informal sector 40% not covered","High fiscal pension spending (~13% GDP)","Reform implementation backlash"], insights:["Meu INSS: 75M app users","Digital anti-fraud biometric validation","INSS Conectividade: employer API"] },
  MEX: { iso3:"MEX", name:"Mexico", flag:"\u{1F1F2}\u{1F1FD}", region:"Americas", institution:"IMSS / AFORE / Consar", maturityScore:2.3, maturityLabel:"Developing", coverageRate:55, replacementRate:45, sustainability:2.4, systemType:"Mandatory DC (Afore) + DB legacy", yearEstablished:1943, digitalLevel:"Transitioning", keyFeatures:["Afore individual capitalization accounts","2021 reform: employer contribution to 15%","IMSS digital services","Social pension for elderly 65+"], challenges:["Low coverage of informal workers (~60%)","Low contribution rates historically","Afore low financial literacy"], insights:["Mi Afore app \u2014 real-time account view","AforeMovil digital onboarding","Pensi\u00f3n para Adultos Mayores: universal 65+"] },
  CHL: { iso3:"CHL", name:"Chile", flag:"\u{1F1E8}\u{1F1F1}", region:"Americas", institution:"AFP / IPS", maturityScore:2.3, maturityLabel:"Developing", coverageRate:72, replacementRate:45, sustainability:2.5, systemType:"Mandatory DC (AFP)", yearEstablished:1981, digitalLevel:"Transitioning", keyFeatures:["World's first mandatory DC system (1981)","AFP online account management","Solidarity Pillar (APS) for low earners","2024 pension reform underway"], challenges:["Low replacement rates \u2014 political crisis","Gender pension gap (homemakers)","COVID-era withdrawals reduced balances"], insights:["AFP online fund switching","Supervisor Superintendencia digital portal","Guaranteed universal pension (PGU) 2022"] },
  ARG: { iso3:"ARG", name:"Argentina", flag:"\u{1F1E6}\u{1F1F7}", region:"Americas", institution:"ANSES / SIPA", maturityScore:1.9, maturityLabel:"Emerging", coverageRate:68, replacementRate:50, sustainability:1.6, systemType:"PAYG (DB) \u2014 nationalized 2008", yearEstablished:1944, digitalLevel:"Transitioning", keyFeatures:["Universal Basic Income for elderly","MI ANSES digital portal","Pension indexation by inflation","Worker's history from multiple regimes"], challenges:["Hyperinflationary erosion of pensions","Renationalization of private funds","Fiscal deficit & IMF conditions"], insights:["Mi ANSES app: 10M users","Digital jubilacion tracking","Mobile notification for pension updates"] },
  COL: { iso3:"COL", name:"Colombia", flag:"\u{1F1E8}\u{1F1F4}", region:"Americas", institution:"Colpensiones / AFP", maturityScore:2.0, maturityLabel:"Developing", coverageRate:42, replacementRate:50, sustainability:2.0, systemType:"PAYG + DC (dual system)", yearEstablished:1946, digitalLevel:"Transitioning", keyFeatures:["Dual choice: Colpensiones or AFP","Colombia Mayor social pension","e-Colpensiones portal","2023 pension reform bill"], challenges:["Very low informal sector coverage","Competitive system duplication costs","Low financial literacy for AFP"], insights:["Colpensiones digital platform relaunch","Mi Pensi\u00f3n simulation tool","Social pension targeting data analytics"] },
  URY: { iso3:"URY", name:"Uruguay", flag:"\u{1F1FA}\u{1F1FE}", region:"Americas", institution:"BPS / Afap", maturityScore:2.6, maturityLabel:"Developing", coverageRate:84, replacementRate:68, sustainability:2.9, systemType:"Mixed (PAYG + DC)", yearEstablished:1943, digitalLevel:"Partially Digital", keyFeatures:["South America's most complete pension","BPS digital services","High coverage (formal sector)","Flexible retirement age"], challenges:["Aging population impact","2022 reform: age 65 referendum","Informal sector gaps"], insights:["BPS app: contribution tracking","Simulation tool for retirement date","Digital employer integration"] },
  ZAF: { iso3:"ZAF", name:"South Africa", flag:"\u{1F1FF}\u{1F1E6}", region:"Africa", institution:"GEPF / SASSA", maturityScore:2.3, maturityLabel:"Developing", coverageRate:40, replacementRate:55, sustainability:2.4, systemType:"DB (GEPF) + Social Grants", yearEstablished:1979, digitalLevel:"Transitioning", keyFeatures:["GEPF: world's 18th largest pension fund","Social Relief of Distress grant","SASSA gold card digital payment","Two-pot system reform 2024"], challenges:["<40% formal sector coverage","Very high unemployment (32%)","Urban-rural access gaps"], insights:["Two-Pot retirement reform 2024","SASSA Postbank digital modernisation","GEPF online portal launched"] },
  NGA: { iso3:"NGA", name:"Nigeria", flag:"\u{1F1F3}\u{1F1EC}", region:"Africa", institution:"PENCOM / PFAs", maturityScore:1.5, maturityLabel:"Emerging", coverageRate:18, replacementRate:35, sustainability:1.6, systemType:"Mandatory DC (CPS)", yearEstablished:2004, digitalLevel:"Manual", keyFeatures:["Contributory Pension Scheme (2004)","PENCOM e-registration","RSA transfers digital","Multi-Fund structure"], challenges:["Only 18% coverage \u2014 mostly formal sector","Low rural awareness","Multiple PFAs \u2014 fragmented access"], insights:["PENCOM e-registration roll-out","RSA transfer digital (2022)","Micro-pension for informal workers pilot"] },
  GHA: { iso3:"GHA", name:"Ghana", flag:"\u{1F1EC}\u{1F1ED}", region:"Africa", institution:"SSNIT / NPRA", maturityScore:1.9, maturityLabel:"Emerging", coverageRate:25, replacementRate:40, sustainability:1.8, systemType:"DB + Mandatory DC + Voluntary", yearEstablished:1965, digitalLevel:"Manual", keyFeatures:["Three-tier pension system","Tier 1 SSNIT mandatory DB","Tier 2 mandatory DC","Informal sector Tier 3 growing"], challenges:["Low informal sector coverage","SSNIT deficit concerns","Digital infrastructure gaps"], insights:["GhanaCard integration with SSNIT","Mobile money pension contributions","NPRA regulatory sandbox 2023"] },
  KEN: { iso3:"KEN", name:"Kenya", flag:"\u{1F1F0}\u{1F1EA}", region:"Africa", institution:"NSSF / RBA", maturityScore:1.8, maturityLabel:"Emerging", coverageRate:22, replacementRate:35, sustainability:1.7, systemType:"DB + Voluntary Occupational", yearEstablished:1965, digitalLevel:"Manual", keyFeatures:["NSSF mandatory contributions","RBA regulatory oversight","M-Pesa pension contribution integration","Mbao Pension Plan for informal sector"], challenges:["Very low formal sector %","NSSF Act 2013 court challenges","Outdated IT systems"], insights:["Mbao Pension: M-Pesa micro-contributions","NSSF digital claim submission","Hustler Fund: mobile-first social savings"] },
  MAR: { iso3:"MAR", name:"Morocco", flag:"\u{1F1F2}\u{1F1E6}", region:"Africa", institution:"CMR / CIMR / CNSS", maturityScore:2.0, maturityLabel:"Developing", coverageRate:42, replacementRate:48, sustainability:2.0, systemType:"DB (Multiple Schemes)", yearEstablished:1959, digitalLevel:"Transitioning", keyFeatures:["CMR for civil servants","CNSS for private sector","CIMR complementary","2024 National Social Protection Reform"], challenges:["Multiple fragmented schemes","Low private sector coverage","Reform implementation pace"], insights:["DAMANCOM digital for CNSS","National Social Protection Strategy 2021\u20132025","Digital employer declaration portal"] },
  TUN: { iso3:"TUN", name:"Tunisia", flag:"\u{1F1F9}\u{1F1F3}", region:"Africa", institution:"CNSS / CNRPS", maturityScore:1.9, maturityLabel:"Emerging", coverageRate:45, replacementRate:48, sustainability:1.8, systemType:"DB (PAYG)", yearEstablished:1960, digitalLevel:"Manual", keyFeatures:["CNSS private sector","CNRPS civil servants","Digital portal CNSS.tn","Agricultural workers scheme"], challenges:["Fiscal deficit impact on pensions","Informal economy majority","Political instability reform risk"], insights:["CNSS digital portal","Mobile claim tracking","Employer e-Declaration system"] },
  ETH: { iso3:"ETH", name:"Ethiopia", flag:"\u{1F1EA}\u{1F1F9}", region:"Africa", institution:"PSNP / OSSA", maturityScore:1.2, maturityLabel:"Emerging", coverageRate:8, replacementRate:30, sustainability:1.2, systemType:"DB (Civil Servants only)", yearEstablished:2011, digitalLevel:"Manual", keyFeatures:["PSNP social protection for rural poor","Civil servant pension scheme","OSSA: private sector embryonic","Foreign aid social safety nets"], challenges:["Only 8% formal coverage","No mandatory private sector pension","Digital infrastructure absent outside cities"], insights:["PSNP: world's largest social protection in Africa","Mobile money integration pilot","ILO/World Bank pension expansion support"] },
};
