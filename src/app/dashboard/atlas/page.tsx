"use client";

import { useState, useMemo, memo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  ChevronDown,
  X,
  Info,
  RefreshCw,
} from "lucide-react";
import {
  type CountryProfile,
  type MetricKey,
  type MetricConfig,
  COUNTRIES,
  METRICS,
  maturityBadgeColor,
  getMetricColor,
  formatMetricValue,
  dbRowToProfile,
} from "@/lib/countries/country-data";
import { CountryFlag } from "@/components/ui/CountryFlag";

export type { CountryProfile };

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
   LOCAL CONSTANTS
═══════════════════════════════════════════════════════════════ */

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
              {tooltip.profile && tooltip.iso && (
                <CountryFlag code={tooltip.iso} size="md" />
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
   PAGE
═══════════════════════════════════════════════════════════════ */

const MATURITY_LABELS = ["All", "Leader", "Advanced", "Developing", "Emerging"];

export default function GlobalAtlasPage() {
  const router = useRouter();
  const [metric,       setMetric]       = useState<MetricKey>("maturityScore");
  const [search,       setSearch]       = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [matFilter,    setMatFilter]    = useState("All");
  const [hoveredIso,   setHoveredIso]   = useState<string | null>(null);
  const [metricOpen,   setMetricOpen]   = useState(false);
  const [listOpen,     setListOpen]     = useState(false);
  const [statsOpen,    setStatsOpen]    = useState(false);
  const [dbProfiles,   setDbProfiles]   = useState<Record<string, CountryProfile>>({});
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null);
  const [refreshing,   setRefreshing]   = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const loadCountries = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const res = await fetch("/api/countries");
      if (!res.ok) return;
      let rows: Array<Record<string, unknown>> = await res.json();

      const completedCount = rows.filter(
        (c) => c.researchStatus === "completed" && c.maturityScore != null
      ).length;
      const totalCount = rows.length;

      if (totalCount > 0 && completedCount < totalCount * 0.5) {
        const jobsRes = await fetch("/api/research/screen-jobs?latest=true");
        if (jobsRes.ok) {
          const jobs: Array<{ id: string; type: string; status: string; completedItems: number }> =
            await jobsRes.json();
          const atlasJob = jobs.find(
            (j) => j.type === "atlas-worldmap" && j.status === "completed" && j.completedItems > 0
          );
          if (atlasJob) {
            await fetch(`/api/research/screen-jobs/${atlasJob.id}/rewrite`, { method: "POST" });
            const refreshed = await fetch("/api/countries");
            if (refreshed.ok) rows = await refreshed.json();
          }
        }
      }

      const map: Record<string, CountryProfile> = {};
      for (const c of rows) {
        const hasData = c.maturityScore != null || c.researchStatus === "completed";
        if (hasData) {
          map[c.iso3 as string] = dbRowToProfile(c);
        }
      }
      setDbProfiles(map);
      setLastUpdated(new Date());
    } catch { /* ignore */ } finally {
      if (showSpinner) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCountries();
    pollRef.current = setInterval(() => loadCountries(), 30_000);
    return () => clearInterval(pollRef.current);
  }, [loadCountries]);

  const mergedCountries = useMemo<Record<string, CountryProfile>>(() => {
    return { ...COUNTRIES, ...dbProfiles };
  }, [dbProfiles]);

  const ALL_PROFILES = useMemo(() => Object.values(mergedCountries), [mergedCountries]);
  const REGIONS = useMemo(() => ["All", ...Array.from(new Set(ALL_PROFILES.map((c) => c.region))).sort()], [ALL_PROFILES]);

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
    const regions   = new Set(ALL_PROFILES.map((p) => p.region)).size;

    const n = ALL_PROFILES.length || 1;
    const activeSum = ALL_PROFILES.reduce((s, p) => s + (p[metric] as number), 0);
    const activeCfg = METRICS[metric];
    const activeAvg = activeCfg.unit === "1-4"
      ? (activeSum / n).toFixed(1)
      : `${Math.round(activeSum / n)}%`;

    return { leaders, advanced, regions, activeAvg, activeLabel: `Avg ${activeCfg.label}` };
  }, [ALL_PROFILES, metric]);

  const currentMetricCfg = METRICS[metric];

  const navigateToCountry = useCallback((iso: string) => {
    router.push(`/dashboard/atlas/country/${iso}`);
  }, [router]);

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
            selectedIso={null}
            onSelect={navigateToCountry}
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

        {/* ── OVERLAY: Countries toggle + refresh — top right ── */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <button
            onClick={() => loadCountries(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs text-gray-muted hover:text-cream transition-all"
            style={{ background: "rgba(8,18,38,0.92)", borderColor: "rgba(255,255,255,0.14)", backdropFilter: "blur(16px)" }}
            title={lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : "Refresh data"}
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {lastUpdated && (
              <span className="text-[10px] text-gray-muted/60">{lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            )}
          </button>
          <button
            onClick={() => setListOpen(!listOpen)}
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
          {listOpen && (
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
                      onClick={() => navigateToCountry(p.iso3)}
                      onMouseEnter={() => setHoveredIso(p.iso3)}
                      onMouseLeave={() => setHoveredIso(null)}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 hover:bg-white/[0.05]"
                    >
                      <CountryFlag code={p.iso3} size="lg" />
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
              { label: stats.activeLabel,    value: stats.activeAvg,              color: "var(--gold)" },
              { label: "Regions",            value: String(stats.regions),        color: "var(--adl-blue)" },
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
