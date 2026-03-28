import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getManagedClubId } from "@/lib/leader";
import { MAX_CUSTOM_FORM_FIELDS } from "@/lib/constants";
import type { CustomFormField } from "@/lib/types";

const fieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  type: z.enum(["text", "textarea", "select", "multiselect"]),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
});

const bodySchema = z.object({
  fields: z.array(fieldSchema).max(MAX_CUSTOM_FORM_FIELDS),
});

export async function PUT(req: Request) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (u.role !== "LEADER") return NextResponse.json({ error: "无权限" }, { status: 403 });
  const clubId = await getManagedClubId(u.userId);
  if (!clubId) return NextResponse.json({ error: "未绑定社团" }, { status: 400 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数无效", details: parsed.error.flatten() }, { status: 400 });
  }

  for (const f of parsed.data.fields) {
    if (f.type === "select" || f.type === "multiselect") {
      if (!f.options?.length) {
        return NextResponse.json({ error: `${f.label} 需要提供选项` }, { status: 400 });
      }
    }
  }

  await prisma.club.update({
    where: { id: clubId },
    data: { customForm: JSON.stringify(parsed.data.fields satisfies CustomFormField[]) },
  });
  return NextResponse.json({ ok: true });
}
