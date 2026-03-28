import { NextResponse } from "next/server";
import { ClubStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const schema = z.object({
  status: z.nativeEnum(ClubStatus),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const u = await getSessionUser();
  if (!u || u.role !== "ADMIN") return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "参数无效" }, { status: 400 });

  const club = await prisma.club.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ ok: true, club });
}
