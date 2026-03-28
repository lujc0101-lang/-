import {
  PrismaClient,
  Role,
  ClubStatus,
  ApplicationStatus,
  PostType,
  PostStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { SEASON_ID } from "../src/lib/constants";

const prisma = new PrismaClient();

async function hash(p: string) {
  return bcrypt.hash(p, 10);
}

async function main() {
  await prisma.postComment.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.postFavorite.deleteMany();
  await prisma.post.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.application.deleteMany();
  await prisma.matchProfile.deleteMany();
  await prisma.inviteCode.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();

  const adminPass = await hash("admin123");
  const studentPass = await hash("student123");
  const leaderPass = await hash("leader123");

  await prisma.user.create({
    data: {
      email: "admin@demo.edu",
      passwordHash: adminPass,
      role: Role.ADMIN,
      name: "系统管理员",
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "student@demo.edu",
      passwordHash: studentPass,
      role: Role.STUDENT,
      name: "演示新生",
      studentId: "20250001",
    },
  });

  const leaderUser = await prisma.user.create({
    data: {
      email: "leader@demo.edu",
      passwordHash: leaderPass,
      role: Role.LEADER,
      name: "演示社长",
    },
  });

  const rs = new Date();
  rs.setMonth(rs.getMonth() - 1);
  const re = new Date();
  re.setMonth(re.getMonth() + 2);

  const json = (v: unknown) => JSON.stringify(v);

  /** 站内静态封面，避免外链（如 Unsplash）在国内无法加载 */
  const cover = {
    robotics: "/seed/covers/robotics.svg",
    volunteer: "/seed/covers/volunteer.svg",
    basketball: "/seed/covers/basketball.svg",
    photography: "/seed/covers/photography.svg",
  } as const;

  const robotics = await prisma.club.create({
    data: {
      name: "机器人协会",
      slogan: "动手造物，赛场合一",
      category: "学术科技",
      tags: json(["机器人", "科技创新", "比赛导向", "夜训"]),
      description:
        "## 社团简介\n\n专注机器人赛事与工程实践，备赛期有固定夜训。\n\n### 你将获得\n- 参赛机会\n- 学长带训",
      coverUrl: cover.robotics,
      gallery: json([]),
      activityTypes: json(["训练", "项目", "比赛"]),
      intensity: "heavy",
      beginnerFriendly: false,
      recruitStart: rs,
      recruitEnd: re,
      recruitQuotaNote: "本届计划招新 30 人",
      applyNote: "若有 Git/嵌入式经验请在自定义题说明",
      contact: json({ email: "robot@demo.edu", qqGroup: "123456789" }),
      customForm: json([
        {
          id: "skill",
          label: "请简述相关技能/项目经历",
          type: "textarea",
          required: false,
        },
        {
          id: "cohort",
          label: "是否接受夜训（单选）",
          type: "select",
          required: true,
          options: ["完全接受", "部分接受", "暂不接受"],
        },
      ]),
      leaderDisplayName: "张社长",
      leaderUserId: leaderUser.id,
      status: ClubStatus.PUBLISHED,
      seasonId: SEASON_ID,
    },
  });

  const volunteer = await prisma.club.create({
    data: {
      name: "青年志愿者协会",
      slogan: "以志愿之名，温暖校园",
      category: "志愿服务",
      tags: json(["志愿服务", "零基础友好", "团建多"]),
      description: "定期开展社区服务与校园公益活动，欢迎热心公益的同学。",
      coverUrl: cover.volunteer,
      gallery: json([]),
      activityTypes: json(["服务", "团建", "社交"]),
      intensity: "light",
      beginnerFriendly: true,
      recruitStart: rs,
      recruitEnd: re,
      contact: json({ wechatKeyword: "青协招新2025" }),
      customForm: json([
        {
          id: "motivation",
          label: "你想参与志愿活动的原因",
          type: "textarea",
          required: true,
        },
      ]),
      leaderDisplayName: "李负责人",
      leaderUserId: leaderUser.id,
      status: ClubStatus.PUBLISHED,
      seasonId: SEASON_ID,
    },
  });

  await prisma.club.create({
    data: {
      name: "篮球协会",
      slogan: "汗水与欢呼同在",
      category: "体育健身",
      tags: json(["篮球", "比赛导向", "训练"]),
      description: "校联赛与日常训练营，欢迎热爱篮球的你。",
      coverUrl: cover.basketball,
      gallery: json([]),
      activityTypes: json(["训练", "比赛"]),
      intensity: "medium",
      beginnerFriendly: true,
      recruitStart: rs,
      recruitEnd: re,
      customForm: json([]),
      leaderDisplayName: "王社长",
      leaderUserId: leaderUser.id,
      status: ClubStatus.PUBLISHED,
      seasonId: SEASON_ID,
    },
  });

  await prisma.club.create({
    data: {
      name: "摄影社团",
      slogan: "定格校园光影",
      category: "文学艺术",
      tags: json(["摄影", "演出机会", "零基础友好"]),
      description: "外拍、暗房体验与年度影展，设备可租借。",
      coverUrl: cover.photography,
      gallery: json([]),
      activityTypes: json(["创作", "展出", "社交"]),
      intensity: "light",
      beginnerFriendly: true,
      recruitStart: rs,
      recruitEnd: re,
      leaderDisplayName: "赵社长",
      status: ClubStatus.PENDING_REVIEW,
      seasonId: SEASON_ID,
    },
  });

  await prisma.application.create({
    data: {
      userId: student.id,
      clubId: robotics.id,
      seasonId: SEASON_ID,
      commonAnswers: json({
        fullName: "演示新生",
        studentId: "20250001",
        college: "计算机学院",
        grade: "本科一年级",
        phone: "13800138000",
        email: "student@demo.edu",
        intro: "我对嵌入式感兴趣",
      }),
      customAnswers: json({ skill: "Arduino 入门", cohort: "部分接受" }),
      status: ApplicationStatus.SUBMITTED,
      timeline: json([
        {
          at: new Date().toISOString(),
          byUserId: student.id,
          action: "created",
          note: "学生提交报名",
        },
      ]),
    },
  });

  // 社区帖（先审后发：种子直接已通过 + 一条置顶）
  await prisma.post.create({
    data: {
      authorId: leaderUser.id,
      type: PostType.RECRUIT,
      title: "机器人协会招新啦",
      content:
        "欢迎对嵌入式、视觉、机械有兴趣的同学。本周五晚宣讲会，评论区见～\n#机器人 #招新",
      images: json([cover.robotics]),
      clubId: robotics.id,
      tags: json(["机器人", "招新", "学术科技"]),
      status: PostStatus.APPROVED,
      pinned: true,
      reviewedAt: new Date(),
    },
  });

  await prisma.post.create({
    data: {
      authorId: leaderUser.id,
      type: PostType.ACTIVITY,
      title: "青协周末社区服务报名",
      content: "本周日走进社区敬老院，需要 20 名志愿者，包午餐。#志愿服务 #周末",
      images: json([cover.volunteer]),
      clubId: volunteer.id,
      tags: json(["志愿服务", "周末"]),
      status: PostStatus.APPROVED,
      reviewedAt: new Date(),
    },
  });

  await prisma.post.create({
    data: {
      authorId: student.id,
      type: PostType.DISCUSS,
      title: null,
      content: "萌新想问：零基础能加机器人协会吗？有没有学长说说体验？",
      images: json([]),
      clubId: null,
      tags: json(["求助", "机器人"]),
      status: PostStatus.APPROVED,
      reviewedAt: new Date(),
    },
  });

  await prisma.post.create({
    data: {
      authorId: student.id,
      type: PostType.RECRUIT,
      title: "待审核示例帖",
      content: "这条帖子处于待审核状态，管理员通过后台可见。",
      images: json([]),
      clubId: robotics.id,
      tags: json(["测试"]),
      status: PostStatus.PENDING,
    },
  });

  await prisma.inviteCode.create({
    data: {
      code: "INV-DEMO-LEADER",
      clubId: robotics.id,
      expiresAt: new Date(Date.now() + 864e7 * 52),
    },
  });

  // eslint-disable-next-line no-console
  console.log("Seed OK");
  // eslint-disable-next-line no-console
  console.log({
    admin: "admin@demo.edu / admin123",
    student: "student@demo.edu / student123",
    leader: "leader@demo.edu / leader123",
    inviteNewLeader: "INV-DEMO-LEADER",
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
