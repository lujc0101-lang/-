"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { MatchAnswers } from "@/lib/types";

const Q1 = ["文艺", "体育", "科技", "志愿服务", "学术", "社会实践"] as const;

export default function ClubsMatchPage() {
  const [answers, setAnswers] = useState<MatchAnswers>({
    q1Interests: ["科技"],
    q2WeeklyHours: "3to6",
    q3ActivityPref: "项目产出",
    q4TrainingFreq: "medium",
    q5BeginnerFriendly: true,
  });
  const [results, setResults] = useState<
    { clubId: string; name: string; score: number; reasons: string[] }[] | null
  >(null);
  const [err, setErr] = useState<string | null>(null);
  const [save, setSave] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "match_start" }),
    });
  }, []);

  const canSubmit = useMemo(() => answers.q1Interests.length > 0, [answers.q1Interests.length]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setErr(null);
    const started = performance.now();
    const r = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, save }),
    });
    const j = await r.json();
    setLoading(false);
    if (!r.ok) {
      setErr(j.error ?? "匹配失败");
      return;
    }
    setResults(j.results);
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "match_complete",
        durationMs: Math.round(performance.now() - started),
      }),
    });
  }

  function toggleInterest(x: string) {
    setAnswers((a) => {
      const set = new Set(a.q1Interests);
      if (set.has(x)) set.delete(x);
      else set.add(x);
      return { ...a, q1Interests: Array.from(set) };
    });
  }

  return (
    <div className="space-y-10 md:space-y-12">
      <div className="text-center md:text-left">
        <h1 className="text-[28px] font-medium leading-snug text-fg md:text-[34px]">问卷匹配</h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted)] md:mx-0 md:text-[16px]">
          回答几个简短问题，为你生成带说明的推荐列表。登录后可保存到个人画像。也可尝试
          <Link href="/clubs/match/nl" className="mx-1 text-[var(--accent)] underline-offset-2 hover:underline">
            对话匹配
          </Link>
          。
        </p>
      </div>

      <form onSubmit={onSubmit} className="apple-panel space-y-8 p-6 md:p-8">
        <section className="space-y-3">
          <div className="text-[15px] font-medium text-fg md:text-[16px]">1. 兴趣领域</div>
          <p className="text-[13px] text-[var(--muted2)]">可多选</p>
          <div className="flex flex-wrap gap-2">
            {Q1.map((x) => (
              <button
                type="button"
                key={x}
                onClick={() => toggleInterest(x)}
                className={`rounded-full px-4 py-2 text-[14px] transition-colors ${
                  answers.q1Interests.includes(x)
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--chip-off)] text-fg hover:bg-[#dedee3]"
                }`}
              >
                {x}
              </button>
            ))}
          </div>
        </section>

        <label className="block space-y-2">
          <span className="text-[15px] font-medium text-fg md:text-[16px]">2. 每周可投入时间</span>
          <select
            className="apple-field apple-select"
            value={answers.q2WeeklyHours}
            onChange={(e) =>
              setAnswers((a) => ({ ...a, q2WeeklyHours: e.target.value as MatchAnswers["q2WeeklyHours"] }))
            }
          >
            <option value="lte3">≤3 小时/周</option>
            <option value="3to6">3～6 小时/周</option>
            <option value="6to10">6～10 小时/周</option>
            <option value="gt10">10 小时以上/周</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-[15px] font-medium text-fg md:text-[16px]">3. 更偏好的活动类型</span>
          <select
            className="apple-field apple-select"
            value={answers.q3ActivityPref}
            onChange={(e) =>
              setAnswers((a) => ({ ...a, q3ActivityPref: e.target.value as MatchAnswers["q3ActivityPref"] }))
            }
          >
            <option value="表演比赛">表演 / 比赛</option>
            <option value="训练提升">训练提升</option>
            <option value="社交松弛">社交松弛</option>
            <option value="项目产出">项目产出</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-[15px] font-medium text-fg md:text-[16px]">4. 可接受的例会 / 培训频率</span>
          <select
            className="apple-field apple-select"
            value={answers.q4TrainingFreq}
            onChange={(e) =>
              setAnswers((a) => ({ ...a, q4TrainingFreq: e.target.value as MatchAnswers["q4TrainingFreq"] }))
            }
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </label>

        <label className="flex cursor-pointer items-center gap-3 text-[15px] text-fg">
          <input
            type="checkbox"
            className="h-[18px] w-[18px] rounded border-[var(--muted2)] accent-[var(--accent)]"
            checked={answers.q5BeginnerFriendly}
            onChange={(e) => setAnswers((a) => ({ ...a, q5BeginnerFriendly: e.target.checked }))}
          />
          更希望零基础友好的社团
        </label>

        <label className="flex cursor-pointer items-center gap-3 text-[14px] text-[var(--muted)]">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--accent)]"
            checked={save}
            onChange={(e) => setSave(e.target.checked)}
          />
          登录时保存结果到「个人画像」
        </label>

        {err && <p className="text-[14px] text-red-600">{err}</p>}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="apple-cta disabled:pointer-events-none disabled:opacity-40"
        >
          {loading ? "正在计算…" : "查看推荐"}
        </button>
      </form>

      {results && (
        <section className="space-y-6">
          <h2 className="text-center text-[21px] font-medium text-fg md:text-left md:text-[24px]">为你推荐</h2>
          {results.length === 0 ? (
            <p className="text-center text-[15px] text-[var(--muted)] md:text-left">
              当前没有可推荐的社团（可能不在招新期内）。
            </p>
          ) : (
            <div className="space-y-4">
              {results.map((r) => (
                <div key={r.clubId} className="apple-panel-soft px-6 py-5 md:px-7 md:py-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[17px] font-medium text-fg">{r.name}</span>
                    <span className="text-[12px] text-[var(--muted2)]">匹配度 {r.score}</span>
                  </div>
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
                      进一步了解
                    </Link>
                    <Link className="apple-link text-[14px]" href={`/apply/${r.clubId}`}>
                      报名参加
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
