/** 社团 contact JSON 常见字段 → 展示用中文标签 */
export const CONTACT_FIELD_LABELS: Record<string, string> = {
  email: "邮箱",
  qqGroup: "QQ 群",
  qq: "QQ 号",
  wechat: "微信",
  wechatKeyword: "微信群关键词",
  phone: "电话",
  mobile: "手机",
  website: "网站",
  link: "链接",
  bilibili: "B 站",
  office: "办公地点",
};

export function contactFieldLabel(key: string): string {
  if (CONTACT_FIELD_LABELS[key]) return CONTACT_FIELD_LABELS[key];
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();
}
