import { NextResponse } from "next/server";
import { PostStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const schema = z.object({
  status: z.nativeEnum(PostStatus),
  rejectNote: z.string().max(200).optional(),
  pinned: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const u = await getSessionUser();
  if (!u || u.role !== "ADMIN") return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await ctx.params;

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "参数无效" }, { status: 400 });

  const data: {
    status: PostStatus;
    rejectNote?: string | null;
    reviewedAt?: Date;
    reviewerId?: string;
    pinned?: boolean;
  } = {
    status: parsed.data.status,
    reviewedAt: new Date(),
    reviewerId: u.userId,
  };
  if (parsed.data.rejectNote !== undefined) data.rejectNote = parsed.data.rejectNote;
  if (parsed.data.pinned !== undefined) data.pinned = parsed.data.pinned;

  await prisma.post.update({ where: { id }, data });

  const post = await prisma.post.findUnique({ where: { id } });
  if (post && parsed.data.status === PostStatus.APPROVED) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: "post_approved",
        payload: JSON.stringify({
          title: "帖子已通过审核",
          body: "你的内容已在社区展示",
          href: `/posts/${id}`,
        }),
      },
    }).catch(() => {});
  }
  if (post && parsed.data.status === PostStatus.REJECTED) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: "post_rejected",
        payload: JSON.stringify({
          title: "帖子未通过审核",
          body: parsed.data.rejectNote ?? "请修改后重新提交",
          href: `/publish?edit=${id}`,
        }),
      },
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
