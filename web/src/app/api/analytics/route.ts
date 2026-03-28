import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const schema = z.object({
  type: z.string(),
  clubId: z.string().optional(),
  source: z.string().optional(),
  durationMs: z.number().optional(),
});

function sessionIdFrom(req: Request): string {
  const h = req.headers.get("x-session-id");
  if (h && h.length > 8) return h;
  return `anon-${Math.random().toString(36).slice(2)}`;
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数无效" }, { status: 400 });
  }
  const u = await getSessionUser();
  const meta = JSON.stringify({
    source: parsed.data.source,
    durationMs: parsed.data.durationMs,
  });
  await prisma.analyticsEvent.create({
    data: {
      type: parsed.data.type,
      clubId: parsed.data.clubId,
      userId: u?.userId,
      sessionId: sessionIdFrom(req),
      meta,
    },
  });
  return NextResponse.json({ ok: true });
}
