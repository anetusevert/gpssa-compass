"use client";

import { AlertTriangle } from "lucide-react";

export interface RaciGroup {
  processArea: string;
  teams: string[];
  activities: { activity: string; roles: Record<string, string> }[];
}

interface RaciMatrixProps {
  group: RaciGroup;
}

const ROLE_STYLE: Record<string, string> = {
  R: "bg-gpssa-green/20 text-gpssa-green border-gpssa-green/30",
  A: "bg-gold/25 text-gold border-gold/40",
  S: "bg-teal-400/20 text-teal-300 border-teal-400/30",
  C: "bg-adl-blue/20 text-adl-blue border-adl-blue/30",
  I: "bg-gray-muted/20 text-gray-muted border-gray-muted/30",
};

function countAccountable(roles: Record<string, string>): number {
  return Object.values(roles).filter((r) => r === "A").length;
}

export function RaciMatrix({ group }: RaciMatrixProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 min-w-[220px] bg-navy-light/60 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-muted">
              Activity
            </th>
            {group.teams.map((team) => (
              <th
                key={team}
                className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-muted"
              >
                {team}
              </th>
            ))}
            <th className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-muted">
              A?
            </th>
          </tr>
        </thead>
        <tbody>
          {group.activities.map((row) => {
            const aCount = countAccountable(row.roles);
            const valid = aCount === 1;
            return (
              <tr key={row.activity}>
                <td className="sticky left-0 z-10 max-w-[260px] truncate bg-navy-light/60 px-3 py-2 text-cream">
                  {row.activity}
                </td>
                {group.teams.map((team) => {
                  const role = row.roles[team];
                  return (
                    <td key={team} className="px-1 py-1 text-center">
                      {role ? (
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold ${ROLE_STYLE[role] ?? ROLE_STYLE.I}`}
                        >
                          {role}
                        </span>
                      ) : (
                        <span className="text-gray-muted/40">·</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-1 py-1 text-center">
                  {valid ? (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gpssa-green/15 text-xs font-bold text-gpssa-green">
                      ✓
                    </span>
                  ) : (
                    <span
                      title={
                        aCount === 0
                          ? "No Accountable — exactly one required"
                          : "Multiple Accountable — exactly one required"
                      }
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15 text-red-400"
                    >
                      <AlertTriangle size={14} />
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
