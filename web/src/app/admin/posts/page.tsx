"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  type: string;
  title: string | null;
  content: string;
  status: string;
  pinned: boolean;
  createdAt: string;
  author: { name: string; email: string };
  club: { name: string } | null;
};

export default function AdminPostsPage() {
  const [status, setStatus] = useState("PENDING");
  const [posts, setPosts] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/admin/posts?status=${encodeURIComponent(status)}`, { cache: "no-store" });
    const j = await r.json();
    setPosts(j.posts ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(id: string, body: { status: string; rejectNote?: string; pinned?: boolean }) {
    const r = await fetch(`/api/admin/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) void load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-fg">帖子审核</h1>
      <div className="flex flex-wrap gap-2">
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full px-4 py-2 text-sm ${
              status === s ? "bg-accent text-white" : "border border-border bg-bg"
            }`}
          >
            {s === "PENDING" ? "待审" : s === "APPROVED" ? "已通过" : "已拒绝"}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-sm text-muted">加载中…</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted">暂无</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-fg">{p.title ?? "（无标题）"}</span>
                <span className="text-xs text-muted">{p.type}</span>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-muted">{p.content}</p>
              <p className="mt-2 text-xs text-muted">
                {p.author.name} · {p.author.email}
                {p.club && <> · {p.club.name}</>}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/posts/${p.id}`} className="text-sm text-accent hover:underline" target="_blank">
                  预览
                </Link>
                {p.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      className="text-sm text-emerald-700 hover:underline"
                      onClick={() => void patch(p.id, { status: "APPROVED" })}
                    >
                      通过
                    </button>
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:underline"
                      onClick={() =>
                        void patch(p.id, {
                          status: "REJECTED",
                          rejectNote: rejectNote[p.id] || "未通过审核",
                        })
                      }
                    >
                      拒绝
                    </button>
                    <input
                      className="min-w-[12rem] rounded border border-border px-2 py-1 text-xs"
                      placeholder="拒绝说明（可选）"
                      value={rejectNote[p.id] ?? ""}
                      onChange={(e) => setRejectNote((m) => ({ ...m, [p.id]: e.target.value }))}
                    />
                  </>
                )}
                {p.status === "APPROVED" && (
                  <button
                    type="button"
                    className="text-sm text-muted hover:underline"
                    onClick={() => void patch(p.id, { status: "APPROVED", pinned: !p.pinned })}
                  >
                    {p.pinned ? "取消置顶" : "置顶"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
