import { describe, expect, it } from "vitest";
import { matchClubs, pickDiverseTop, scoreOneClub } from "./match-engine";
import type { ClubForMatch, MatchAnswers } from "./types";

const baseClub = (over: Partial<ClubForMatch>): ClubForMatch => ({
  id: "c1",
  name: "测试社",
  category: "学术科技",
  tags: ["机器人", "科技创新"],
  activityTypes: ["项目", "训练"],
  intensity: "medium",
  beginnerFriendly: true,
  recruitEnd: new Date(Date.now() + 864e5 * 30),
  ...over,
});

const baseAnswers = (): MatchAnswers => ({
  q1Interests: ["科技"],
  q2WeeklyHours: "3to6",
  q3ActivityPref: "项目产出",
  q4TrainingFreq: "medium",
  q5BeginnerFriendly: true,
});

describe("match-engine", () => {
  it("scores and returns at least 2 reasons", () => {
    const s = scoreOneClub(baseAnswers(), baseClub({}));
    expect(s.reasons.length).toBeGreaterThanOrEqual(2);
    expect(s.score).toBeGreaterThan(0);
  });

  it("pickDiverseTop respects category cap", () => {
    const clubs: ClubForMatch[] = Array.from({ length: 12 }).map((_, i) =>
      baseClub({
        id: `c${i}`,
        category: i % 2 === 0 ? "学术科技" : "体育健身",
        name: `社${i}`,
      }),
    );
    const answers = baseAnswers();
    const scored = clubs.map((c) => scoreOneClub(answers, c)).sort((a, b) => b.score - a.score);
    const top = pickDiverseTop(scored, 10, 4);
    const counts = new Map<string, number>();
    for (const t of top) {
      counts.set(t.club.category, (counts.get(t.club.category) ?? 0) + 1);
    }
    for (const [, n] of counts) {
      expect(n).toBeLessThanOrEqual(4);
    }
  });

  it("matchClubs excludes ended recruiting", () => {
    const past = new Date(Date.now() - 864e5);
    const clubs = [
      baseClub({ id: "a", recruitEnd: past }),
      baseClub({ id: "b", name: "B" }),
    ];
    const r = matchClubs(baseAnswers(), clubs);
    expect(r.every((x) => x.club.id === "b")).toBe(true);
  });
});
