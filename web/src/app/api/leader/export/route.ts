import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getManagedClubId } from "@/lib/leader";

export async function GET() {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (u.role !== "LEADER") return NextResponse.json({ error: "无权限" }, { status: 403 });
  const clubId = await getManagedClubId(u.userId);
  if (!clubId) return NextResponse.json({ error: "未绑定社团" }, { status: 400 });

  const rows = await prisma.application.findMany({
    where: { clubId },
    orderBy: { createdAt: "desc" },
    take: 2000,
  });

  const header = ["applicationId", "status", "createdAt", "fullName", "studentId", "college", "grade", "phone", "email"];
  const lines = [header.join(",")];
  for (const r of rows) {
    const c = JSON.parse(r.commonAnswers) as Record<string, string>;
    lines.push(
      [
        r.id,
        r.status,
        r.createdAt.toISOString(),
        escapeCsv(c.fullName ?? ""),
        escapeCsv(c.studentId ?? ""),
        escapeCsv(c.college ?? ""),
        escapeCsv(c_grade(c.grade)),
        escapeCsv(c.phone ?? ""),
        escapeCsv(c.email ?? ""),
      ].join(","),
    );
  }

  const body = lines.join("\n");
  return new NextResponse(`\ufeff${body}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="applications-${clubId}.csv"`,
    },
  });
}

function escapeCsv(s: string) {
  if (/[","\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function c_grade(g: unknown) {
  return typeof g === "string" ? g : "";
}
