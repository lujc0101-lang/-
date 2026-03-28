"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="rounded-lg px-3 py-1.5 text-sm text-muted hover:text-fg"
      aria-label="退出登录"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
    >
      退出
    </button>
  );
}
