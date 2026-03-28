import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AppNav } from "@/components/AppNav";
import { BottomNav } from "@/components/BottomNav";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "招新",
  description: "发现社团，智能匹配，一站式报名",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <AppNav user={user} />
        <main className="mx-auto max-w-[1024px] px-4 pb-24 pt-10 md:px-[22px] md:pb-28 md:pt-14">
          {children}
        </main>
        <BottomNav />
        <footer className="border-t border-[var(--nav-border)] bg-[var(--bg)] pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto max-w-[1024px] px-4 py-8 md:px-[22px] md:py-10">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-center md:gap-10">
              <Link href="/clubs" className="apple-link text-[12px]">
                社团与匹配
              </Link>
              <span className="text-[12px] text-[var(--muted2)]">本地演示 · 非商业用途</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
