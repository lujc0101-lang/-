"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CLUB_CATEGORIES } from "@/lib/constants";

type ClubRow = {
  id: string;
  name: string;
  slogan: string;
  category: string;
  tags: string[];
  recruiting: boolean;
  state: string;
  coverUrl: string | null;
  applicationsCount: number;
  pv7d: number;
};

export default function ClubsDiscoverPage() {
  const [clubs, setClubs] = useState<ClubRow[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("default");
  const [recruitingOnly, setRecruitingOnly] = useState(false);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (sort) p.set("sort", sort);
    if (recruitingOnly) p.set("recruitingOnly", "1");
    if (category) p.set("category", category);
    return p.toString();
  }, [q, sort, recruitingOnly, category]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await fetch(`/api/clubs?${query}`, { cache: "no-store" });
      const j = await r.json();
      if (!cancelled) {
        setClubs(j.clubs ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  useEffect(() => {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "club_list_view", source: "clubs_page" }),
    });
  }, []);

  return (
    <div className="space-y-10 md:space-y-12">
      <div className="text-center md:text-left">
        <h1 className="text-[28px] font-medium leading-snug text-fg md:text-[34px]">发现</h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted)] md:mx-0 md:text-[16px]">
          搜索、筛选并按你的节奏浏览社团。
        </p>
      </div>

      <div className="apple-panel p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center">
          <input
            className="apple-field lg:min-w-0 lg:flex-1"
            placeholder="搜索名称或关键词"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="搜索社团"
          />
          <select
            className="apple-field apple-select lg:w-44"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="分类"
          >
            <option value="">所有分类</option>
            {CLUB_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="apple-field apple-select lg:w-48"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="排序"
          >
            <option value="default">推荐排序</option>
            <option value="hot">热度</option>
            <option value="new">最新</option>
            <option value="name">名称</option>
          </select>
          <label className="flex cursor-pointer items-center gap-2 text-[14px] text-[var(--muted)] lg:shrink-0">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--muted2)] text-accent accent-[var(--accent)]"
              checked={recruitingOnly}
              onChange={(e) => setRecruitingOnly(e.target.checked)}
            />
            仅招新中
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-[15px] text-[var(--muted)]">加载中…</p>
      ) : clubs.length === 0 ? (
        <div className="apple-panel px-8 py-16 text-center">
          <p className="text-[17px] text-[var(--muted)]">没有找到符合条件的社团。</p>
          <button
            type="button"
            className="apple-link mt-6 text-[15px] font-normal"
            onClick={() => {
              setQ("");
              setCategory("");
              setRecruitingOnly(false);
              setSort("default");
            }}
          >
            清除筛选
          </button>
        </div>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {clubs.map((c) => (
            <Link key={c.id} href={`/clubs/${c.id}`} className="group block">
              <div className="apple-panel-soft aspect-[16/10] overflow-hidden rounded-[18px] bg-[var(--chip-off)]">
                {c.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.coverUrl}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.02]"
                  />
                ) : null}
              </div>
              <div className="mt-4 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[17px] font-medium leading-snug text-fg">{c.name}</span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      c.recruiting
                        ? "bg-[rgba(52,199,89,0.15)] text-[#1d1d1f]"
                        : "bg-[var(--chip-off)] text-[var(--muted)]"
                    }`}
                  >
                    {c.recruiting ? "招新中" : c.state === "upcoming" ? "未开始" : "已结束"}
                  </span>
                </div>
                <p className="line-clamp-2 text-[14px] leading-relaxed text-[var(--muted)]">{c.slogan}</p>
                <p className="pt-1 text-[12px] text-[var(--muted2)]">
                  {c.category} · 报名 {c.applicationsCount}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
