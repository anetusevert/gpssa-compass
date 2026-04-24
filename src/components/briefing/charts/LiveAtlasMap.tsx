"use client";

import { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import type { AtlasCountryRow } from "@/lib/briefing/types";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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
  "Afghanistan":"AFG","Algeria":"DZA","Angola":"AGO","Argentina":"ARG","Armenia":"ARM","Australia":"AUS",
  "Austria":"AUT","Azerbaijan":"AZE","Bahrain":"BHR","Bangladesh":"BGD","Belarus":"BLR","Belgium":"BEL",
  "Bolivia":"BOL","Bosnia and Herz.":"BIH","Botswana":"BWA","Brazil":"BRA","Bulgaria":"BGR","Cambodia":"KHM",
  "Cameroon":"CMR","Canada":"CAN","Chad":"TCD","Chile":"CHL","China":"CHN","Colombia":"COL","Congo":"COG",
  "Dem. Rep. Congo":"COD","Costa Rica":"CRI","Croatia":"HRV","Cuba":"CUB","Cyprus":"CYP","Czechia":"CZE",
  "Denmark":"DNK","Dominican Rep.":"DOM","Ecuador":"ECU","Egypt":"EGY","El Salvador":"SLV","Eq. Guinea":"GNQ",
  "Eritrea":"ERI","Estonia":"EST","Eswatini":"SWZ","Ethiopia":"ETH","Finland":"FIN","France":"FRA",
  "Gabon":"GAB","Georgia":"GEO","Germany":"DEU","Ghana":"GHA","Greece":"GRC","Guatemala":"GTM","Guinea":"GIN",
  "Guyana":"GUY","Haiti":"HTI","Honduras":"HND","Hungary":"HUN","Iceland":"ISL","India":"IND",
  "Indonesia":"IDN","Iran":"IRN","Iraq":"IRQ","Ireland":"IRL","Israel":"ISR","Italy":"ITA","Jamaica":"JAM",
  "Japan":"JPN","Jordan":"JOR","Kazakhstan":"KAZ","Kenya":"KEN","North Korea":"PRK","South Korea":"KOR",
  "Kuwait":"KWT","Kyrgyzstan":"KGZ","Lao PDR":"LAO","Latvia":"LVA","Lebanon":"LBN","Liberia":"LBR",
  "Libya":"LBY","Lithuania":"LTU","Luxembourg":"LUX","Malaysia":"MYS","Mali":"MLI","Mauritania":"MRT",
  "Mauritius":"MUS","Mexico":"MEX","Moldova":"MDA","Mongolia":"MNG","Montenegro":"MNE","Morocco":"MAR",
  "Mozambique":"MOZ","Myanmar":"MMR","Namibia":"NAM","Nepal":"NPL","Netherlands":"NLD","New Zealand":"NZL",
  "Nicaragua":"NIC","Niger":"NER","Nigeria":"NGA","North Macedonia":"MKD","Norway":"NOR","Oman":"OMN",
  "Pakistan":"PAK","Palestine":"PSE","Panama":"PAN","Papua New Guinea":"PNG","Paraguay":"PRY","Peru":"PER",
  "Philippines":"PHL","Poland":"POL","Portugal":"PRT","Qatar":"QAT","Romania":"ROU","Russia":"RUS",
  "Rwanda":"RWA","Saudi Arabia":"SAU","Senegal":"SEN","Serbia":"SRB","Sierra Leone":"SLE","Singapore":"SGP",
  "Slovakia":"SVK","Slovenia":"SVN","Somalia":"SOM","South Africa":"ZAF","S. Sudan":"SSD","Spain":"ESP",
  "Sri Lanka":"LKA","Sudan":"SDN","Sweden":"SWE","Switzerland":"CHE","Syria":"SYR","Taiwan":"TWN",
  "Tajikistan":"TJK","Tanzania":"TZA","Thailand":"THA","Togo":"TGO","Trinidad and Tobago":"TTO",
  "Tunisia":"TUN","Turkey":"TUR","Uganda":"UGA","Ukraine":"UKR","United Arab Emirates":"ARE",
  "United Kingdom":"GBR","United States of America":"USA","Uruguay":"URY","Uzbekistan":"UZB",
  "Venezuela":"VEN","Vietnam":"VNM","Yemen":"YEM","Zambia":"ZMB","Zimbabwe":"ZWE",
  "Côte d'Ivoire":"CIV","W. Sahara":"ESH","Timor-Leste":"TLS","Central African Rep.":"CAF",
  "Bahamas":"BHS","Brunei":"BRN","Solomon Is.":"SLB","Suriname":"SUR",
};

