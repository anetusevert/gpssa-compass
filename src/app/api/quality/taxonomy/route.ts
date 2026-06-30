import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Returns the error-taxonomy tree (top categories with children) plus a defect
 * count per node, used by both the collapsible tree and the Pareto chart.
 */
export async function GET() {
  try {
    const [nodes, grouped] = await Promise.all([
      prisma.errorTaxonomyNode.findMany({
        orderBy: [{ sortOrder: "asc" }],
      }),
      prisma.defect.groupBy({
        by: ["taxonomyNodeId"],
        _count: { _all: true },
      }),
    ]);

    const countByNode = new Map<string, number>();
    for (const g of grouped) {
      if (g.taxonomyNodeId) countByNode.set(g.taxonomyNodeId, g._count._all);
    }

    interface TaxNode {
      id: string;
      code: string;
      name: string;
      severity: string;
      category: string | null;
      description: string | null;
      parentId: string | null;
      sortOrder: number;
      defectCount: number;
      children: TaxNode[];
    }

    const byId = new Map<string, TaxNode>(
      nodes.map((n) => [
        n.id,
        {
          id: n.id,
          code: n.code,
          name: n.name,
          severity: n.severity,
          category: n.category,
          description: n.description,
          parentId: n.parentId,
          sortOrder: n.sortOrder,
          defectCount: countByNode.get(n.id) ?? 0,
          children: [],
        },
      ])
    );

    const roots: TaxNode[] = [];
    for (const n of nodes) {
      const node = byId.get(n.id)!;
      if (n.parentId && byId.has(n.parentId)) {
        byId.get(n.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    // Roll child defect counts up into parents for the tree totals.
    for (const root of roots) {
      const childSum = root.children.reduce((s, c) => s + c.defectCount, 0);
      root.defectCount += childSum;
    }

    return NextResponse.json({ tree: roots });
  } catch (error) {
    console.error("GET /api/quality/taxonomy failed:", error);
    return NextResponse.json({ error: "Failed to fetch taxonomy" }, { status: 500 });
  }
}
