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

## 代码托管与「别人怎么用」

要分清两种链接：

| 类型 | 是什么 | 别人怎么用 |
|------|--------|------------|
| **仓库链接**（GitHub / Gitee / GitLab） | 存放源码 | 克隆到本机，按上文「本地运行」安装依赖并 `npm run dev`，在**自己电脑**上打开浏览器访问 |
| **在线演示链接**（如 Vercel） | 已部署的网站 | 浏览器**直接打开网址**即可用（需你完成部署并配置数据库与环境变量） |

### 用 GitHub 保存代码（从零操作）

**0. 本机安装 Git（若还没有）**  
到 [https://git-scm.com/download/win](https://git-scm.com/download/win) 安装。装好后打开 **PowerShell**，执行 `git --version` 能看到版本号即可。

**1. 注册 / 登录 GitHub**  
打开 [https://github.com](https://github.com) 注册账号并登录。

**2. 在网页上新建空仓库**  
- 右上角 **+** → **New repository**。  
- **Repository name** 填仓库名（例如 `club-recruit-platform`）。  
- 选 **Public**（公开）或 **Private**（仅你可见）。  
- **不要**勾选 *Add a README*、*.gitignore*、*license*（避免和本地第一次提交冲突）。  
- 点 **Create repository**。  
- 创建完成后，页面会显示仓库地址，记下 **HTTPS** 地址，形如：  
  `https://github.com/你的用户名/仓库名.git`

**3. 第一次使用 Git 时配置你的名字和邮箱（仅本机一次）**

```bash
git config --global user.name "你的名字或昵称"
git config --global user.email "你的邮箱@example.com"
```

邮箱建议与 GitHub 账号邮箱一致。

**4. 在项目根目录初始化并推送（推荐：整仓含 `docs` + `web`）**

在 PowerShell 里进入**项目根目录**（包含 `docs` 和 `web` 的那一层；路径里有中文时请整段加引号）：

```powershell
cd "d:\APP\cursor文件\社团招新智能匹配平台"
git init
git add .
git status
```

确认 **`git status`** 里**没有**出现 `.env`、`dev.db`、`node_modules`、`.next`（根目录与 `web` 下已有 `.gitignore` 会排除它们）。

```powershell
git commit -m "Initial commit: club recruit platform"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

把 `你的用户名`、`仓库名` 换成你在 GitHub 上的真实信息。

**5. 若 `git push` 要求登录**  
GitHub 已不再支持「仅用账号密码」推代码，需使用 **Personal Access Token（PAT）**：  
GitHub → **Settings** → **Developer settings** → **Personal access tokens**，生成带 **`repo`** 权限的 token；在密码提示处**粘贴该 token**（而不是登录密码）。

（也可配置 [SSH 密钥](https://docs.github.com/zh/authentication/connecting-to-github-with-ssh)，以后用 `git@github.com:用户名/仓库名.git` 作为 `origin`。）

**6. 只推 `web` 子目录（可选）**  
若你只想把 Next 工程单独当一个仓库，可在 `web` 里 `git init`，但 **`docs` PRD 不会进库**；更推荐上面「根目录整仓」方式。

**7. 完成后**  
浏览器打开 `https://github.com/你的用户名/仓库名` 即为你的**代码链接**；别人 **`git clone`** 后进入 `web` 按本文「本地运行」即可在自己电脑跑起来。

**若希望「点开链接就能用」：** 需要 **部署**。本项目含服务端与数据库，常用做法包括：把数据库换成 **PostgreSQL**（如 Neon / Supabase），在 **Vercel** 连接该库、配置 `DATABASE_URL` 与 `SESSION_SECRET`，构建命令含 `prisma generate`，并在部署后执行迁移或 `db push`。SQLite 文件在 Vercel 等无持久磁盘的环境不适用，需换库。细节以各平台文档为准。

## 部署（概要）

可部署至 Vercel / 自有服务器：生产环境务必设置 **`DATABASE_URL`**、**`SESSION_SECRET`（≥32 字符）**；数据库建议使用 **PostgreSQL**（调整 `prisma/schema.prisma` 的 `provider` 与连接串后迁移或 `db push`）。

## 本地常见卡点（Windows）

1. **3000 端口被占用**：Next 会自动改用 3001、3002 等，用终端打印的 **Local** 地址即可。若希望固定用 3000，可先结束占用进程（任务管理器结束对应 Node，或在 PowerShell 用 `Get-NetTCPConnection -LocalPort 3000` 查 PID 后结束该进程），再执行 `npm run dev`。
2. **PowerShell 里 `&&` 报错**：较老版本不支持 `cd xx && npm install`，请改用分号 `;` 或 **`cmd /c "cd /d 路径\web && npm install"`**。
3. **`npm install` 很久不出日志**：多为网络下载依赖，可换镜像或稍后重试；确认已进入 **`web` 目录**（存在 `package.json`）。
4. **`SESSION_SECRET` 过短**：需 **≥32 字符**，与 `.env.example` 一致即可通过 `iron-session`。
5. **Prisma 提示 `package.json#prisma` 将废弃**：当前不影响构建；后续可迁到官方推荐的 `prisma.config.ts`。

## 目录说明（概要）

- `public/seed/covers` — 演示用社团封面（SVG，随站点一同加载）。**SVG 内文建议仅用 ASCII**（或保证 UTF-8 无损坏），否则在部分环境下整图会在 `<img>` 里显示为裂图。
- `src/app` — 页面与 `api/*` 路由
- `src/lib/match-engine.ts` — 可解释规则匹配，含单测
- `prisma/schema.prisma` — 数据模型
