import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  return NextResponse.json({ loggedIn: Boolean(userId) });
}