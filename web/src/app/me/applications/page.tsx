import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUS_LABEL } from "@/lib/constants";

export default async function ApplicationsPage() {
  const u = await getSessionUser();
  if (!u) redirect("/login?next=/me/applications");

  const rows = await prisma.application.findMany({
    where: { userId: u.userId },
    include: { club: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-fg">我的报名</h1>
        <Link href="/clubs" className="text-sm text-accent hover:underline">
          去广场
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">暂无报名记录</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((a) => (
            <li
              id={a.id}
              key={a.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold text-fg">
                  {a.club?.name ?? (a.clubSnapshot ? JSON.parse(a.clubSnapshot).clubName : "未知社团")}
                </div>
                <span className="rounded-full bg-border/40 px-3 py-1 text-xs text-muted">
                  {APPLICATION_STATUS_LABEL[a.status] ?? a.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted">
                提交时间：{a.createdAt.toLocaleString("zh-CN")}
              </p>
              <div className="mt-2 flex gap-3 text-sm text-accent">
                {a.club && (
                  <Link href={`/clubs/${a.club.id}`} className="hover:underline">
                    社团详情
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
