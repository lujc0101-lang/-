"use client";

import { useEffect, useState } from "react";
import { ApplicationStatus } from "@prisma/client";
import { APPLICATION_STATUS_LABEL } from "@/lib/constants";

type Row = {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  user: { name: string; email: string };
  commonAnswers: Record<string, string>;
};

export default function LeaderApplicationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    const r = await fetch(`/api/leader/applications?${p.toString()}`);
    const j = await r.json();
    setRows(j.applications ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function patchStatus(id: string, status: ApplicationStatus) {
    await fetch(`/api/leader/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    void load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-xl font-bold text-fg">报名管理</h1>
        <div className="flex flex-wrap gap-2">
          <input
            className="rounded-xl border border-border bg-bg px-3 py-2 text-sm"
            placeholder="搜索姓名/学号"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="button" className="rounded-xl border border-border bg-card px-3 py-2 text-sm" onClick={() => void load()}>
            搜索
          </button>
          <a
            href="/api/leader/export"
            className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white"
          >
            导出 CSV
          </a>
        </div>
      </div>
      {loading ? (
        <p className="text-sm text-muted">加载中…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="min-w-[900px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-left text-xs text-muted">
                <th className="p-2">学生</th>
                <th className="p-2">学号</th>
                <th className="p-2">手机</th>
                <th className="p-2">状态</th>
                <th className="p-2">时间</th>
                <th className="p-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="p-2">
                    {r.user.name}
                    <div className="text-[11px] text-muted">{r.user.email}</div>
                  </td>
                  <td className="p-2">{r.commonAnswers.studentId}</td>
                  <td className="p-2">{r.commonAnswers.phone}</td>
                  <td className="p-2">{APPLICATION_STATUS_LABEL[r.status]}</td>
                  <td className="p-2 text-xs text-muted">{new Date(r.createdAt).toLocaleString("zh-CN")}</td>
                  <td className="p-2">
                    <select
                      className="rounded-lg border border-border bg-bg px-2 py-1 text-xs"
                      value={r.status}
                      onChange={(e) => void patchStatus(r.id, e.target.value as ApplicationStatus)}
                    >
                      {Object.keys(APPLICATION_STATUS_LABEL).map((k) => (
                        <option key={k} value={k}>
                          {APPLICATION_STATUS_LABEL[k]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
