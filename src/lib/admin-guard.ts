import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export type AppRole = "viewer" | "editor" | "admin" | "user";

function roleOf(session: { user?: unknown } | null): AppRole | null {
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  if (role === "admin" || role === "editor" || role === "viewer" || role === "user") {
    return role;
  }
  return "viewer";
}

/** Legacy `user` is treated as editor for backward compatibility. */
export function canEdit(role: AppRole | null): boolean {
  return role === "admin" || role === "editor" || role === "user";
}

export function canAdmin(role: AppRole | null): boolean {
  return role === "admin";
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  if (!canAdmin(roleOf(session))) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null };
  }
  return { error: null, session };
}

/** Authenticated users who may mutate operational data (not research agents). */
export async function requireEditor() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  if (!canEdit(roleOf(session))) {
    return { error: NextResponse.json({ error: "Forbidden — viewer role is read-only" }, { status: 403 }), session: null };
  }
  return { error: null, session };
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  return { error: null, session };
}
