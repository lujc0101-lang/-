import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET(req: Request) {
  const u = await getSessionUser();
  if (!u || u.role !== "ADMIN") return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const days = Math.min(30, Math.max(1, Number(searchParams.get("days") ?? "7")));
  const since = new Date(Date.now() - days * 864e5 * 1000);

  const [listViews, detailViews, applyOpens, applySubmits, clubs] = await Promise.all([
    prisma.analyticsEvent.count({ where: { type: "club_list_view", ts: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { type: "club_detail_view", ts: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { type: "apply_open", ts: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { type: "apply_submit", ts: { gte: since } } }),
    prisma.application.groupBy({
      by: ["clubId"],
      _count: { _all: true },
      orderBy: { _count: { clubId: "desc" } },
      take: 20,
    }),
  ]);

  const funnel =
    detailViews > 0
      ? {
          detailToApply: applyOpens / detailViews,
          applyToSubmit: applyOpens > 0 ? applySubmits / applyOpens : 0,
        }
      : { detailToApply: 0, applyToSubmit: 0 };

  const clubRows = await prisma.club.findMany({
    where: { id: { in: clubs.map((c) => c.clubId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(clubRows.map((c) => [c.id, c.name]));

  return NextResponse.json({
    rangeDays: days,
    counts: {
      club_list_view: listViews,
      club_detail_view: detailViews,
      apply_open: applyOpens,
      apply_submit: applySubmits,
    },
    funnel,
    topClubsByApplications: clubs.map((c) => ({
      clubId: c.clubId,
      name: nameById.get(c.clubId) ?? c.clubId,
      applications: c._count._all,
    })),
  });
}