function getIso3(geo: { properties: { name: string; ISO_A2?: string } }): string | undefined {
  const a2 = geo.properties.ISO_A2;
  return (a2 ? ISO_A2_TO_A3[a2] : undefined) ?? NAME_TO_ISO[geo.properties.name];
}

const MATURITY_FILL: Record<string, string> = {
  Leading: "#33C490",
  Advanced: "#1B7A4A",
  Developed: "#4899FF",
  Emerging: "#E7B02E",
  Foundational: "#E76363",
};

const NO_DATA_FILL = "#11243A";

// ISO-3 → approximate centroid (lon, lat). Used to anchor the spotlight ring.
const COUNTRY_CENTROID: Record<string, [number, number]> = {
  ARE: [54.3, 24.4], SAU: [45.0, 24.0], QAT: [51.2, 25.3], KWT: [47.5, 29.3],
  OMN: [55.9, 21.4], BHR: [50.6, 26.0], EGY: [30.0, 26.5], JOR: [36.0, 31.0],
  LBN: [35.9, 33.9], MAR: [-6.0, 32.0], TUN: [9.5, 34.0], DZA: [3.0, 28.0],
  GBR: [-1.5, 52.5], FRA: [2.5, 46.5], DEU: [10.5, 51.0], ESP: [-3.7, 40.2],
  ITA: [12.5, 42.5], NLD: [5.3, 52.2], BEL: [4.4, 50.7], LUX: [6.1, 49.6],
  SWE: [16.0, 62.0], NOR: [10.0, 62.0], FIN: [26.0, 64.0], DNK: [10.0, 56.0],
  ISL: [-19.0, 64.7], CHE: [8.2, 46.8], AUT: [14.5, 47.5], IRL: [-8.0, 53.0],
  PRT: [-8.0, 39.5], CZE: [15.5, 49.7], POL: [19.5, 52.0], HUN: [19.5, 47.0],
  GRC: [22.0, 39.0], TUR: [35.0, 39.0], RUS: [55.0, 60.0],
  USA: [-98.0, 39.0], CAN: [-105.0, 60.0], MEX: [-102.0, 23.0], BRA: [-55.0, -10.0],
  ARG: [-64.0, -34.0], CHL: [-71.0, -33.0], COL: [-74.0, 4.0], PER: [-76.0, -10.0],
  URY: [-56.0, -32.5], CRI: [-84.0, 10.0], PAN: [-80.0, 8.5], JAM: [-77.5, 18.1],
  CHN: [104.0, 35.0], JPN: [138.0, 36.0], KOR: [127.5, 37.0], IND: [80.0, 22.0],
  IDN: [118.0, -2.0], MYS: [102.0, 4.0], SGP: [103.8, 1.4], THA: [101.0, 15.0],
  PHL: [122.0, 13.0], VNM: [108.0, 16.0], AUS: [134.0, -25.0], NZL: [172.0, -41.0],
  PAK: [70.0, 30.0], IRN: [54.0, 32.0], BGD: [90.0, 24.0], KAZ: [68.0, 48.0],
  UZB: [64.0, 41.5], TJK: [71.0, 38.5], KGZ: [75.0, 41.5], TKM: [60.0, 39.5],
  AFG: [66.0, 33.5], MNG: [105.0, 46.0], FJI: [178.0, -17.7],
  ZAF: [25.0, -29.0], NGA: [8.0, 9.0], KEN: [38.0, 1.0], ETH: [40.0, 9.0],
  GHA: [-1.0, 8.0], LBY: [17.0, 27.0],
  YEM: [48.0, 15.5], SYR: [38.5, 35.0], IRQ: [44.0, 33.0], ISR: [35.0, 31.5],
  PSE: [35.2, 31.9],
};

