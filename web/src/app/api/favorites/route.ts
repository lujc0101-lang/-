import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { z } from "zod";
import { ClubStatus } from "@prisma/client";

export async function GET() {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const rows = await prisma.favorite.findMany({
    where: { userId: u.userId },
    include: { club: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    favorites: rows
      .filter((r) => r.club.status === ClubStatus.PUBLISHED)
      .map((r) => ({
        id: r.id,
        clubId: r.clubId,
        club: {
          id: r.club.id,
          name: r.club.name,
          slogan: r.club.slogan,
          category: r.club.category,
          recruitStart: r.club.recruitStart,
          recruitEnd: r.club.recruitEnd,
          coverUrl: r.club.coverUrl,
        },
      })),
  });
}

const postSchema = z.object({ clubId: z.string() });

export async function POST(req: Request) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const json = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "参数无效" }, { status: 400 });

  const club = await prisma.club.findFirst({
    where: { id: parsed.data.clubId, status: ClubStatus.PUBLISHED },
  });
  if (!club) return NextResponse.json({ error: "社团不存在" }, { status: 404 });

  await prisma.favorite.upsert({
    where: { userId_clubId: { userId: u.userId, clubId: parsed.data.clubId } },
    create: { userId: u.userId, clubId: parsed.data.clubId },
    update: {},
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const clubId = searchParams.get("clubId");
  if (!clubId) return NextResponse.json({ error: "缺少 clubId" }, { status: 400 });
  await prisma.favorite.deleteMany({ where: { userId: u.userId, clubId } });
  return NextResponse.json({ ok: true });
}
