# SecondMe 集成应用

这是一个集成 SecondMe OAuth 登录和 API 的 Next.js 应用。

## 功能特性

- ✅ SecondMe OAuth 2.0 登录
- ✅ 用户个人信息展示
- ✅ 聊天功能
- ✅ 笔记管理
- ✅ Token 自动刷新

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: PostgreSQL + Prisma ORM
- **HTTP 客户端**: Axios

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

项目已经生成了 `.env.local` 文件，包含以下配置：

- `SECONDME_CLIENT_ID`: SecondMe 应用 Client ID
- `SECONDME_CLIENT_SECRET`: SecondMe 应用 Client Secret
- `DATABASE_URL`: PostgreSQL 数据库连接串

**重要**: 在生产环境中，请修改 `NEXTAUTH_SECRET` 为随机字符串。

### 3. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 4. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动。

## 项目结构

```
.
├── app/
│   ├── api/
│   │   ├── auth/          # OAuth 认证路由
│   │   ├── profile/       # 用户信息 API
│   │   ├── chat/          # 聊天 API
│   │   └── notes/         # 笔记 API
│   ├── profile/           # 个人资料页面
│   ├── chat/              # 聊天页面
│   ├── notes/             # 笔记页面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页（登录页）
├── components/
│   └── Header.tsx         # 导航头部
├── lib/
│   ├── prisma.ts          # Prisma 客户端
│   └── secondme.ts        # SecondMe API 工具函数
├── prisma/
│   └── schema.prisma      # 数据库模型
└── .secondme/
    └── state.json         # 项目配置（敏感信息，不要提交到 Git）
```

## SecondMe API 端点

- **授权**: https://api.second.me/oauth/authorize
- **Token**: https://api.second.me/oauth/token
- **API Base**: https://api.second.me/v1

## 开发文档

- [OAuth 认证指南](https://docs.second.me/zh/guides/oauth)
- [用户 API](https://docs.second.me/zh/api/users)
- [聊天 API](https://docs.second.me/zh/api/chat)
- [笔记 API](https://docs.second.me/zh/api/notes)

## 安全注意事项

- ⚠️ `.secondme/` 目录包含敏感配置，已添加到 `.gitignore`
- ⚠️ `.env.local` 包含应用凭证，不要提交到版本控制
- ⚠️ 生产环境请使用 HTTPS
- ⚠️ 定期更新依赖包以修复安全漏洞

## 常见问题

### 1. 数据库连接失败

确保 PostgreSQL 服务正在运行，并且连接串正确：
```bash
postgresql://postgres:postgres@localhost:5432/secondme
```

### 2. OAuth 登录失败

- 检查 Client ID 和 Client Secret 是否正确
- 确认回调地址在 SecondMe 开发者平台配置正确
- 查看浏览器控制台和服务器日志

### 3. Token 过期

应用会自动刷新过期的 Token。如果刷新失败，用户需要重新登录。

## 生产部署

### 环境变量

部署到生产环境时，需要配置以下环境变量：

- `SECONDME_CLIENT_ID`
- `SECONDME_CLIENT_SECRET`
- `SECONDME_CALLBACK_URL` (使用生产域名)
- `DATABASE_URL`
- `NEXTAUTH_URL` (生产域名)
- `NEXTAUTH_SECRET` (随机字符串)

### 构建

```bash
npm run build
npm start
```

## 许可证

MIT
