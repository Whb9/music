# 湖北文理学院 音乐与舞蹈学院 课程建设网站

基于 Next.js 15 + Cloudflare Pages + D1 + R2 部署。

## 本地开发

```bash
npm install
npm run dev        # http://localhost:3000
```

后台入口: `/admin`，默认密码 `hbwlxy123`

## 部署到 Cloudflare Pages

### 1. 前置准备

```bash
# 安装 wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

### 2. 创建 Cloudflare 资源

```bash
# 创建 D1 数据库（记录返回的 database_id）
wrangler d1 create hbwlxy-db

# 创建 R2 存储桶（文件上传）
wrangler r2 bucket create hbwlxy-uploads

# 初始化数据库表结构
wrangler d1 execute hbwlxy-db --file=./db/init.sql

# 导入种子数据
wrangler d1 execute hbwlxy-db --file=./db/seed.sql
```

### 3. 更新 wrangler.toml

将 `wrangler.toml` 中的 `database_id` 替换为步骤 2 创建 D1 时返回的实际 ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "hbwlxy-db"
database_id = "你的实际ID"  # ← 替换这里
```

### 4. 设置环境变量

```bash
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
```

### 5. 推送代码并部署

```bash
# 推送到 GitHub
git add -A && git commit -m "Cloudflare Pages migration"
git remote add origin <你的GitHub仓库>
git push -u origin main

# 在 Cloudflare Pages Dashboard 中:
# 1. 连接 GitHub 仓库
# 2. 框架预设: Next.js
# 3. 构建命令: npx @cloudflare/next-on-pages
# 4. 构建输出目录: .vercel/output/static
# 5. 绑定 D1 变量名: DB (database_id 自动从 wrangler.toml 读取)
# 6. 绑定 R2 变量名: UPLOADS
```

### 6. 或直接部署

```bash
npm run cf:deploy
```

## 技术栈

- **框架**: Next.js 15 (Pages Router)
- **样式**: Tailwind CSS
- **数据**: Cloudflare D1 (SQLite)
- **文件**: Cloudflare R2
- **函数**: Cloudflare Pages Functions (via @cloudflare/next-on-pages)

## 目录结构

```
hbwlxy-music/
├── data/site.json        # 原始种子数据（部署后不再直接读写）
├── db/init.sql           # D1 建表语句
├── db/seed.sql           # D1 种子数据
├── public/               # 静态资源
│   ├── images/           # 图片
│   ├── videos/           # 视频
│   ├── uploads/          # 上传文件（仅用于本地开发）
│   └── pitch-to-score.html  # 音高识别页面
├── src/
│   ├── components/       # React 组件
│   ├── lib/
│   │   ├── auth.ts       # 认证（Web Crypto）
│   │   └── data.ts       # 数据层（D1）
│   ├── pages/
│   │   ├── admin/        # 后台管理
│   │   ├── api/          # API 路由 → Cloudflare Functions
│   │   ├── course/       # 课程页面
│   │   └── teachers/     # 教师页面
│   └── types/            # TypeScript 类型
├── wrangler.toml         # Cloudflare 配置
└── package.json
```
