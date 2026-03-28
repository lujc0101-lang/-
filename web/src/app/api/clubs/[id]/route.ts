import { NextResponse } from "next/server";
import { ClubStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/json";
import { recruitingState } from "@/lib/club-utils";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const club = await prisma.club.findFirst({
    where: { id, status: ClubStatus.PUBLISHED },
  });
  if (!club) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  const state = recruitingState(club.recruitStart, club.recruitEnd);
  const [appCount, favCount] = await Promise.all([
    prisma.application.count({ where: { clubId: id } }),
    prisma.favorite.count({ where: { clubId: id } }),
  ]);
  return NextResponse.json({
    club: {
      ...club,
      tags: parseJsonArray(club.tags),
      gallery: parseJsonArray(club.gallery),
      activityTypes: parseJsonArray(club.activityTypes),
      contact: club.contact ? JSON.parse(club.contact) : null,
      customForm: club.customForm ? JSON.parse(club.customForm) : [],
      state,
      recruiting: state === "open",
      applicationsCount: appCount,
      favoritesCount: favCount,
    },
  });
}
