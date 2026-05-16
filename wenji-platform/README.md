# 文迹 · Literary Footprints

情怀文旅资产平台 —— 用 Design.md 书写你的文学朝圣路线。

## 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript
- **后端**: Next.js API Routes + Prisma ORM
- **数据库**: PostgreSQL
- **认证**: NextAuth.js (Credentials Provider)
- **支付**: 模拟模式（预留微信/支付宝/Stripe接入点）

## 快速启动

### 1. 启动数据库

```bash
docker-compose up -d
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，确保数据库连接正确：
```
DATABASE_URL="postgresql://wenji:wenji123@localhost:5432/wenji_platform"
NEXTAUTH_SECRET="your-super-secret-key"
```

### 4. 初始化数据库

```bash
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 已实现功能（基础交易闭环）

### 01 · 用户系统
- [x] 邮箱注册（bcrypt加密）
- [x] 邮箱登录（JWT Session）
- [x] 角色区分（READER / CREATOR / ADMIN）
- [x] 创作者资格审核状态

### 02 · 支付系统
- [x] Design.md 年度订阅（¥68/年）
- [x] 单张卡片购买（¥18/张）
- [x] 模拟支付模式（开发测试用）
- [x] 订单记录与防重复购买

### 03 · 内容管理（CMS）
- [x] 卡片创作表单（标题/作者/引言/正文/坐标/标签）
- [x] 提交审核工作流（DRAFT → PENDING_REVIEW → PUBLISHED）
- [x] 创作者权限校验（订阅有效 + 审核通过）

### 04 · 数据库与API
- [x] PostgreSQL + Prisma Schema
- [x] RESTful API（/api/cards, /api/leaderboard, /api/payment/*）
- [x] 动态榜单（按热度分排序）
- [x] 精选卡片查询

## 预设账号

种子数据已创建以下演示账号，密码均为 `demo123`：

| 邮箱 | 角色 | 笔名 |
|---|---|---|
| chunyuan@wenji.literary | 创作者 | Chunyuan |
| miyazaki@wenji.literary | 创作者 | Miyazaki |
| lemon@wenji.literary | 创作者 | Lemon |

## 接入真实支付

修改 `.env`：
```
PAYMENT_MODE="wechat" # 或 alipay / stripe
```

然后在 `src/app/api/payment/subscribe/route.ts` 和 `buy-card/route.ts` 中补充对应支付渠道的 SDK 调用逻辑。

## 项目结构

```
wenji-platform/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── register/
│   │   │   ├── cards/
│   │   │   ├── leaderboard/
│   │   │   └── payment/
│   │   │       ├── subscribe/
│   │   │       └── buy-card/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── SessionProvider.tsx
│   │   ├── AuthModal.tsx
│   │   └── CreateCardModal.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── auth.ts
│   └── types/
│       └── next-auth.d.ts
├── docker-compose.yml
├── .env.example
└── package.json
```

## 下一步（05-10）

- [ ] 卡片详情页（独立路由 /card/[id]）
- [ ] 供应商系统入驻与联名
- [ ] 管理后台（内容审核、数据看板）
- [ ] 真实支付渠道接入
- [ ] 图片上传与CDN
- [ ] 搜索与筛选功能

---

© 2026 Literary Footprints · 守护人类共同的文化记忆
