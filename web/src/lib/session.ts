import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";

export type SessionUser = {
  userId: string;
  role: Role;
  email: string;
  name: string;
};

export type SessionPayload = {
  user?: SessionUser;
};

function getSessionSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  return "development-only-secret-key-32chars!!";
}

export const sessionOptions: SessionOptions = {
  password: getSessionSecret(),
  cookieName: "clubmatch_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  },
};

export async function getIron(): Promise<IronSession<SessionPayload>> {
  const store = await cookies();
  return getIronSession<SessionPayload>(store, sessionOptions);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const s = await getIron();
  return s.user ?? null;
}

export async function setSessionUser(user: SessionUser): Promise<void> {
  const s = await getIron();
  s.user = user;
  await s.save();
}

export async function clearSession(): Promise<void> {
  const s = await getIron();
  s.destroy();
}
