import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setSessionUser } from "@/lib/session";

const schema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("STUDENT"),
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2).max(20),
    studentId: z.string().optional(),
  }),
  z.object({
    role: z.literal("LEADER"),
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2).max(20),
    inviteCode: z.string().min(4),
  }),
]);

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数无效", details: parsed.error.flatten() }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) {
    return NextResponse.json({ error: "该邮箱已注册" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  if (parsed.data.role === "STUDENT") {
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        name: parsed.data.name,
        role: Role.STUDENT,
        studentId: parsed.data.studentId,
      },
    });
    await setSessionUser({
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });
    return NextResponse.json({ ok: true, user: { id: user.id, role: user.role } });
  }

  const code = await prisma.inviteCode.findFirst({
    where: {
      code: parsed.data.inviteCode,
      consumedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });
  if (!code?.clubId) {
    return NextResponse.json({ error: "邀请码无效或已使用" }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.name,
      role: Role.LEADER,
    },
  });

  await prisma.club.update({
    where: { id: code.clubId },
    data: { leaderUserId: user.id },
  });

  await prisma.inviteCode.update({
    where: { id: code.id },
    data: { consumedAt: new Date(), usedByUserId: user.id },
  });

  await setSessionUser({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  return NextResponse.json({ ok: true, user: { id: user.id, role: user.role, clubId: code.clubId } });
}
