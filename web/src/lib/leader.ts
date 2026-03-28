import { prisma } from "./prisma";

export async function getManagedClubId(leaderUserId: string) {
  const club = await prisma.club.findFirst({ where: { leaderUserId } });
  return club?.id ?? null;
}
