"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/lib/session";

const menuItem =
  "block px-4 py-2.5 text-[14px] text-fg hover:bg-[var(--apple-hover)] transition-colors rounded-lg mx-1";

export function NavAccount({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-4 md:gap-5">
        <Link href="/login" className="apple-link text-[12px] md:text-[13px]">
          登录
        </Link>
        <Link href="/register" className="apple-cta min-w-0 px-4 py-1.5 text-[12px] md:px-5 md:py-2 md:text-[13px]">
          注册
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        className="flex max-w-[9rem] items-center gap-0.5 rounded-full py-1 pl-2.5 pr-2 text-left text-[12px] text-fg hover:bg-[var(--apple-hover)] md:max-w-[10rem] md:text-[13px]"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate font-normal">{user.name}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden className="shrink-0 text-muted opacity-70">
          <path fill="currentColor" d="M5 6 0 0h10z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[220px] overflow-hidden rounded-[18px] border border-[var(--nav-border)] bg-[rgba(255,255,255,0.94)] py-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl"
        >
          <Link href="/me" className={menuItem} role="menuitem" onClick={() => setOpen(false)}>
            我的
          </Link>
          <Link
            href="/notifications"
            className={menuItem}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            通知
          </Link>
          {user.role === "LEADER" && (
            <Link href="/leader" className={menuItem} role="menuitem" onClick={() => setOpen(false)}>
              社长工作台
            </Link>
          )}
          {user.role === "ADMIN" && (
            <Link href="/admin" className={menuItem} role="menuitem" onClick={() => setOpen(false)}>
              管理后台
            </Link>
          )}
          <div className="mx-2 my-2 border-t border-[var(--border)]" />
          <button
            type="button"
            role="menuitem"
            className={`${menuItem} w-full text-left text-muted`}
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/";
            }}
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
