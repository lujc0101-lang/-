import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export default async function MePage() {
  const u = await getSessionUser();
  if (!u) redirect("/login?next=/me");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">我的</h1>
        <p className="text-sm text-muted">
          {u.name} · {u.email}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/me/applications"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:bg-border/20"
        >
          <div className="font-semibold text-fg">我的报名</div>
          <p className="mt-1 text-sm text-muted">查看进度与历史记录</p>
        </Link>
        <Link
          href="/me/profile"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:bg-border/20"
        >
          <div className="font-semibold text-fg">个人画像</div>
          <p className="mt-1 text-sm text-muted">问卷 / 对话匹配档案</p>
        </Link>
        <Link
          href="/me/favorites"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:bg-border/20"
        >
          <div className="font-semibold text-fg">收藏夹</div>
          <p className="mt-1 text-sm text-muted">管理意向社团</p>
        </Link>
        <Link
          href="/publish"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:bg-border/20"
        >
          <div className="font-semibold text-fg">发布帖子</div>
          <p className="mt-1 text-sm text-muted">提交社区内容（先审后发）</p>
        </Link>
      </div>
    </div>
  );
}
