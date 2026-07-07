# 湖北文理学院 音乐与舞蹈学院 课程建设网站

基于 Next.js 15 + EdgeOne Pages + EdgeOne KV + COS 部署，国内访问无障碍。

## 技术栈

- **框架**: Next.js 15 (Pages Router)
- **样式**: Tailwind CSS
- **后端 API**: EdgeOne Edge Functions (`functions/api/`)
- **数据存储**: EdgeOne KV
- **文件存储**: 腾讯云 COS

## 本地开发

```bash
npm install
npm run dev        # http://localhost:3000
```

> 本地开发时 API 请求会 fallback 到 `localhost:3000`，读取 `data/site.json` 数据。

## 一键部署

```bash
# 首次准备（只需一次）
npm install -g edgeone    # 安装 EdgeOne CLI
edgeone login             # 登录腾讯云

# 部署（构建 + 上传，自动检测 Next.js）
npm run deploy

# 部署到生产环境
npm run deploy:prod
```

### 完整首次部署流程

首次部署需要额外完成 KV 创建和配置：

```bash
# 1. 安装依赖
npm install

# 2. 在 EdgeOne 控制台 → KV 存储 → 创建命名空间，记录 ID
#    然后更新 edgeone.json，将 PLACEHOLDER 替换为实际 ID

# 3. 一键部署
npm run deploy

# 4. 在 EdgeOne Pages 控制台，项目 → 设置 → 环境变量 中添加：
#    ADMIN_PASSWORD  — 后台管理密码
#    SESSION_SECRET  — 会话密钥（随机字符串）
#    （可选：COS_SECRET_ID, COS_SECRET_KEY, COS_BUCKET, COS_REGION）

# 5. （可选）初始化 KV 种子数据，使后台编辑内容可持久化
npm run deploy:seed-kv

# 6. （可选）绑定自定义域名
```

**重要**：密码等敏感信息在 EdgeOne Pages 控制台设置，**不要提交到 Git**。

## 环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| `ADMIN_PASSWORD` | 是 | 后台登录密码（默认 `hbwlxy123`） |
| `SESSION_SECRET` | 是 | Session 签名密钥 |
| `COS_SECRET_ID` | 否 | 腾讯云 API SecretId（文件上传） |
| `COS_SECRET_KEY` | 否 | 腾讯云 API SecretKey（文件上传） |
| `COS_BUCKET` | 否 | COS 存储桶名称（文件上传） |
| `COS_REGION` | 否 | COS 地域，默认 `ap-guangzhou` |
| `SITE_URL` | 否 | 站点公开 URL（SSR 用，通常自动检测） |

> 所有变量在 Edge Functions 中都有合理默认值，站点在零配置下也能正常运行。

## 目录结构

```
hbwlxy-music/
├── data/site.json            # 种子数据（导入 KV 用，线上不直接读取）
├── functions/api/            # EdgeOne Edge Functions（后端 API）
│   ├── auth/
│   │   ├── login.js          # POST /api/auth/login
│   │   ├── check.js          # GET  /api/auth/check
│   │   └── logout.js         # POST /api/auth/logout
│   ├── site.js               # GET/POST /api/site
│   ├── upload.js             # POST /api/upload → COS
│   ├── import-data.js        # POST /api/import-data
│   └── uploads/[key].js      # GET  /api/uploads/:key → COS
├── public/                   # 静态资源
│   ├── images/               # 图片
│   ├── videos/               # 视频
│   ├── uploads/              # 已上传文件
│   └── pitch-to-score.html   # 音高识别页面
├── src/
│   ├── components/           # React 组件
│   ├── lib/
│   │   ├── auth.ts           # 认证层
│   │   └── data.ts           # 数据层
│   ├── pages/                # Next.js 页面
│   └── types/                # TypeScript 类型
├── scripts/
│   └── seed-kv.mjs           # KV 初始化脚本
├── edgeone.json              # EdgeOne 配置（KV 绑定）
├── .env.example              # 环境变量模板
└── package.json
```

## 后台管理

访问 `/admin`，默认密码 `hbwlxy123`（通过环境变量 `ADMIN_PASSWORD` 修改）。
