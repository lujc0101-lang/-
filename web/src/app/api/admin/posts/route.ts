import { NextResponse } from "next/server";
import { PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET(req: Request) {
  const u = await getSessionUser();
  if (!u || u.role !== "ADMIN") return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") as PostStatus) ?? PostStatus.PENDING;

  const posts = await prisma.post.findMany({
    where: { status: Object.values(PostStatus).includes(status) ? status : PostStatus.PENDING },
    include: { author: { select: { name: true, email: true } }, club: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json({ posts });
}
