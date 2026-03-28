import { NextResponse } from "next/server";
import { ClubStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { matchClubs } from "@/lib/match-engine";
import { MatchAnswersSchema } from "@/lib/types";
import { clubToMatchShape } from "@/lib/club-utils";
import { getSessionUser } from "@/lib/session";
import { stringifyJson } from "@/lib/json";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const body = (json ?? {}) as { answers?: unknown; save?: boolean };
  const parsed = MatchAnswersSchema.safeParse(body.answers);
  if (!parsed.success) {
    return NextResponse.json({ error: "问卷无效", details: parsed.error.flatten() }, { status: 400 });
  }

  const clubs = await prisma.club.findMany({ where: { status: ClubStatus.PUBLISHED } });
  const shaped = clubs.map(clubToMatchShape);
  const results = matchClubs(parsed.data, shaped);

  const u = await getSessionUser();
  if (u && body.save) {
    await prisma.matchProfile.upsert({
      where: { userId: u.userId },
      create: { userId: u.userId, answers: stringifyJson(parsed.data) },
      update: { answers: stringifyJson(parsed.data), nlSource: null },
    });
  }

  return NextResponse.json({
    results: results.map((r) => ({
      clubId: r.club.id,
      name: r.club.name,
      category: r.club.category,
      score: r.score,
      reasons: r.reasons,
    })),
  });
}
