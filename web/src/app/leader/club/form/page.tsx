"use client";

import { useEffect, useState } from "react";

export default function LeaderFormConfigPage() {
  const [json, setJson] = useState("[]");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/leader/club");
      const j = await r.json();
      if (j.club?.customForm) setJson(JSON.stringify(j.club.customForm, null, 2));
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    let fields: unknown;
    try {
      fields = JSON.parse(json);
    } catch {
      setMsg("JSON 格式错误");
      return;
    }
    const r = await fetch("/api/leader/form", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });
    const j = await r.json();
    if (!r.ok) setMsg(j.error ?? "保存失败");
    else setMsg("已保存");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-bold text-fg">报名表自定义题目</h1>
      <p className="text-sm text-muted">
        JSON 数组，每项包含 id / label / type / required / options（select、multiselect 必填）。示例见 PRD 或种子数据。
      </p>
      {msg && <p className="text-sm text-muted">{msg}</p>}
      <form onSubmit={save} className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <textarea
          className="min-h-[320px] w-full rounded-xl border border-border bg-bg px-3 py-2 font-mono text-xs"
          value={json}
          onChange={(e) => setJson(e.target.value)}
        />
        <button type="submit" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white">
          保存
        </button>
      </form>
    </div>
  );
}
