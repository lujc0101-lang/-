import {
  INTEREST_TO_TAG_HINTS,
  MATCH_WEIGHTS,
  MATCH_TOP_N,
  MAX_PER_CATEGORY_IN_TOP,
  Q3_TO_ACTIVITY_TYPES,
} from "./match-config";
import type { ClubForMatch, MatchAnswers, ScoredClub } from "./types";

function now(): Date {
  return new Date();
}

function isRecruiting(club: ClubForMatch): boolean {
  return club.recruitEnd >= now();
}

function tagBlob(club: ClubForMatch): string {
  return [...club.tags, club.category].join(" ").toLowerCase();
}

function scoreQ1(answers: MatchAnswers, club: ClubForMatch): { pts: number; reasons: string[] } {
  const w = MATCH_WEIGHTS.q1Interest;
  const reasons: string[] = [];
  let hits = 0;
  for (const interest of answers.q1Interests) {
    const hints = INTEREST_TO_TAG_HINTS[interest] ?? [interest];
    for (const h of hints) {
      if (tagBlob(club).includes(h.toLowerCase())) {
        hits++;
        reasons.push(`你在兴趣中选择「${interest}」，与该社标签/方向「${h}」相符`);
        break;
      }
    }
  }
  const denom = Math.max(1, answers.q1Interests.length);
  const ratio = Math.min(1, hits / denom);
  return { pts: ratio * w, reasons };
}

function intensityRank(i: ClubForMatch["intensity"]): number {
  return i === "light" ? 1 : i === "medium" ? 2 : 3;
}

function hoursRank(h: MatchAnswers["q2WeeklyHours"]): number {
  const m = { lte3: 1, "3to6": 2, "6to10": 3, gt10: 4 } as const;
  return m[h];
}

/** 时间投入与社团强度相容：差距越小分越高 */
function scoreQ2(answers: MatchAnswers, club: ClubForMatch): { pts: number; reasons: string[] } {
  const w = MATCH_WEIGHTS.q2TimeIntensity;
  const diff = Math.abs(intensityRank(club.intensity) - hoursRank(answers.q2WeeklyHours));
  const ratio = Math.max(0, 1 - diff * 0.28);
  const reasons: string[] = [];
  if (ratio >= 0.72) {
    reasons.push("你的每周可投入时间与该社参与强度较为匹配");
  } else {
    reasons.push("你的时间投入与该社强度存在一定差异，仍可尝试了解");
  }
  return { pts: ratio * w, reasons };
}

function scoreQ3(answers: MatchAnswers, club: ClubForMatch): { pts: number; reasons: string[] } {
  const w = MATCH_WEIGHTS.q3Activity;
  const prefs = Q3_TO_ACTIVITY_TYPES[answers.q3ActivityPref] ?? [];
  const blob = tagBlob(club) + club.activityTypes.join(" ").toLowerCase();
  let hit = false;
  for (const p of prefs) {
    if (blob.includes(p.toLowerCase())) {
      hit = true;
      break;
    }
  }
  const ratio = hit ? 1 : 0.35;
  const reasons: string[] = hit
    ? [`你偏好「${answers.q3ActivityPref}」类活动，与该社日常活动类型相近`]
    : [];
  return { pts: ratio * w, reasons };
}

function trainingRank(t: MatchAnswers["q4TrainingFreq"]): number {
  return t === "low" ? 1 : t === "medium" ? 2 : 3;
}

function scoreQ4(answers: MatchAnswers, club: ClubForMatch): { pts: number; reasons: string[] } {
  const w = MATCH_WEIGHTS.q4Training;
  const diff = Math.abs(trainingRank(answers.q4TrainingFreq) - intensityRank(club.intensity));
  const ratio = Math.max(0, 1 - diff * 0.32);
  const reasons: string[] = [];
  if (ratio >= 0.68) {
    reasons.push("你对例会/训练的接受度与该社节奏较为一致");
  }
  return { pts: ratio * w, reasons };
}

function scoreQ5(answers: MatchAnswers, club: ClubForMatch): { pts: number; reasons: string[] } {
  const w = MATCH_WEIGHTS.q5Beginner;
  if (answers.q5BeginnerFriendly && club.beginnerFriendly) {
    return {
      pts: w,
      reasons: ["你倾向于零基础友好社团，该社标注了对新手友好"],
    };
  }
  if (!answers.q5BeginnerFriendly && !club.beginnerFriendly) {
    return {
      pts: w * 0.92,
      reasons: ["你接受一定基础要求，该社更偏进阶训练/产出"],
    };
  }
  return {
    pts: w * 0.55,
    reasons: ["零基础偏好与该社特色存在差异，可作为拓展尝试"],
  };
}

export function scoreOneClub(answers: MatchAnswers, club: ClubForMatch): ScoredClub {
  const s1 = scoreQ1(answers, club);
  const s2 = scoreQ2(answers, club);
  const s3 = scoreQ3(answers, club);
  const s4 = scoreQ4(answers, club);
  const s5 = scoreQ5(answers, club);
  const score = s1.pts + s2.pts + s3.pts + s4.pts + s5.pts;
  const reasons = [...s1.reasons, ...s2.reasons, ...s3.reasons, ...s4.reasons, ...s5.reasons];
  const dedup = [...new Set(reasons)];
  let finalReasons = dedup;
  if (finalReasons.length < 2) {
    finalReasons = [...finalReasons, "综合画像与该社方向具有一定契合度（规则推荐）"];
  }
  return { club, score: Math.round(score * 10) / 10, reasons: finalReasons.slice(0, 6) };
}

/** 多样性：Top N 中同一分类不超过 maxPerCat（不突破上限；不足 topN 时提前结束） */
export function pickDiverseTop(
  ranked: ScoredClub[],
  topN: number,
  maxPerCat: number,
): ScoredClub[] {
  const out: ScoredClub[] = [];
  const catCount = new Map<string, number>();
  for (const item of ranked) {
    if (out.length >= topN) break;
    const c = item.club.category;
    const n = catCount.get(c) ?? 0;
    if (n >= maxPerCat) continue;
    out.push(item);
    catCount.set(c, n + 1);
  }
  return out;
}

export function matchClubs(answers: MatchAnswers, clubs: ClubForMatch[]): ScoredClub[] {
  const active = clubs.filter(isRecruiting);
  const scored = active.map((club) => scoreOneClub(answers, club));
  scored.sort((a, b) => b.score - a.score);
  return pickDiverseTop(scored, MATCH_TOP_N, MAX_PER_CATEGORY_IN_TOP);
}

export function matchClubsIncludingEnded(
  answers: MatchAnswers,
  clubs: ClubForMatch[],
): { active: ScoredClub[]; ended: ScoredClub[] } {
  const active = clubs.filter(isRecruiting);
  const ended = clubs.filter((c) => !isRecruiting(c));
  return {
    active: matchClubs(answers, active),
    ended: ended.map((c) => scoreOneClub(answers, c)).sort((a, b) => b.score - a.score).slice(0, 5),
  };
}
