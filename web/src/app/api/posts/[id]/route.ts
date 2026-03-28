import { NextResponse } from "next/server";
import { PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { parseJsonArray } from "@/lib/json";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const u = await getSessionUser();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      club: { select: { id: true, name: true, status: true } },
      _count: { select: { likes: true, comments: true, favs: true } },
    },
  });
  if (!post) return NextResponse.json({ error: "未找到" }, { status: 404 });

  const canSeePending =
    u && (u.role === "ADMIN" || post.authorId === u.userId) && post.status === PostStatus.PENDING;
  if (post.status !== PostStatus.APPROVED && !canSeePending) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }

  let liked = false;
  let fav = false;
  if (u) {
    const [l, f] = await Promise.all([
      prisma.postLike.findUnique({
        where: { userId_postId: { userId: u.userId, postId: id } },
      }),
      prisma.postFavorite.findUnique({
        where: { userId_postId: { userId: u.userId, postId: id } },
      }),
    ]);
    liked = !!l;
    fav = !!f;
  }

  return NextResponse.json({
    post: {
      id: post.id,
      type: post.type,
      title: post.title,
      content: post.content,
      images: parseJsonArray(post.images),
      tags: parseJsonArray(post.tags),
      clubId: post.clubId,
      club: post.club,
      pinned: post.pinned,
      status: post.status,
      createdAt: post.createdAt,
      author: post.author,
      likes: post._count.likes,
      comments: post._count.comments,
      favs: post._count.favs,
      liked,
      fav,
    },
  });
}
