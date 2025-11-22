import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export function requireRole(userRole: Role, allowedRoles: Role[]) {
  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null; // Authorized
}
