import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { SEASON_ID } from "@/lib/constants";
import { recruitingState } from "@/lib/club-utils";
import { ClubStatus, ApplicationStatus } from "@prisma/client";
import { MAX_CUSTOM_FORM_FIELDS } from "@/lib/constants";
import type { CustomFormField } from "@/lib/types";
import { stringifyJson } from "@/lib/json";

const commonSchema = z.object({
  fullName: z.string().min(2).max(20),
  studentId: z.string().regex(/^\d{8,12}$/, "学号需为 8～12 位数字"),
  college: z.string().min(2),
  grade: z.string().min(2),
  phone: z.string().regex(/^1\d{10}$/, "手机号需为 11 位"),
  email: z.string().email().optional().or(z.literal("")),
  intro: z.string().max(500).optional(),
});

const bodySchema = z.object({
  clubId: z.string(),
  common: commonSchema,
  custom: z.record(z.union([z.string(), z.array(z.string())])).optional(),
});

export async function POST(req: Request) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "表单无效", details: parsed.error.flatten() }, { status: 400 });
  }

  const club = await prisma.club.findFirst({
    where: { id: parsed.data.clubId, status: ClubStatus.PUBLISHED },
  });
  if (!club) return NextResponse.json({ error: "社团不可报名" }, { status: 404 });

  const state = recruitingState(club.recruitStart, club.recruitEnd);
  if (state !== "open") {
    return NextResponse.json({ error: "当前不在招新时间内" }, { status: 400 });
  }

  let customFields: CustomFormField[] = [];
  try {
    customFields = club.customForm ? (JSON.parse(club.customForm) as CustomFormField[]) : [];
  } catch {
    customFields = [];
  }
  if (customFields.length > MAX_CUSTOM_FORM_FIELDS) {
    customFields = customFields.slice(0, MAX_CUSTOM_FORM_FIELDS);
  }

  const customIn = parsed.data.custom ?? {};
  for (const f of customFields) {
    const v = customIn[f.id];
    if (f.required) {
      if (f.type === "multiselect") {
        if (!Array.isArray(v) || v.length === 0) {
          return NextResponse.json({ error: `请填写：${f.label}` }, { status: 400 });
        }
      } else if (v === undefined || v === "" || (typeof v === "string" && !v.trim())) {
        return NextResponse.json({ error: `请填写：${f.label}` }, { status: 400 });
      }
    }
  }

  const seasonId = club.seasonId || SEASON_ID;
  const snapshot = {
    clubName: club.name,
    seasonId,
    ts: new Date().toISOString(),
  };
  const timeline = [
    {
      at: new Date().toISOString(),
      byUserId: u.userId,
      action: "created",
      note: "学生提交报名",
    },
  ];

  try {
    const app = await prisma.application.create({
      data: {
        userId: u.userId,
        clubId: club.id,
        seasonId,
        commonAnswers: stringifyJson(parsed.data.common),
        customAnswers: stringifyJson(customIn),
        status: ApplicationStatus.SUBMITTED,
        clubSnapshot: stringifyJson(snapshot),
        timeline: stringifyJson(timeline),
      },
    });
    return NextResponse.json({ ok: true, applicationId: app.id });
  } catch (e: unknown) {
    const code = typeof e === "object" && e && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2002") {
      return NextResponse.json({ error: "你已报名该社团本季招新", code: "duplicate" }, { status: 409 });
    }
    throw e;
  }
}
