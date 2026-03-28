import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = await getSessionUser();
  if (!u || u.role !== "ADMIN") {
    redirect("/login?next=/admin");
  }

  const link =
    "text-[13px] text-[var(--muted)] hover:text-fg md:text-[14px] whitespace-nowrap";

  return (
    <div className="space-y-6">
      <nav
        className="flex flex-wrap gap-x-5 gap-y-2 border-b border-[var(--border)] pb-4"
        aria-label="管理后台"
      >
        <Link href="/admin/dashboard" className={link}>
          看板
        </Link>
        <Link href="/admin/posts" className={link}>
          帖子审核
        </Link>
        <Link href="/admin/clubs" className={link}>
          社团
        </Link>
        <Link href="/admin/invite" className={link}>
          邀请码
        </Link>
        <Link href="/" className={`${link} ml-auto`}>
          回前台
        </Link>
      </nav>
      {children}
    </div>
  );
}
