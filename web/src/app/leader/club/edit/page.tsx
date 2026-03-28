"use client";

import { useEffect, useState } from "react";
import { CLUB_CATEGORIES } from "@/lib/constants";

type EditForm = {
  name: string;
  slogan: string;
  category: string;
  tags: string;
  description: string;
  coverUrl: string;
  activityTypes: string;
  intensity: "light" | "medium" | "heavy";
  beginnerFriendly: boolean;
  recruitStart: string;
  recruitEnd: string;
  recruitQuotaNote: string;
  applyNote: string;
  leaderDisplayName: string;
  contactEmail: string;
  submitReview: boolean;
};

export default function LeaderEditClubPage() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>({
    name: "",
    slogan: "",
    category: CLUB_CATEGORIES[0],
    tags: "科技创新, 夜训",
    description: "",
    coverUrl: "",
    activityTypes: "训练, 项目",
    intensity: "medium" as "light" | "medium" | "heavy",
    beginnerFriendly: false,
    recruitStart: "",
    recruitEnd: "",
    recruitQuotaNote: "",
    applyNote: "",
    leaderDisplayName: "",
    contactEmail: "",
    submitReview: false,
  });

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/leader/club");
      const j = await r.json();
      if (!j.club) {
        setLoading(false);
        setMsg("未绑定社团或无权访问");
        return;
      }
      const c = j.club;
      const contact = c.contact ?? {};
      setForm({
        name: c.name,
        slogan: c.slogan,
        category: c.category,
        tags: (c.tags as string[]).join(", "),
        description: c.description,
        coverUrl: c.coverUrl ?? "",
        activityTypes: (c.activityTypes as string[]).join(", "),
        intensity: c.intensity,
        beginnerFriendly: !!c.beginnerFriendly,
        recruitStart: c.recruitStart.slice(0, 16),
        recruitEnd: c.recruitEnd.slice(0, 16),
        recruitQuotaNote: c.recruitQuotaNote ?? "",
        applyNote: c.applyNote ?? "",
        leaderDisplayName: c.leaderDisplayName,
        contactEmail: (contact.email as string) ?? "",
        submitReview: false,
      });
      setLoading(false);
    })();
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const tags = form.tags.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
    const activityTypes = form.activityTypes.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
    const r = await fetch("/api/leader/club", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        slogan: form.slogan,
        category: form.category,
        tags,
        description: form.description,
        coverUrl: form.coverUrl || null,
        activityTypes,
        intensity: form.intensity,
        beginnerFriendly: form.beginnerFriendly,
        recruitStart: new Date(form.recruitStart).toISOString(),
        recruitEnd: new Date(form.recruitEnd).toISOString(),
        recruitQuotaNote: form.recruitQuotaNote || null,
        applyNote: form.applyNote || null,
        leaderDisplayName: form.leaderDisplayName,
        contact: { email: form.contactEmail || undefined },
        submitReview: form.submitReview,
      }),
    });
    const j = await r.json();
    if (!r.ok) {
      setMsg(j.error ?? "保存失败");
      return;
    }
    setMsg("已保存" + (form.submitReview ? "，并已提交审核" : ""));
  }

  if (loading) return <p className="text-sm text-muted">加载中…</p>;

  return (
    <form onSubmit={onSave} className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h1 className="text-xl font-bold text-fg">编辑社团资料</h1>
      {msg && <p className="text-sm text-muted">{msg}</p>}
      <label className="block space-y-1 text-sm">
        <span className="text-muted">名称</span>
        <input className="w-full rounded-xl border border-border bg-bg px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted">一句话</span>
        <input className="w-full rounded-xl border border-border bg-bg px-3 py-2" value={form.slogan} onChange={(e) => setForm({ ...form, slogan: e.target.value })} required />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted">分类</span>
        <select className="w-full rounded-xl border border-border bg-bg px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {CLUB_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted">标签（逗号分隔）</span>
        <input className="w-full rounded-xl border border-border bg-bg px-3 py-2" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted">详细介绍（支持换行）</span>
        <textarea className="min-h-[160px] w-full rounded-xl border border-border bg-bg px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted">封面图 URL</span>
        <input className="w-full rounded-xl border border-border bg-bg px-3 py-2" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted">日常活动类型（逗号分隔）</span>
        <input className="w-full rounded-xl border border-border bg-bg px-3 py-2" value={form.activityTypes} onChange={(e) => setForm({ ...form, activityTypes: e.target.value })} />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted">强度</span>
        <select className="w-full rounded-xl border border-border bg-bg px-3 py-2" value={form.intensity} onChange={(e) => setForm({ ...form, intensity: e.target.value as typeof form.intensity })}>
          <option value="light">轻</option>
          <option value="medium">中</option>
          <option value="heavy">重</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.beginnerFriendly} onChange={(e) => setForm({ ...form, beginnerFriendly: e.target.checked })} />
        零基础友好
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="text-muted">招新开始</span>
          <input type="datetime-local" className="w-full rounded-xl border border-border bg-bg px-3 py-2" value={form.recruitStart} onChange={(e) => setForm({ ...form, recruitStart: e.target.value })} required />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted">招新结束</span>
          <input type="datetime-local" className="w-full rounded-xl border border-border bg-bg px-3 py-2" value={form.recruitEnd} onChange={(e) => setForm({ ...form, recruitEnd: e.target.value })} required />
        </label>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="text-muted">名额说明（可选）</span>
        <input className="w-full rounded-xl border border-border bg-bg px-3 py-2" value={form.recruitQuotaNote} onChange={(e) => setForm({ ...form, recruitQuotaNote: e.target.value })} />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted">报名额外提示（可选）</span>
        <input className="w-full rounded-xl border border-border bg-bg px-3 py-2" value={form.applyNote} onChange={(e) => setForm({ ...form, applyNote: e.target.value })} />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted">社长对外展示名</span>
        <input className="w-full rounded-xl border border-border bg-bg px-3 py-2" value={form.leaderDisplayName} onChange={(e) => setForm({ ...form, leaderDisplayName: e.target.value })} required />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted">联系邮箱（写入 JSON contact）</span>
        <input className="w-full rounded-xl border border-border bg-bg px-3 py-2" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
      </label>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={form.submitReview} onChange={(e) => setForm({ ...form, submitReview: e.target.checked })} />
        保存并提交管理员审核（状态设为待审核）
      </label>
      <button type="submit" className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white">
        保存
      </button>
    </form>
  );
}
