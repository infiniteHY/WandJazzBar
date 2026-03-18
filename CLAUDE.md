# SecondMe 集成项目

## 项目概述

本项目是一个集成 SecondMe OAuth 登录和 API 的 Next.js 应用。

## 应用配置

- **Client ID**: `7afb384b-6eac-4525-89e1-0ae7af22ea0d`
- **权限范围**: profile, chat, note
- **回调地址**: http://localhost:3000/api/auth/callback
- **数据库**: PostgreSQL

## 功能模块

### 1. auth - OAuth 认证
- SecondMe OAuth 2.0 登录流程
- Token 管理和刷新
- 用户会话管理

### 2. profile - 用户信息
- 获取用户头像、昵称、简介
- 展示用户个人资料

### 3. chat - 聊天功能
- 发送和接收消息
- 聊天会话管理

### 4. note - 笔记管理
- 创建、读取、更新笔记
- 笔记列表展示

## API 端点

- **授权**: https://api.second.me/oauth/authorize
- **Token**: https://api.second.me/oauth/token
- **API Base**: https://api.second.me/v1

## 开发文档

- [OAuth 认证指南](https://docs.second.me/zh/guides/oauth)
- [用户 API](https://docs.second.me/zh/api/users)
- [聊天 API](https://docs.second.me/zh/api/chat)
- [笔记 API](https://docs.second.me/zh/api/notes)

## 数据模型

### User 表（Prisma Schema）
- id: 主键
- secondme_id: SecondMe 用户 ID
- access_token: 访问令牌（必需）
- refresh_token: 刷新令牌
- token_expires_at: Token 过期时间
- profile_data: 用户资料 JSON

## 注意事项

- `.secondme/` 目录包含敏感配置，已添加到 .gitignore
- Token 存储在数据库中，需定期刷新
- 所有 API 调用需要有效的 access_token

## 下一步

运行 `/secondme-prd` 定义产品需求，或运行 `/secondme-nextjs --quick` 直接生成项目。
