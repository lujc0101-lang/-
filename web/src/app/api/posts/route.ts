import { NextResponse } from "next/server";
import { PostStatus, PostType, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { parseJsonArray } from "@/lib/json";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const tag = (searchParams.get("tag") ?? "").trim().toLowerCase();
  const typeParam = searchParams.get("type") as PostType | null;
  const take = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20")));

  const u = await getSessionUser();
  const isAdmin = u?.role === "ADMIN";

  const whereStatus = isAdmin && searchParams.get("moderation") === "1" ? undefined : PostStatus.APPROVED;

  const where: Prisma.PostWhereInput = {};
  if (whereStatus) where.status = whereStatus;
  if (typeParam && Object.values(PostType).includes(typeParam)) where.type = typeParam;

  let posts = await prisma.post.findMany({
    where,
    include: {
      author: { select: { id: true, name: true } },
      club: { select: { id: true, name: true } },
      _count: { select: { likes: true, comments: true, favs: true } },
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  if (q) {
    posts = posts.filter((p) => {
      const blob = `${p.title ?? ""} ${p.content}`.toLowerCase();
      const tags = parseJsonArray(p.tags).join(" ").toLowerCase();
      return blob.includes(q) || tags.includes(q);
    });
  }
  if (tag) {
    posts = posts.filter((p) =>
      parseJsonArray(p.tags).some((t) => t.toLowerCase().includes(tag)),
    );
  }

  posts = posts.slice(0, take);

  const likedSet = new Set<string>();
  if (u) {
    const likes = await prisma.postLike.findMany({
      where: { userId: u.userId, postId: { in: posts.map((p) => p.id) } },
      select: { postId: true },
    });
    likes.forEach((l) => likedSet.add(l.postId));
  }

  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      type: p.type,
      title: p.title,
      content: p.content,
      images: parseJsonArray(p.images),
      tags: parseJsonArray(p.tags),
      clubId: p.clubId,
      clubName: p.club?.name,
      pinned: p.pinned,
      status: p.status,
      createdAt: p.createdAt,
      author: p.author,
      likes: p._count.likes,
      comments: p._count.comments,
      favs: p._count.favs,
      liked: likedSet.has(p.id),
    })),
  });
}

const createSchema = z.object({
  type: z.nativeEnum(PostType),
  title: z.string().max(80).optional().nullable(),
  content: z.string().min(1).max(8000),
  images: z.array(z.string().url()).max(9).optional(),
  clubId: z.string().optional().nullable(),
  tags: z.array(z.string().max(20)).max(10).optional(),
});

export async function POST(req: Request) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数无效", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.clubId) {
    const club = await prisma.club.findFirst({
      where: { id: parsed.data.clubId, status: "PUBLISHED" },
    });
    if (!club) return NextResponse.json({ error: "社团不存在或未上架" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      authorId: u.userId,
      type: parsed.data.type,
      title: parsed.data.title ?? null,
      content: parsed.data.content,
      images: JSON.stringify(parsed.data.images ?? []),
      clubId: parsed.data.clubId ?? null,
      tags: JSON.stringify(parsed.data.tags ?? []),
      status: PostStatus.PENDING,
    },
  });

  return NextResponse.json({
    ok: true,
    postId: post.id,
    message: "已提交审核，通过后将在社区展示",
  });
}
