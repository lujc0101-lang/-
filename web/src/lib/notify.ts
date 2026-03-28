import { prisma } from "./prisma";
import { stringifyJson } from "./json";

export async function notifyUser(
  userId: string,
  type: string,
  payload: { title: string; body: string; href: string; clubId?: string },
) {
  await prisma.notification.create({
    data: {
      userId,
      type,
      payload: stringifyJson(payload),
    },
  });
}

/** 报名状态变更通知 */
export async function notifyApplicationStatus(
  userId: string,
  clubName: string,
  statusLabel: string,
  applicationId: string,
) {
  await notifyUser(userId, "application_status", {
    title: "报名状态更新",
    body: `${clubName}：${statusLabel}`,
    href: `/me/applications#${applicationId}`,
  });
}

/**
 * 收藏社团招新截止提醒（登录时触发，避免重复：24h 内同 club 不重复建）
 */
export async function ensureFavoriteDeadlineReminders(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.notifyDeadlineReminders) return;

  const favs = await prisma.favorite.findMany({
    where: { userId },
    include: { club: true },
  });
  const now = Date.now();
  for (const f of favs) {
    const end = f.club.recruitEnd.getTime();
    const msLeft = end - now;
    if (msLeft <= 0 || msLeft > 24 * 3600 * 1000) continue;
    if (f.club.status !== "PUBLISHED") continue;

    const since = new Date(now - 24 * 3600 * 1000);
    const exists = await prisma.notification.findFirst({
      where: {
        userId,
        type: "recruit_deadline",
        createdAt: { gte: since },
        payload: { contains: f.clubId },
      },
    });
    if (exists) continue;

    const hours = Math.ceil(msLeft / 3600000);
    await notifyUser(userId, "recruit_deadline", {
      title: "招新即将截止",
      body: `你收藏的「${f.club.name}」将在约 ${hours} 小时后截止报名`,
      href: `/clubs/${f.clubId}`,
      clubId: f.clubId,
    });
  }
}
