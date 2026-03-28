# 社团招新智能匹配平台（Web）

对应仓库内 `docs/PRD-社团招新智能匹配平台.md`，本目录为 **Next.js 15 + Prisma(SQLite) + TypeScript** 全栈实现，覆盖 **社区信息流（先审后发）**、**社团发现与匹配（问卷 / 对话）**、**报名**、**社长台**、**管理端（含帖子审核）**、**通知**、**对话匹配**、**运营看板**等能力。

## 本地运行

```bash
cd web
npm install
npx prisma db push
npm run db:seed
npm run dev
```

在浏览器打开开发地址：**默认**为 **`http://localhost:3000`**。若终端出现类似 `Port 3000 is in use ... using available port 3002`，说明 3000 已被其它进程占用，Next 会自动换端口（例如 **`http://localhost:3002`**），**请以终端里 `Local:` 那一行为准**，不要死记 3000。

## 演示账号（种子数据）

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@demo.edu | admin123 |
| 新生 | student@demo.edu | student123 |
| 社长 | leader@demo.edu | leader123 |

社长邀请码示例（注册社长号时可用，注意与已存在社长冲突时可自行在管理端生成新码）：`INV-DEMO-LEADER`

## 脚本

- `npm run dev` — 开发模式（默认 Webpack，更稳）
- `npm run dev:turbo` — 开发模式（Turbopack，若出现 chunk 报错请先删掉 `.next` 再启动）
- `npm run build` / `npm start` — 生产构建与启动
- `npm run db:push` — 更新本地 SQLite schema
- `npm run db:seed` — 写入演示数据（**会清空**当前库内演示表数据）。社团封面与帖内配图使用站内 **`public/seed/covers/*.svg`**，不依赖外网图床；若你曾用旧种子（Unsplash）导致图片裂图，重新执行一次 `db:seed` 即可。
- `npm test` — Vitest（匹配引擎单测）

## 环境变量

复制 `.env.example` 为 `.env`，至少包含：

- `DATABASE_URL` — 默认 `file:./dev.db`
- `SESSION_SECRET` — **至少 32 字符**（生产环境务必修改）



## 目录说明（概要）

- `public/seed/covers` — 演示用社团封面（SVG，随站点一同加载）。**SVG 内文建议仅用 ASCII**（或保证 UTF-8 无损坏），否则在部分环境下整图会在 `<img>` 里显示为裂图。
- `src/app` — 页面与 `api/*` 路由
- `src/lib/match-engine.ts` — 可解释规则匹配，含单测
- `prisma/schema.prisma` — 数据模型
