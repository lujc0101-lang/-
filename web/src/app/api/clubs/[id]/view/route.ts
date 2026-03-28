import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const WINDOW_MS = 30 * 60 * 1000;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const prev = req.headers.get("cookie")?.match(new RegExp(`(?:^|; )pv_${id}=([^;]+)`));
  const prevTs = prev?.[1] ? Number(prev[1]) : 0;
  if (prevTs && Date.now() - prevTs < WINDOW_MS) {
    const res = NextResponse.json({ ok: true, deduped: true });
    return res;
  }

  const u = await getSessionUser();
  const sid =
    req.headers.get("x-session-id")?.slice(0, 64) ??
    u?.userId ??
    `pv-${id}-${Math.random().toString(36).slice(2)}`;
  await prisma.analyticsEvent.create({
    data: {
      type: "club_detail_view",
      clubId: id,
      userId: u?.userId,
      sessionId: sid,
      meta: JSON.stringify({ dedupedWindowSec: WINDOW_MS / 1000 }),
    },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(`pv_${id}`, String(Date.now()), {
    maxAge: Math.floor(WINDOW_MS / 1000),
    path: "/",
    sameSite: "lax",
  });
  return res;
}
