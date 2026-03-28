"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tab =
  "rounded-full px-4 py-2 text-[14px] font-medium transition-colors md:px-5 md:text-[15px]";
const tabActive = "bg-[var(--accent)] text-white";
const tabIdle = "bg-[var(--chip-off)] text-fg hover:bg-[#dedee3]";

export function ClubsHubNav() {
  const pathname = usePathname();
  const show =
    pathname === "/clubs" || pathname === "/clubs/match" || pathname === "/clubs/match/nl";
  if (!show) return null;

  const onDiscover = pathname === "/clubs";
  const onMatch = pathname === "/clubs/match";
  const onNl = pathname === "/clubs/match/nl";

  return (
    <nav
      className="flex flex-wrap justify-center gap-2 border-b border-[var(--nav-border)] pb-4 md:justify-start"
      aria-label="社团分区"
    >
      <Link href="/clubs" className={`${tab} ${onDiscover ? tabActive : tabIdle}`}>
        发现
      </Link>
      <Link href="/clubs/match" className={`${tab} ${onMatch ? tabActive : tabIdle}`}>
        问卷匹配
      </Link>
      <Link href="/clubs/match/nl" className={`${tab} ${onNl ? tabActive : tabIdle}`}>
        对话匹配
      </Link>
    </nav>
  );
}
