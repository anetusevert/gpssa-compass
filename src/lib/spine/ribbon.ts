import type { SpineNodeId } from "./types";

/** Which spine node "owns" a dashboard route. Longest prefix wins. */
const ROUTE_NODE_MAP: [prefix: string, node: SpineNodeId][] = [
  ["/dashboard/delivery/personas", "episode"],
  ["/dashboard/delivery", "journey"],
  ["/dashboard/services/operating", "process"],
  ["/dashboard/services", "journey"],
  ["/dashboard/products", "episode"],
  ["/dashboard/fulfilment", "systems"],
  ["/dashboard/quality", "qa"],
  ["/dashboard/performance", "qa"],
];

export const RIBBON_NODES: { id: SpineNodeId; label: string; color: string }[] = [
  { id: "episode", label: "Episode", color: "#00A86B" },
  { id: "journey", label: "Journey", color: "#3B82C4" },
  { id: "process", label: "Process", color: "#C99A3C" },
  { id: "systems", label: "Systems", color: "#B0764A" },
  { id: "qa", label: "QA", color: "#C5A572" },
];

export function nodeForRoute(pathname: string): SpineNodeId | null {
  let best: SpineNodeId | null = null;
  let bestLen = 0;
  for (const [prefix, node] of ROUTE_NODE_MAP) {
    if (pathname.startsWith(prefix) && prefix.length > bestLen) {
      best = node;
      bestLen = prefix.length;
    }
  }
  return best;
}

/** Show the ribbon only on module pages that belong to the spine story. */
export function showRibbonFor(pathname: string): boolean {
  return nodeForRoute(pathname) !== null;
}
