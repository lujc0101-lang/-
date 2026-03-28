import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const u = await getSessionUser();
  if (!u) redirect("/login?next=/me/profile");

  const p = await prisma.matchProfile.findUnique({ where: { userId: u.userId } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-fg">个人画像</h1>
      {!p ? (
        <div className="rounded-2xl border border-dashed border-border bg-bg px-6 py-10 text-sm text-muted">
          尚未保存匹配档案，去
          <Link className="mx-1 text-accent hover:underline" href="/match">
            问卷匹配
          </Link>
          或
          <Link className="mx-1 text-accent hover:underline" href="/match/nl">
            对话匹配
          </Link>
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs text-muted">
            更新于 {p.updatedAt.toLocaleString("zh-CN")}
          </p>
          {p.nlSource && (
            <div className="rounded-xl bg-bg p-3 text-sm text-muted">
              <div className="font-medium text-fg">原始描述（对话）</div>
              <p className="mt-2 whitespace-pre-wrap">{p.nlSource}</p>
            </div>
          )}
          <pre className="overflow-x-auto rounded-xl bg-bg p-4 text-xs text-muted">
            {JSON.stringify(JSON.parse(p.answers), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
