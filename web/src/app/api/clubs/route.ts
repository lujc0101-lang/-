import { ClubStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CLUB_CATEGORIES } from "@/lib/constants";
import { parseJsonArray } from "@/lib/json";
import { recruitingState } from "@/lib/club-utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qRaw = (searchParams.get("q") ?? "").trim();
  const q = qRaw.toLowerCase();
  const sort = searchParams.get("sort") ?? "default";
  const recruitingOnly = searchParams.get("recruitingOnly") === "1";
  const category = searchParams.get("category") ?? "";

  const where: { status: typeof ClubStatus.PUBLISHED; category?: string } = {
    status: ClubStatus.PUBLISHED,
  };

  if (category && CLUB_CATEGORIES.includes(category as (typeof CLUB_CATEGORIES)[number])) {
    where.category = category;
  }

  const since = new Date(Date.now() - 7 * 864e5 * 1000);
  const pvRows = await prisma.analyticsEvent.groupBy({
    by: ["clubId"],
    where: { type: "club_detail_view", ts: { gte: since }, clubId: { not: null } },
    _count: { _all: true },
  });
  const pvMap = new Map(pvRows.map((r) => [r.clubId as string, r._count._all]));

  const appCounts = await prisma.application.groupBy({
    by: ["clubId"],
    _count: { _all: true },
  });
  const appMap = new Map(appCounts.map((r) => [r.clubId, r._count._all]));

  let clubs = await prisma.club.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  if (q) {
    clubs = clubs.filter((c) => {
      const tags = parseJsonArray(c.tags).join(" ").toLowerCase();
      const blob = `${c.name} ${c.slogan} ${tags}`.toLowerCase();
      return blob.includes(q);
    });
  }

  const mapped = clubs.map((c) => {
    const state = recruitingState(c.recruitStart, c.recruitEnd);
    const recruiting = state === "open";
    return {
      ...c,
      tags: parseJsonArray(c.tags),
      state,
      recruiting,
      pv7d: pvMap.get(c.id) ?? 0,
      applicationsCount: appMap.get(c.id) ?? 0,
    };
  });

  let list = mapped;
  if (recruitingOnly) list = list.filter((c) => c.recruiting);

  const orderRank = { open: 0, upcoming: 1, ended: 2 } as const;
  list.sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name, "zh-CN");
    if (sort === "new") return b.createdAt.getTime() - a.createdAt.getTime();
    if (sort === "hot") return (b.pv7d ?? 0) - (a.pv7d ?? 0);
    return (
      orderRank[a.state as keyof typeof orderRank] - orderRank[b.state as keyof typeof orderRank] ||
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  });

  return NextResponse.json({ clubs: list });
}
