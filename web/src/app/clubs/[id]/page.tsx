import { notFound } from "next/navigation";
import { ClubStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/json";
import { recruitingState } from "@/lib/club-utils";
import { ClubDetailClient } from "./ClubDetailClient";

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const club = await prisma.club.findFirst({
    where: { id, status: ClubStatus.PUBLISHED },
  });
  if (!club) notFound();

  const state = recruitingState(club.recruitStart, club.recruitEnd);
  const [appCount, favCount] = await Promise.all([
    prisma.application.count({ where: { clubId: id } }),
    prisma.favorite.count({ where: { clubId: id } }),
  ]);

  const initial = {
    club: {
      id: club.id,
      name: club.name,
      slogan: club.slogan,
      category: club.category,
      description: club.description,
      tags: parseJsonArray(club.tags),
      gallery: parseJsonArray(club.gallery),
      activityTypes: parseJsonArray(club.activityTypes),
      intensity: club.intensity,
      beginnerFriendly: club.beginnerFriendly,
      recruitStart: club.recruitStart.toISOString(),
      recruitEnd: club.recruitEnd.toISOString(),
      recruitQuotaNote: club.recruitQuotaNote,
      applyNote: club.applyNote,
      contact: club.contact ? (JSON.parse(club.contact) as Record<string, string>) : null,
      leaderDisplayName: club.leaderDisplayName,
      coverUrl: club.coverUrl,
      applicationsCount: appCount,
      favoritesCount: favCount,
      state,
      recruiting: state === "open",
    },
  };

  return <ClubDetailClient clubId={id} initial={initial} />;
}
