import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireEditor } from "@/lib/admin-guard";

/**
 * POST /api/engagement/import/opportunities
 * Body: { csv: string } or { rows: Array<...> }
 * CSV headers: title,category,description,impact,effort,status,sourceSection,owner
 */
export async function POST(req: NextRequest) {
  const { error } = await requireEditor();
  if (error) return error;

  try {
    const body = await req.json();
    let rows: Record<string, string>[] = [];

    if (Array.isArray(body.rows)) {
      rows = body.rows;
    } else if (typeof body.csv === "string") {
      rows = parseCsv(body.csv);
    } else {
      return NextResponse.json({ error: "Provide csv string or rows array" }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "No rows to import" }, { status: 400 });
    }

    let created = 0;
    for (const row of rows) {
      const title = (row.title || row.Title || "").trim();
      if (!title) continue;
      await prisma.opportunity.create({
        data: {
          title,
          category: (row.category || row.Category || "enhancement").trim() || "enhancement",
          description: (row.description || row.Description || "").trim() || null,
          impact: normalizeLevel(row.impact || row.Impact),
          effort: normalizeLevel(row.effort || row.Effort),
          status: (row.status || row.Status || "identified").trim() || "identified",
          sourceSection: (row.sourceSection || row.SourceSection || row.rfp || "").trim() || null,
          owner: (row.owner || row.Owner || "").trim() || null,
        },
      });
      created += 1;
    }

    return NextResponse.json({ created, total: rows.length });
  } catch (e) {
    console.error("opportunity import", e);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}

function normalizeLevel(v?: string): string {
  const s = (v || "medium").trim().toLowerCase();
  if (s === "low" || s === "medium" || s === "high") return s;
  return "medium";
}

function parseCsv(csv: string): Record<string, string>[] {
  const lines = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (ch === "," && !inQ) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}
