"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type PostDetail = {
  id: string;
  type: string;
  title: string | null;
  content: string;
  images: string[];
  tags: string[];
  clubId: string | null;
  club: { id: string; name: string; status: string } | null;
  pinned: boolean;
  status: string;
  createdAt: string;
  author: { id: string; name: string };
  likes: number;
  comments: number;
  liked: boolean;
  fav: boolean;
};

type CommentRow = { id: string; content: string; createdAt: string; user: { id: string; name: string } };

const typeLabel: Record<string, string> = {
  RECRUIT: "招新帖",
  ACTIVITY: "活动",
  DISCUSS: "讨论",
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch(`/api/posts/${id}`, { cache: "no-store" });
    if (!r.ok) {
      setErr("帖子不存在或未通过审核");
      setPost(null);
      return;
    }
    const j = await r.json();
    setPost(j.post);
    setErr(null);
    const cr = await fetch(`/api/posts/${id}/comments`, { cache: "no-store" });
    const cj = await cr.json();
    setComments(cj.comments ?? []);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleLike() {
    const me = await fetch("/api/auth/me").then((r) => r.json());
    if (!me.user) {
      router.push(`/login?next=/posts/${id}`);
      return;
    }
    const r = await fetch(`/api/posts/${id}/like`, { method: "POST" });
    const j = await r.json();
    if (r.ok && post) {
      setPost({
        ...post,
        liked: j.liked,
        likes: post.likes + (j.liked ? 1 : -1),
      });
    }
  }

  async function sendComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const me = await fetch("/api/auth/me").then((r) => r.json());
    if (!me.user) {
      router.push(`/login?next=/posts/${id}`);
      return;
    }
    setSubmitting(true);
    const r = await fetch(`/api/posts/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText.trim() }),
    });
    setSubmitting(false);
    if (r.ok) {
      setCommentText("");
      void load();
    }
  }

  if (err || !post) {
    return (
      <div className="apple-panel px-8 py-16 text-center">
        <p className="text-[17px] text-[var(--muted)]">{err ?? "加载中…"}</p>
        <Link href="/" className="apple-link mt-6 inline-block text-[15px]">
          回社区
        </Link>
      </div>
    );
  }

  const showApply = post.type === "RECRUIT" && post.clubId && post.club?.status === "PUBLISHED";

  return (
    <article className="space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--muted2)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">
          社区
        </Link>
        <span>/</span>
        <span>{typeLabel[post.type] ?? post.type}</span>
      </div>

      <header className="space-y-3">
        {post.pinned && (
          <span className="inline-block rounded-md bg-[var(--accent)]/15 px-2 py-0.5 text-[11px] font-medium">置顶</span>
        )}
        {post.title && <h1 className="text-[26px] font-medium leading-snug text-fg md:text-[32px]">{post.title}</h1>}
        <p className="text-[14px] text-[var(--muted)]">
          {post.author.name}
          {post.club && <> · {post.club.name}</>}
          {post.status === "PENDING" && (
            <span className="ml-2 text-amber-700">（待审核，仅本人可见）</span>
          )}
        </p>
      </header>

      <div className="apple-panel-soft space-y-4 p-6 md:p-8">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-fg md:text-[16px]">{post.content}</p>
        {post.images.map((src) => (
          <div key={src} className="overflow-hidden rounded-[14px] bg-[var(--chip-off)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="max-h-[480px] w-full object-cover" />
          </div>
        ))}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-[var(--chip-off)] px-3 py-1 text-[12px] text-[var(--muted)]">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => void toggleLike()}
          className="rounded-full border border-[var(--border)] bg-bg px-4 py-2 text-[14px] text-fg hover:bg-[var(--chip-off)]"
        >
          {post.liked ? "已赞" : "赞"} {post.likes}
        </button>
        {showApply && (
          <Link href={`/apply/${post.clubId}`} className="apple-cta text-[14px]">
            一键报名
          </Link>
        )}
        {post.clubId && (
          <Link href={`/clubs/${post.clubId}`} className="apple-link text-[14px]">
            查看社团
          </Link>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-[18px] font-medium text-fg">评论</h2>
        <form onSubmit={sendComment} className="space-y-2">
          <textarea
            className="apple-field min-h-[88px] w-full resize-y"
            placeholder="说点什么…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting}
            className="apple-cta-secondary text-[14px] disabled:opacity-50"
          >
            发送
          </button>
        </form>
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="apple-panel-soft px-4 py-3 text-[14px]">
              <div className="font-medium text-fg">{c.user.name}</div>
              <p className="mt-1 whitespace-pre-wrap text-[var(--muted)]">{c.content}</p>
              <p className="mt-2 text-[11px] text-[var(--muted2)]">
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
