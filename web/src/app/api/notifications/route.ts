import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const items = await prisma.notification.findMany({
    where: { userId: u.userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({
    notifications: items.map((n) => ({
      id: n.id,
      type: n.type,
      payload: JSON.parse(n.payload),
      readAt: n.readAt,
      createdAt: n.createdAt,
    })),
  });
}

export async function PATCH(req: Request) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const json = await req.json().catch(() => ({}));
  if ((json as { allRead?: boolean }).allRead) {
    await prisma.notification.updateMany({
      where: { userId: u.userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
  return NextResponse.json({ ok: true });
}
