"use client";

import { useEffect, useState } from "react";
import { ClubStatus } from "@prisma/client";

type Club = {
  id: string;
  name: string;
  status: ClubStatus;
  updatedAt: string;
};

const labels: Record<ClubStatus, string> = {
  DRAFT: "草稿",
  PENDING_REVIEW: "待审核",
  PUBLISHED: "已发布",
  REJECTED: "已驳回",
};

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);

  async function load() {
    const r = await fetch("/api/admin/clubs");
    const j = await r.json();
    setClubs(j.clubs ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function setStatus(id: string, status: ClubStatus) {
    await fetch(`/api/admin/clubs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    void load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-fg">社团审核</h1>
      <div className="space-y-3">
        {clubs.map((c) => (
          <div key={c.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold text-fg">{c.name}</div>
              <div className="text-xs text-muted">
                {labels[c.status]} · {new Date(c.updatedAt).toLocaleString("zh-CN")}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {c.status !== ClubStatus.PUBLISHED && (
                <button
                  type="button"
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                  onClick={() => void setStatus(c.id, ClubStatus.PUBLISHED)}
                >
                  批准上架
                </button>
              )}
              {c.status !== ClubStatus.REJECTED && (
                <button
                  type="button"
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                  onClick={() => void setStatus(c.id, ClubStatus.REJECTED)}
                >
                  驳回
                </button>
              )}
              {c.status === ClubStatus.PUBLISHED && (
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs"
                  onClick={() => void setStatus(c.id, ClubStatus.DRAFT)}
                >
                  下架为草稿
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
