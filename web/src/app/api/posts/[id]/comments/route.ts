import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const post = await prisma.post.findFirst({ where: { id, status: "APPROVED" } });
  if (!post) return NextResponse.json({ error: "未找到" }, { status: 404 });

  const rows = await prisma.postComment.findMany({
    where: { postId: id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return NextResponse.json({
    comments: rows.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      user: c.user,
    })),
  });
}

const schema = z.object({ content: z.string().min(1).max(1000) });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const { id } = await ctx.params;

  const post = await prisma.post.findFirst({ where: { id, status: "APPROVED" } });
  if (!post) return NextResponse.json({ error: "帖子不可评论" }, { status: 400 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "内容无效" }, { status: 400 });

  const c = await prisma.postComment.create({
    data: { postId: id, userId: u.userId, content: parsed.data.content },
  });

  await prisma.notification.create({
    data: {
      userId: post.authorId,
      type: "post_comment",
      payload: JSON.stringify({
        title: "你的帖子有新评论",
        body: `${u.name} 评论了你的内容`,
        href: `/posts/${id}`,
      }),
    },
  }).catch(() => {});

  return NextResponse.json({ ok: true, commentId: c.id });
}
