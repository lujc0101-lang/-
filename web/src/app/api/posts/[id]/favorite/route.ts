import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const { id } = await ctx.params;

  const post = await prisma.post.findFirst({ where: { id, status: "APPROVED" } });
  if (!post) return NextResponse.json({ error: "帖子不可收藏" }, { status: 400 });

  await prisma.postFavorite.upsert({
    where: { userId_postId: { userId: u.userId, postId: id } },
    create: { userId: u.userId, postId: id },
    update: {},
  });
  return NextResponse.json({ ok: true, fav: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const { id } = await ctx.params;
  await prisma.postFavorite.deleteMany({ where: { userId: u.userId, postId: id } });
  return NextResponse.json({ ok: true, fav: false });
}
