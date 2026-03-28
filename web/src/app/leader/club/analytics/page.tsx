"use client";

import { useEffect, useState } from "react";
import { APPLICATION_STATUS_LABEL } from "@/lib/constants";
import type { ApplicationStatus } from "@prisma/client";

export default function LeaderAnalyticsPage() {
  const [data, setData] = useState<null | {
    pv7d: number;
    applications: number;
    statusDistribution: Partial<Record<ApplicationStatus, number>>;
  }>(null);

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/leader/analytics");
      const j = await r.json();
      setData(j.metrics);
    })();
  }, []);

  if (!data) return <p className="text-sm text-muted">加载中…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-fg">社团数据简版</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted">近 7 日详情页浏览（去重会话口径依赖服务端）</div>
          <div className="mt-2 text-3xl font-bold text-fg">{data.pv7d}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted">累计报名</div>
          <div className="mt-2 text-3xl font-bold text-fg">{data.applications}</div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="text-sm font-semibold text-fg">状态分布</div>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          {Object.entries(data.statusDistribution ?? {}).map(([k, v]) => (
            <li key={k} className="flex justify-between">
              <span>{APPLICATION_STATUS_LABEL[k] ?? k}</span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
