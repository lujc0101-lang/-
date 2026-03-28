import { NextResponse } from "next/server";
import { ensureFavoriteDeadlineReminders } from "@/lib/notify";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ user: null });
  await ensureFavoriteDeadlineReminders(u.userId).catch(() => {});
  return NextResponse.json({ user: u });
}
