"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GRADES } from "@/lib/constants";
import type { CustomFormField } from "@/lib/types";

type ClubResp = {
  club: {
    id: string;
    name: string;
    recruiting: boolean;
    customForm: CustomFormField[];
  };
};

export default function ApplyPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<ClubResp["club"] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [college, setCollege] = useState("");
  const [grade, setGrade] = useState<string>(GRADES[0]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [intro, setIntro] = useState("");
  const [custom, setCustom] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    void (async () => {
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (!me.user) {
        router.replace(`/login?next=/apply/${clubId}`);
        return;
      }
      const r = await fetch(`/api/clubs/${clubId}`);
      if (!r.ok) {
        setErr("社团不存在或未上架");
        setLoading(false);
        return;
      }
      const j = (await r.json()) as ClubResp;
      setClub(j.club);
      const init: Record<string, string | string[]> = {};
      for (const f of j.club.customForm ?? []) init[f.id] = f.type === "multiselect" ? [] : "";
      setCustom(init);
      setLoading(false);
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "apply_open", clubId, source: "apply_page" }),
      });
    })();
  }, [clubId, router]);

  const canSubmit = useMemo(() => club?.recruiting === true, [club]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!club || !canSubmit) return;
    setErr(null);
    const r = await fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clubId,
        common: { fullName, studentId, college, grade, phone, email: email || undefined, intro },
        custom,
      }),
    });
    const j = await r.json();
    if (!r.ok) {
      setErr(j.error ?? "提交失败");
      if (j.code === "duplicate") router.push("/me/applications");
      return;
    }
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "apply_submit", clubId }),
    });
    router.push("/me/applications");
  }

  function setCustomField(id: string, v: string | string[]) {
    setCustom((c) => ({ ...c, [id]: v }));
  }

  if (loading) return <p className="text-sm text-muted">加载中…</p>;
  if (!club) return <p className="text-sm text-red-600">{err ?? "错误"}</p>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">报名 · {club.name}</h1>
        <p className="text-sm text-muted">
          返回 <Link href={`/clubs/${clubId}`} className="text-accent hover:underline">社团详情</Link>
        </p>
      </div>

      {!canSubmit && <p className="text-sm text-red-600">当前不在招新窗口内，无法提交。</p>}

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-fg">通用信息</h2>
        <label className="block space-y-1 text-sm">
          <span className="text-muted">姓名</span>
          <input
            className="w-full rounded-xl border border-border bg-bg px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted">学号</span>
          <input
            className="w-full rounded-xl border border-border bg-bg px-3 py-2"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            inputMode="numeric"
            autoComplete="off"
            pattern="[0-9]{8,12}"
            title="请输入 8～12 位数字学号"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted">学院</span>
          <input
            className="w-full rounded-xl border border-border bg-bg px-3 py-2"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            required
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted">年级</span>
          <select
            className="w-full rounded-xl border border-border bg-bg px-3 py-2"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted">手机</span>
          <input
            className="w-full rounded-xl border border-border bg-bg px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            inputMode="tel"
            pattern="1[0-9]{10}"
            title="请输入 11 位手机号，以 1 开头"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted">邮箱（可选）</span>
          <input
            className="w-full rounded-xl border border-border bg-bg px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted">自我介绍（可选）</span>
          <textarea
            className="min-h-[100px] w-full rounded-xl border border-border bg-bg px-3 py-2"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            maxLength={500}
          />
        </label>

        {(club.customForm ?? []).length > 0 && (
          <>
            <h2 className="pt-2 text-sm font-semibold text-fg">社团自定义题目</h2>
            {(club.customForm ?? []).map((f) => (
              <div key={f.id} className="block space-y-1 text-sm">
                <span className="text-muted">
                  {f.label}
                  {f.required ? " *" : ""}
                </span>
                {f.type === "text" && (
                  <input
                    className="w-full rounded-xl border border-border bg-bg px-3 py-2"
                    value={(custom[f.id] as string) ?? ""}
                    onChange={(e) => setCustomField(f.id, e.target.value)}
                    required={f.required}
                  />
                )}
                {f.type === "textarea" && (
                  <textarea
                    className="min-h-[90px] w-full rounded-xl border border-border bg-bg px-3 py-2"
                    value={(custom[f.id] as string) ?? ""}
                    onChange={(e) => setCustomField(f.id, e.target.value)}
                    required={f.required}
                  />
                )}
                {f.type === "select" && (
                  <select
                    className="w-full rounded-xl border border-border bg-bg px-3 py-2"
                    value={(custom[f.id] as string) ?? ""}
                    onChange={(e) => setCustomField(f.id, e.target.value)}
                    required={f.required}
                  >
                    <option value="">请选择</option>
                    {(f.options ?? []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                )}
                {f.type === "multiselect" && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(f.options ?? []).map((o) => {
                      const arr = (custom[f.id] as string[]) ?? [];
                      const on = arr.includes(o);
                      return (
                        <button
                          type="button"
                          key={o}
                          className={`rounded-full px-3 py-1 text-sm ring-1 ${
                            on ? "bg-accent text-white ring-accent" : "bg-bg ring-border"
                          }`}
                          onClick={() => {
                            const next = on ? arr.filter((x) => x !== o) : [...arr, o];
                            setCustomField(f.id, next);
                          }}
                        >
                          {o}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          提交报名
        </button>
      </form>
    </div>
  );
}