export interface LiveAtlasMapProps {
  countries: AtlasCountryRow[];
  /** Currently spotlighted ISO3 (controlled). */
  spotlitIso: string | null;
  onSpotlightChange: (iso: string | null) => void;
  /** Optional click callback (e.g. to add to comparator). */
  onPick?: (country: AtlasCountryRow) => void;
}

export const LiveAtlasMap = memo(function LiveAtlasMap({
  countries,
  spotlitIso,
  onSpotlightChange,
  onPick,
}: LiveAtlasMapProps) {
  const byIso = useMemo(() => {
    const m = new Map<string, AtlasCountryRow>();
    for (const c of countries) m.set(c.iso3, c);
    return m;
  }, [countries]);

  const [hoveredIso, setHoveredIso] = useState<string | null>(null);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-[#06111F]">
      {/* Glow grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(51,196,144,0.08) 0%, transparent 55%), radial-gradient(circle at 80% 70%, rgba(73,153,255,0.06) 0%, transparent 50%)",
        }}
      />

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 135, center: [12, 22] }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies, projection }) => {
            // Compute spotlight x/y once per render so child overlays can use it
            const spotlightProjected = (() => {
              if (!spotlitIso) return null;
              const centroid = COUNTRY_CENTROID[spotlitIso];
              if (!centroid) return null;
              const xy = projection(centroid);
              if (!xy) return null;
              const [x, y] = xy;
              return { x, y };
            })();

            return (
              <>
                {geographies.map((geo) => {
                  const iso = getIso3(geo);
                  const c = iso ? byIso.get(iso) : undefined;
                  const isUae = iso === "ARE";
                  const isSpot = iso === spotlitIso;
                  const isHover = iso === hoveredIso;
                  const fill = c?.maturityLabel
                    ? MATURITY_FILL[c.maturityLabel] ?? NO_DATA_FILL
                    : NO_DATA_FILL;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke={isUae ? "#FFFFFF" : isSpot ? "#FFFFFF" : "#0d1b2a"}
                      strokeWidth={isUae ? 1.2 : isSpot ? 1.1 : 0.4}
                      style={{
                        default: {
                          outline: "none",
                          opacity: c ? (isHover || isSpot ? 1 : 0.92) : 0.32,
                        },
                        hover: {
                          outline: "none",
                          opacity: 1,
                          cursor: c ? "pointer" : "default",
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => {
                        if (!c) return;
                        setHoveredIso(c.iso3);
                        onSpotlightChange(c.iso3);
                      }}
                      onMouseLeave={() => setHoveredIso(null)}
                      onClick={() => c && onPick?.(c)}
                    />
                  );
                })}

                {/* Spotlight pulse */}
                {spotlightProjected && (
                  <g
                    transform={`translate(${spotlightProjected.x}, ${spotlightProjected.y})`}
                    style={{ pointerEvents: "none" }}
                  >
                    <motion.circle
                      r={9}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth={1.4}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                    <motion.circle
                      r={9}
                      fill="none"
                      stroke="#33C490"
                      strokeWidth={1.6}
                      initial={{ scale: 1, opacity: 0.7 }}
                      animate={{ scale: [1, 2.4, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    />
                    <circle r={2.6} fill="#FFFFFF" />
                  </g>
                )}
              </>
            );
          }}
        </Geographies>
      </ComposableMap>
    </div>
  );
});
