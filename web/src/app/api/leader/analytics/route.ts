import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getManagedClubId } from "@/lib/leader";
import { ApplicationStatus } from "@prisma/client";

export async function GET() {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (u.role !== "LEADER") return NextResponse.json({ error: "无权限" }, { status: 403 });
  const clubId = await getManagedClubId(u.userId);
  if (!clubId) return NextResponse.json({ metrics: null });

  const since = new Date(Date.now() - 7 * 864e5 * 1000);
  const [pv7d, apps, byStatus] = await Promise.all([
    prisma.analyticsEvent.count({
      where: { clubId, type: "club_detail_view", ts: { gte: since } },
    }),
    prisma.application.count({ where: { clubId } }),
    prisma.application.groupBy({
      by: ["status"],
      where: { clubId },
      _count: { _all: true },
    }),
  ]);

  const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count._all])) as Partial<
    Record<ApplicationStatus, number>
  >;

  return NextResponse.json({
    metrics: {
      pv7d,
      applications: apps,
      statusDistribution: statusMap,
    },
  });
}
