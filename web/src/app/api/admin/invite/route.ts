import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const schema = z.object({
  clubId: z.string().optional(),
  expiresInDays: z.number().min(1).max(365).optional(),
});

function randomCode() {
  return `INV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST(req: Request) {
  const u = await getSessionUser();
  if (!u || u.role !== "ADMIN") return NextResponse.json({ error: "无权限" }, { status: 403 });
  const json = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "参数无效" }, { status: 400 });

  const expiresAt = parsed.data.expiresInDays
    ? new Date(Date.now() + parsed.data.expiresInDays * 864e5)
    : new Date(Date.now() + 365 * 864e5);

  const code = await prisma.inviteCode.create({
    data: {
      code: randomCode(),
      clubId: parsed.data.clubId,
      expiresAt,
    },
  });
  return NextResponse.json({ ok: true, code: code.code, id: code.id, expiresAt });
}
