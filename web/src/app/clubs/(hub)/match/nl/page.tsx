"use client";

import Link from "next/link";
import { useState } from "react";

export default function ClubsMatchNlPage() {
  const [text, setText] = useState("我喜欢篮球和摄影，一周大概四天有空，想交朋友也会一点代码。");
  const [summary, setSummary] = useState<string | null>(null);
  const [results, setResults] = useState<
    { clubId: string; name: string; score: number; reasons: string[] }[] | null
  >(null);
  const [err, setErr] = useState<string | null>(null);
  const [save, setSave] = useState(true);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const r = await fetch("/api/match/nl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, save }),
    });
    const j = await r.json();
    setLoading(false);
    if (!r.ok) {
      setErr(j.error ?? "解析失败，可改用问卷匹配");
      setSummary(null);
      setResults(null);
      return;
    }
    setSummary(j.summary);
    setResults(j.results);
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center md:text-left">
        <h1 className="text-[28px] font-medium leading-snug text-fg md:text-[34px]">对话匹配</h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted)] md:mx-0 md:text-[16px]">
          用自然语言描述兴趣与时间，系统抽取偏好并推荐社团。也可使用
          <Link href="/clubs/match" className="mx-1 text-[var(--accent)] underline-offset-2 hover:underline">
            问卷匹配
          </Link>
          。
        </p>
      </div>

      <form onSubmit={onSubmit} className="apple-panel space-y-4 p-6 md:p-8">
        <label className="block space-y-2">
          <span className="text-[15px] font-medium text-fg">描述你自己</span>
          <textarea
            className="apple-field min-h-[140px] resize-y"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-[14px] text-[var(--muted)]">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--accent)]"
            checked={save}
            onChange={(e) => setSave(e.target.checked)}
          />
          登录后保存解析结果到个人画像
        </label>
        {err && <p className="text-[14px] text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="apple-cta disabled:pointer-events-none disabled:opacity-40"
        >
          {loading ? "解析中…" : "生成推荐"}
        </button>
      </form>

      {summary && (
        <div className="apple-panel-soft p-5 text-[14px] text-[var(--muted)] md:p-6">
          <div className="font-medium text-fg">识别摘要</div>
          <p className="mt-2 leading-relaxed">{summary}</p>
        </div>
      )}

      {results && (
        <section className="space-y-4">
          <h2 className="text-[21px] font-medium text-fg md:text-[24px]">推荐</h2>
          <div className="space-y-4">
            {results.map((r) => (
              <div key={r.clubId} className="apple-panel-soft px-6 py-5 md:px-7 md:py-6">
                <div className="text-[17px] font-medium text-fg">{r.name}</div>
                <div className="text-[12px] text-[var(--muted2)]">匹配分 {r.score}</div>
                <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-[var(--muted)]">
                  {r.reasons.map((x) => (
                    <li key={x} className="flex gap-2">
                      <span className="text-[var(--accent)]">·</span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-6">
                  <Link className="apple-link text-[14px]" href={`/clubs/${r.clubId}`}>
                    详情
                  </Link>
                  <Link className="apple-link text-[14px]" href={`/apply/${r.clubId}`}>
                    报名
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
