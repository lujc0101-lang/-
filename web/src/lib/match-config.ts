/** 问卷与打分权重（可抽至环境变量或管理端，PRD P0 写死） */

export const MATCH_TOP_N = 10;
export const MAX_PER_CATEGORY_IN_TOP = 4;

export const INTEREST_TO_TAG_HINTS: Record<string, string[]> = {
  文艺: ["演出", "摄影", "文学", "艺术", "音乐"],
  体育: ["篮球", "夜训", "比赛", "健身"],
  科技: ["科技", "机器人", "创新", "学术"],
  志愿服务: ["志愿", "公益", "服务"],
  学术: ["学术", "科研", "英语", "辩论"],
  社会实践: ["实践", "创业", "调研", "社会"],
};

export const Q3_TO_ACTIVITY_TYPES: Record<string, string[]> = {
  表演比赛: ["演出", "比赛", "表演"],
  训练提升: ["训练", "夜训", "技能"],
  社交松弛: ["团建", "社交", "松弛"],
  项目产出: ["项目", "产出", "创业", "科研"],
};

export const MATCH_WEIGHTS = {
  q1Interest: 22,
  q2TimeIntensity: 22,
  q3Activity: 22,
  q4Training: 18,
  q5Beginner: 16,
} as const;
