import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getManagedClubId } from "@/lib/leader";

const card =
  "block rounded-2xl border border-border bg-card p-5 shadow-sm hover:bg-border/15";

export default async function LeaderHomePage() {
  const u = await getSessionUser();
  if (!u || u.role !== "LEADER") redirect("/login?next=/leader");
  const clubId = await getManagedClubId(u.userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">社长工作台</h1>
        <p className="text-sm text-muted">
          {clubId ? `已绑定社团 ID：${clubId}` : "尚未通过邀请码绑定社团"}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link className={card} href="/leader/club/edit">
          <div className="font-semibold text-fg">编辑社团资料</div>
          <p className="mt-1 text-sm text-muted">文案、招新时间、联系方式等</p>
        </Link>
        <Link className={card} href="/leader/club/form">
          <div className="font-semibold text-fg">配置报名表</div>
          <p className="mt-1 text-sm text-muted">最多 5 道自定义题</p>
        </Link>
        <Link className={card} href="/leader/club/applications">
          <div className="font-semibold text-fg">报名管理</div>
          <p className="mt-1 text-sm text-muted">状态流转与导出</p>
        </Link>
        <Link className={card} href="/leader/club/analytics">
          <div className="font-semibold text-fg">数据简版</div>
          <p className="mt-1 text-sm text-muted">近 7 日浏览与报名分布</p>
        </Link>
      </div>
    </div>
  );
}
