export const SEASON_ID = "2025-FALL";

export const CLUB_CATEGORIES = [
  "文学艺术",
  "体育健身",
  "学术科技",
  "志愿服务",
  "实践创业",
  "国际交流",
  "其他",
] as const;

export const SUGGESTED_TAGS = [
  "零基础友好",
  "比赛导向",
  "演出机会",
  "夜训",
  "团建多",
  "需基础技能",
  "科技创新",
  "机器人",
  "摄影",
  "篮球",
  "志愿服务",
  "社会实践",
] as const;

export const GRADES = ["本科一年级", "本科二年级", "本科三年级", "本科四年级", "硕士", "博士"] as const;

export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "已提交",
  CONTACTED: "已联系",
  INTERVIEW: "面试中",
  ACCEPTED: "已通过",
  WAITLIST: "候补",
  REJECTED: "未通过",
};

export const MAX_CUSTOM_FORM_FIELDS = 5;
