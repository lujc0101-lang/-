"use client";

import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<null | {
    counts: Record<string, number>;
    funnel: { detailToApply: number; applyToSubmit: number };
    topClubsByApplications: { clubId: string; name: string; applications: number }[];
  }>(null);

  useEffect(() => {
    void (async () => {
      const r = await fetch(`/api/admin/dashboard?days=${days}`);
      const j = await r.json();
      setData(j);
    })();
  }, [days]);

  if (!data) return <p className="text-sm text-muted">加载中…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-fg">运营看板</h1>
        <label className="flex items-center gap-2 text-sm text-muted">
          区间（天）
          <input
            type="number"
            className="w-20 rounded-lg border border-border bg-bg px-2 py-1"
            value={days}
            min={1}
            max={30}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(data.counts).map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="text-xs text-muted">{k}</div>
            <div className="mt-1 text-2xl font-bold text-fg">{v}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="text-sm font-semibold text-fg">转化漏斗（估算）</div>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          <li>详情 → 打开报名页：{(data.funnel.detailToApply * 100).toFixed(1)}%</li>
          <li>报名页 → 提交：{(data.funnel.applyToSubmit * 100).toFixed(1)}%</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="text-sm font-semibold text-fg">报名量 Top 社团</div>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
          {data.topClubsByApplications.map((c) => (
            <li key={c.clubId}>
              {c.name} — {c.applications}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
