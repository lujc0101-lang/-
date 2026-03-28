"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type N = {
  id: string;
  type: string;
  payload: { title: string; body: string; href: string };
  readAt: string | null;
  createdAt: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<N[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/notifications");
    const j = await r.json();
    setItems(j.notifications ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-fg">通知</h1>
        <button
          type="button"
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm"
          onClick={async () => {
            await fetch("/api/notifications", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ allRead: true }),
            });
            void load();
          }}
        >
          全部标为已读
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">加载中…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">暂无通知</p>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-2xl border border-border bg-card p-4 shadow-sm ${n.readAt ? "opacity-70" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-fg">{n.payload.title}</div>
                  <p className="mt-1 text-sm text-muted">{n.payload.body}</p>
                </div>
                <span className="text-[11px] text-muted">
                  {new Date(n.createdAt).toLocaleString("zh-CN")}
                </span>
              </div>
              <Link href={n.payload.href} className="mt-3 inline-block text-sm text-accent hover:underline">
                查看
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
