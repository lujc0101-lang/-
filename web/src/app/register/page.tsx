"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RoleTab = "STUDENT" | "LEADER";

export default function RegisterPage() {
  const router = useRouter();
  const [tab, setTab] = useState<RoleTab>("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const body =
      tab === "STUDENT"
        ? { role: "STUDENT" as const, email, password, name, studentId: studentId || undefined }
        : { role: "LEADER" as const, email, password, name, inviteCode };
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    setLoading(false);
    if (!r.ok) {
      setErr(j.error ?? "注册失败");
      return;
    }
    router.replace(tab === "LEADER" ? "/leader" : "/me");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[26rem] space-y-8">
      <div className="text-center">
        <h1 className="text-[26px] font-medium text-fg md:text-[30px]">注册</h1>
        <p className="mt-3 text-[15px] text-[var(--muted)]">
          已有账户？
          <Link href="/login" className="apple-link ml-1">
            登录
          </Link>
        </p>
      </div>

      <div className="flex rounded-full bg-[var(--chip-off)] p-1">
        <button
          type="button"
          className={`flex-1 rounded-full py-2 text-[13px] font-medium transition-colors md:text-[14px] ${
            tab === "STUDENT" ? "bg-white text-fg shadow-sm" : "text-[var(--muted)]"
          }`}
          onClick={() => setTab("STUDENT")}
        >
          新生
        </button>
        <button
          type="button"
          className={`flex-1 rounded-full py-2 text-[13px] font-medium transition-colors md:text-[14px] ${
            tab === "LEADER" ? "bg-white text-fg shadow-sm" : "text-[var(--muted)]"
          }`}
          onClick={() => setTab("LEADER")}
        >
          社长
        </button>
      </div>

      <form onSubmit={onSubmit} className="apple-panel space-y-5 p-6 md:p-8">
        <label className="block space-y-2">
          <span className="text-[13px] text-[var(--muted2)]">姓名</span>
          <input className="apple-field" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block space-y-2">
          <span className="text-[13px] text-[var(--muted2)]">邮箱</span>
          <input
            className="apple-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
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
            minLength={6}
          />
        </label>
        {tab === "STUDENT" && (
          <label className="block space-y-2">
            <span className="text-[13px] text-[var(--muted2)]">学号（选填）</span>
            <input className="apple-field" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
          </label>
        )}
        {tab === "LEADER" && (
          <label className="block space-y-2">
            <span className="text-[13px] text-[var(--muted2)]">邀请码</span>
            <input
              className="apple-field"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
            />
          </label>
        )}
        {err && <p className="text-[14px] text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="apple-cta w-full min-w-0 disabled:pointer-events-none disabled:opacity-40"
        >
          {loading ? "提交中…" : "创建账户"}
        </button>
      </form>
    </div>
  );
}
