"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const item =
  "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium text-[var(--muted)] transition-colors md:text-[12px]";
const itemActive = "text-[var(--accent)]";

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) return null;

  const onCommunity = pathname === "/" || pathname.startsWith("/posts/");
  const onClubs = pathname.startsWith("/clubs");
  const onPublish = pathname.startsWith("/publish");
  const onMe = pathname.startsWith("/me");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--nav-border)] bg-[rgba(255,255,255,0.92)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:pb-0"
      aria-label="底部导航"
    >
      <div className="mx-auto flex max-w-[1024px]">
        <Link href="/" className={`${item} ${onCommunity ? itemActive : ""}`}>
          <span className="text-[18px] leading-none md:text-[20px]" aria-hidden>
            ◎
          </span>
          社区
        </Link>
        <Link href="/clubs" className={`${item} ${onClubs ? itemActive : ""}`}>
          <span className="text-[18px] leading-none md:text-[20px]" aria-hidden>
            ◆
          </span>
          社团
        </Link>
        <Link href="/publish" className={`${item} ${onPublish ? itemActive : ""}`}>
          <span className="text-[18px] leading-none md:text-[20px]" aria-hidden>
            ＋
          </span>
          发布
        </Link>
        <Link href="/me" className={`${item} ${onMe ? itemActive : ""}`}>
          <span className="text-[18px] leading-none md:text-[20px]" aria-hidden>
            ◐
          </span>
          我的
        </Link>
      </div>
    </nav>
  );
}
