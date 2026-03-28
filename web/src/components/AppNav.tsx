import Link from "next/link";
import type { SessionUser } from "@/lib/session";
import { NavAccount } from "./NavAccount";

export function AppNav({ user }: { user: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-11 max-w-[1024px] items-center gap-2 px-4 md:h-12 md:px-[22px]">
        <Link href="/" className="shrink-0 text-[17px] font-medium text-fg md:text-[18px]" aria-label="社区首页">
          招新
        </Link>

        <nav className="flex flex-1 justify-center gap-6 md:gap-9" aria-label="主导航">
          <Link href="/" className="nav-pill">
            社区
          </Link>
          <Link href="/clubs" className="nav-pill">
            社团
          </Link>
          <Link href="/publish" className="nav-pill hidden sm:inline-flex">
            发布
          </Link>
        </nav>

        <div className="shrink-0">
          <NavAccount user={user} />
        </div>
      </div>
    </header>
  );
}
