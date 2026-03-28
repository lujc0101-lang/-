"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { contactFieldLabel } from "@/lib/contact-labels";

type Props = {
  clubId: string;
  initial: {
    club: {
      id: string;
      name: string;
      slogan: string;
      category: string;
      description: string;
      tags: string[];
      gallery: string[];
      activityTypes: string[];
      intensity: string;
      beginnerFriendly: boolean;
      recruitStart: string;
      recruitEnd: string;
      recruitQuotaNote: string | null;
      applyNote: string | null;
      contact: Record<string, string> | null;
      leaderDisplayName: string;
      coverUrl: string | null;
      applicationsCount: number;
      favoritesCount: number;
      state: string;
      recruiting: boolean;
    };
  };
};

export function ClubDetailClient({ clubId, initial }: Props) {
  const [fav, setFav] = useState<boolean | null>(null);

  useEffect(() => {
    const sid = sessionStorage.getItem("analytics_session_id") ?? crypto.randomUUID();
    sessionStorage.setItem("analytics_session_id", sid);
    void fetch(`/api/clubs/${clubId}/view`, {
      method: "POST",
      headers: { "x-session-id": sid },
    });
    void (async () => {
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (!me.user) return;
      const r = await fetch("/api/favorites").then((x) => x.json());
      const ok = (r.favorites ?? []).some((x: { clubId: string }) => x.clubId === clubId);
      setFav(ok);
    })();
  }, [clubId]);

  async function toggleFavorite() {
    const me = await fetch("/api/auth/me").then((r) => r.json());
    if (!me.user) {
      window.location.href = `/login?next=/clubs/${clubId}`;
      return;
    }
    if (fav) {
      await fetch(`/api/favorites?clubId=${encodeURIComponent(clubId)}`, { method: "DELETE" });
      setFav(false);
    } else {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId }),
      });
      setFav(true);
    }
  }

  const c = initial.club;
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="aspect-[16/10] bg-border/40 lg:aspect-auto lg:min-h-[320px]">
            {c.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.coverUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="space-y-3 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-border/50 px-3 py-1 text-xs text-muted">{c.category}</span>
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  c.recruiting ? "bg-emerald-50 text-emerald-800" : "bg-bg text-muted"
                }`}
              >
                {c.recruiting ? "招新进行中" : c.state === "upcoming" ? "招新未开始" : "招新已结束"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-fg">{c.name}</h1>
            <p className="text-sm text-muted">{c.slogan}</p>
            <p className="text-xs text-muted">
              招新：{new Date(c.recruitStart).toLocaleDateString()} — {new Date(c.recruitEnd).toLocaleDateString()}
            </p>
            {c.recruitQuotaNote && <p className="text-xs text-muted">名额说明：{c.recruitQuotaNote}</p>}
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href={c.recruiting ? `/apply/${clubId}` : "#"}
                aria-disabled={!c.recruiting}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  c.recruiting ? "bg-accent hover:opacity-95" : "cursor-not-allowed bg-muted text-white/80"
                }`}
                onClick={(e) => {
                  if (!c.recruiting) e.preventDefault();
                }}
              >
                {c.recruiting ? "立即报名" : "暂不可报名"}
              </Link>
              <button
                type="button"
                onClick={() => void toggleFavorite()}
                className="rounded-xl border border-border bg-bg px-4 py-2 text-sm font-semibold text-fg hover:bg-border/30"
                aria-label="收藏"
              >
                {fav ? "已收藏" : "收藏"}
              </button>
            </div>
            {!c.recruiting && (
              <p className="text-xs text-red-600">当前不在招新窗口内，仍可浏览信息与收藏。</p>
            )}
            <p className="text-xs text-muted">
              报名 {c.applicationsCount} · 收藏 {c.favoritesCount} · 对外联系人：{c.leaderDisplayName}
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-fg">介绍</h2>
        <div className="prose prose-sm mt-3 max-w-none whitespace-pre-wrap text-muted">{c.description}</div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {c.tags.map((t) => (
            <span key={t} className="rounded-md bg-bg px-2 py-1 ring-1 ring-border">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-2">
          <div>活动类型：{c.activityTypes.join("、") || "—"}</div>
          <div>
            强度：{c.intensity === "light" ? "轻" : c.intensity === "medium" ? "中" : "重"} · 零基础友好：
            {c.beginnerFriendly ? "是" : "否"}
          </div>
        </div>
        {c.applyNote && <p className="mt-3 text-sm text-muted">报名提示：{c.applyNote}</p>}
        {c.contact && Object.keys(c.contact).length > 0 && (
          <div className="mt-5 border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-fg">联系方式</h3>
            <dl className="mt-3 space-y-3">
              {Object.entries(c.contact)
                .filter(([, v]) => v != null && String(v).trim() !== "")
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="grid gap-1 sm:grid-cols-[minmax(0,7rem)_1fr] sm:items-baseline sm:gap-4"
                  >
                    <dt className="text-xs font-medium text-fg">{contactFieldLabel(key)}</dt>
                    <dd className="text-sm leading-relaxed text-muted break-words">{value}</dd>
                  </div>
                ))}
            </dl>
          </div>
        )}
      </section>

    </div>
  );
}
