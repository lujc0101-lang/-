import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const u = await getSessionUser();
  if (!u) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const p = await prisma.matchProfile.findUnique({ where: { userId: u.userId } });
  if (!p) return NextResponse.json({ profile: null });
  return NextResponse.json({
    profile: {
      answers: JSON.parse(p.answers),
      nlSource: p.nlSource,
      updatedAt: p.updatedAt,
    },
  });
}
