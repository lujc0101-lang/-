import { NextResponse } from "next/server";
import { ClubStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const u = await getSessionUser();
  if (!u || u.role !== "ADMIN") return NextResponse.json({ error: "无权限" }, { status: 403 });

  const clubs = await prisma.club.findMany({
    where: { status: { in: [ClubStatus.PENDING_REVIEW, ClubStatus.REJECTED, ClubStatus.PUBLISHED, ClubStatus.DRAFT] } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ clubs });
}
