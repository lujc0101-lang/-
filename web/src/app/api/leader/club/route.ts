import { NextResponse } from "next/server";
import { ClubStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getManagedClubId } from "@/lib/leader";
import { parseJsonArray } from "@/lib/json";
import { CLUB_CATEGORIES } from "@/lib/constants";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slogan: z.string().min(2).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).max(12).optional(),
  description: z.string().min(10).optional(),
  coverUrl: z.string().optional().nullable(),
  gallery: z.array(z.string()).max(12).optional(),
  activityTypes: z.array(z.string()).max(12).optional(),
  intensity: z.enum(["light", "medium", "heavy"]).optional(),
  beginnerFriendly: z.boolean().optional(),
  recruitStart: z.string().datetime().optional(),
  recruitEnd: z.string().datetime().optional(),
  recruitQuotaNote: z.string().optional().nullable(),
  applyNote: z.string().optional().nullable(),
  contact: z.record(z.string()).optional().nullable(),
  leaderDisplayName: z.string().min(2).optional(),
  /** 社长提交审核 */
  submitReview: z.boolean().optional(),
});

export async function GET() {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (u.role !== "LEADER") return NextResponse.json({ error: "无权限" }, { status: 403 });
  const clubId = await getManagedClubId(u.userId);
  if (!clubId) return NextResponse.json({ club: null });
  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) return NextResponse.json({ club: null });
  return NextResponse.json({
    club: {
      ...club,
      tags: parseJsonArray(club.tags),
      gallery: parseJsonArray(club.gallery),
      activityTypes: parseJsonArray(club.activityTypes),
      contact: club.contact ? JSON.parse(club.contact) : null,
      customForm: club.customForm ? JSON.parse(club.customForm) : [],
    },
  });
}

export async function PUT(req: Request) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (u.role !== "LEADER") return NextResponse.json({ error: "无权限" }, { status: 403 });
  const clubId = await getManagedClubId(u.userId);
  if (!clubId) return NextResponse.json({ error: "未绑定社团" }, { status: 400 });

  const json = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数无效", details: parsed.error.flatten() }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  const b = parsed.data;
  if (b.name !== undefined) data.name = b.name;
  if (b.slogan !== undefined) data.slogan = b.slogan;
  if (b.category !== undefined) {
    if (!CLUB_CATEGORIES.includes(b.category as (typeof CLUB_CATEGORIES)[number])) {
      return NextResponse.json({ error: "分类无效" }, { status: 400 });
    }
    data.category = b.category;
  }
  if (b.tags !== undefined) data.tags = JSON.stringify(b.tags);
  if (b.description !== undefined) data.description = b.description;
  if (b.coverUrl !== undefined) data.coverUrl = b.coverUrl;
  if (b.gallery !== undefined) data.gallery = JSON.stringify(b.gallery);
  if (b.activityTypes !== undefined) data.activityTypes = JSON.stringify(b.activityTypes);
  if (b.intensity !== undefined) data.intensity = b.intensity;
  if (b.beginnerFriendly !== undefined) data.beginnerFriendly = b.beginnerFriendly;
  if (b.recruitStart !== undefined) data.recruitStart = new Date(b.recruitStart);
  if (b.recruitEnd !== undefined) data.recruitEnd = new Date(b.recruitEnd);
  if (b.recruitQuotaNote !== undefined) data.recruitQuotaNote = b.recruitQuotaNote;
  if (b.applyNote !== undefined) data.applyNote = b.applyNote;
  if (b.contact !== undefined) data.contact = b.contact ? JSON.stringify(b.contact) : null;
  if (b.leaderDisplayName !== undefined) data.leaderDisplayName = b.leaderDisplayName;
  if (b.submitReview) {
    data.status = ClubStatus.PENDING_REVIEW;
  }

  const club = await prisma.club.update({
    where: { id: clubId },
    data,
  });
  return NextResponse.json({ ok: true, clubId: club.id, status: club.status });
}
