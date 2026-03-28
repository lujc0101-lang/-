import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const schema = z.object({
  notifyDeadlineReminders: z.boolean(),
});

export async function PATCH(req: Request) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "参数无效" }, { status: 400 });
  await prisma.user.update({
    where: { id: u.userId },
    data: { notifyDeadlineReminders: parsed.data.notifyDeadlineReminders },
  });
  return NextResponse.json({ ok: true });
}
