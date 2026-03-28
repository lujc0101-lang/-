"use client";

import { useState } from "react";

export default function AdminInvitePage() {
  const [clubId, setClubId] = useState("");
  const [days, setDays] = useState(180);
  const [out, setOut] = useState<string | null>(null);

  async function gen(e: React.FormEvent) {
    e.preventDefault();
    setOut(null);
    const r = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubId: clubId || undefined, expiresInDays: days }),
    });
    const j = await r.json();
    if (!r.ok) setOut(j.error ?? "失败");
    else setOut(`邀请码：${j.code}，到期：${new Date(j.expiresAt).toLocaleString("zh-CN")}`);
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-bold text-fg">生成社长邀请码</h1>
      <form onSubmit={gen} className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <label className="block space-y-1 text-sm">
          <span className="text-muted">绑定社团 ID（可空，则仅生成占位码需在后台手动关联）</span>
          <input className="w-full rounded-xl border border-border bg-bg px-3 py-2" value={clubId} onChange={(e) => setClubId(e.target.value)} placeholder="club_..." />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted">有效天数</span>
          <input type="number" className="w-full rounded-xl border border-border bg-bg px-3 py-2" value={days} min={1} max={365} onChange={(e) => setDays(Number(e.target.value))} />
        </label>
        <button type="submit" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white">
          生成
        </button>
        {out && <p className="text-sm text-muted whitespace-pre-wrap">{out}</p>}
      </form>
    </div>
  );
}
