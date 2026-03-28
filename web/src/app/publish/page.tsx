"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TYPES = [
  { v: "RECRUIT", l: "招新 / 纳新" },
  { v: "ACTIVITY", l: "活动" },
  { v: "DISCUSS", l: "讨论 / 求助" },
] as const;

type ClubOpt = { id: string; name: string };

export default function PublishPage() {
  const router = useRouter();
  const [type, setType] = useState<string>("DISCUSS");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [clubId, setClubId] = useState("");
  const [clubs, setClubs] = useState<ClubOpt[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (!me.user) {
        router.replace("/login?next=/publish");
        return;
      }
      const r = await fetch("/api/clubs", { cache: "no-store" });
      const j = await r.json();
      setClubs((j.clubs ?? []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
    })();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const tags = tagsRaw
      .split(/[,，\s]+/)
      .map((t) => t.replace(/^#/, "").trim())
      .filter(Boolean);
    const r = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title: title.trim() || null,
        content: content.trim(),
        tags,
        clubId: clubId || null,
      }),
    });
    const j = await r.json();
    setLoading(false);
    if (!r.ok) {
      setErr(j.error ?? "发布失败");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-[26px] font-medium text-fg md:text-[30px]">发布</h1>
        <p className="mt-2 text-[14px] text-[var(--muted)]">提交后需管理员审核通过才会在社区展示。</p>
      </div>

      <form onSubmit={onSubmit} className="apple-panel space-y-5 p-6 md:p-8">
        <label className="block space-y-2">
          <span className="text-[14px] font-medium text-fg">类型</span>
          <select className="apple-field apple-select" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => (
              <option key={t.v} value={t.v}>
                {t.l}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-[14px] font-medium text-fg">标题（可选）</span>
          <input className="apple-field" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
        </label>

        <label className="block space-y-2">
          <span className="text-[14px] font-medium text-fg">正文</span>
          <textarea
            className="apple-field min-h-[160px] resize-y"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={8000}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-[14px] font-medium text-fg">话题标签</span>
          <input
            className="apple-field"
            placeholder="用逗号或空格分隔，如：机器人, 招新"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-[14px] font-medium text-fg">关联社团（可选）</span>
          <select className="apple-field apple-select" value={clubId} onChange={(e) => setClubId(e.target.value)}>
            <option value="">不关联</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {err && <p className="text-[14px] text-red-600">{err}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={loading} className="apple-cta disabled:opacity-50">
            {loading ? "提交中…" : "提交审核"}
          </button>
          <Link href="/" className="apple-cta-secondary inline-flex items-center text-[14px]">
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
