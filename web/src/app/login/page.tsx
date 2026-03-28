"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("student@demo.edu");
  const [password, setPassword] = useState("student123");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json();
    setLoading(false);
    if (!r.ok) {
      setErr(j.error ?? "登录失败");
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    router.replace(next && next.startsWith("/") ? next : "/me");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[26rem] space-y-8">
      <div className="text-center">
        <h1 className="text-[26px] font-medium text-fg md:text-[30px]">登录</h1>
        <p className="mt-3 text-[15px] text-[var(--muted)]">
          没有账户？
          <Link href="/register" className="apple-link ml-1">
            立即创建
          </Link>
        </p>
      </div>
      <form onSubmit={onSubmit} className="apple-panel space-y-5 p-6 md:p-8">
        <label className="block space-y-2">
          <span className="text-[13px] text-[var(--muted2)]">邮箱</span>
          <input
            className="apple-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            autoComplete="email"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-[13px] text-[var(--muted2)]">密码</span>
          <input
            className="apple-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            autoComplete="current-password"
          />
        </label>
        {err && <p className="text-[14px] text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="apple-cta w-full min-w-0 disabled:pointer-events-none disabled:opacity-40"
        >
          {loading ? "请稍候…" : "继续"}
        </button>
      </form>
    </div>
  );
}
