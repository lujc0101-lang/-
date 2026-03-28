import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { APPLICATION_STATUS_LABEL } from "@/lib/constants";

export async function GET() {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const rows = await prisma.application.findMany({
    where: { userId: u.userId },
    include: { club: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    applications: rows.map((a) => ({
      id: a.id,
      status: a.status,
      statusLabel: APPLICATION_STATUS_LABEL[a.status] ?? a.status,
      createdAt: a.createdAt,
      commonAnswers: JSON.parse(a.commonAnswers),
      club: a.club
        ? {
            id: a.club.id,
            name: a.club.name,
            status: a.club.status,
          }
        : null,
      clubSnapshot: a.clubSnapshot ? JSON.parse(a.clubSnapshot) : null,
    })),
  });
}
