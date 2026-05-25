# 外部集成

**分析日期：** 2026-05-25

## API 与外部服务

**前端资源与图标：**
- Iconify 图标生态（通过 `@iconify-json/carbon` + UnoCSS 图标预设）
  - SDK/Client：`@iconify-json/carbon`（定义于 `pnpm-workspace.yaml`）
  - 鉴权：不需要

**代码托管链接：**
- GitHub 仓库链接（`src/components/TheFooter.vue`）
  - 用途：对外跳转项目模板仓库
  - 鉴权：匿名访问

## 数据存储

**数据库：**
- 未检测到（未发现 ORM/数据库驱动依赖于 `package.json`）

**文件存储：**
- 本地静态文件与构建产物（`public/`、`dist/`）

**缓存：**
- 未检测到显式缓存层（如 Redis）

## 认证与身份

**认证提供方：**
- 未检测到（当前代码未接入 OAuth/Auth SDK）

## 监控与可观测性

**错误追踪：**
- 未检测到（无 Sentry/Datadog/Bugsnag 依赖）

**日志：**
- 以浏览器控制台或构建日志为主（无专用日志 SDK）

## CI/CD 与部署

**托管平台：**
- Netlify（`netlify.toml`）

**CI 流水线：**
- GitHub Actions（`.github/workflows/test.yml`）
  - 任务：安装、构建、测试、Lint、TypeCheck

## 环境配置

**必需环境变量：**
- 未检测到强制变量（仓库未包含 `.env*`，且代码未读取 `import.meta.env.*` 自定义字段）

**密钥存放位置：**
- 推断应由平台环境变量管理（Netlify/GitHub Secrets），仓库中未明文出现

## Webhook 与回调

**入站：**
- 未检测到（纯前端 SPA，无服务端接收端点）

**出站：**
- 未检测到（无第三方 webhook 发送逻辑）

---

*集成审计：2026-05-25*
