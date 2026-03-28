import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const { id } = await ctx.params;

  const post = await prisma.post.findFirst({ where: { id, status: "APPROVED" } });
  if (!post) return NextResponse.json({ error: "帖子不可互动" }, { status: 400 });

  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId: u.userId, postId: id } },
  });
  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, liked: false });
  }
  await prisma.postLike.create({ data: { userId: u.userId, postId: id } });
  return NextResponse.json({ ok: true, liked: true });
}
