import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";

/**
 * GET /api/auth/me
 * Retorna dados básicos do usuário logado
 */
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return NextResponse.json({ userId: null, authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    userId,
    authenticated: true,
  });
}