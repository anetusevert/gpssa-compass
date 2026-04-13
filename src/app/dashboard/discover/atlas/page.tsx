"use client";

import { useState, useMemo, memo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import {
  Globe,
  Search,
  Zap,
  ChevronDown,
  X,
  ArrowRight,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

/* ═══════════════════════════════════════════════════════════════
   ISO CODE MAPPINGS — full 196-country coverage
═══════════════════════════════════════════════════════════════ */

const ISO_A2_TO_A3: Record<string, string> = {
  AF:"AFG",AL:"ALB",DZ:"DZA",AD:"AND",AO:"AGO",AG:"ATG",AR:"ARG",AM:"ARM",AU:"AUS",AT:"AUT",AZ:"AZE",
  BS:"BHS",BH:"BHR",BD:"BGD",BB:"BRB",BY:"BLR",BE:"BEL",BZ:"BLZ",BJ:"BEN",BT:"BTN",BO:"BOL",BA:"BIH",
  BW:"BWA",BR:"BRA",BN:"BRN",BG:"BGR",BF:"BFA",BI:"BDI",CV:"CPV",KH:"KHM",CM:"CMR",CA:"CAN",CF:"CAF",
  TD:"TCD",CL:"CHL",CN:"CHN",CO:"COL",KM:"COM",CG:"COG",CD:"COD",CR:"CRI",CI:"CIV",HR:"HRV",CU:"CUB",
  CY:"CYP",CZ:"CZE",DK:"DNK",DJ:"DJI",DM:"DMA",DO:"DOM",EC:"ECU",EG:"EGY",SV:"SLV",GQ:"GNQ",ER:"ERI",
  EE:"EST",SZ:"SWZ",ET:"ETH",FJ:"FJI",FI:"FIN",FR:"FRA",GA:"GAB",GM:"GMB",GE:"GEO",DE:"DEU",GH:"GHA",
  GR:"GRC",GD:"GRD",GT:"GTM",GN:"GIN",GW:"GNB",GY:"GUY",HT:"HTI",HN:"HND",HU:"HUN",IS:"ISL",IN:"IND",
  ID:"IDN",IR:"IRN",IQ:"IRQ",IE:"IRL",IL:"ISR",IT:"ITA",JM:"JAM",JP:"JPN",JO:"JOR",KZ:"KAZ",KE:"KEN",
  KI:"KIR",KP:"PRK",KR:"KOR",KW:"KWT",KG:"KGZ",LA:"LAO",LV:"LVA",LB:"LBN",LS:"LSO",LR:"LBR",LY:"LBY",
  LI:"LIE",LT:"LTU",LU:"LUX",MG:"MDG",MW:"MWI",MY:"MYS",MV:"MDV",ML:"MLI",MT:"MLT",MH:"MHL",MR:"MRT",
  MU:"MUS",MX:"MEX",FM:"FSM",MD:"MDA",MC:"MCO",MN:"MNG",ME:"MNE",MA:"MAR",MZ:"MOZ",MM:"MMR",NA:"NAM",
  NR:"NRU",NP:"NPL",NL:"NLD",NZ:"NZL",NI:"NIC",NE:"NER",NG:"NGA",MK:"MKD",NO:"NOR",OM:"OMN",PK:"PAK",
  PW:"PLW",PS:"PSE",PA:"PAN",PG:"PNG",PY:"PRY",PE:"PER",PH:"PHL",PL:"POL",PT:"PRT",QA:"QAT",RO:"ROU",
  RU:"RUS",RW:"RWA",KN:"KNA",LC:"LCA",VC:"VCT",WS:"WSM",SM:"SMR",ST:"STP",SA:"SAU",SN:"SEN",RS:"SRB",
  SC:"SYC",SL:"SLE",SG:"SGP",SK:"SVK",SI:"SVN",SB:"SLB",SO:"SOM",ZA:"ZAF",SS:"SSD",ES:"ESP",LK:"LKA",
  SD:"SDN",SR:"SUR",SE:"SWE",CH:"CHE",SY:"SYR",TW:"TWN",TJ:"TJK",TZ:"TZA",TH:"THA",TL:"TLS",TG:"TGO",
  TO:"TON",TT:"TTO",TN:"TUN",TR:"TUR",TM:"TKM",TV:"TUV",UG:"UGA",UA:"UKR",AE:"ARE",GB:"GBR",US:"USA",
  UY:"URY",UZ:"UZB",VU:"VUT",VA:"VAT",VE:"VEN",VN:"VNM",YE:"YEM",ZM:"ZMB",ZW:"ZWE",
};

const NAME_TO_ISO: Record<string, string> = {
  "Afghanistan":"AFG","Albania":"ALB","Algeria":"DZA","Angola":"AGO","Argentina":"ARG","Armenia":"ARM",
  "Australia":"AUS","Austria":"AUT","Azerbaijan":"AZE","Bahrain":"BHR","Bangladesh":"BGD","Belarus":"BLR",
  "Belgium":"BEL","Bolivia":"BOL","Bosnia and Herzegovina":"BIH","Bosnia and Herz.":"BIH","Botswana":"BWA",
  "Brazil":"BRA","Bulgaria":"BGR","Cambodia":"KHM","Cameroon":"CMR","Canada":"CAN","Chad":"TCD",
  "Chile":"CHL","China":"CHN","Colombia":"COL","Congo":"COG","Dem. Rep. Congo":"COD",
  "Democratic Republic of the Congo":"COD","Costa Rica":"CRI","Croatia":"HRV","Cuba":"CUB","Cyprus":"CYP",
  "Czechia":"CZE","Czech Republic":"CZE","Denmark":"DNK","Dominican Republic":"DOM","Dominican Rep.":"DOM",
  "Ecuador":"ECU","Egypt":"EGY","El Salvador":"SLV","Eq. Guinea":"GNQ","Eritrea":"ERI","Estonia":"EST",
  "Eswatini":"SWZ","Ethiopia":"ETH","Finland":"FIN","France":"FRA","Gabon":"GAB","Georgia":"GEO",
  "Germany":"DEU","Ghana":"GHA","Greece":"GRC","Guatemala":"GTM","Guinea":"GIN","Guyana":"GUY",
  "Haiti":"HTI","Honduras":"HND","Hungary":"HUN","Iceland":"ISL","India":"IND","Indonesia":"IDN",
  "Iran":"IRN","Iraq":"IRQ","Ireland":"IRL","Israel":"ISR","Italy":"ITA","Jamaica":"JAM","Japan":"JPN",
  "Jordan":"JOR","Kazakhstan":"KAZ","Kenya":"KEN","North Korea":"PRK","South Korea":"KOR","Korea":"KOR",
  "Kuwait":"KWT","Kyrgyzstan":"KGZ","Laos":"LAO","Lao PDR":"LAO","Latvia":"LVA","Lebanon":"LBN",
  "Liberia":"LBR","Libya":"LBY","Lithuania":"LTU","Luxembourg":"LUX","Malaysia":"MYS","Mali":"MLI",
  "Malta":"MLT","Mauritania":"MRT","Mauritius":"MUS","Mexico":"MEX","Moldova":"MDA","Mongolia":"MNG",
  "Montenegro":"MNE","Morocco":"MAR","Mozambique":"MOZ","Myanmar":"MMR","Namibia":"NAM","Nepal":"NPL",
  "Netherlands":"NLD","New Zealand":"NZL","Nicaragua":"NIC","Niger":"NER","Nigeria":"NGA",
  "North Macedonia":"MKD","Norway":"NOR","Oman":"OMN","Pakistan":"PAK","Palestine":"PSE","Panama":"PAN",
  "Papua New Guinea":"PNG","Paraguay":"PRY","Peru":"PER","Philippines":"PHL","Poland":"POL",
  "Portugal":"PRT","Qatar":"QAT","Romania":"ROU","Russia":"RUS","Rwanda":"RWA","Saudi Arabia":"SAU",
  "Senegal":"SEN","Serbia":"SRB","Sierra Leone":"SLE","Singapore":"SGP","Slovakia":"SVK","Slovenia":"SVN",
  "Somalia":"SOM","South Africa":"ZAF","S. Sudan":"SSD","South Sudan":"SSD","Spain":"ESP",
  "Sri Lanka":"LKA","Sudan":"SDN","Sweden":"SWE","Switzerland":"CHE","Syria":"SYR","Taiwan":"TWN",
  "Tajikistan":"TJK","Tanzania":"TZA","Thailand":"THA","Togo":"TGO","Trinidad and Tobago":"TTO",
  "Tunisia":"TUN","Turkey":"TUR","Türkiye":"TUR","Uganda":"UGA","Ukraine":"UKR",
  "United Arab Emirates":"ARE","United Kingdom":"GBR","United States of America":"USA",
  "United States":"USA","Uruguay":"URY","Uzbekistan":"UZB","Venezuela":"VEN","Vietnam":"VNM",
  "Viet Nam":"VNM","Yemen":"YEM","Zambia":"ZMB","Zimbabwe":"ZWE",
  "Côte d'Ivoire":"CIV","Ivory Coast":"CIV","W. Sahara":"ESH","Timor-Leste":"TLS",
  "Central African Rep.":"CAF","Central African Republic":"CAF",
};

/* ═══════════════════════════════════════════════════════════════
   COUNTRY DATA — Global Pension & Social Security Intelligence
═══════════════════════════════════════════════════════════════ */

export interface CountryProfile {
  iso3: string;
  name: string;
  flag: string;
  region: string;
  institution: string;
  maturityScore: number;      // 1.0 – 4.0
  maturityLabel: "Leader" | "Advanced" | "Developing" | "Emerging";
  coverageRate: number;       // % of working-age population
  replacementRate: number;    // % of pre-retirement income
  sustainability: number;     // 1–4 scale
  systemType: string;
  yearEstablished: number;
  digitalLevel: string;
  keyFeatures: string[];
  challenges: string[];
  insights: string[];
}

const COUNTRIES: Record<string, CountryProfile> = {
  // ─── GCC / Middle East ───────────────────────────────────────
  ARE: { iso3:"ARE", name:"United Arab Emirates", flag:"🇦🇪", region:"Middle East", institution:"GPSSA + DEWS", maturityScore:3.1, maturityLabel:"Advanced", coverageRate:78, replacementRate:65, sustainability:3.2, systemType:"Defined Benefit + DEWS", yearEstablished:1999, digitalLevel:"Partially Digital", keyFeatures:["Federal pension for UAE nationals","DEWS for expat end-of-service","Digital member portal","Multi-employer coverage"], challenges:["Limited expat pension portability","Aging liability growth","Manual document processing"], insights:["First GCC authority to launch mobile member portal","Expanding employer self-service","AI pilot for claims processing underway"] },
  SAU: { iso3:"SAU", name:"Saudi Arabia", flag:"🇸🇦", region:"Middle East", institution:"GOSI", maturityScore:2.7, maturityLabel:"Developing", coverageRate:72, replacementRate:58, sustainability:2.8, systemType:"Defined Benefit", yearEstablished:1969, digitalLevel:"Partially Digital", keyFeatures:["Vision 2030 pension reform","Mandatory employee + employer contributions","Work injury coverage","Digital Wage Protection System"], challenges:["High dependence on oil revenue","Low private sector Saudi coverage","Lengthy claim processing"], insights:["Najm platform for digital injury reporting","Integration with national ID (Absher)","Expanding to gig economy workers"] },
  QAT: { iso3:"QAT", name:"Qatar", flag:"🇶🇦", region:"Middle East", institution:"PFIO", maturityScore:2.6, maturityLabel:"Developing", coverageRate:62, replacementRate:60, sustainability:2.7, systemType:"Defined Benefit", yearEstablished:1993, digitalLevel:"Transitioning", keyFeatures:["Nationals-only pension scheme","Sovereign wealth fund backing","Housing allowances integrated","World Cup legacy digital reforms"], challenges:["Expat workforce not covered","Small citizen beneficiary base","Manual claim workflows"], insights:["Metrash2 app integration for government services","Expanded eligibility ahead of 2022 reforms","PFIO digital portal launched 2023"] },
  KWT: { iso3:"KWT", name:"Kuwait", flag:"🇰🇼", region:"Middle East", institution:"PIFSS", maturityScore:2.3, maturityLabel:"Developing", coverageRate:55, replacementRate:62, sustainability:2.4, systemType:"Defined Benefit", yearEstablished:1976, digitalLevel:"Transitioning", keyFeatures:["Generous replacement rates","Government-backed guarantees","Civil + private sector funds","Survivors and disability coverage"], challenges:["Fiscal sustainability concerns","No expat pension portability","Limited digital channels"], insights:["Digital services expansion via Civil ID integration","e-Pension portal launched","Actuarial reforms underway"] },
  BHR: { iso3:"BHR", name:"Bahrain", flag:"🇧🇭", region:"Middle East", institution:"Social Insurance Organization", maturityScore:2.5, maturityLabel:"Developing", coverageRate:65, replacementRate:60, sustainability:2.5, systemType:"Defined Benefit", yearEstablished:1975, digitalLevel:"Transitioning", keyFeatures:["Covers both nationals and expatriates","Unemployment insurance scheme","Work injury protection","Bahrain.bh digital integration"], challenges:["Sustainability pressure from aging nationals","Expat contribution portability","Manual verification bottlenecks"], insights:["SIO eServices portal","National labour fund (Tamkeen) partnership","Parametric reform adopted 2022"] },
  OMN: { iso3:"OMN", name:"Oman", flag:"🇴🇲", region:"Middle East", institution:"PASI", maturityScore:2.2, maturityLabel:"Developing", coverageRate:52, replacementRate:55, sustainability:2.3, systemType:"Defined Benefit", yearEstablished:1991, digitalLevel:"Manual", keyFeatures:["Omanization policy linked to benefits","Injury and disability protection","Civil and military separate funds"], challenges:["Very low expat coverage","Oman Vision 2040 reform pending","High reliance on manual processes"], insights:["Digital services piloted via app","Actuarial review underway","Expanding to private sector SMEs"] },
  JOR: { iso3:"JOR", name:"Jordan", flag:"🇯🇴", region:"Middle East", institution:"Social Security Corporation", maturityScore:2.0, maturityLabel:"Developing", coverageRate:48, replacementRate:50, sustainability:2.0, systemType:"Defined Benefit", yearEstablished:1978, digitalLevel:"Manual", keyFeatures:["Old-age, disability, death coverage","Work injury insurance","Unemployment insurance","National ID integration"], challenges:["Low coverage in informal sector","Fiscal sustainability concerns","Limited digital access outside cities"], insights:["e-SSC portal launched","SMS notifications for beneficiaries","Mobile top-up for contributions piloted"] },
  EGY: { iso3:"EGY", name:"Egypt", flag:"🇪🇬", region:"Middle East", institution:"National Social Insurance Authority", maturityScore:1.8, maturityLabel:"Emerging", coverageRate:35, replacementRate:45, sustainability:1.8, systemType:"Defined Benefit", yearEstablished:1975, digitalLevel:"Manual", keyFeatures:["Old-age pension + lump sum","Survivor and disability benefits","Egypt 2030 Vision reform agenda"], challenges:["Very low informal sector coverage","High administrative costs","Fragmented system across ministries"], insights:["Digital pension card pilot","Fintech partnerships for contribution collection","New Social Protection Act 2019"] },
  // ─── Europe ──────────────────────────────────────────────────
  NLD: { iso3:"NLD", name:"Netherlands", flag:"🇳🇱", region:"Europe", institution:"SVB / APG", maturityScore:4.0, maturityLabel:"Leader", coverageRate:98, replacementRate:88, sustainability:3.8, systemType:"Three-Pillar (DB + DC + Private)", yearEstablished:1901, digitalLevel:"Digital-First", keyFeatures:["World's #1 ranked pension system","Quasi-mandatory occupational pensions","MijnSVB digital portal","Automatic life-event triggers"], challenges:["Transition to new DC-based system","Rising life expectancy pressure","Communication complexity"], insights:["New pension law (Wtp) 2023 — full DC transition","Open pension data API","Personalized pension dashboard for all citizens"] },
  DNK: { iso3:"DNK", name:"Denmark", flag:"🇩🇰", region:"Europe", institution:"ATP / Udbetaling Danmark", maturityScore:3.9, maturityLabel:"Leader", coverageRate:97, replacementRate:85, sustainability:4.0, systemType:"Multi-Pillar (NDC + Occupational + Voluntary)", yearEstablished:1891, digitalLevel:"Digital-First", keyFeatures:["Consistently #1 Mercer Global Index","ATP mandatory savings","Fully automated benefit payments","Digital.gov.dk integration"], challenges:["Means-testing complexity","Cross-border EU pension coordination"], insights:["MitID single sign-on for all pension services","Life expectancy automatic adjustments","Green investment mandate for pension funds"] },
  SWE: { iso3:"SWE", name:"Sweden", flag:"🇸🇪", region:"Europe", institution:"Pensionsmyndigheten", maturityScore:3.8, maturityLabel:"Leader", coverageRate:99, replacementRate:80, sustainability:4.0, systemType:"NDC + Premium Pension", yearEstablished:1913, digitalLevel:"Digital-First", keyFeatures:["Notional Defined Contribution system","Automatic financial stabiliser","minPension.se aggregation platform","Orange Envelope annual statement"], challenges:["Premium pension fund complexity","Aging population management"], insights:["Open pension data API","Aggregated multi-fund view for citizens","Robot-advisor integration for premium pension"] },
  NOR: { iso3:"NOR", name:"Norway", flag:"🇳🇴", region:"Europe", institution:"NAV / NBIM", maturityScore:3.9, maturityLabel:"Leader", coverageRate:99, replacementRate:83, sustainability:4.0, systemType:"NDC + Government Pension Fund Global", yearEstablished:1936, digitalLevel:"Digital-First", keyFeatures:["$1.7T sovereign wealth fund","Full digital self-service","Flexible retirement from 62","Integration with Altinn digital platform"], challenges:["Oil fund dependency risk","Immigration-related coverage gaps"], insights:["Altinn: world's leading digital government platform","Pension projections visible in online banking","Gender pension gap proactive alerts"] },
  CHE: { iso3:"CHE", name:"Switzerland", flag:"🇨🇭", region:"Europe", institution:"AHV / SUVA", maturityScore:3.8, maturityLabel:"Leader", coverageRate:98, replacementRate:85, sustainability:3.7, systemType:"Three-Pillar (AHV + BVG + Private)", yearEstablished:1948, digitalLevel:"Digital-First", keyFeatures:["Mandatory three-pillar architecture","BVG occupational pension mandatory","Federal supplement minimum income","High-quality actuarial governance"], challenges:["AHV 21 reform political resistance","Pension gap for part-time (female) workers"], insights:["AHV app for simulation","BVG reform 2023: expanded part-time coverage","Digital pension certificate e-AHV"] },
  FIN: { iso3:"FIN", name:"Finland", flag:"🇫🇮", region:"Europe", institution:"Keva / ETK", maturityScore:3.7, maturityLabel:"Leader", coverageRate:98, replacementRate:82, sustainability:3.8, systemType:"Earnings-Related (DB)", yearEstablished:1937, digitalLevel:"Digital-First", keyFeatures:["Fully earnings-related system","Strong actuarial funding","Life expectancy coefficient adjustments","Omakanta health + pension integration"], challenges:["Lowest birth rate pressure","Public sector underfunding"], insights:["Machine learning for pension fraud detection","Seamless Kela + ETK data sharing","API-first benefit calculation engine"] },
  DEU: { iso3:"DEU", name:"Germany", flag:"🇩🇪", region:"Europe", institution:"Deutsche Rentenversicherung", maturityScore:3.3, maturityLabel:"Advanced", coverageRate:90, replacementRate:70, sustainability:3.0, systemType:"Pay-As-You-Go (DB)", yearEstablished:1889, digitalLevel:"Partially Digital", keyFeatures:["Bismarck's legacy — world's first pension","57M insured persons","eAntrag online applications","EU cross-border interoperability"], challenges:["Rapidly aging population","East-West pension disparities","Slow digitization of legacy systems"], insights:["Rentenauskunft online pension statement","Interoperability with EU Social Security Coordination","Riester-Rente private supplement reform 2024"] },
  GBR: { iso3:"GBR", name:"United Kingdom", flag:"🇬🇧", region:"Europe", institution:"DWP / Nest", maturityScore:3.4, maturityLabel:"Advanced", coverageRate:92, replacementRate:68, sustainability:3.2, systemType:"State Pension + Auto-Enrolment DC", yearEstablished:1908, digitalLevel:"Partially Digital", keyFeatures:["Flat-rate New State Pension","Nest auto-enrolment workplace DC","Universal Credit integration","Pension Wise guidance service"], challenges:["Gender pension gap","Adequacy concerns for self-employed","Legacy admin systems"], insights:["Open Finance pension dashboard","Pension Tracing Service digitized","Lifetime provider model consultation underway"] },
  FRA: { iso3:"FRA", name:"France", flag:"🇫🇷", region:"Europe", institution:"CNAV / AGIRC-ARRCO", maturityScore:3.1, maturityLabel:"Advanced", coverageRate:95, replacementRate:74, sustainability:2.8, systemType:"Pay-As-You-Go (Multi-Fund)", yearEstablished:1910, digitalLevel:"Partially Digital", keyFeatures:["Multiple occupational funds","Info-retraite.fr aggregation portal","2023 reform: retirement age to 64","Comprehensive disability coverage"], challenges:["Political pension reform instability","Complex multi-fund architecture","Fiscal sustainability"], insights:["Mon compte retraite — single digital account","AI claims pre-processing","Mobile pension projections"] },
  ITA: { iso3:"ITA", name:"Italy", flag:"🇮🇹", region:"Europe", institution:"INPS", maturityScore:3.0, maturityLabel:"Advanced", coverageRate:88, replacementRate:72, sustainability:2.7, systemType:"NDC (Notional DC)", yearEstablished:1919, digitalLevel:"Partially Digital", keyFeatures:["NDC system since 1995","INPS online portal (largest in EU)","Quota 100/102/103 reform experiments","Disability and survivor benefits"], challenges:["Aging demographics — EU's oldest","High pension-to-GDP ratio","Early retirement political pressure"], insights:["SPID digital identity for all INPS services","Machine learning for fraud detection","Busta Arancione online pension statement"] },
  ESP: { iso3:"ESP", name:"Spain", flag:"🇪🇸", region:"Europe", institution:"Seguridad Social", maturityScore:2.9, maturityLabel:"Advanced", coverageRate:88, replacementRate:72, sustainability:2.6, systemType:"Pay-As-You-Go (DB)", yearEstablished:1908, digitalLevel:"Partially Digital", keyFeatures:["High replacement rate","Digital Tu Seguridad Social app","Intergenerational Equity Fund","2023 reform: contribution base expansion"], challenges:["Demographic decline","Unemployment volatility impact","Pension sustainability deficit"], insights:["Tu Seguridad Social digital app","Pension simulation tool online","Toledo Pact for cross-party reform"] },
  POL: { iso3:"POL", name:"Poland", flag:"🇵🇱", region:"Europe", institution:"ZUS / OFE", maturityScore:2.8, maturityLabel:"Advanced", coverageRate:85, replacementRate:60, sustainability:2.7, systemType:"NDC + DC (OFE)", yearEstablished:1919, digitalLevel:"Partially Digital", keyFeatures:["Multi-pillar post-1999 reform","ZUS e-ZUS portal","PPK workplace savings (2019)","Citizens' pension reform track record"], challenges:["OFE (private fund) political reversals","Low replacement rates","Brain drain reducing contributions"], insights:["ZUS digital statement","PPK (Employee Capital Plans) 2.5M workers enrolled","API for employer contributions"] },
  AUT: { iso3:"AUT", name:"Austria", flag:"🇦🇹", region:"Europe", institution:"PVA / SVS", maturityScore:3.2, maturityLabel:"Advanced", coverageRate:92, replacementRate:80, sustainability:3.0, systemType:"Pay-As-You-Go (DB)", yearEstablished:1887, digitalLevel:"Partially Digital", keyFeatures:["High replacement rate","Account-based individual tracking","Pension accounts since 2005","Compulsory occupational pensions"], challenges:["Aging population — fiscal pressure","High contribution rates","Self-employed gaps"], insights:["FinanzOnline integration","Digital pension account view","Actuarial modernization 2023"] },
  BEL: { iso3:"BEL", name:"Belgium", flag:"🇧🇪", region:"Europe", institution:"ONP / PDOS", maturityScore:3.2, maturityLabel:"Advanced", coverageRate:92, replacementRate:70, sustainability:3.0, systemType:"Pay-As-You-Go (Multi-sector)", yearEstablished:1900, digitalLevel:"Partially Digital", keyFeatures:["Sector-based pension system","MyPension.be digital portal","Flexi-job pension credits","Pension reform 2025 underway"], challenges:["Complexity of multiple regimes","Low first-pillar adequacy","Long-term sustainability"], insights:["MyPension.be: 4.5M active users","Pension simulation in 3 clicks","Automated cross-sector consolidation"] },
  IRL: { iso3:"IRL", name:"Ireland", flag:"🇮🇪", region:"Europe", institution:"DSP / PRSA", maturityScore:3.2, maturityLabel:"Advanced", coverageRate:82, replacementRate:65, sustainability:3.1, systemType:"State Pension + DC (PRSA)", yearEstablished:1908, digitalLevel:"Partially Digital", keyFeatures:["Auto-enrolment launching 2024","MyWelfare.ie portal","Flat-rate State Pension","PRSA personal retirement accounts"], challenges:["Low occupational pension coverage","Auto-enrolment delayed repeatedly","Gender pension gap"], insights:["Automatic enrolment scheme 2024 — 750K workers","MyGovID for pension services","PRSA online account aggregation"] },
  ISR: { iso3:"ISR", name:"Israel", flag:"🇮🇱", region:"Middle East", institution:"NII / Pension Clearing House", maturityScore:3.0, maturityLabel:"Advanced", coverageRate:88, replacementRate:65, sustainability:3.1, systemType:"Mandatory DC + DB for old workers", yearEstablished:1953, digitalLevel:"Partially Digital", keyFeatures:["Mandatory comprehensive pension since 2008","Pension Clearing House (aggregator)","High coverage post-reform","Multiple fund choice"], challenges:["Old DB schemes unfunded liability","Self-employed compliance gaps","Palestinian worker coverage gaps"], insights:["Pension Clearing House — digital fund aggregation","Annual pension report (letter)","Online employer reporting portal"] },
  EST: { iso3:"EST", name:"Estonia", flag:"🇪🇪", region:"Europe", institution:"Social Insurance Board", maturityScore:2.9, maturityLabel:"Advanced", coverageRate:94, replacementRate:60, sustainability:3.0, systemType:"NDC + Mandatory DC + Voluntary", yearEstablished:1991, digitalLevel:"Digital-First", keyFeatures:["e-Estonia: world's most digital government","Online pension account management","X-Road data exchange","Third-pillar tax incentives"], challenges:["Low replacement rate concerns","Small population base","Aging demographics"], insights:["X-Road: blockchain-secured data sharing","Pension management fully online","AI-driven occupational pension advice"] },
  CZE: { iso3:"CZE", name:"Czech Republic", flag:"🇨🇿", region:"Europe", institution:"ČSSZ / DPS", maturityScore:2.7, maturityLabel:"Developing", coverageRate:90, replacementRate:58, sustainability:2.8, systemType:"PAYG + Voluntary DC", yearEstablished:1906, digitalLevel:"Transitioning", keyFeatures:["ePortal social insurance","Third pillar voluntary savings","EU cross-border portability","Family care pension credits"], challenges:["Low replacement rate","Pension indexation disputes","Sustainability reform backlog"], insights:["ČSSZ ePortal redesign 2023","Online employer reporting","Pension saving app integration"] },
  HRV: { iso3:"HRV", name:"Croatia", flag:"🇭🇷", region:"Europe", institution:"HZMO / REGOS", maturityScore:2.7, maturityLabel:"Developing", coverageRate:85, replacementRate:55, sustainability:2.5, systemType:"NDC + Mandatory DC", yearEstablished:1998, digitalLevel:"Transitioning", keyFeatures:["Post-1999 multi-pillar reform","REGOS capital fund management","EU integration since 2013","e-Građani (eCitizen) portal"], challenges:["Brain drain reducing contributions","Low private pension adequacy","Administrative fragmentation"], insights:["eGrađani: 1.5M digital pension users","REGOS online portfolio view","Pension transfer digital streamlining"] },
  ROU: { iso3:"ROU", name:"Romania", flag:"🇷🇴", region:"Europe", institution:"CNPP / ASF", maturityScore:2.0, maturityLabel:"Developing", coverageRate:78, replacementRate:50, sustainability:1.9, systemType:"PAYG + Pillar II DC", yearEstablished:1912, digitalLevel:"Manual", keyFeatures:["Mandatory Pillar II (partially reversed)","High political pension reform volatility","EU minimum pension guarantee","e-Romania portal"], challenges:["Political instability in pension law","Brain drain depleting contributions","High informal employment"], insights:["e-Pensie online account","Digital employer reporting","ANAF-CNPP data integration"] },
  RUS: { iso3:"RUS", name:"Russia", flag:"🇷🇺", region:"Europe", institution:"Social Fund of Russia (SFR)", maturityScore:2.1, maturityLabel:"Developing", coverageRate:82, replacementRate:40, sustainability:2.0, systemType:"NDC + Frozen DC", yearEstablished:1990, digitalLevel:"Transitioning", keyFeatures:["Gosuslugi (digital gov) integration","Pension fund merged with SSF 2023","Pension reform 2018: age raised","Maternal capital linked to pension"], challenges:["Sanctions impact on fund assets","Low replacement rate","Frozen DC accumulations"], insights:["Gosuslugi: 80M registered users for pension services","Online pension statement","Maternity capital digital claims"] },
  UKR: { iso3:"UKR", name:"Ukraine", flag:"🇺🇦", region:"Europe", institution:"Pension Fund of Ukraine", maturityScore:1.8, maturityLabel:"Emerging", coverageRate:70, replacementRate:38, sustainability:1.7, systemType:"PAYG (DB)", yearEstablished:1991, digitalLevel:"Transitioning", keyFeatures:["Diia digital app — pension integration","Wartime emergency payments","EU accession reform alignment","IDP pension portability"], challenges:["War-time displacement","Fund deficit structural issue","Very low replacement rate"], insights:["Diia app: pension certificates mobile","IDP pension access digital expansion","EU integration reform 2024"] },
  // ─── Asia Pacific ─────────────────────────────────────────────
  SGP: { iso3:"SGP", name:"Singapore", flag:"🇸🇬", region:"Asia Pacific", institution:"CPF Board", maturityScore:4.0, maturityLabel:"Leader", coverageRate:100, replacementRate:92, sustainability:4.0, systemType:"Fully-Funded DC (CPF)", yearEstablished:1955, digitalLevel:"Digital-First", keyFeatures:["Global gold standard — #1 globally","Covers retirement + health + housing","CPF mobile app with full self-service","AI retirement projections","Integrated with national ID (SingPass)"], challenges:["Rising healthcare cost draw on Medisave","Adequacy for lower-wage workers","Increasing self-employed inclusion"], insights:["SingPass integration: 4M users","AI-powered retirement planning chatbot","CPF LIFE — longevity insurance annuity","Fully digital onboarding — zero paper"] },
  AUS: { iso3:"AUS", name:"Australia", flag:"🇦🇺", region:"Asia Pacific", institution:"ATO Superannuation / APRA", maturityScore:3.7, maturityLabel:"Leader", coverageRate:96, replacementRate:75, sustainability:3.8, systemType:"Mandatory DC (Superannuation)", yearEstablished:1992, digitalLevel:"Digital-First", keyFeatures:["SuperStream electronic standard","MyGov integration","11% mandatory employer contribution","Lost super recovery service"], challenges:["Gender gap in super balances","Early withdrawal COVID legacy","Advice affordability gap"], insights:["ATO Super Hotline digital bot","SuperStream: $700B+ annually processed electronically","YourSuper comparison tool","Super stapling — one fund for life"] },
  NZL: { iso3:"NZL", name:"New Zealand", flag:"🇳🇿", region:"Asia Pacific", institution:"MSD / KiwiSaver", maturityScore:3.6, maturityLabel:"Leader", coverageRate:92, replacementRate:70, sustainability:3.7, systemType:"Voluntary DC (KiwiSaver) + NZS", yearEstablished:2007, digitalLevel:"Digital-First", keyFeatures:["KiwiSaver: automatic opt-in","NZ Superannuation (flat-rate universal)","Digital myKiwiSaver portal","Government employer contribution match"], challenges:["NZS affordability long-term","Low KiwiSaver default rates","Gender retirement savings gap"], insights:["Smart investor comparison tool","KiwiSaver auto-escalation pilot","Māori pension access digital expansion"] },
  JPN: { iso3:"JPN", name:"Japan", flag:"🇯🇵", region:"Asia Pacific", institution:"Japan Pension Service / GPIF", maturityScore:3.0, maturityLabel:"Advanced", coverageRate:90, replacementRate:62, sustainability:2.5, systemType:"NDC (NP + EPI)", yearEstablished:1942, digitalLevel:"Partially Digital", keyFeatures:["World's 2nd largest pension fund (GPIF)","My Number integration","Pension simulation tools","iDeCo personal pension scheme"], challenges:["Severe aging — 29% over 65","30% contribution evasion self-employed","Pension adequacy reform urgency"], insights:["My Number Card pension integration","iDeCo digital account management","GPIF ESG investment mandate 2023"] },
  KOR: { iso3:"KOR", name:"South Korea", flag:"🇰🇷", region:"Asia Pacific", institution:"National Pension Service (NPS)", maturityScore:3.3, maturityLabel:"Advanced", coverageRate:92, replacementRate:63, sustainability:2.8, systemType:"Defined Benefit (NDC-like)", yearEstablished:1988, digitalLevel:"Partially Digital", keyFeatures:["World's 3rd largest pension fund ($800B)","NPS mobile app","AI customer service chatbot","Biometric authentication"], challenges:["Projected fund depletion by 2055","Low birth rate impact","Adequacy reform needed"], insights:["NPS reform 2024: contribution increase","Biometric app login","AI pension advisor launched 2023"] },
  MYS: { iso3:"MYS", name:"Malaysia", flag:"🇲🇾", region:"Asia Pacific", institution:"EPF (KWSP)", maturityScore:3.2, maturityLabel:"Advanced", coverageRate:80, replacementRate:70, sustainability:3.3, systemType:"Fully-Funded DC (EPF)", yearEstablished:1951, digitalLevel:"Digital-First", keyFeatures:["EPF i-Akaun digital platform","Shariah-compliant investment option","Multi-fund choice for members","COVID hardship withdrawal legacy"], challenges:["COVID-era withdrawals depleted savings","Informal sector coverage gaps","Adequacy for low-wage workers"], insights:["i-Akaun: 14M digital users","EPF Simpanan Shariah — halal portfolio","Digital contribution automation for gig workers"] },
  THA: { iso3:"THA", name:"Thailand", flag:"🇹🇭", region:"Asia Pacific", institution:"Social Security Office (SSO)", maturityScore:2.1, maturityLabel:"Developing", coverageRate:58, replacementRate:45, sustainability:2.2, systemType:"DB + Voluntary DC (PVD)", yearEstablished:1990, digitalLevel:"Transitioning", keyFeatures:["National Social Security Scheme","eSSO portal","PVD voluntary provident fund","Government pension fund (GPF) for civil servants"], challenges:["Low informal sector coverage","Low contribution rates","Aging society pressure"], insights:["e-SSO app launched 2022","Digital claims for sickness benefit","National Savings Fund expansion"] },
  IDN: { iso3:"IDN", name:"Indonesia", flag:"🇮🇩", region:"Asia Pacific", institution:"BPJS Ketenagakerjaan", maturityScore:2.2, maturityLabel:"Developing", coverageRate:52, replacementRate:40, sustainability:2.3, systemType:"DB + DC (JHT + JP)", yearEstablished:2014, digitalLevel:"Transitioning", keyFeatures:["JKK, JKM, JHT, JP programmes","BPJSTK mobile app","Digital claims 1-hour SLA (2022)","National Health Insurance (JKN) linked"], challenges:["Large informal sector exclusion","Low contribution compliance","Rural digital access"], insights:["BPJSTK mobile: 15M+ downloads","Digital claim in under 1 hour","Big data to detect non-compliance"] },
  PHL: { iso3:"PHL", name:"Philippines", flag:"🇵🇭", region:"Asia Pacific", institution:"SSS / GSIS", maturityScore:2.0, maturityLabel:"Developing", coverageRate:45, replacementRate:40, sustainability:2.0, systemType:"DB (SSS + GSIS)", yearEstablished:1954, digitalLevel:"Transitioning", keyFeatures:["SSS for private, GSIS for government","My.SSS portal","Flexi-fund voluntary savings","OFW overseas worker coverage"], challenges:["OFW portability complexity","Low formal sector coverage","IT legacy infrastructure"], insights:["My.SSS digital — real-time transactions","SSS chatbot launches","Unified ID for faster benefit release"] },
  IND: { iso3:"IND", name:"India", flag:"🇮🇳", region:"Asia Pacific", institution:"EPFO / NPS Trust", maturityScore:2.0, maturityLabel:"Developing", coverageRate:30, replacementRate:40, sustainability:2.1, systemType:"DB (EPF) + DC (NPS)", yearEstablished:1952, digitalLevel:"Transitioning", keyFeatures:["EPFO: 250M+ subscribers (world's largest)","NPS for government + voluntary","Aadhaar-linked digital onboarding","UMANG mobile app"], challenges:["Only 30% of workforce covered","Fragmented ESIC / EPFO split","Rural and gig worker exclusion"], insights:["EPFO digital claim settlement 72hrs","Aadhaar-based employer compliance","NPS 3-click account opening via DigiLocker"] },
  CHN: { iso3:"CHN", name:"China", flag:"🇨🇳", region:"Asia Pacific", institution:"National Social Insurance Fund (NSIF)", maturityScore:2.4, maturityLabel:"Developing", coverageRate:72, replacementRate:55, sustainability:2.5, systemType:"DB + DC (Three Pillars)", yearEstablished:1951, digitalLevel:"Partially Digital", keyFeatures:["World's largest pension population","Social Credit integration","Alipay pension contribution module","Provincial fund consolidation underway"], challenges:["Urban-rural pension disparity","Aging faster than any major economy","Provincial fund solvency variance"], insights:["National Pension Bureau established 2023","Alipay/WeChat Pay contribution micro-payments","Personal pension scheme (Pillar 3) launched 2022"] },
  // ─── Americas ─────────────────────────────────────────────────
  CAN: { iso3:"CAN", name:"Canada", flag:"🇨🇦", region:"Americas", institution:"CPPIB / Service Canada", maturityScore:3.7, maturityLabel:"Leader", coverageRate:97, replacementRate:78, sustainability:4.0, systemType:"DB (CPP) + OAS + DC (RRSP)", yearEstablished:1927, digitalLevel:"Digital-First", keyFeatures:["CPP Investment Board (world-class)","My Service Canada Account","My Retirement income estimator","OAS universal payment at 65"], challenges:["Quebec QPP divergence complexity","Low-income adequacy — GIS reliance","Long-term CPP adequacy debate"], insights:["MSCA digital — 11M users","CPP2 enhanced contributions 2024","MyBenefits mobile app for OAS/CPP"] },
  USA: { iso3:"USA", name:"United States", flag:"🇺🇸", region:"Americas", institution:"Social Security Administration (SSA)", maturityScore:3.3, maturityLabel:"Advanced", coverageRate:94, replacementRate:57, sustainability:2.9, systemType:"DB (OASDI) + DC (401k/IRA)", yearEstablished:1935, digitalLevel:"Partially Digital", keyFeatures:["SSA.gov with 175M accounts","my Social Security online portal","SECURE 2.0 Act (2022) reforms","Medicare integration"], challenges:["Trust Fund depletion projected 2035","Low replacement rate for high-earners","401k coverage gaps in small businesses"], insights:["My Social Security: e-Statement","SECURE 2.0: auto-enrollment mandate","Retirement Savings Lost & Found database 2024"] },
  BRA: { iso3:"BRA", name:"Brazil", flag:"🇧🇷", region:"Americas", institution:"INSS / Previc", maturityScore:2.4, maturityLabel:"Developing", coverageRate:68, replacementRate:60, sustainability:2.3, systemType:"DB (PAYG) + DC (EFPC)", yearEstablished:1923, digitalLevel:"Transitioning", keyFeatures:["Meu INSS digital app","2019 landmark pension reform","Means-tested BPC benefit","Private Closed Pension Funds (EFPC)"], challenges:["Informal sector 40% not covered","High fiscal pension spending (~13% GDP)","Reform implementation backlash"], insights:["Meu INSS: 75M app users","Digital anti-fraud biometric validation","INSS Conectividade: employer API"] },
  MEX: { iso3:"MEX", name:"Mexico", flag:"🇲🇽", region:"Americas", institution:"IMSS / AFORE / Consar", maturityScore:2.3, maturityLabel:"Developing", coverageRate:55, replacementRate:45, sustainability:2.4, systemType:"Mandatory DC (Afore) + DB legacy", yearEstablished:1943, digitalLevel:"Transitioning", keyFeatures:["Afore individual capitalization accounts","2021 reform: employer contribution to 15%","IMSS digital services","Social pension for elderly 65+"], challenges:["Low coverage of informal workers (~60%)","Low contribution rates historically","Afore low financial literacy"], insights:["Mi Afore app — real-time account view","AforeMovil digital onboarding","Pensión para Adultos Mayores: universal 65+"] },
  CHL: { iso3:"CHL", name:"Chile", flag:"🇨🇱", region:"Americas", institution:"AFP / IPS", maturityScore:2.3, maturityLabel:"Developing", coverageRate:72, replacementRate:45, sustainability:2.5, systemType:"Mandatory DC (AFP)", yearEstablished:1981, digitalLevel:"Transitioning", keyFeatures:["World's first mandatory DC system (1981)","AFP online account management","Solidarity Pillar (APS) for low earners","2024 pension reform underway"], challenges:["Low replacement rates — political crisis","Gender pension gap (homemakers)","COVID-era withdrawals reduced balances"], insights:["AFP online fund switching","Supervisor Superintendencia digital portal","Guaranteed universal pension (PGU) 2022"] },
  ARG: { iso3:"ARG", name:"Argentina", flag:"🇦🇷", region:"Americas", institution:"ANSES / SIPA", maturityScore:1.9, maturityLabel:"Emerging", coverageRate:68, replacementRate:50, sustainability:1.6, systemType:"PAYG (DB) — nationalized 2008", yearEstablished:1944, digitalLevel:"Transitioning", keyFeatures:["Universal Basic Income for elderly","MI ANSES digital portal","Pension indexation by inflation","Worker's history from multiple regimes"], challenges:["Hyperinflationary erosion of pensions","Renationalization of private funds","Fiscal deficit & IMF conditions"], insights:["Mi ANSES app: 10M users","Digital jubilacion tracking","Mobile notification for pension updates"] },
  COL: { iso3:"COL", name:"Colombia", flag:"🇨🇴", region:"Americas", institution:"Colpensiones / AFP", maturityScore:2.0, maturityLabel:"Developing", coverageRate:42, replacementRate:50, sustainability:2.0, systemType:"PAYG + DC (dual system)", yearEstablished:1946, digitalLevel:"Transitioning", keyFeatures:["Dual choice: Colpensiones or AFP","Colombia Mayor social pension","e-Colpensiones portal","2023 pension reform bill"], challenges:["Very low informal sector coverage","Competitive system duplication costs","Low financial literacy for AFP"], insights:["Colpensiones digital platform relaunch","Mi Pensión simulation tool","Social pension targeting data analytics"] },
  URY: { iso3:"URY", name:"Uruguay", flag:"🇺🇾", region:"Americas", institution:"BPS / Afap", maturityScore:2.6, maturityLabel:"Developing", coverageRate:84, replacementRate:68, sustainability:2.9, systemType:"Mixed (PAYG + DC)", yearEstablished:1943, digitalLevel:"Partially Digital", keyFeatures:["South America's most complete pension","BPS digital services","High coverage (formal sector)","Flexible retirement age"], challenges:["Aging population impact","2022 reform: age 65 referendum","Informal sector gaps"], insights:["BPS app: contribution tracking","Simulation tool for retirement date","Digital employer integration"] },
  // ─── Africa ──────────────────────────────────────────────────
  ZAF: { iso3:"ZAF", name:"South Africa", flag:"🇿🇦", region:"Africa", institution:"GEPF / SASSA", maturityScore:2.3, maturityLabel:"Developing", coverageRate:40, replacementRate:55, sustainability:2.4, systemType:"DB (GEPF) + Social Grants", yearEstablished:1979, digitalLevel:"Transitioning", keyFeatures:["GEPF: world's 18th largest pension fund","Social Relief of Distress grant","SASSA gold card digital payment","Two-pot system reform 2024"], challenges:["<40% formal sector coverage","Very high unemployment (32%)","Urban-rural access gaps"], insights:["Two-Pot retirement reform 2024","SASSA Postbank digital modernisation","GEPF online portal launched"] },
  NGA: { iso3:"NGA", name:"Nigeria", flag:"🇳🇬", region:"Africa", institution:"PENCOM / PFAs", maturityScore:1.5, maturityLabel:"Emerging", coverageRate:18, replacementRate:35, sustainability:1.6, systemType:"Mandatory DC (CPS)", yearEstablished:2004, digitalLevel:"Manual", keyFeatures:["Contributory Pension Scheme (2004)","PENCOM e-registration","RSA transfers digital","Multi-Fund structure"], challenges:["Only 18% coverage — mostly formal sector","Low rural awareness","Multiple PFAs — fragmented access"], insights:["PENCOM e-registration roll-out","RSA transfer digital (2022)","Micro-pension for informal workers pilot"] },
  GHA: { iso3:"GHA", name:"Ghana", flag:"🇬🇭", region:"Africa", institution:"SSNIT / NPRA", maturityScore:1.9, maturityLabel:"Emerging", coverageRate:25, replacementRate:40, sustainability:1.8, systemType:"DB + Mandatory DC + Voluntary", yearEstablished:1965, digitalLevel:"Manual", keyFeatures:["Three-tier pension system","Tier 1 SSNIT mandatory DB","Tier 2 mandatory DC","Informal sector Tier 3 growing"], challenges:["Low informal sector coverage","SSNIT deficit concerns","Digital infrastructure gaps"], insights:["GhanaCard integration with SSNIT","Mobile money pension contributions","NPRA regulatory sandbox 2023"] },
  KEN: { iso3:"KEN", name:"Kenya", flag:"🇰🇪", region:"Africa", institution:"NSSF / RBA", maturityScore:1.8, maturityLabel:"Emerging", coverageRate:22, replacementRate:35, sustainability:1.7, systemType:"DB + Voluntary Occupational", yearEstablished:1965, digitalLevel:"Manual", keyFeatures:["NSSF mandatory contributions","RBA regulatory oversight","M-Pesa pension contribution integration","Mbao Pension Plan for informal sector"], challenges:["Very low formal sector %","NSSF Act 2013 court challenges","Outdated IT systems"], insights:["Mbao Pension: M-Pesa micro-contributions","NSSF digital claim submission","Hustler Fund: mobile-first social savings"] },
  MAR: { iso3:"MAR", name:"Morocco", flag:"🇲🇦", region:"Africa", institution:"CMR / CIMR / CNSS", maturityScore:2.0, maturityLabel:"Developing", coverageRate:42, replacementRate:48, sustainability:2.0, systemType:"DB (Multiple Schemes)", yearEstablished:1959, digitalLevel:"Transitioning", keyFeatures:["CMR for civil servants","CNSS for private sector","CIMR complementary","2024 National Social Protection Reform"], challenges:["Multiple fragmented schemes","Low private sector coverage","Reform implementation pace"], insights:["DAMANCOM digital for CNSS","National Social Protection Strategy 2021–2025","Digital employer declaration portal"] },
  TUN: { iso3:"TUN", name:"Tunisia", flag:"🇹🇳", region:"Africa", institution:"CNSS / CNRPS", maturityScore:1.9, maturityLabel:"Emerging", coverageRate:45, replacementRate:48, sustainability:1.8, systemType:"DB (PAYG)", yearEstablished:1960, digitalLevel:"Manual", keyFeatures:["CNSS private sector","CNRPS civil servants","Digital portal CNSS.tn","Agricultural workers scheme"], challenges:["Fiscal deficit impact on pensions","Informal economy majority","Political instability reform risk"], insights:["CNSS digital portal","Mobile claim tracking","Employer e-Declaration system"] },
  ETH: { iso3:"ETH", name:"Ethiopia", flag:"🇪🇹", region:"Africa", institution:"PSNP / OSSA", maturityScore:1.2, maturityLabel:"Emerging", coverageRate:8, replacementRate:30, sustainability:1.2, systemType:"DB (Civil Servants only)", yearEstablished:2011, digitalLevel:"Manual", keyFeatures:["PSNP social protection for rural poor","Civil servant pension scheme","OSSA: private sector embryonic","Foreign aid social safety nets"], challenges:["Only 8% formal coverage","No mandatory private sector pension","Digital infrastructure absent outside cities"], insights:["PSNP: world's largest social protection in Africa","Mobile money integration pilot","ILO/World Bank pension expansion support"] },
};

/* ═══════════════════════════════════════════════════════════════
   METRIC CONFIGS
═══════════════════════════════════════════════════════════════ */

type MetricKey = "maturityScore" | "coverageRate" | "replacementRate" | "sustainability";

interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  ranges: { value: number; color: string; label: string }[];
}

const METRICS: Record<MetricKey, MetricConfig> = {
  maturityScore: {
    key: "maturityScore", label: "Digital Maturity", unit: "1–4",
    ranges: [
      { value: 3.5, color: "#00C896", label: "3.5–4.0 — Leader" },
      { value: 2.5, color: "#4A9EFF", label: "2.5–3.4 — Advanced" },
      { value: 1.5, color: "#C5A572", label: "1.5–2.4 — Developing" },
      { value: 0,   color: "#EF4444", label: "1.0–1.4 — Emerging" },
    ],
  },
  coverageRate: {
    key: "coverageRate", label: "Coverage Rate", unit: "%",
    ranges: [
      { value: 85, color: "#00C896", label: "≥85% — Universal" },
      { value: 60, color: "#4A9EFF", label: "60–84% — Broad" },
      { value: 35, color: "#C5A572", label: "35–59% — Developing" },
      { value: 0,  color: "#EF4444", label: "<35% — Limited" },
    ],
  },
  replacementRate: {
    key: "replacementRate", label: "Replacement Rate", unit: "%",
    ranges: [
      { value: 75, color: "#00C896", label: "≥75% — Excellent" },
      { value: 55, color: "#4A9EFF", label: "55–74% — Adequate" },
      { value: 40, color: "#C5A572", label: "40–54% — Below Target" },
      { value: 0,  color: "#EF4444", label: "<40% — Inadequate" },
    ],
  },
  sustainability: {
    key: "sustainability", label: "Sustainability Score", unit: "1–4",
    ranges: [
      { value: 3.5, color: "#00C896", label: "3.5–4.0 — Robust" },
      { value: 2.5, color: "#4A9EFF", label: "2.5–3.4 — Stable" },
      { value: 1.5, color: "#C5A572", label: "1.5–2.4 — At Risk" },
      { value: 0,   color: "#EF4444", label: "1.0–1.4 — Critical" },
    ],
  },
};

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

function getIso3(geo: { properties: { name: string; ISO_A2?: string } }): string | undefined {
  const a2 = geo.properties.ISO_A2;
  const name = geo.properties.name;
  return (a2 ? ISO_A2_TO_A3[a2] : undefined) ?? NAME_TO_ISO[name];
}

function getMetricColor(profile: CountryProfile, metricKey: MetricKey): string {
  const val = profile[metricKey] as number;
  const ranges = METRICS[metricKey].ranges;
  for (const r of ranges) {
    if (val >= r.value) return r.color;
  }
  return ranges[ranges.length - 1].color;
}

function maturityBadgeColor(label: string): string {
  if (label === "Leader")    return "#00C896";
  if (label === "Advanced")  return "#4A9EFF";
  if (label === "Developing")return "#C5A572";
  return "#EF4444";
}

function formatMetricValue(profile: CountryProfile, key: MetricKey): string {
  const v = profile[key] as number;
  if (key === "maturityScore" || key === "sustainability") return v.toFixed(1);
  return `${v}%`;
}

/* ═══════════════════════════════════════════════════════════════
   CHOROPLETH MAP
═══════════════════════════════════════════════════════════════ */

interface MapProps {
  metric: MetricKey;
  selectedIso: string | null;
  onSelect: (iso: string) => void;
  onHover: (iso: string | null) => void;
  hoveredIso: string | null;
  countryData: Record<string, CountryProfile>;
}

const GPSSAWorldMap = memo(function GPSSAWorldMap({
  metric, selectedIso, onSelect, onHover, hoveredIso, countryData,
}: MapProps) {
  const [tooltip, setTooltip] = useState<{ name: string; iso: string; profile?: CountryProfile; x: number; y: number } | null>(null);

  const handleMouseMove = useCallback((
    geo: { properties: { name: string; ISO_A2?: string } },
    e: React.MouseEvent
  ) => {
    const iso = getIso3(geo);
    const profile = iso ? countryData[iso] : undefined;
    setTooltip({ name: geo.properties.name, iso: iso ?? "—", profile, x: e.clientX, y: e.clientY });
    onHover(iso ?? null);
  }, [onHover, countryData]);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    onHover(null);
  }, [onHover]);

  return (
    <div className="relative w-full h-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [10, 25] }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const iso = getIso3(geo);
                const profile = iso ? countryData[iso] : undefined;
                const isSelected = iso === selectedIso;
                const isHovered  = iso === hoveredIso;
                const fill = profile
                  ? getMetricColor(profile, metric)
                  : "#1a2535";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isSelected ? "#ffffff" : fill}
                    stroke={isSelected ? "#ffffff" : "#0d1b2a"}
                    strokeWidth={isSelected ? 1.2 : 0.4}
                    style={{
                      default: { outline: "none", opacity: isSelected ? 1 : isHovered ? 0.85 : 0.9 },
                      hover:   { outline: "none", fill: profile ? fill : "#243040", opacity: 1, cursor: profile ? "pointer" : "default" },
                      pressed: { outline: "none" },
                    }}
                    onClick={() => iso && profile && onSelect(iso)}
                    onMouseMove={(e) => handleMouseMove(geo, e as unknown as React.MouseEvent)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          <div
            className="rounded-xl border px-3.5 py-2.5 shadow-2xl backdrop-blur-md"
            style={{ background: "rgba(10,22,40,0.96)", borderColor: "rgba(255,255,255,0.1)", minWidth: 190 }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {tooltip.profile && (
                <span className="text-lg leading-none">{tooltip.profile.flag}</span>
              )}
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{tooltip.name}</p>
                <p className="text-[10px] text-gray-muted/70">{tooltip.profile?.region ?? "No data tracked"}</p>
              </div>
            </div>
            {tooltip.profile ? (
              <>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-muted">{METRICS[metric].label}</span>
                  <span className="font-mono font-semibold" style={{ color: maturityBadgeColor(tooltip.profile.maturityLabel) }}>
                    {formatMetricValue(tooltip.profile, metric)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: maturityBadgeColor(tooltip.profile.maturityLabel) }}
                  />
                  <span className="text-[10px] font-medium" style={{ color: maturityBadgeColor(tooltip.profile.maturityLabel) }}>
                    {tooltip.profile.maturityLabel}
                  </span>
                  <span className="text-[10px] text-gray-muted ml-auto">Click to explore →</span>
                </div>
              </>
            ) : (
              <p className="text-[10px] text-gray-muted mt-1">No pension data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   COUNTRY DETAIL PANEL
═══════════════════════════════════════════════════════════════ */

// GPSSA reference for comparison
const GPSSA_REF: CountryProfile = COUNTRIES["ARE"];

function CompareBar({ label, gpssaVal, otherVal, maxVal, unit }: {
  label: string; gpssaVal: number; otherVal: number; maxVal: number; unit: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-gray-muted">{label}</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-gpssa-green">GPSSA: {unit === "%" ? `${gpssaVal}%` : gpssaVal.toFixed(1)}</span>
          <span className="font-mono text-[var(--cream)]">This: {unit === "%" ? `${otherVal}%` : otherVal.toFixed(1)}</span>
        </div>
      </div>
      <div className="relative h-1.5 rounded-full bg-white/5">
        {/* GPSSA bar */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gpssa-green/60"
          style={{ width: `${Math.min((gpssaVal / maxVal) * 100, 100)}%` }}
        />
        {/* Country bar */}
        <div
          className="absolute inset-y-0 left-0 rounded-full border border-white/20"
          style={{ width: `${Math.min((otherVal / maxVal) * 100, 100)}%`, background: "rgba(255,255,255,0.15)" }}
        />
      </div>
    </div>
  );
}

type DetailTab = "intelligence" | "features" | "compare";

function CountryDetailPanel({ profile, onClose }: { profile: CountryProfile; onClose: () => void }) {
  const [tab, setTab] = useState<DetailTab>("intelligence");
  const accentColor = maturityBadgeColor(profile.maturityLabel);
  const isGPSSA = profile.iso3 === "ARE";

  return (
    <motion.div
      key={profile.iso3}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="flex h-full flex-col overflow-hidden"
    >
      {/* Header — compact */}
      <div className="flex items-start justify-between p-3 pb-2 border-b border-[var(--border)] shrink-0">
        <div className="flex items-start gap-2.5">
          <span className="text-3xl leading-none mt-0.5">{profile.flag}</span>
          <div>
            <h3 className="font-playfair text-sm font-semibold text-cream leading-tight">{profile.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] text-gray-muted">{profile.region}</span>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
              <span className="text-[10px] font-semibold" style={{ color: accentColor }}>{profile.maturityLabel}</span>
              {isGPSSA && (
                <span className="rounded-full bg-gpssa-green/15 px-1.5 py-0.5 text-[9px] font-bold text-gpssa-green">GPSSA</span>
              )}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 text-gray-muted transition-colors hover:bg-white/5 hover:text-cream">
          <X size={14} />
        </button>
      </div>

      {/* Institution line */}
      <div className="px-3 py-2 shrink-0 border-b border-[var(--border)]">
        <p className="text-xs font-medium text-cream truncate">{profile.institution}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-gray-muted">Est. {profile.yearEstablished} · {profile.systemType}</span>
          <span className="text-[10px] text-gray-muted">·</span>
          <Zap size={10} style={{ color: accentColor }} className="inline" />
          <span className="text-[10px] text-cream">{profile.digitalLevel}</span>
        </div>
      </div>

      {/* Metrics grid — compact 2x2 */}
      <div className="grid grid-cols-2 gap-1.5 p-3 shrink-0">
        {([
          { label: "Digital Maturity", value: profile.maturityScore.toFixed(1), sub: "/ 4.0" },
          { label: "Coverage", value: `${profile.coverageRate}%`, sub: "of workforce" },
          { label: "Replacement", value: `${profile.replacementRate}%`, sub: "of salary" },
          { label: "Sustainability", value: profile.sustainability.toFixed(1), sub: "/ 4.0" },
        ] as const).map(({ label, value, sub }) => (
          <div key={label} className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-[9px] text-gray-muted">{label}</p>
            <p className="font-playfair text-base font-bold" style={{ color: accentColor }}>{value}</p>
            <p className="text-[9px] text-gray-muted/60">{sub}</p>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 px-3 shrink-0">
        {([
          { id: "intelligence" as DetailTab, label: "Intelligence" },
          { id: "features" as DetailTab, label: "Features" },
          ...(!isGPSSA ? [{ id: "compare" as DetailTab, label: "Compare" }] : []),
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all ${
              tab === t.id ? "bg-white/10 text-cream" : "text-gray-muted hover:text-cream hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content — fills remaining space, overflow hidden */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 pt-2" style={{ scrollbarWidth: "thin" }}>
        {tab === "intelligence" && (
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-muted mb-1.5">Key Features</p>
              <ul className="space-y-1">
                {profile.keyFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-[11px] text-gray-muted">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ background: accentColor }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "features" && (
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-muted mb-1.5">Insights & Innovations</p>
              <ul className="space-y-1">
                {profile.insights.map((ins) => (
                  <li key={ins} className="flex items-start gap-1.5 text-[11px] text-gray-muted">
                    <ArrowRight size={10} className="mt-0.5 shrink-0" style={{ color: accentColor }} />
                    {ins}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-muted mb-1.5">Challenges</p>
              <ul className="space-y-1">
                {profile.challenges.map((c) => (
                  <li key={c} className="flex items-start gap-1.5 text-[11px] text-gray-muted">
                    <Info size={10} className="mt-0.5 shrink-0 text-amber-400/70" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "compare" && !isGPSSA && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-muted mb-2">vs. GPSSA (UAE)</p>
            <CompareBar label="Digital Maturity" gpssaVal={GPSSA_REF.maturityScore} otherVal={profile.maturityScore} maxVal={4} unit="" />
            <CompareBar label="Coverage Rate" gpssaVal={GPSSA_REF.coverageRate} otherVal={profile.coverageRate} maxVal={100} unit="%" />
            <CompareBar label="Replacement Rate" gpssaVal={GPSSA_REF.replacementRate} otherVal={profile.replacementRate} maxVal={100} unit="%" />
            <CompareBar label="Sustainability" gpssaVal={GPSSA_REF.sustainability} otherVal={profile.sustainability} maxVal={4} unit="" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */

const STATIC_PROFILES = Object.values(COUNTRIES);
const MATURITY_LABELS = ["All", "Leader", "Advanced", "Developing", "Emerging"];

function parseJsonArr(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export default function GlobalAtlasPage() {
  const [metric,       setMetric]       = useState<MetricKey>("maturityScore");
  const [search,       setSearch]       = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [matFilter,    setMatFilter]    = useState("All");
  const [selectedIso,  setSelectedIso]  = useState<string | null>(null);
  const [hoveredIso,   setHoveredIso]   = useState<string | null>(null);
  const [metricOpen,   setMetricOpen]   = useState(false);
  const [listOpen,     setListOpen]     = useState(false);
  const [statsOpen,    setStatsOpen]    = useState(false);
  const [dbProfiles,   setDbProfiles]   = useState<Record<string, CountryProfile>>({});

  useEffect(() => {
    fetch("/api/countries?status=completed")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Array<Record<string, unknown>>) => {
        const map: Record<string, CountryProfile> = {};
        for (const c of rows) {
          const iso3 = c.iso3 as string;
          map[iso3] = {
            iso3,
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
          };
        }
        setDbProfiles(map);
      })
      .catch(() => {});
  }, []);

  const mergedCountries = useMemo<Record<string, CountryProfile>>(() => {
    return { ...COUNTRIES, ...dbProfiles };
  }, [dbProfiles]);

  const ALL_PROFILES = useMemo(() => Object.values(mergedCountries), [mergedCountries]);
  const REGIONS = useMemo(() => ["All", ...Array.from(new Set(ALL_PROFILES.map((c) => c.region))).sort()], [ALL_PROFILES]);

  const selectedProfile = selectedIso ? mergedCountries[selectedIso] ?? null : null;

  const filteredList = useMemo(() => {
    return ALL_PROFILES.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.institution ?? "").toLowerCase().includes(search.toLowerCase());
      const matchRegion = regionFilter === "All" || p.region === regionFilter;
      const matchMat    = matFilter === "All"    || p.maturityLabel === matFilter;
      return matchSearch && matchRegion && matchMat;
    }).sort((a, b) => b.maturityScore - a.maturityScore);
  }, [search, regionFilter, matFilter, ALL_PROFILES]);

  const stats = useMemo(() => {
    const leaders   = ALL_PROFILES.filter((p) => p.maturityLabel === "Leader").length;
    const advanced  = ALL_PROFILES.filter((p) => p.maturityLabel === "Advanced").length;
    const avgMat    = ALL_PROFILES.length > 0 ? (ALL_PROFILES.reduce((s, p) => s + p.maturityScore, 0) / ALL_PROFILES.length).toFixed(1) : "0";
    const avgCov    = ALL_PROFILES.length > 0 ? Math.round(ALL_PROFILES.reduce((s, p) => s + p.coverageRate, 0) / ALL_PROFILES.length) : 0;
    const avgRep    = ALL_PROFILES.length > 0 ? Math.round(ALL_PROFILES.reduce((s, p) => s + p.replacementRate, 0) / ALL_PROFILES.length) : 0;
    const regions   = new Set(ALL_PROFILES.map((p) => p.region)).size;
    return { leaders, advanced, avgMat, avgCov, avgRep, regions };
  }, [ALL_PROFILES]);

  const currentMetricCfg = METRICS[metric];

  // Close list panel when a country is selected
  const handleSelectCountry = useCallback((iso: string | null) => {
    setSelectedIso(iso);
    if (iso) setListOpen(false);
  }, []);

  return (
    <div className="relative" style={{ height: "calc(100vh - 148px)", minHeight: 520 }}>

      {/* ── CINEMATIC MAP CONTAINER ── */}
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden"
        style={{ background: "rgba(8,18,38,0.95)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Ambient orbs inside map */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div style={{ position:"absolute", width:600, height:600, top:-120, right:-80, background:"radial-gradient(circle,rgba(0,168,107,0.05) 0%,transparent 65%)" }} />
          <div style={{ position:"absolute", width:400, height:400, bottom:-60, left:-60, background:"radial-gradient(circle,rgba(45,74,140,0.06) 0%,transparent 65%)" }} />
        </div>

        {/* Full-coverage map */}
        <div className="absolute inset-0 z-10">
          <GPSSAWorldMap
            metric={metric}
            selectedIso={selectedIso}
            onSelect={handleSelectCountry}
            onHover={setHoveredIso}
            hoveredIso={hoveredIso}
            countryData={mergedCountries}
          />
        </div>

        {/* ── OVERLAY: Metric selector — top left ── */}
        <div className="absolute top-4 left-4 z-30">
          <div className="relative">
            <button
              onClick={() => setMetricOpen(!metricOpen)}
              className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-cream shadow-xl transition-all hover:border-gpssa-green/30"
              style={{ background: "rgba(8,18,38,0.92)", borderColor: "rgba(255,255,255,0.14)", backdropFilter: "blur(16px)" }}
            >
              <Globe size={13} className="text-gpssa-green" />
              <span>{currentMetricCfg.label}</span>
              <ChevronDown size={12} className={`text-gray-muted transition-transform ${metricOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {metricOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full left-0 mt-1.5 w-52 rounded-xl border shadow-2xl overflow-hidden z-50"
                  style={{ background: "rgba(8,18,38,0.98)", borderColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}
                >
                  {(Object.values(METRICS) as MetricConfig[]).map((cfg) => (
                    <button
                      key={cfg.key}
                      onClick={() => { setMetric(cfg.key); setMetricOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left transition-colors ${metric === cfg.key ? "text-gpssa-green bg-gpssa-green/10" : "text-gray-muted hover:text-cream hover:bg-white/5"}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${metric === cfg.key ? "bg-gpssa-green" : "bg-white/10"}`} />
                      {cfg.label}
                      <span className="ml-auto text-[10px] text-gray-muted/50">{cfg.unit}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── OVERLAY: Title tag — top center ── */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ background: "rgba(8,18,38,0.7)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gpssa-green">GPSSA</span>
            <span className="text-[10px] text-gray-muted/60">·</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-muted/70">Global Research Atlas</span>
          </div>
        </div>

        {/* ── OVERLAY: Countries toggle — top right ── */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {selectedProfile && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => handleSelectCountry(null)}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs text-gray-muted transition-all hover:text-cream"
              style={{ background: "rgba(8,18,38,0.88)", borderColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}
            >
              <X size={12} />
              <span>Close</span>
            </motion.button>
          )}
          <button
            onClick={() => { setListOpen(!listOpen); setSelectedIso(null); }}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${listOpen ? "border-gpssa-green/40 text-gpssa-green" : "text-cream hover:border-gpssa-green/20"}`}
            style={{ background: "rgba(8,18,38,0.92)", borderColor: listOpen ? undefined : "rgba(255,255,255,0.14)", backdropFilter: "blur(16px)" }}
          >
            <Globe size={13} />
            <span>Countries</span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              style={{ background: "rgba(0,168,107,0.15)", color: "var(--gpssa-green)" }}
            >
              {ALL_PROFILES.length}
            </span>
          </button>
        </div>

        {/* ── OVERLAY: Legend — bottom left (above stats bar) ── */}
        <div
          className="absolute bottom-14 left-4 z-30 rounded-xl border p-3"
          style={{ background: "rgba(8,18,38,0.9)", borderColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(14px)" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-muted mb-2">
            {currentMetricCfg.label} <span className="opacity-50">({currentMetricCfg.unit})</span>
          </p>
          <div className="space-y-1.5">
            {currentMetricCfg.ranges.map((r) => (
              <div key={r.label} className="flex items-center gap-2">
                <div className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: r.color }} />
                <span className="text-[10px] text-gray-muted">{r.label}</span>
              </div>
            ))}
            <div className="my-1 border-t border-white/5" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 shrink-0 rounded-sm bg-[#1a2535]" />
              <span className="text-[10px] text-gray-muted/60">No data</span>
            </div>
          </div>
        </div>

        {/* ── FLOATING RIGHT PANEL: Country list ── */}
        <AnimatePresence>
          {listOpen && !selectedProfile && (
            <motion.div
              key="list-panel"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.38, ease: EASE }}
              className="absolute right-0 top-0 bottom-0 z-40 flex flex-col w-[300px]"
              style={{ background: "rgba(8,18,38,0.96)", borderLeft: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <h3 className="font-playfair text-sm font-semibold text-cream">
                  Countries <span className="ml-1 text-xs text-gray-muted font-normal">({filteredList.length})</span>
                </h3>
                <button
                  onClick={() => setListOpen(false)}
                  className="rounded-lg p-1.5 text-gray-muted transition-colors hover:bg-white/5 hover:text-cream"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Search + filters */}
              <div className="px-3 py-3 space-y-2 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country or institution…"
                    className="w-full rounded-xl border py-2 pl-8 pr-3 text-xs text-cream placeholder:text-gray-muted/50 focus:outline-none transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
                  />
                </div>
                <div className="flex gap-1.5">
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="flex-1 rounded-lg border py-1.5 px-2 text-[11px] text-gray-muted focus:outline-none cursor-pointer"
                    style={{ background: "rgba(8,18,38,0.9)", borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select
                    value={matFilter}
                    onChange={(e) => setMatFilter(e.target.value)}
                    className="flex-1 rounded-lg border py-1.5 px-2 text-[11px] text-gray-muted focus:outline-none cursor-pointer"
                    style={{ background: "rgba(8,18,38,0.9)", borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    {MATURITY_LABELS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Country list */}
              <div className="flex-1 overflow-y-auto px-2 py-2" style={{ scrollbarWidth: "thin" }}>
                <AnimatePresence mode="popLayout">
                  {filteredList.map((p, i) => (
                    <motion.button
                      key={p.iso3}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.015 }}
                      onClick={() => { handleSelectCountry(p.iso3); }}
                      onMouseEnter={() => setHoveredIso(p.iso3)}
                      onMouseLeave={() => setHoveredIso(null)}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 hover:bg-white/[0.05]"
                    >
                      <span className="text-xl leading-none shrink-0">{p.flag}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-cream">{p.name}</p>
                        <p className="truncate text-[10px] text-gray-muted/70">{p.institution}</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="text-xs font-bold font-mono" style={{ color: maturityBadgeColor(p.maturityLabel) }}>
                          {p.maturityScore.toFixed(1)}
                        </span>
                        <span
                          className="rounded-full px-1.5 py-px text-[9px] font-semibold"
                          style={{ background: `${maturityBadgeColor(p.maturityLabel)}18`, color: maturityBadgeColor(p.maturityLabel) }}
                        >
                          {p.maturityLabel}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
                {filteredList.length === 0 && (
                  <p className="py-10 text-center text-xs text-gray-muted">No countries match your filters.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FLOATING RIGHT PANEL: Country detail ── */}
        <AnimatePresence>
          {selectedProfile && (
            <motion.div
              key={`detail-${selectedIso}`}
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.38, ease: EASE }}
              className="absolute right-0 top-0 bottom-0 z-40 w-[300px]"
              style={{ background: "rgba(8,18,38,0.96)", borderLeft: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}
            >
              <CountryDetailPanel
                profile={selectedProfile}
                onClose={() => handleSelectCountry(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STATS BOTTOM BAR ── */}
        <button
          onClick={() => setStatsOpen(true)}
          className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-2.5 transition-all hover:bg-white/[0.03] group"
          style={{ background: "rgba(8,18,38,0.88)", borderTop: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(14px)" }}
        >
          <div className="flex items-center gap-6">
            {[
              { label: "Countries Tracked", value: String(ALL_PROFILES.length), color: "var(--gpssa-green)" },
              { label: "Global Leaders",    value: String(stats.leaders),        color: "var(--gpssa-green)" },
              { label: "Avg Coverage",      value: `${stats.avgCov}%`,           color: "var(--gold)" },
              { label: "Avg Digital Score", value: stats.avgMat,                 color: "var(--adl-blue)" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-baseline gap-2">
                <span className="font-playfair text-base font-bold" style={{ color }}>{value}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-muted/60">{label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-muted/40 group-hover:text-gray-muted/70 transition-colors">
            <Info size={11} />
            <span>Click for detailed analytics</span>
          </div>
        </button>
      </div>

      {/* ── STATS MODAL ── */}
      <AnimatePresence>
        {statsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[90]"
              style={{ background: "rgba(8,18,38,0.75)", backdropFilter: "blur(8px)" }}
              onClick={() => setStatsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="fixed inset-x-0 bottom-0 z-[91] mx-auto max-w-3xl p-4"
            >
              <div
                className="rounded-2xl border p-6"
                style={{ background: "rgba(8,18,38,0.98)", borderColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(24px)" }}
              >
                {/* Modal header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-playfair text-lg font-bold text-cream">Global Atlas Analytics</h2>
                    <p className="text-xs text-gray-muted mt-0.5">Pension & social security intelligence across {ALL_PROFILES.length} countries</p>
                  </div>
                  <button
                    onClick={() => setStatsOpen(false)}
                    className="rounded-xl p-2 text-gray-muted transition-colors hover:bg-white/5 hover:text-cream"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Countries Tracked",  value: ALL_PROFILES.length,   unit: "",    color: "var(--gpssa-green)", desc: "Active pension systems monitored" },
                    { label: "Global Leaders",       value: stats.leaders,         unit: "",    color: "var(--gpssa-green)", desc: "Digital maturity score ≥ 3.5/4.0" },
                    { label: "Avg Coverage Rate",    value: stats.avgCov,          unit: "%",   color: "var(--gold)",        desc: "Workforce covered globally" },
                    { label: "Avg Digital Score",    value: stats.avgMat,          unit: "/4",  color: "var(--adl-blue)",    desc: "Digital transformation maturity" },
                  ].map(({ label, value, unit, color, desc }) => (
                    <div
                      key={label}
                      className="rounded-xl p-4"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <p className="font-playfair text-2xl font-bold" style={{ color }}>
                        {value}{unit}
                      </p>
                      <p className="text-xs font-medium text-cream mt-1">{label}</p>
                      <p className="text-[10px] text-gray-muted/60 mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>

                {/* Maturity breakdown */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-muted mb-3">Maturity Distribution</p>
                  <div className="grid grid-cols-4 gap-3">
                    {(["Leader", "Advanced", "Developing", "Emerging"] as const).map((label) => {
                      const count = ALL_PROFILES.filter((p) => p.maturityLabel === label).length;
                      const pct = Math.round((count / ALL_PROFILES.length) * 100);
                      const color = maturityBadgeColor(label);
                      return (
                        <div key={label} className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span style={{ color }} className="font-medium">{label}</span>
                            <span className="text-gray-muted">{count}</span>
                          </div>
                          <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                          <p className="text-[10px] text-gray-muted/50">{pct}% of tracked</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Regions */}
                <div className="mt-5 pt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-muted mb-3">Regional Coverage</p>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.filter((r) => r !== "All").map((region) => {
                      const count = ALL_PROFILES.filter((p) => p.region === region).length;
                      return (
                        <div
                          key={region}
                          className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <span className="text-xs text-cream font-medium">{region}</span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-px rounded-full"
                            style={{ background: "rgba(0,168,107,0.12)", color: "var(--gpssa-green)" }}
                          >
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
