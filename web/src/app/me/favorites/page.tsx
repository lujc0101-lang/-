import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ClubStatus } from "@prisma/client";

export default async function FavoritesPage() {
  const u = await getSessionUser();
  if (!u) redirect("/login?next=/me/favorites");

  const rows = await prisma.favorite.findMany({
    where: { userId: u.userId },
    include: { club: true },
    orderBy: { createdAt: "desc" },
  });

  const list = rows.filter((r) => r.club.status === ClubStatus.PUBLISHED);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-fg">收藏夹</h1>
        <Link href="/clubs" className="text-sm text-accent hover:underline">
          逛社团
        </Link>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-muted">暂无收藏</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((f) => (
            <li key={f.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="font-semibold text-fg">{f.club.name}</div>
              <p className="mt-1 text-xs text-muted">{f.club.slogan}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-accent">
                <Link href={`/clubs/${f.clubId}`}>详情</Link>
                <Link href={`/apply/${f.clubId}`}>报名</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
