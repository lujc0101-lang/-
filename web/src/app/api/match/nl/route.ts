import { NextResponse } from "next/server";
import { ClubStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { matchClubs } from "@/lib/match-engine";
import { clubToMatchShape } from "@/lib/club-utils";
import { nlToMatchAnswers } from "@/lib/nlu";
import { getSessionUser } from "@/lib/session";
import { stringifyJson } from "@/lib/json";

const schema = z.object({
  text: z.string().min(8, "请再多描述一点（至少 8 个字）"),
  save: z.boolean().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数无效", details: parsed.error.flatten() }, { status: 400 });
  }
  const { summary, answers } = nlToMatchAnswers(parsed.data.text);
  const clubs = await prisma.club.findMany({ where: { status: ClubStatus.PUBLISHED } });
  const results = matchClubs(answers, clubs.map(clubToMatchShape));

  const u = await getSessionUser();
  if (u && parsed.data.save) {
    await prisma.matchProfile.upsert({
      where: { userId: u.userId },
      create: {
        userId: u.userId,
        answers: stringifyJson(answers),
        nlSource: parsed.data.text,
      },
      update: {
        answers: stringifyJson(answers),
        nlSource: parsed.data.text,
      },
    });
  }

  return NextResponse.json({
    summary,
    results: results.map((r) => ({
      clubId: r.club.id,
      name: r.club.name,
      category: r.club.category,
      score: r.score,
      reasons: r.reasons,
    })),
  });
}
