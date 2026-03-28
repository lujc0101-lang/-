import type { MatchAnswers } from "./types";

export type NluResult = {
  summary: string;
  answers: MatchAnswers;
};

const KEY_TO_INTEREST: { kw: string; interest: MatchAnswers["q1Interests"][number] }[] = [
  { kw: "篮球", interest: "体育" },
  { kw: "足球", interest: "体育" },
  { kw: "跑步", interest: "体育" },
  { kw: "健身", interest: "体育" },
  { kw: "摄影", interest: "文艺" },
  { kw: "音乐", interest: "文艺" },
  { kw: "舞蹈", interest: "文艺" },
  { kw: "志愿", interest: "志愿服务" },
  { kw: "公益", interest: "志愿服务" },
  { kw: "代码", interest: "科技" },
  { kw: "编程", interest: "科技" },
  { kw: "机器人", interest: "科技" },
  { kw: "辩论", interest: "学术" },
  { kw: "英语", interest: "学术" },
  { kw: "创业", interest: "社会实践" },
  { kw: "调研", interest: "社会实践" },
];

/** P2：规则 + 关键词抽取，不依赖外部 LLM */
export function nlToMatchAnswers(text: string): NluResult {
  const t = text.toLowerCase();
  const interests: string[] = [];
  for (const { kw, interest } of KEY_TO_INTEREST) {
    if (t.includes(kw.toLowerCase()) && !interests.includes(interest)) interests.push(interest);
  }
  if (interests.length === 0) interests.push("社会实践");

  let q2: MatchAnswers["q2WeeklyHours"] = "3to6";
  if (/两小时|一个小时|很少|没太多|忙/.test(text)) q2 = "lte3";
  if (/十小时|很多时间|很空|特别有空/.test(text)) q2 = "gt10";

  let q3: MatchAnswers["q3ActivityPref"] = "社交松弛";
  if (/比赛|演出|舞台|展演/.test(text)) q3 = "表演比赛";
  if (/训练|提升|进步|练习/.test(text)) q3 = "训练提升";
  if (/项目|产出|作品|研发/.test(text)) q3 = "项目产出";

  let q4: MatchAnswers["q4TrainingFreq"] = "medium";
  if (/不想.*例会|轻松|随意|少开会/.test(text)) q4 = "low";
  if (/高强度|密集|频繁/.test(text)) q4 = "high";

  const beginner = /零基础|新手|没基础|小白/.test(text);

  const answers: MatchAnswers = {
    q1Interests: interests.slice(0, 4) as MatchAnswers["q1Interests"],
    q2WeeklyHours: q2,
    q3ActivityPref: q3,
    q4TrainingFreq: q4,
    q5BeginnerFriendly: beginner,
  };

  const summary = `识别兴趣：${answers.q1Interests.join("、")}；周投入：${answers.q2WeeklyHours}；活动偏好：${answers.q3ActivityPref}；训练/例会接受度：${answers.q4TrainingFreq}；零基础友好：${answers.q5BeginnerFriendly ? "希望" : "一般"}`;

  return { summary, answers };
}
