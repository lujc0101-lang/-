"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type PostRow = {
  id: string;
  type: string;
  title: string | null;
  content: string;
  images: string[];
  tags: string[];
  clubId: string | null;
  clubName?: string | null;
  pinned: boolean;
  createdAt: string;
  author: { id: string; name: string };
  likes: number;
  comments: number;
};

const typeLabel: Record<string, string> = {
  RECRUIT: "招新",
  ACTIVITY: "活动",
  DISCUSS: "讨论",
};

export function CommunityFeed() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (debouncedQ) p.set("q", debouncedQ);
    if (typeFilter) p.set("type", typeFilter);
    p.set("limit", "40");
    return p.toString();
  }, [debouncedQ, typeFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/posts?${query}`, { cache: "no-store" });
    const j = await r.json();
    setPosts(j.posts ?? []);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "community_feed_view" }),
    });
  }, []);

  return (
    <div className="space-y-8 md:space-y-10">
      <header className="text-center md:text-left">
        <h1 className="text-[28px] font-medium leading-snug text-fg md:text-[34px]">社区</h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted)] md:mx-0 md:text-[16px]">
          话题、招新帖与活动信息。支持搜索正文与标签。
        </p>
      </header>

      <div className="apple-panel space-y-4 p-5 md:p-6">
        <input
          className="apple-field w-full"
          placeholder="搜索帖子、话题…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="搜索帖子"
        />
        <div className="flex flex-wrap gap-2">
          {[
            { v: "", l: "全部" },
            { v: "RECRUIT", l: "招新" },
            { v: "ACTIVITY", l: "活动" },
            { v: "DISCUSS", l: "讨论" },
          ].map((x) => (
            <button
              key={x.v || "all"}
              type="button"
              onClick={() => setTypeFilter(x.v)}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors md:text-[14px] ${
                typeFilter === x.v
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--chip-off)] text-fg hover:bg-[#dedee3]"
              }`}
            >
              {x.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-[15px] text-[var(--muted)]">加载中…</p>
      ) : posts.length === 0 ? (
        <div className="apple-panel px-8 py-16 text-center">
          <p className="text-[17px] text-[var(--muted)]">暂无符合条件的帖子</p>
          <Link href="/publish" className="apple-link mt-6 inline-block text-[15px]">
            去发布
          </Link>
        </div>
      ) : (
        <ul className="space-y-5 md:space-y-6">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/posts/${p.id}`} className="block">
                <article
                  className={`apple-panel-soft overflow-hidden text-left transition hover:opacity-[0.98] ${
                    p.pinned ? "ring-2 ring-[var(--accent)]/25" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] px-5 py-3 md:px-6">
                    {p.pinned && (
                      <span className="rounded-md bg-[var(--accent)]/15 px-2 py-0.5 text-[11px] font-medium text-fg">
                        置顶
                      </span>
                    )}
                    <span className="rounded-md bg-[var(--chip-off)] px-2 py-0.5 text-[11px] text-[var(--muted)]">
                      {typeLabel[p.type] ?? p.type}
                    </span>
                    <span className="text-[13px] text-[var(--muted2)]">{p.author.name}</span>
                    {p.clubName && (
                      <span className="text-[13px] text-[var(--muted)]">· {p.clubName}</span>
                    )}
                  </div>
                  <div className="px-5 py-4 md:px-6 md:py-5">
                    {p.title && (
                      <h2 className="text-[17px] font-medium leading-snug text-fg md:text-[18px]">{p.title}</h2>
                    )}
                    <p className={`whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--muted)] ${p.title ? "mt-2" : ""} line-clamp-4`}>
                      {p.content}
                    </p>
                    {p.images[0] && (
                      <div className="mt-4 aspect-[16/9] max-h-48 overflow-hidden rounded-[14px] bg-[var(--chip-off)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    {p.tags.length > 0 && (
                      <p className="mt-3 text-[12px] text-[var(--muted2)]">
                        {p.tags.map((t) => (
                          <span key={t} className="mr-2">
                            #{t}
                          </span>
                        ))}
                      </p>
                    )}
                    <p className="mt-3 text-[12px] text-[var(--muted2)]">
                      {p.likes} 赞 · {p.comments} 评论
                    </p>
                  </div>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
