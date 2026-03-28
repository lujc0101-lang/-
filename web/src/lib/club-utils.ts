import type { Club } from "@prisma/client";
import { parseJsonArray } from "./json";
import type { ClubForMatch } from "./types";

export function recruitingState(
  recruitStart: Date,
  recruitEnd: Date,
  now: Date = new Date(),
): "upcoming" | "open" | "ended" {
  if (now < recruitStart) return "upcoming";
  if (now > recruitEnd) return "ended";
  return "open";
}

export function clubToMatchShape(c: Club): ClubForMatch {
  const intensity = (["light", "medium", "heavy"].includes(c.intensity)
    ? c.intensity
    : "medium") as ClubForMatch["intensity"];
  return {
    id: c.id,
    name: c.name,
    category: c.category,
    tags: parseJsonArray(c.tags),
    activityTypes: parseJsonArray(c.activityTypes),
    intensity,
    beginnerFriendly: c.beginnerFriendly,
    recruitEnd: c.recruitEnd,
  };
}

export function intervalsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}
