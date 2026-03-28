import { NextResponse } from "next/server";
import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getManagedClubId } from "@/lib/leader";
import { notifyApplicationStatus } from "@/lib/notify";
import { APPLICATION_STATUS_LABEL } from "@/lib/constants";

const schema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  note: z.string().max(200).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (u.role !== "LEADER") return NextResponse.json({ error: "无权限" }, { status: 403 });
  const clubId = await getManagedClubId(u.userId);
  if (!clubId) return NextResponse.json({ error: "未绑定社团" }, { status: 400 });

  const { id } = await ctx.params;
  const app = await prisma.application.findFirst({
    where: { id, clubId },
    include: { club: true, user: true },
  });
  if (!app) return NextResponse.json({ error: "未找到" }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "参数无效" }, { status: 400 });

  const timeline = JSON.parse(app.timeline) as {
    at: string;
    byUserId: string;
    action: string;
    note?: string;
  }[];
  timeline.push({
    at: new Date().toISOString(),
    byUserId: u.userId,
    action: `status:${parsed.data.status}`,
    note: parsed.data.note,
  });

  await prisma.application.update({
    where: { id },
    data: {
      status: parsed.data.status,
      timeline: JSON.stringify(timeline),
    },
  });

  await notifyApplicationStatus(
    app.userId,
    app.club.name,
    APPLICATION_STATUS_LABEL[parsed.data.status] ?? parsed.data.status,
    id,
  ).catch(() => {});

  return NextResponse.json({ ok: true });
}
