import { NextResponse } from "next/server";
import { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getManagedClubId } from "@/lib/leader";
import { APPLICATION_STATUS_LABEL } from "@/lib/constants";

export async function GET(req: Request) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (u.role !== "LEADER") return NextResponse.json({ error: "无权限" }, { status: 403 });
  const clubId = await getManagedClubId(u.userId);
  if (!clubId) return NextResponse.json({ applications: [] });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const status = searchParams.get("status") as ApplicationStatus | null;

  const where: {
    clubId: string;
    status?: ApplicationStatus;
  } = { clubId };
  if (status && Object.values(ApplicationStatus).includes(status)) where.status = status;

  let rows = await prisma.application.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  if (q) {
    rows = rows.filter((r) => {
      const common = JSON.parse(r.commonAnswers) as { fullName?: string; studentId?: string };
      const blob = `${common.fullName ?? ""} ${common.studentId ?? ""}`.toLowerCase();
      return blob.includes(q);
    });
  }

  return NextResponse.json({
    applications: rows.map((a) => ({
      id: a.id,
      status: a.status,
      statusLabel: APPLICATION_STATUS_LABEL[a.status] ?? a.status,
      createdAt: a.createdAt,
      user: a.user,
      commonAnswers: JSON.parse(a.commonAnswers),
      customAnswers: JSON.parse(a.customAnswers),
      timeline: JSON.parse(a.timeline),
    })),
  });
}
