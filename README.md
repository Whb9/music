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

> 本地开发时 API 请求会 fallback 到 `localhost:3000`，需要将 `data/site.json` 的内容手动写入 EdgeOne KV 或暂时使用静态数据。

## 部署到 EdgeOne Pages

### 1. 准备工作

```bash
# 安装 EdgeOne CLI
npm install -g edgeone

# 登录腾讯云
edgeone login
```

### 2. 创建 KV 存储

在 EdgeOne 控制台 → KV 存储 → 创建命名空间（名称任意，如 `site-kv`），记录 **命名空间 ID**。

### 3. 初始化种子数据

将 `data/site.json` 的内容作为 KV 数据写入：
- Key: `site_data`
- Value: `data/site.json` 的完整 JSON 内容

可以在控制台直接添加，或通过 EdgeOne CLI 写入。

### 4. 配置 COS（可选，用于文件上传）

在腾讯云控制台创建 COS 存储桶，然后在 EdgeOne Pages 项目设置中添加环境变量:

| 变量 | 说明 |
|------|------|
| `COS_SECRET_ID` | 腾讯云 API SecretId |
| `COS_SECRET_KEY` | 腾讯云 API SecretKey |
| `COS_BUCKET` | COS 存储桶名称 |
| `COS_REGION` | COS 地域（如 `ap-guangzhou`） |

### 5. 设置环境变量

在 EdgeOne Pages 项目设置中添加:

| 变量 | 说明 |
|------|------|
| `ADMIN_PASSWORD` | 后台管理密码 |
| `SESSION_SECRET` | 会话加密密钥（随机字符串） |

### 6. 更新 edgeone.json

将 `edgeone.json` 中的 `"id": "PLACEHOLDER"` 替换为步骤 2 创建的 KV 命名空间 ID。

### 7. 部署

```bash
# Git 部署：推送代码到 GitHub/Gitee，在 EdgeOne 控制台连接仓库

# 或直接部署：
edgeone pages deploy . -n hbwlxy-music
```

EdgeOne Pages 会自动识别 Next.js 框架，构建并部署。

### 8. 绑定自定义域名

在 EdgeOne 控制台绑定 `hbwlxy-music.com`（需先在腾讯云购买并备案域名），国内用户即可通过自定义域名访问。

## 目录结构

```
hbwlxy-music/
├── data/site.json          # 种子数据（部署时导入 KV，线上不再直接读取）
├── functions/api/          # EdgeOne Edge Functions（后端 API）
│   ├── auth/
│   │   ├── login.js        # POST /api/auth/login
│   │   ├── check.js        # GET  /api/auth/check
│   │   └── logout.js       # POST /api/auth/logout
│   ├── site.js             # GET/POST /api/site
│   ├── upload.js           # POST /api/upload → COS
│   ├── import-data.js      # POST /api/import-data
│   └── uploads/[key].js    # GET  /api/uploads/:key → COS
├── public/                 # 静态资源
│   ├── images/             # 图片
│   ├── videos/             # 视频
│   ├── uploads/            # 已上传的文件
│   └── pitch-to-score.html # 音高识别页面
├── src/
│   ├── components/         # React 组件
│   ├── lib/
│   │   ├── auth.ts         # 认证（调用 Edge Functions API）
│   │   └── data.ts         # 数据层（调用 Edge Functions API）
│   ├── pages/              # Next.js 页面
│   └── types/              # TypeScript 类型
├── edgeone.json            # EdgeOne 配置（KV 绑定）
└── package.json
```

## 后台管理

访问 `/admin`，默认密码 `hbwlxy123`（通过环境变量 `ADMIN_PASSWORD` 修改）。
